import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaRedo, FaInfoCircle, FaCheckCircle } from "react-icons/fa";

/**
 * Multi-layer AdBlock detection:
 * 1. Cosmetic Filter Probe: Injects a bait DOM element with common ad classes.
 *    Adblockers hide it using CSS rules (display: none !important).
 * 2. Network Probe: Attempts to fetch a dummy request to standard ad networks (Google AdSense / DoubleClick).
 *    Adblockers block this immediately (net::ERR_BLOCKED_BY_CLIENT).
 *
 * Normal users will NOT be blocked because neither the DOM bait is hidden nor the network requests blocked.
 */
const runAdBlockCheck = async () => {
  // Never block admin panel
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return false;
  }

  let isBlocked = false;

  // --- Probe 1: DOM Bait Element (detects uBlock Origin, Adblock Plus, AdGuard, Brave cosmetic filters) ---
  try {
    const bait = document.createElement("div");
    bait.className = "adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads banner-ad banner_ad ad-unit ad-zone";
    bait.setAttribute("id", "ad-detector-probe");
    bait.style.cssText = "position: absolute !important; left: -9999px !important; top: -9999px !important; width: 300px !important; height: 250px !important; display: block !important; visibility: visible !important; pointer-events: none !important;";
    document.body.appendChild(bait);

    // Wait a brief tick for browser extensions' content scripts & CSS rules to inject
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
    // If DOM manipulation throws, ignore
  }

  if (isBlocked) return true;

  // --- Probe 2: Network Request Probe (detects network-level Adblockers, DNS blockers, Brave Shields) ---
  try {
    const req = new Request("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
    await fetch(req);
  } catch (err) {
    // Check Brave Shields
    if (navigator.brave && typeof navigator.brave.isBrave === "function") {
      try {
        const isBrave = await navigator.brave.isBrave();
        if (isBrave) isBlocked = true;
      } catch {
        isBlocked = true;
      }
    } else {
      // Secondary confirmation with DoubleClick to avoid false positives on transient network drops
      try {
        const req2 = new Request("https://securepubads.g.doubleclick.net/tag/js/gpt.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        await fetch(req2);
      } catch {
        // Both ad networks failed => Confirmed adblocker
        isBlocked = true;
      }
    }
  }

  return isBlocked;
};

export default function AdBlockDetector() {
  const [isAdBlockActive, setIsAdBlockActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const checkStatus = useCallback(async (isManualRetry = false) => {
    if (window.location.pathname.startsWith("/admin")) {
      setIsAdBlockActive(false);
      return;
    }

    if (isManualRetry) {
      setIsChecking(true);
      setStatusMessage("Checking AdBlock status...");
    }

    const blocked = await runAdBlockCheck();

    if (isManualRetry) {
      await new Promise((r) => setTimeout(r, 600)); // Smooth feel
      setIsChecking(false);
      if (!blocked) {
        setStatusMessage("AdBlocker disabled! Unlocking site...");
        setTimeout(() => {
          setIsAdBlockActive(false);
          setStatusMessage("");
        }, 500);
        return;
      } else {
        setStatusMessage("AdBlocker is still detected! Please turn it off and try again.");
      }
    }

    setIsAdBlockActive(blocked);
  }, []);

  useEffect(() => {
    // Initial check after short delay to let page stabilize
    const timer = setTimeout(() => {
      checkStatus(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [checkStatus]);

  // Lock body scroll when blocker is active
  useEffect(() => {
    if (isAdBlockActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAdBlockActive]);

  if (!isAdBlockActive) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-lg bg-[#14151b] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-500/10 text-white overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primaryBtn/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600/20 to-orange-500/20 flex items-center justify-center border border-red-500/40 shadow-inner">
                <FaShieldAlt className="text-4xl text-red-500 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              AdBlocker Detected!
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              We noticed you are using an <span className="text-red-400 font-semibold">Ad Blocker</span>.
              AnimeToon is completely free to watch with no subscriptions, and we rely on ads to keep our streaming servers fast and alive.
            </p>
          </div>

          {/* Steps */}
          <div className="my-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-xs sm:text-sm text-gray-300">
            <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <FaInfoCircle className="text-primaryBtn text-sm" /> How to continue:
            </p>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <span>Click your <strong>AdBlock extension icon</strong> in the browser toolbar.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <span>Toggle off protection or select <strong>"Pause on this site"</strong>.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <span>Click the <strong>Try Again</strong> button below to resume watching.</span>
            </div>
          </div>

          {/* Status Alert Message */}
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => checkStatus(true)}
              disabled={isChecking}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRedo className={isChecking ? "animate-spin" : ""} />
              {isChecking ? "Verifying..." : "I've Disabled AdBlock — Try Again"}
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors text-center"
            >
              {showHelp ? "Hide Details" : "Need help disabling your ad blocker?"}
            </button>

            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-black/40 text-xs text-gray-400 space-y-2 border border-white/5"
              >
                <p><strong>uBlock Origin:</strong> Click the big power icon in the extension popup to turn it blue/off, then reload.</p>
                <p><strong>Brave Browser:</strong> Click the lion icon in the URL bar and toggle off "Shields UP".</p>
                <p><strong>AdBlock Plus / AdGuard:</strong> Click the icon and select "Enabled on this site" to disable it.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
