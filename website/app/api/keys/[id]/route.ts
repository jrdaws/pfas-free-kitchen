/**
 * GET /api/keys/[id] - Get decrypted key (for use in exports)
 * DELETE /api/keys/[id] - Delete API key
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || "default-dev-key-32-chars-long!!";

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function getSupabaseClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.substring(7);
    const supabase = getSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the encrypted key
    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !apiKey) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    // Decrypt the key
    let decryptedKey: string;
    try {
      decryptedKey = decrypt(apiKey.encrypted_key);
    } catch {
      return NextResponse.json({ error: "Failed to decrypt key" }, { status: 500 });
    }

    // Update last used
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        provider: apiKey.provider,
        value: decryptedKey,
      },
    });
  } catch (error: unknown) {
    console.error("[API Key] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.substring(7);
    const supabase = getSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get key info for logging
    const { data: apiKey } = await supabase
      .from("api_keys")
      .select("name, provider")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[API Key] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    if (apiKey) {
      await supabase.rpc("log_activity", {
        p_type: "api_key",
        p_action: "API Key Deleted",
        p_details: `Deleted ${apiKey.provider} key: ${apiKey.name}`,
        p_metadata: { keyId: id, provider: apiKey.provider },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[API Key] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

