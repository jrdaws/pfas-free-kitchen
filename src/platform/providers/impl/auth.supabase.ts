import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuthProvider } from "../auth";
import type { AuthUser, Session, ProviderHealth } from "../types";

// Singleton Supabase client
let _client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url) {
      throw new Error("SUPABASE_URL environment variable is not set");
    }
    if (!anonKey) {
      throw new Error("SUPABASE_ANON_KEY environment variable is not set");
    }

    _client = createClient(url, anonKey);
  }
  return _client;
}

// Error mapping utility
class SupabaseAuthError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly originalError?: unknown;

  constructor(
    message: string,
    code: string,
    status?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = "SupabaseAuthError";
    this.code = code;
    this.status = status;
    this.originalError = originalError;
  }
}

function mapSupabaseError(error: unknown, context: string): SupabaseAuthError {
  if (error && typeof error === "object" && "message" in error) {
    const err = error as { message: string; code?: string; status?: number };
    return new SupabaseAuthError(
      `[${context}] ${err.message}`,
      err.code || "unknown",
      err.status,
      error
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return new SupabaseAuthError(
    `[${context}] ${message}`,
    "unknown_error",
    undefined,
    error
  );
}

const provider: AuthProvider = {
  name: "auth.supabase",

  async getSession(req: Request): Promise<Session | null> {
    try {
      // Extract Authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const client = getSupabaseClient();

      // Verify the token with Supabase
      const { data, error } = await client.auth.getUser(token);

      if (error || !data.user) {
        return null;
      }

      // Map Supabase user to framework AuthUser
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
        imageUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        emailVerified: data.user.email_confirmed_at != null,
      };

      return {
        user,
        accessToken: token,
        expiresAt: undefined, // Supabase handles expiration internally
      };
    } catch (error) {
      throw mapSupabaseError(error, "getSession");
    }
  },

  async requireSession(req: Request): Promise<Session> {
    const session = await this.getSession(req);
    if (!session) {
      throw new SupabaseAuthError(
        "Authentication required",
        "unauthorized",
        401
      );
    }
    return session;
  },

  async signInWithEmail(email: string, redirectTo?: string): Promise<void> {
    const client = getSupabaseClient();
    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw mapSupabaseError(error, "signInWithEmail");
    }
  },

  async signInWithOAuth(
    provider: "google" | "apple" | "facebook",
    redirectTo?: string
  ): Promise<void> {
    const client = getSupabaseClient();
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw mapSupabaseError(error, "signInWithOAuth");
    }
  },

  async signOut(session: Session): Promise<void> {
    const client = getSupabaseClient();
    try {
      if (!session.accessToken) {
        throw new Error("Session has no access token");
      }

      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      throw mapSupabaseError(error, "signOut");
    }
  },

  async getUser(userId: string): Promise<AuthUser | null> {
    const client = getSupabaseClient();
    try {
      // Note: This requires a service role key for admin operations
      // For now, we'll use the auth.admin API which requires service_role
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!serviceKey) {
        throw new Error(
          "SUPABASE_SERVICE_KEY required for admin operations like getUser"
        );
      }

      // Create admin client with service key
      const adminClient = createClient(
        process.env.SUPABASE_URL!,
        serviceKey
      );

      const { data, error } = await adminClient.auth.admin.getUserById(userId);

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
        imageUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        emailVerified: data.user.email_confirmed_at != null,
      };
    } catch (error) {
      throw mapSupabaseError(error, "getUser");
    }
  },

  async health(): Promise<ProviderHealth> {
    try {
      const client = getSupabaseClient();

      // Lightweight health check - verify client is configured
      // We don't make an actual API call to avoid costs
      return {
        ok: true,
        provider: "auth.supabase",
        details: {
          url: Boolean(process.env.SUPABASE_URL),
          anonKey: Boolean(process.env.SUPABASE_ANON_KEY),
          serviceKey: Boolean(process.env.SUPABASE_SERVICE_KEY),
          configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        },
      };
    } catch (error) {
      return {
        ok: false,
        provider: "auth.supabase",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
};

export default provider;
