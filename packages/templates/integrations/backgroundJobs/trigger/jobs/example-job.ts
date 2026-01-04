import { triggerClient } from "@/lib/trigger/client";

/**
 * Example Job: Data Sync
 * Syncs data from an external API
 */
export const dataSyncJob = triggerClient.defineJob({
  id: "data-sync",
  name: "Data Sync",
  version: "1.0.0",
  trigger: {
    event: "data.sync.requested",
  },
  run: async (payload: { source: string; options?: Record<string, unknown> }, io) => {
    await io.logger.info("Starting data sync", { source: payload.source });

    // Step 1: Connect to source
    await io.runTask("connect-source", async () => {
      await io.wait("connection-delay", 500);
      return { connected: true };
    });

    // Step 2: Fetch data in batches
    const totalRecords = 100;
    const batchSize = 20;
    let processedRecords = 0;

    for (let batch = 0; batch < Math.ceil(totalRecords / batchSize); batch++) {
      await io.runTask(`process-batch-${batch}`, async () => {
        // Process batch of records
        const recordsInBatch = Math.min(batchSize, totalRecords - processedRecords);
        processedRecords += recordsInBatch;

        await io.logger.info("Processed batch", {
          batch,
          records: recordsInBatch,
          total: processedRecords,
        });

        return { processed: recordsInBatch };
      });
    }

    // Step 3: Cleanup
    await io.runTask("cleanup", async () => {
      return { cleaned: true };
    });

    await io.logger.info("Data sync complete", {
      source: payload.source,
      totalRecords: processedRecords,
    });

    return {
      success: true,
      source: payload.source,
      recordsProcessed: processedRecords,
    };
  },
});

/**
 * Helper: Trigger a data sync job
 */
export async function triggerDataSync(source: string, options?: Record<string, unknown>) {
  const { id } = await triggerClient.sendEvent({
    name: "data.sync.requested",
    payload: { source, options },
  });

  return { runId: id };
}

