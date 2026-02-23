import { createServer } from "node:http";
import process from "node:process";
import { URL } from "node:url";

import { decode } from "@auth/core/jwt";
import { WebSocketServer } from "ws";

const REALTIME_PORT = Number(process.env.REALTIME_PORT ?? 3001);
const REALTIME_INTERNAL_SECRET = process.env.REALTIME_INTERNAL_SECRET;
const AUTH_SECRET = process.env.AUTH_SECRET;
const HEARTBEAT_INTERVAL_MS = 30000;
const GLOBAL_ROOM = "tasks:global";
const userRoomName = (userId) => `user:${userId}`;

if (!AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is required for realtime server authentication.",
  );
}

if (!REALTIME_INTERNAL_SECRET) {
  throw new Error(
    "REALTIME_INTERNAL_SECRET is required for realtime server emit endpoint.",
  );
}

const wsServer = new WebSocketServer({ noServer: true });
const clients = new Map();

const parseCookieHeader = (cookieHeader) => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.split("=");
    const key = rawKey?.trim();
    const value = rest.join("=").trim();

    if (key) {
      acc[key] = decodeURIComponent(value);
    }

    return acc;
  }, {});
};

const decodeAuthToken = async (cookieName, token) => {
  if (!token) {
    return null;
  }

  try {
    return await decode({
      token,
      secret: AUTH_SECRET,
      salt: cookieName,
    });
  } catch {
    return null;
  }
};

const resolveAuthenticatedUser = async (request) => {
  const cookies = parseCookieHeader(request.headers.cookie);
  const tokenCandidates = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
  ];

  for (const cookieName of tokenCandidates) {
    const token = cookies[cookieName];
    const payload = await decodeAuthToken(cookieName, token);

    if (payload?.sub) {
      return {
        id: payload.sub,
        email: typeof payload.email === "string" ? payload.email : null,
      };
    }
  }

  return null;
};

const broadcast = (payload, room = GLOBAL_ROOM) => {
  const message = JSON.stringify(payload);
  let recipients = 0;

  for (const [socket, metadata] of clients.entries()) {
    if (socket.readyState !== socket.OPEN || !metadata.rooms.has(room)) {
      continue;
    }

    socket.send(message);
    recipients += 1;
  }

  return recipients;
};

const httpServer = createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(request.url, "http://127.0.0.1");

  if (request.method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, clients: clients.size }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/emit") {
    const providedSecret = request.headers["x-realtime-secret"];

    if (providedSecret !== REALTIME_INTERNAL_SECRET) {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    let rawBody = "";
    for await (const chunk of request) {
      rawBody += chunk;
    }

    try {
      const body = JSON.parse(rawBody);
      const room =
        typeof body.room === "string" && body.room.length > 0
          ? body.room
          : DEFAULT_ROOM;
      const recipients = broadcast(body, room);

      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true, recipients }));
      return;
    } catch {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }
  }

  response.writeHead(404).end("Not found");
});

wsServer.on("connection", (socket, request, authUser) => {
  const userRoom = userRoomName(authUser.id);
  const metadata = {
    userId: authUser.id,
    email: authUser.email,
    rooms: new Set([GLOBAL_ROOM, userRoom]),
    isAlive: true,
  };

  clients.set(socket, metadata);

  socket.on("pong", () => {
    const current = clients.get(socket);
    if (current) {
      current.isAlive = true;
    }
  });

  socket.on("message", (data) => {
    try {
      const payload = JSON.parse(data.toString());

      if (payload?.type === "subscribe" && typeof payload.room === "string") {
        metadata.rooms.add(payload.room);
      }

      if (
        payload?.type === "unsubscribe" &&
        typeof payload.room === "string" &&
        payload.room !== GLOBAL_ROOM &&
        payload.room !== userRoom
      ) {
        metadata.rooms.delete(payload.room);
      }
    } catch {
      // Ignore malformed payloads from clients.
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
  });

  socket.on("error", () => {
    clients.delete(socket);
  });

  socket.send(
    JSON.stringify({
      type: "realtime.connected",
      userId: metadata.userId,
      email: metadata.email,
    }),
  );
});

httpServer.on("upgrade", async (request, socket, head) => {
  if (!request.url) {
    socket.destroy();
    return;
  }

  const url = new URL(request.url, "http://127.0.0.1");
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const authUser = await resolveAuthenticatedUser(request);

  if (!authUser) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  wsServer.handleUpgrade(request, socket, head, (upgradedSocket) => {
    wsServer.emit("connection", upgradedSocket, request, authUser);
  });
});

const heartbeatTimer = setInterval(() => {
  for (const [socket, metadata] of clients.entries()) {
    if (!metadata.isAlive) {
      clients.delete(socket);
      socket.terminate();
      continue;
    }

    metadata.isAlive = false;
    socket.ping();
  }
}, HEARTBEAT_INTERVAL_MS);

httpServer.listen(REALTIME_PORT, () => {
  console.log(`Realtime server listening on http://127.0.0.1:${REALTIME_PORT}`);
});

const shutdown = () => {
  clearInterval(heartbeatTimer);
  for (const socket of clients.keys()) {
    socket.terminate();
  }
  wsServer.close();
  httpServer.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
