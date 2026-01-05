/**
 * GET /api/keys - List user's API keys
 * POST /api/keys - Add new API key
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Simple encryption for API keys (in production, use Vault or AWS KMS)
const ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || "default-dev-key-32-chars-long!!";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function createKeyPreview(key: string): string {
  if (key.length <= 12) return "••••••••";
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

function getSupabaseClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    let query = supabase
      .from("api_keys")
      .select("id, name, provider, key_preview, status, last_used_at, expires_at, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (provider) {
      query = query.eq("provider", provider);
    }

    const { data: keys, error } = await query;

    if (error) {
      console.error("[API Keys] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, keys });
  } catch (error: unknown) {
    console.error("[API Keys] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { name, provider, key, expiresAt } = body;

    if (!name || !provider || !key) {
      return NextResponse.json({ error: "Name, provider, and key required" }, { status: 400 });
    }

    // Encrypt the key
    const encryptedKey = encrypt(key);
    const keyPreview = createKeyPreview(key);

    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name,
        provider,
        encrypted_key: encryptedKey,
        key_preview: keyPreview,
        expires_at: expiresAt || null,
        status: "active",
      })
      .select("id, name, provider, key_preview, status, created_at")
      .single();

    if (error) {
      console.error("[API Keys] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc("log_activity", {
      p_type: "api_key",
      p_action: "API Key Added",
      p_details: `Added ${provider} key: ${name}`,
      p_metadata: { keyId: apiKey.id, provider },
    });

    return NextResponse.json({ success: true, key: apiKey });
  } catch (error: unknown) {
    console.error("[API Keys] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

