/**
 * Example Integration - File Upload API Route
 * 
 * This file demonstrates the pattern for API route handlers.
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/example";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 2. Convert to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Upload using the integration helper
    const result = await uploadFile(buffer, {
      filename: file.name,
    });

    // 4. Return success response
    return NextResponse.json({
      success: true,
      url: result.url,
      id: result.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[Example Upload] Error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

