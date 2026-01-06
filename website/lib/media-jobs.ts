/**
 * Media Generation Job Storage
 * 
 * In-memory storage for generation jobs.
 * In production, this should be replaced with Redis or database storage.
 */

export interface GenerationJob {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  assets: Array<{
    id: string;
    status: "pending" | "generating" | "complete" | "failed";
    progress: number;
    imageUrl?: string;
    error?: string;
  }>;
  createdAt: string;
  projectName: string;
  assetTarget: string;
}

// In-memory job storage
const jobs = new Map<string, GenerationJob>();

// Job TTL (1 hour)
const JOB_TTL_MS = 1000 * 60 * 60;

/**
 * Get a job by ID
 */
export function getJob(jobId: string): GenerationJob | undefined {
  return jobs.get(jobId);
}

/**
 * Set a job
 */
export function setJob(job: GenerationJob): void {
  jobs.set(job.id, job);
}

/**
 * Delete a job
 */
export function deleteJob(jobId: string): void {
  jobs.delete(jobId);
}

/**
 * Cleanup old jobs
 */
export function cleanupOldJobs(): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - new Date(job.createdAt).getTime() > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
}

/**
 * Get all jobs (for debugging)
 */
export function getAllJobs(): GenerationJob[] {
  return Array.from(jobs.values());
}

