import { triggerClient } from "@/lib/trigger/client";
import { cronTrigger } from "@trigger.dev/sdk";

/**
 * Scheduled Job: Daily Cleanup
 * Runs every day at midnight to clean up old data
 */
export const dailyCleanup = triggerClient.defineJob({
  id: "daily-cleanup",
  name: "Daily Cleanup",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 0 * * *", // Every day at midnight
  }),
  run: async (payload, io) => {
    await io.logger.info("Starting daily cleanup");

    // Step 1: Clean expired sessions
    const expiredSessions = await io.runTask("clean-sessions", async () => {
      // Delete expired sessions from your database
      // await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      return { deleted: 42 };
    });

    // Step 2: Clean old notifications
    const oldNotifications = await io.runTask("clean-notifications", async () => {
      // Delete notifications older than 30 days
      // const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      // await db.notification.deleteMany({ where: { createdAt: { lt: thirtyDaysAgo } } });
      return { deleted: 156 };
    });

    // Step 3: Clean temporary files
    const tempFiles = await io.runTask("clean-temp-files", async () => {
      // Delete temporary files from storage
      return { deleted: 23 };
    });

    // Step 4: Update stats
    await io.runTask("update-stats", async () => {
      // Update cleanup statistics
      return { updated: true };
    });

    const summary = {
      sessionsDeleted: expiredSessions.deleted,
      notificationsDeleted: oldNotifications.deleted,
      tempFilesDeleted: tempFiles.deleted,
    };

    await io.logger.info("Daily cleanup complete", summary);

    return { success: true, ...summary };
  },
});

/**
 * Scheduled Job: Hourly Health Check
 * Runs every hour to check system health
 */
export const hourlyHealthCheck = triggerClient.defineJob({
  id: "hourly-health-check",
  name: "Hourly Health Check",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 * * * *", // Every hour
  }),
  run: async (payload, io) => {
    await io.logger.info("Starting health check");

    const checks = [];

    // Check database
    const dbCheck = await io.runTask("check-database", async () => {
      try {
        // await db.$queryRaw`SELECT 1`;
        return { status: "healthy", latency: 5 };
      } catch {
        return { status: "unhealthy", error: "Connection failed" };
      }
    });
    checks.push({ name: "database", ...dbCheck });

    // Check external API
    const apiCheck = await io.runTask("check-external-api", async () => {
      try {
        const start = Date.now();
        // await fetch(process.env.EXTERNAL_API_URL + "/health");
        return { status: "healthy", latency: Date.now() - start };
      } catch {
        return { status: "unhealthy", error: "API unreachable" };
      }
    });
    checks.push({ name: "external-api", ...apiCheck });

    // Check storage
    const storageCheck = await io.runTask("check-storage", async () => {
      // Check storage availability
      return { status: "healthy", available: "95%" };
    });
    checks.push({ name: "storage", ...storageCheck });

    const allHealthy = checks.every((c) => c.status === "healthy");

    if (!allHealthy) {
      await io.logger.error("Health check failed", { checks });
      // Optionally send an alert
    } else {
      await io.logger.info("Health check passed", { checks });
    }

    return { healthy: allHealthy, checks };
  },
});

/**
 * Scheduled Job: Weekly Report
 * Generates and sends weekly reports every Monday at 9 AM
 */
export const weeklyReport = triggerClient.defineJob({
  id: "weekly-report",
  name: "Weekly Report",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 9 * * 1", // Every Monday at 9 AM
  }),
  run: async (payload, io) => {
    await io.logger.info("Generating weekly report");

    // Generate report data
    const reportData = await io.runTask("generate-data", async () => {
      return {
        newUsers: 150,
        activeUsers: 1234,
        revenue: 9876.54,
        topFeatures: ["Dashboard", "Reports", "API"],
      };
    });

    // Generate PDF
    const pdf = await io.runTask("generate-pdf", async () => {
      // Generate PDF using your preferred library
      return { url: "https://example.com/reports/weekly.pdf" };
    });

    // Send to stakeholders
    await io.runTask("send-emails", async () => {
      // Send email with report attached
      // await sendEmail({ to: "team@example.com", ... });
      return { sent: true };
    });

    await io.logger.info("Weekly report sent");

    return { success: true, reportUrl: pdf.url, data: reportData };
  },
});

