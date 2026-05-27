/**
 * ndjsonStream.js
 * ─────────────────────────────────────────────────────────────────────────
 * Hybrid NDJSON streaming utility.
 *
 * The backend already uses:
 *   • orjson  – ultra-fast binary JSON serialiser (server side)
 *   • ujson   – fast JSON fallback (server side)
 *   • NDJSON  – newline-delimited JSON framing for streaming responses
 *
 * On the client we use the native Fetch Streams API + TextDecoder to
 * progressively parse each NDJSON line and call onItem() as items arrive,
 * giving a "data streams in" experience instead of a full-page loading block.
 *
 * Usage:
 *   const abort = streamNDJSON(url, (item) => setState(prev => [...prev, item]));
 *   // call abort() to cancel mid-stream
 */

/**
 * Stream an NDJSON endpoint and call onItem for every parsed JSON line.
 *
 * @param {string} url          - Full URL to the NDJSON endpoint
 * @param {function} onItem     - Called with each parsed object as it arrives
 * @param {function} [onDone]   - Called when the stream finishes (optional)
 * @param {function} [onError]  - Called with Error on failure (optional)
 * @param {object}  [headers]   - Extra request headers (optional)
 * @returns {function}          - Abort function to cancel the stream
 */
export function streamNDJSON(url, onItem, onDone, onError, headers = {}) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/x-ndjson",
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`NDJSON stream failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partial + chunk).split("\n");
        partial = lines.pop(); // keep incomplete last line for next iteration

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            onItem(JSON.parse(trimmed));
          } catch (e) {
            // Skip malformed lines silently – robust for real-world network glitches
            console.warn("[ndjsonStream] Skipping malformed line:", trimmed.slice(0, 80));
          }
        }
      }

      // Flush any remaining partial line
      if (partial.trim()) {
        try {
          onItem(JSON.parse(partial.trim()));
        } catch (_) {}
      }

      onDone?.();
    } catch (err) {
      if (err.name === "AbortError") return; // Expected on cancel – not an error
      console.error("[ndjsonStream] Error:", err);
      onError?.(err);
    }
  })();

  return () => controller.abort();
}

/**
 * Build a query string from a params object, ignoring undefined/null values.
 *
 * @param {object} params
 * @returns {string}
 */
export function buildQueryString(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}
