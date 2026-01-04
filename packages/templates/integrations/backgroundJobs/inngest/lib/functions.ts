/**
 * Inngest Functions
 * 
 * Define your background jobs and workflows here.
 */

import { inngest, Events } from "./client";

// ============================================================
// User Functions
// ============================================================

/**
 * Welcome flow for new users
 */
export const welcomeUser = inngest.createFunction(
  { id: "welcome-user", name: "Welcome User Flow" },
  { event: "user/created" },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Step 1: Send welcome email
    await step.run("send-welcome-email", async () => {
      // Send email using your email provider
      console.log(`Sending welcome email to ${email}`);
      // await sendEmail({ to: email, template: 'welcome', data: { name } });
    });

    // Step 2: Wait 24 hours
    await step.sleep("wait-for-onboarding", "24h");

    // Step 3: Send onboarding tips
    await step.run("send-onboarding-tips", async () => {
      console.log(`Sending onboarding tips to ${email}`);
      // await sendEmail({ to: email, template: 'onboarding-tips' });
    });

    // Step 4: Wait 3 days
    await step.sleep("wait-for-follow-up", "3d");

    // Step 5: Check engagement and send follow-up
    const isEngaged = await step.run("check-engagement", async () => {
      // Check if user has completed onboarding
      // return await checkUserEngagement(userId);
      return false;
    });

    if (!isEngaged) {
      await step.run("send-follow-up", async () => {
        console.log(`Sending follow-up to ${email}`);
        // await sendEmail({ to: email, template: 'need-help' });
      });
    }

    return { userId, completed: true };
  }
);

/**
 * Clean up after user deletion
 */
export const cleanupUser = inngest.createFunction(
  { id: "cleanup-user", name: "Cleanup User Data" },
  { event: "user/deleted" },
  async ({ event, step }) => {
    const { userId } = event.data;

    await step.run("delete-user-data", async () => {
      console.log(`Cleaning up data for user ${userId}`);
      // Delete user's data from various services
    });

    await step.run("cancel-subscriptions", async () => {
      console.log(`Cancelling subscriptions for user ${userId}`);
      // Cancel any active subscriptions
    });

    return { userId, cleanedUp: true };
  }
);

// ============================================================
// Email Functions
// ============================================================

/**
 * Send email with retry
 */
export const sendEmailJob = inngest.createFunction(
  {
    id: "send-email",
    name: "Send Email",
    retries: 3,
    throttle: {
      limit: 100,
      period: "1m",
    },
  },
  { event: "email/send" },
  async ({ event, step }) => {
    const { to, subject, template, variables } = event.data;

    await step.run("send", async () => {
      console.log(`Sending ${template} email to ${to}`);
      // await resend.emails.send({ to, subject, ... });
    });

    return { sent: true, to };
  }
);

// ============================================================
// Scheduled Jobs
// ============================================================

/**
 * Daily cleanup job
 */
export const dailyCleanup = inngest.createFunction(
  { id: "daily-cleanup", name: "Daily Cleanup" },
  { cron: "0 2 * * *" }, // Run at 2 AM daily
  async ({ step }) => {
    await step.run("cleanup-expired-sessions", async () => {
      console.log("Cleaning up expired sessions...");
      // Delete expired sessions from database
    });

    await step.run("cleanup-old-logs", async () => {
      console.log("Cleaning up old logs...");
      // Delete logs older than 30 days
    });

    return { success: true, timestamp: new Date().toISOString() };
  }
);

/**
 * Weekly report job
 */
export const weeklyReport = inngest.createFunction(
  { id: "weekly-report", name: "Weekly Report" },
  { cron: "0 9 * * 1" }, // Run at 9 AM every Monday
  async ({ step }) => {
    const metrics = await step.run("gather-metrics", async () => {
      console.log("Gathering weekly metrics...");
      // Collect metrics from your database
      return {
        newUsers: 100,
        activeUsers: 500,
        revenue: 10000,
      };
    });

    await step.run("send-report", async () => {
      console.log("Sending weekly report...");
      // Send report email to admins
    });

    return { metrics, sent: true };
  }
);

// ============================================================
// Export All Functions
// ============================================================

export const functions = [
  welcomeUser,
  cleanupUser,
  sendEmailJob,
  dailyCleanup,
  weeklyReport,
];

