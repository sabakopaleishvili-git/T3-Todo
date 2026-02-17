# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Realtime Sidecar (Self-hosted WebSocket)

This project includes a websocket sidecar for cross-user task updates.

### Environment Variables

Add these values to your local `.env`:

- `REALTIME_URL="http://127.0.0.1:3001"` (used by Next.js server to publish events)
- `REALTIME_PORT="3001"` (port used by sidecar process)
- `REALTIME_INTERNAL_SECRET="<long-random-secret>"` (protects the sidecar `/emit` endpoint)
- `NEXT_PUBLIC_REALTIME_URL="ws://127.0.0.1:3001/ws"` (used by browser websocket client)

### Local Development

Run Next.js and the realtime sidecar in separate terminals:

1. `yarn dev`
2. `yarn realtime:dev`

### Production

Run Next.js and realtime sidecar as two processes:

1. `yarn start`
2. `yarn realtime:start`
