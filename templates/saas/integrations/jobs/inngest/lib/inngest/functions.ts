import { inngest } from "./client";

export const welcomeUser = inngest.createFunction(
  { id: "welcome-user", name: "Welcome User Flow" },
  { event: "user/created" },
  async ({ event, step }) => {
    const { userId, email } = event.data;
    await step.run("send-welcome-email", async () => {
      console.log(`Sending welcome email to ${email}`);
    });
    await step.sleep("wait-for-onboarding", "24h");
    await step.run("send-onboarding-tips", async () => {
      console.log(`Sending onboarding tips to ${email}`);
    });
    return { userId, completed: true };
  }
);

export const sendEmailJob = inngest.createFunction(
  { id: "send-email", name: "Send Email", retries: 3 },
  { event: "email/send" },
  async ({ event, step }) => {
    const { to, template } = event.data;
    await step.run("send", async () => {
      console.log(`Sending ${template} email to ${to}`);
    });
    return { sent: true, to };
  }
);

export const dailyCleanup = inngest.createFunction(
  { id: "daily-cleanup", name: "Daily Cleanup" },
  { cron: "0 2 * * *" },
  async ({ step }) => {
    await step.run("cleanup", async () => {
      console.log("Running daily cleanup...");
    });
    return { success: true, timestamp: new Date().toISOString() };
  }
);

export const functions = [welcomeUser, sendEmailJob, dailyCleanup];

