/**
 * Cloudinary Signature API Route
 * 
 * Generates signed upload params for secure client-side uploads.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSignature } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, tags = [] } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign: Record<string, string> = {
      timestamp: timestamp.toString(),
    };

    if (folder) paramsToSign.folder = folder;
    if (tags.length) paramsToSign.tags = tags.join(",");

    const signature = generateSignature(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Failed to generate signature:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}

