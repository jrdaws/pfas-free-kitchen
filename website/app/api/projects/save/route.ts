import { NextRequest, NextResponse } from "next/server";
import { supabase, generateToken, CreateProjectInput } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectInput = await request.json();

    // Validate required fields
    if (!body.template) {
      return NextResponse.json(
        { error: "Validation failed", message: "Template is required" },
        { status: 400 }
      );
    }

    if (!body.project_name) {
      return NextResponse.json(
        { error: "Validation failed", message: "Project name is required" },
        { status: 400 }
      );
    }

    // Generate unique token
    let token = generateToken();
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure token is unique (retry if collision)
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("projects")
        .select("token")
        .eq("token", token)
        .single();

      if (!existing) break;

      token = generateToken();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Token generation failed", message: "Could not generate unique token" },
        { status: 500 }
      );
    }

    // Insert project into database
    const { data, error } = await supabase
      .from("projects")
      .insert({
        token,
        template: body.template,
        project_name: body.project_name,
        output_dir: body.output_dir || "./my-app",
        integrations: body.integrations || {},
        env_keys: body.env_keys || {},
        vision: body.vision,
        mission: body.mission,
        success_criteria: body.success_criteria,
        inspirations: body.inspirations || [],
        description: body.description,
      })
      .select()
      .single();

    if (error) {
      console.error("[Project Save Error]", error);
      return NextResponse.json(
        { error: "Database error", message: "Failed to save project", details: error.message },
        { status: 500 }
      );
    }

    console.log(`[Project Saved] ${token} | ${body.template} | ${body.project_name}`);

    return NextResponse.json({
      success: true,
      token,
      project: data,
      pullCommand: `npx @jrdaws/framework pull ${token}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/configure?project=${token}`,
    });
  } catch (error: any) {
    console.error("[Project Save Error]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to save project",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
