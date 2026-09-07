/**
 * Resilient API client for safe JSON communication with backend routes.
 * Prevents HTML parsing errors and unhandled promise rejections.
 */

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackData?: T
): Promise<{ ok: boolean; data: T; status: number; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await res.json();
      return {
        ok: res.ok,
        data: json as T,
        status: res.status,
        error: !res.ok ? (json?.error || `HTTP ${res.status}`) : undefined
      };
    }

    // Response is not JSON (e.g., plain text or HTML error page)
    const text = await res.text();
    return {
      ok: res.ok,
      data: (fallbackData ?? null) as unknown as T,
      status: res.status,
      error: !res.ok ? (text.slice(0, 100) || `HTTP ${res.status}`) : undefined
    };
  } catch (err: any) {
    return {
      ok: false,
      data: (fallbackData ?? null) as unknown as T,
      status: 0,
      error: err?.message || "Network request failed"
    };
  }
}
