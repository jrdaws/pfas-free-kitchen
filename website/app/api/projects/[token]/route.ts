import { NextRequest, NextResponse } from "next/server";
import { supabase, Project } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Validation failed", message: "Token is required" },
        { status: 400 }
      );
    }

    // Fetch project from database
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("token", token)
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Not found", message: `Project with token "${token}" not found` },
          { status: 404 }
        );
      }

      console.error("[Project Fetch Error]", error);
      return NextResponse.json(
        { error: "Database error", message: "Failed to fetch project", details: error.message },
        { status: 500 }
      );
    }

    // Check if project has expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "Expired",
          message: `Project "${token}" has expired. Projects expire after 30 days.`
        },
        { status: 410 }
      );
    }

    console.log(`[Project Retrieved] ${token} | ${data.template} | ${data.project_name}`);

    return NextResponse.json({
      success: true,
      project: data as Project,
    });
  } catch (error: any) {
    console.error("[Project Fetch Error]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch project",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
