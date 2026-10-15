import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaRedo, FaInfoCircle, FaCheckCircle, FaTimes } from "react-icons/fa";

/**
 * Multi-layer AdBlock detection:
 * 1. Cosmetic Filter Probe: Injects a bait DOM element with common ad classes.
 * 2. Network Probe: Attempts to fetch a dummy request to standard ad networks (Google AdSense / DoubleClick).
 */
export const runAdBlockCheck = async () => {
  // Never block admin panel
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return false;
  }

  let isBlocked = false;

  // --- Probe 1: DOM Bait Element ---
  try {
    const bait = document.createElement("div");
    bait.className = "adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads banner-ad banner_ad ad-unit ad-zone";
    bait.setAttribute("id", "ad-detector-probe");
    bait.style.cssText = "position: absolute !important; left: -9999px !important; top: -9999px !important; width: 300px !important; height: 250px !important; display: block !important; visibility: visible !important; pointer-events: none !important;";
    document.body.appendChild(bait);

    await new Promise((resolve) => setTimeout(resolve, 80));

    const computed = window.getComputedStyle(bait);
    if (
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      computed.display === "none" ||
      computed.visibility === "hidden"
    ) {
      isBlocked = true;
    }

    if (bait.parentNode) {
      bait.parentNode.removeChild(bait);
    }
  } catch {
    // ignore DOM manipulation errors
  }

  if (isBlocked) return true;

  // --- Probe 2: Network Request Probe ---
  try {
    const req = new Request("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
    await fetch(req);
  } catch (err) {
    if (navigator.brave && typeof navigator.brave.isBrave === "function") {
      try {
        const isBrave = await navigator.brave.isBrave();
        if (isBrave) isBlocked = true;
      } catch {
        isBlocked = true;
      }
    } else {
      try {
        const req2 = new Request("https://securepubads.g.doubleclick.net/tag/js/gpt.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        await fetch(req2);
      } catch {
        isBlocked = true;
      }
    }
  }

  return isBlocked;
};

// Global helper for initiating strict adblock check before Play, Download, or Telegram actions
export const requestStrictAdBlockCheck = async (actionName, onPassed) => {
  if (typeof window === "undefined") {
    if (onPassed) onPassed();
    return;
  }

  // Bypass on admin
  if (window.location.pathname.startsWith("/admin")) {
    if (onPassed) onPassed();
    return;
  }

  const isBlocked = await runAdBlockCheck();
  if (isBlocked) {
    window.dispatchEvent(
      new CustomEvent("open-strict-adblock-modal", {
        detail: { actionName, onPassed },
      })
    );
  } else {
    if (onPassed) onPassed();
  }
};

// Bind to window for universal access across components
if (typeof window !== "undefined") {
  window.__runAdBlockCheck = runAdBlockCheck;
  window.__requestStrictAdBlockCheck = requestStrictAdBlockCheck;
}

export default function AdBlockDetector() {
  // State for non-intrusive casual browsing banner
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("adblock_banner_dismissed") === "true";
    } catch {
      return false;
    }
  });

  // State for strict action modal (NO cancel button)
  const [strictModalOpen, setStrictModalOpen] = useState(false);
  const [strictAction, setStrictAction] = useState("");
  const [pendingCallback, setPendingCallback] = useState(null);

  const [isChecking, setIsChecking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Initial passive check on page load
  const runPassiveCheck = useCallback(async () => {
    if (window.location.pathname.startsWith("/admin")) return;
    const blocked = await runAdBlockCheck();
    setIsAdBlockDetected(blocked);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      runPassiveCheck();
    }, 1500);

    return () => clearTimeout(timer);
  }, [runPassiveCheck]);

  // Listen for strict checks triggered by Play / Download / Telegram
  useEffect(() => {
    const handleStrictRequest = (e) => {
      const { actionName, onPassed } = e.detail || {};
      setStrictAction(actionName || "continue");
      setPendingCallback(() => onPassed);
      setStrictModalOpen(true);
      setStatusMessage("");
    };

    window.addEventListener("open-strict-adblock-modal", handleStrictRequest);
    return () => {
      window.removeEventListener("open-strict-adblock-modal", handleStrictRequest);
    };
  }, []);

  // Lock body scroll ONLY when STRICT modal is open
  useEffect(() => {
    if (strictModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [strictModalOpen]);

  // Handle dismissal of casual banner
  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem("adblock_banner_dismissed", "true");
    } catch {
      // ignore storage errors
    }
  };

  // Re-verify function (used by both small banner & strict modal)
  const handleVerifyAdblock = async (isStrictMode = false) => {
    setIsChecking(true);
    setStatusMessage("Checking AdBlock status...");

    const stillBlocked = await runAdBlockCheck();

    await new Promise((r) => setTimeout(r, 600)); // Smooth UX transition
    setIsChecking(false);

    if (!stillBlocked) {
      setIsAdBlockDetected(false);
      setStatusMessage("AdBlocker disabled! Proceeding...");

      setTimeout(() => {
        setStatusMessage("");
        if (isStrictMode) {
          setStrictModalOpen(false);
          if (pendingCallback) {
            pendingCallback();
            setPendingCallback(null);
          }
        }
      }, 500);
    } else {
      setStatusMessage("AdBlocker is still detected! Please turn it off and try again.");
    }
  };

  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────────
          1. CASUAL BROWSING: Small Floating Popup / Toast (WITH CANCEL BUTTON)
          Shown only during normal browsing if adblock is detected and not dismissed.
          ──────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAdBlockDetected && !isBannerDismissed && !strictModalOpen && (
          <motion.aside
            aria-label="AdBlock Notice"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 left-5 z-[70] max-w-sm sm:max-w-md bg-[#12131a]/95 border border-purple-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl text-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 mt-0.5">
                <FaShieldAlt className="text-xl" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                    AdBlocker Detected
                  </h3>
                  {/* Cancel / Dismiss Button */}
                  <button
                    onClick={handleDismissBanner}
                    aria-label="Close AdBlocker Notice"
                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-gray-300 leading-snug">
                  Please consider disabling your AdBlocker. AnimeToon is 100% free and ads keep our streaming servers alive.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyAdblock(false)}
                    disabled={isChecking}
                    className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primaryBtn hover:opacity-90 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FaRedo className={`text-[9px] ${isChecking ? "animate-spin" : ""}`} />
                    {isChecking ? "Checking..." : "I've Disabled"}
                  </button>

                  {/* Explicit Cancel Button */}
                  <button
                    onClick={handleDismissBanner}
                    className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────────
          2. STRICT ACTION MODAL (FOR PLAY, DOWNLOAD, TELEGRAM): NO CANCEL BUTTON!
          User MUST disable adblock to proceed. Theme matched to AnimeToon.
          ──────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {strictModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#12131b] border border-primaryBtn/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(128,90,213,0.2)] text-white overflow-hidden"
            >
              {/* Glow Accents */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primaryBtn/25 rounded-full blur-3xl pointer-events-none" />

              {/* Icon Header */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600/30 to-pink-500/20 flex items-center justify-center border border-purple-500/50 shadow-inner">
                    <FaShieldAlt className="text-4xl text-purple-400 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                  AdBlocker Detected!
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                  To <span className="text-purple-400 font-bold">{strictAction || "proceed"}</span>, please disable your <span className="text-red-400 font-bold">AdBlocker</span>. AnimeToon is completely free with no subscriptions and funded solely by ads.
                </p>
              </div>

              {/* Steps to Disable */}
              <div className="my-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5 text-xs sm:text-sm text-gray-300">
                <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <FaInfoCircle className="text-primaryBtn text-sm" /> How to disable:
                </p>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Click your <strong>AdBlock extension icon</strong> in the browser toolbar.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Turn off protection or select <strong>"Pause on this site"</strong>.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Click <strong>Try Again</strong> below to instantly resume.</span>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-xl text-center text-xs font-semibold ${
                    statusMessage.includes("disabled")
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {statusMessage.includes("disabled") ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <FaCheckCircle /> {statusMessage}
                    </span>
                  ) : (
                    statusMessage
                  )}
                </motion.div>
              )}

              {/* Actions: Notice NO CANCEL BUTTON HERE! */}
              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyAdblock(true)}
                  disabled={isChecking}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-primaryBtn to-pink-600 hover:opacity-95 text-white shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaRedo className={isChecking ? "animate-spin" : ""} />
                  {isChecking ? "Verifying..." : "I've Disabled AdBlock — Try Again"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors text-center cursor-pointer"
                >
                  {showHelp ? "Hide Details" : "Need help disabling your ad blocker?"}
                </button>

                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-black/40 text-[11px] sm:text-xs text-gray-400 space-y-1.5 border border-white/5"
                  >
                    <p><strong>uBlock Origin:</strong> Click the large blue power icon in the extension popup, then click Try Again.</p>
                    <p><strong>Brave Browser:</strong> Click the lion shield icon in the URL bar and turn off "Shields UP".</p>
                    <p><strong>AdBlock Plus / AdGuard:</strong> Click the icon and select "Disable on this site".</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
