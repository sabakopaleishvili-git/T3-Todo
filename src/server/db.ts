import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const hasProjectDelegates = (client: PrismaClient) =>
  typeof client.project !== "undefined" &&
  typeof client.projectMember !== "undefined" &&
  typeof client.projectInvitation !== "undefined";

const getPrismaClient = () => {
  const cached = globalForPrisma.prisma;

  if (cached && hasProjectDelegates(cached)) {
    return cached;
  }

  return createPrismaClient();
};

export const db = getPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
