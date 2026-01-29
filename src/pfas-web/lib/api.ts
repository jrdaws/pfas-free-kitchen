/**
 * PFAS-Free Kitchen - API Client
 * 
 * Centralized API client for frontend to backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Custom error class for API errors with status code.
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'APIError';
  }

  /**
   * Check if error is a not found (404) error.
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a validation error (400).
   */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if error is an authentication error (401).
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a rate limit error (429).
   */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * Check if error is a server error (5xx).
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Parse error response from API.
 */
async function parseErrorResponse(res: Response): Promise<{ message: string; code?: string; field?: string }> {
  try {
    const data = await res.json();
    return {
      message: data.message || data.error?.message || data.error || 'An error occurred',
      code: data.code || data.error?.code,
      field: data.field || data.error?.field,
    };
  } catch {
    return { message: `HTTP ${res.status}: ${res.statusText || 'Unknown error'}` };
  }
}

/**
 * API Client for PFAS-Free Kitchen.
 * 
 * All methods return the unwrapped `data` field from API responses.
 */
export class APIClient {
  /**
   * Make a GET request.
   * 
   * @param endpoint - API endpoint (e.g., '/products')
   * @param options - Additional fetch options
   * @returns Unwrapped data from API response
   */
  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      // Enable Next.js caching for GET requests
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    // API wraps responses in { data: ... }
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Make a POST request.
   * 
   * @param endpoint - API endpoint
   * @param body - Request body (will be JSON stringified)
   * @param options - Additional fetch options
   * @returns Unwrapped data from API response
   */
  static async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Make a PUT request.
   */
  static async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Make a PATCH request.
   */
  static async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Make a DELETE request.
   */
  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Upload a file via multipart form data.
   */
  static async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        // Don't set Content-Type - browser will set it with boundary
        'Accept': 'application/json',
        ...options?.headers,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await parseErrorResponse(res);
      throw new APIError(res.status, error.message, error.code, error.field);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  /**
   * Get the base URL for constructing URLs manually.
   */
  static getBaseUrl(): string {
    return API_BASE;
  }
}

/**
 * Check if an error is an APIError.
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}
