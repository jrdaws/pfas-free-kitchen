import { triggerClient } from "./client";

/**
 * Task: Send welcome email
 * Triggered when a new user signs up
 */
export const sendWelcomeEmail = triggerClient.defineJob({
  id: "send-welcome-email",
  name: "Send Welcome Email",
  version: "1.0.0",
  trigger: {
    event: "user.signup",
  },
  run: async (payload: { email: string; name: string }, io) => {
    // Log the start of the job
    await io.logger.info("Sending welcome email", { email: payload.email });

    // Simulate email sending
    await io.wait("wait-before-send", 1000);

    // In a real app, you'd call your email service here
    await io.runTask("send-email", async () => {
      // await sendEmail({
      //   to: payload.email,
      //   subject: "Welcome!",
      //   template: "welcome",
      //   data: { name: payload.name },
      // });
      return { sent: true };
    });

    await io.logger.info("Welcome email sent", { email: payload.email });

    return { success: true, email: payload.email };
  },
});

/**
 * Task: Process webhook
 * Handle incoming webhook events
 */
export const processWebhook = triggerClient.defineJob({
  id: "process-webhook",
  name: "Process Webhook",
  version: "1.0.0",
  trigger: {
    event: "webhook.received",
  },
  run: async (payload: { type: string; data: Record<string, unknown> }, io) => {
    await io.logger.info("Processing webhook", { type: payload.type });

    // Handle different webhook types
    switch (payload.type) {
      case "payment.succeeded":
        await io.runTask("handle-payment", async () => {
          // Handle successful payment
          return { handled: true };
        });
        break;
      case "subscription.cancelled":
        await io.runTask("handle-cancellation", async () => {
          // Handle subscription cancellation
          return { handled: true };
        });
        break;
      default:
        await io.logger.warn("Unknown webhook type", { type: payload.type });
    }

    return { processed: true, type: payload.type };
  },
});

/**
 * Task: Generate report
 * Long-running job for generating reports
 */
export const generateReport = triggerClient.defineJob({
  id: "generate-report",
  name: "Generate Report",
  version: "1.0.0",
  trigger: {
    event: "report.requested",
  },
  run: async (
    payload: { reportType: string; userId: string; dateRange: { start: string; end: string } },
    io
  ) => {
    await io.logger.info("Generating report", {
      type: payload.reportType,
      user: payload.userId,
    });

    // Step 1: Fetch data
    const data = await io.runTask("fetch-data", async () => {
      // Fetch report data from your database
      return { records: 100 };
    });

    // Step 2: Process data
    const processed = await io.runTask("process-data", async () => {
      // Process and aggregate the data
      return { aggregated: true, recordCount: data.records };
    });

    // Step 3: Generate file
    const file = await io.runTask("generate-file", async () => {
      // Generate PDF or CSV
      return { fileUrl: "https://example.com/reports/report.pdf" };
    });

    // Step 4: Notify user
    await io.runTask("notify-user", async () => {
      // Send notification that report is ready
      return { notified: true };
    });

    return {
      success: true,
      reportUrl: file.fileUrl,
      recordCount: processed.recordCount,
    };
  },
});

