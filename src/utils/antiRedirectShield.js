// ─────────────────────────────────────────────────────────────────────────────
// Anti-Redirect & Anti-Back-Trap Protection Shield
// Protects users from aggressive third-party ad networks (Adsterra, 1win, Monetag)
// that attempt to:
//   1. Automatically redirect without user clicks (window.location hijack)
//   2. Trap the browser back button (history.pushState spam)
//   3. Open unprompted popunders/popups
// ─────────────────────────────────────────────────────────────────────────────

(function initAntiRedirectShield() {
  if (typeof window === "undefined" || window.__ANTI_REDIRECT_SHIELD_INSTALLED__) {
    return;
  }
  window.__ANTI_REDIRECT_SHIELD_INSTALLED__ = true;

  let lastUserInteractionTime = 0;
  const USER_INTERACTION_TIMEOUT_MS = 1800; // 1.8 seconds validity window for user clicks

  // 1. Track genuine, trusted user gestures
  const registerUserGesture = (e) => {
    if (e && e.isTrusted) {
      lastUserInteractionTime = Date.now();
    }
  };

  const gestureEvents = ["pointerdown", "touchstart", "touchend", "click", "keydown"];
  gestureEvents.forEach((evt) => {
    window.addEventListener(evt, registerUserGesture, { capture: true, passive: true });
  });

  // Helper: Determine if URL is internal to AnimeToon or safe
  const isInternalOrSafeUrl = (targetUrl) => {
    if (!targetUrl) return true;
    try {
      const urlStr = String(targetUrl).trim();
      if (urlStr.startsWith("/") || urlStr.startsWith("#") || urlStr.startsWith("./") || urlStr.startsWith("../")) {
        return true;
      }
      const parsed = new URL(urlStr, window.location.href);
      const host = parsed.hostname.toLowerCase();
      const currentHost = window.location.hostname.toLowerCase();

      // Allowed domains
      if (
        host === currentHost ||
        host.endsWith("animetoon.in") ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.includes("t.me") ||
        host.includes("telegram.me")
      ) {
        return true;
      }
      return false;
    } catch {
      return true; // If invalid URL string, let browser handle normally
    }
  };

  // 2. Intercept window.location.assign & replace
  try {
    const originalAssign = window.location.assign.bind(window.location);
    const originalReplace = window.location.replace.bind(window.location);

    window.location.assign = function (url) {
      const timeSinceClick = Date.now() - lastUserInteractionTime;
      const isSafe = isInternalOrSafeUrl(url);

      if (!isSafe && timeSinceClick > USER_INTERACTION_TIMEOUT_MS) {
        console.warn("[AntiRedirectShield] Blocked unprompted external location.assign to:", url);
        return;
      }
      return originalAssign(url);
    };

    window.location.replace = function (url) {
      const timeSinceClick = Date.now() - lastUserInteractionTime;
      const isSafe = isInternalOrSafeUrl(url);

      if (!isSafe && timeSinceClick > USER_INTERACTION_TIMEOUT_MS) {
        console.warn("[AntiRedirectShield] Blocked unprompted external location.replace to:", url);
        return;
      }
      return originalReplace(url);
    };
  } catch (err) {
    // Some browsers make window.location methods non-configurable
    console.debug("[AntiRedirectShield] Could not override location methods:", err);
  }

  // 3. Intercept window.open (Popups & Popunders)
  try {
    const originalOpen = window.open.bind(window);
    window.open = function (url, target, features) {
      const timeSinceClick = Date.now() - lastUserInteractionTime;
      const isSafe = isInternalOrSafeUrl(url);

      // Block unprompted popups when no recent user click occurred
      if (!isSafe && timeSinceClick > USER_INTERACTION_TIMEOUT_MS) {
        console.warn("[AntiRedirectShield] Blocked unprompted window.open popup:", url);
        return null;
      }
      return originalOpen(url, target, features);
    };
  } catch (err) {
    console.debug("[AntiRedirectShield] Could not override window.open:", err);
  }

  // 4. Protect Browser History from Back-Button Hijacking (history.pushState spam)
  try {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    let pushHistoryLog = [];

    history.pushState = function (state, unused, url) {
      const now = Date.now();
      // Filter calls within the last 2 seconds
      pushHistoryLog = pushHistoryLog.filter((t) => now - t < 2000);

      // If ad script is spamming pushState (> 4 pushes in 2 seconds without user action)
      const timeSinceClick = now - lastUserInteractionTime;
      if (pushHistoryLog.length >= 4 && timeSinceClick > USER_INTERACTION_TIMEOUT_MS) {
        console.warn("[AntiRedirectShield] Blocked history back-button hijack spam:", url);
        return;
      }

      pushHistoryLog.push(now);
      return originalPushState(state, unused, url);
    };

    history.replaceState = function (state, unused, url) {
      return originalReplaceState(state, unused, url);
    };
  } catch (err) {
    console.debug("[AntiRedirectShield] Could not override history methods:", err);
  }

  // 5. Intercept Form Submission Hijack
  try {
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      const formAction = this.getAttribute("action") || "";
      const isSafe = isInternalOrSafeUrl(formAction);
      const timeSinceClick = Date.now() - lastUserInteractionTime;

      if (!isSafe && timeSinceClick > USER_INTERACTION_TIMEOUT_MS) {
        console.warn("[AntiRedirectShield] Blocked unprompted form submit redirect to:", formAction);
        return;
      }
      return originalSubmit.apply(this, arguments);
    };
  } catch (err) {
    console.debug("[AntiRedirectShield] Could not override form submit:", err);
  }

  console.info("[AntiRedirectShield] Active - Protected against auto-redirects & back-button hijacking.");
})();

export const notifyUserGesture = () => {
  // Can be called programmatically on genuine user actions
};
