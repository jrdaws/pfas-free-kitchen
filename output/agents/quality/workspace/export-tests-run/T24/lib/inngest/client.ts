import { Inngest } from "inngest";

if (!process.env.INNGEST_EVENT_KEY) {
  console.warn(`
⚠️  Inngest configuration missing

Required environment variables:
  INNGEST_EVENT_KEY
  INNGEST_SIGNING_KEY

For local development: npx inngest-cli@latest dev
  `);
}

export const inngest = new Inngest({
  id: "my-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type Events = {
  "user/created": { data: { userId: string; email: string; name?: string } };
  "user/deleted": { data: { userId: string } };
  "email/send": { data: { to: string; subject: string; template: string; variables?: Record<string, unknown> } };
};

export async function sendEvent<T extends keyof Events>(name: T, data: Events[T]["data"]) {
  return inngest.send({ name, data });
}

