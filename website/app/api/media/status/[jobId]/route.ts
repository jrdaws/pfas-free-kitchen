import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/media-jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: "Job ID required" },
      { status: 400 }
    );
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      assets: job.assets,
      createdAt: job.createdAt,
      projectName: job.projectName,
      assetTarget: job.assetTarget,
    },
  });
}

