import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaClock, 
  FaFilm, 
  FaLock, 
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaHandPointer
} from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";
import SEO from "../components/SEO";
import AdComponent from "../components/AdComponent";
import { useSettings } from "../context/SettingsContext";

export default function ContentDelivery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Extract query parameters
  const targetUrl = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Anime Episode";
  const quality = searchParams.get("quality") || "HD 1080p";
  const contentType = searchParams.get("type") || "Download"; // 'Download' | 'Telegram' | 'MX Player'
  const poster = searchParams.get("poster") || "";
  const size = searchParams.get("size") || "";

  // ── Ad Verification State & Timers ──────────────────────────────────────────
  const [hasClickedAd, setHasClickedAd] = useState(false);
  const [isAdVerified, setIsAdVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [hasStartedDownload, setHasStartedDownload] = useState(false);

  const leaveTimestampRef = useRef(null);
  const destinationRef = useRef(null);
  const adBoxRef = useRef(null);

  // Helper to determine the actual Adsterra redirect URL
  const getAdsterraRedirectUrl = () => {
    // 1. Check if an explicit Direct Link / Smartlink was configured in Admin Panel
    if (settings?.adSmartlink) {
      const match = settings.adSmartlink.match(/https?:\/\/[^\s"']+/);
      if (match && match[0]) return match[0];
    }

    // 2. Extract key from Adsterra adPopup script if available
    const popupCode = settings?.adPopup || "";
    const keyMatch = popupCode.match(/[a-f0-9]{32}/i);
    const key = keyMatch ? keyMatch[0] : "73396f53e4d0e2635a379ba01777a0aa";

    // 3. Official Adsterra direct monetization gateway
    return `https://www.profitablecpmrate.com/f9vkv98v?key=${key}`;
  };

  // ── Track Tab Blur & Focus for 5-Second Verification ────────────────────────
  useEffect(() => {
    const handleWindowBlur = () => {
      // User switched away to the ad page / clicked out
      leaveTimestampRef.current = Date.now();
    };

    const handleWindowFocus = () => {
      // User returned back to our page
      if (leaveTimestampRef.current && (hasClickedAd || !isAdVerified)) {
        const timeAwayMs = Date.now() - leaveTimestampRef.current;
        const timeAwaySec = timeAwayMs / 1000;
        leaveTimestampRef.current = null;

        if (timeAwaySec < 5) {
          const roundedSec = Math.max(1, Math.floor(timeAwaySec));
          setVerificationError(
            `You only waited ${roundedSec} second${roundedSec === 1 ? "" : "s"}! You must stay on the sponsor page for at least 5 seconds to unlock the download link. Please click the ad again and wait 5 seconds.`
          );
          setVerificationSuccess(false);
        } else {
          // Stayed 5 seconds or more -> Verification Successful!
          setIsAdVerified(true);
          setVerificationError("");
          setVerificationSuccess(true);
          setTimeout(() => {
            if (destinationRef.current) {
              destinationRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleWindowBlur();
      } else if (document.visibilityState === "visible") {
        handleWindowFocus();
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasClickedAd, isAdVerified]);

  // Handle clicking on an Ad / Sponsor Card -> Opens real Adsterra redirect ad
  const handleAdInteraction = () => {
    setHasClickedAd(true);
    leaveTimestampRef.current = Date.now();
    setVerificationError("");

    const adUrl = getAdsterraRedirectUrl();
    window.open(adUrl, "_blank", "noopener noreferrer");
  };

  // Handle "Get Link" click -> Trigger download or Telegram redirect
  const handleGetLinkClick = () => {
    if (!targetUrl || !isAdVerified) return;
    setHasStartedDownload(true);

    if (contentType === "Telegram" || targetUrl.startsWith("https://t.me")) {
      window.open(targetUrl, "_blank", "noopener noreferrer");
    } else if (contentType === "MX Player" || targetUrl.startsWith("intent:")) {
      window.location.href = targetUrl;
    } else {
      // Direct file download
      const tempLink = document.createElement("a");
      tempLink.href = targetUrl;
      tempLink.setAttribute("download", "");
      tempLink.setAttribute("target", "_blank");
      tempLink.setAttribute("rel", "noopener noreferrer");
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    }
  };

  return (
    <div className="min-h-screen bg-bgColor text-primaryTextColor pt-24 pb-20 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col items-center">
      {/* ── Active Redirect / Popunder Ad Injection on Content Delivery Page ── */}
      <AdComponent type="adPopup" />

      {/* Intermediate delivery page should have noindex to protect SEO health */}
      <SEO
        title={`Secure Content Gateway - ${title} | ${settings?.siteName || "AnimeToon"}`}
        description={`Secure content link gateway for ${title}. Fast anime streaming and downloads.`}
        link={window.location.href}
        type="website"
      />

      {/* Top Navigation / Return Link */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Anime Details</span>
        </button>

        <span className="text-[11px] font-bold uppercase tracking-widest text-primaryBtn flex items-center gap-1.5 bg-primaryBtn/10 px-3 py-1 rounded-full border border-primaryBtn/20">
          <FaShieldAlt /> Fast & Secure Delivery
        </span>
      </div>

      {/* Top Banner Ad Slot for Viewability */}
      <div className="w-full my-2 flex justify-center">
        <AdComponent type="adBanner" />
      </div>

      {/* Main Delivery Glassmorphic Card */}
      <div className="w-full bg-[#12131b]/95 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/20 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-primaryBtn/20 rounded-full blur-3xl pointer-events-none" />

        {/* Anime Information Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-white/10">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-2xl shadow-lg border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-24 h-32 sm:w-28 sm:h-36 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 text-primaryBtn text-3xl">
              {contentType === "Telegram" ? <PiTelegramLogo /> : <FaFilm />}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-primaryBtn/20 text-purple-300 border border-primaryBtn/30 text-[10px] font-extrabold uppercase tracking-wider">
                {contentType}
              </span>
              {quality && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {quality}
                </span>
              )}
              {size && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {size}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight line-clamp-2 mb-2">
              {title}
            </h1>

            <p className="text-xs text-gray-400">
              High speed direct cloud access verified by AnimeToon. Please complete the quick sponsor verification below to generate your download link.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: AD CLICK & 5-SECOND VERIFICATION INSTRUCTIONS
            ───────────────────────────────────────────────────────────── */}
        <div className="py-8 flex flex-col items-center text-center">
          {/* Prominent Verification Notice in English */}
          <div className="w-full max-w-xl bg-purple-950/40 border-2 border-primaryBtn/40 rounded-2xl p-5 mb-6 text-center shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-300">
                Sponsor Verification Required
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed mb-4">
              Click any ad below, stay on the ad page for at least <span className="text-yellow-400 font-bold">5 seconds</span>, and return here to unlock your download link.
            </p>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] sm:text-xs">
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center sm:flex-col gap-2 justify-center">
                <span className="w-5 h-5 rounded-full bg-primaryBtn text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                <span className="text-gray-300 font-semibold">Click Any Ad Below</span>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center sm:flex-col gap-2 justify-center">
                <span className="w-5 h-5 rounded-full bg-yellow-500/30 text-yellow-300 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                <span className="text-gray-300 font-semibold">Stay 5 Seconds on Ad</span>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center sm:flex-col gap-2 justify-center">
                <span className="w-5 h-5 rounded-full bg-green-500/30 text-green-300 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                <span className="text-gray-300 font-semibold">Return & Get Link</span>
              </div>
            </div>
          </div>

          {/* Verification Status Alerts */}
          <AnimatePresence>
            {verificationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full max-w-xl mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-3 text-left shadow-lg"
              >
                <FaExclamationTriangle className="text-2xl text-red-400 shrink-0" />
                <div>
                  <p className="font-bold text-red-200 mb-0.5">Verification Incomplete!</p>
                  <p>{verificationError}</p>
                </div>
              </motion.div>
            )}

            {verificationSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full max-w-xl mb-6 p-4 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs sm:text-sm font-semibold flex items-center gap-3 text-left shadow-lg"
              >
                <FaCheckCircle className="text-2xl text-green-400 shrink-0" />
                <div>
                  <p className="font-bold text-green-200 mb-0.5">Verification Successful!</p>
                  <p>You stayed on the sponsor page for 5+ seconds. Your download button is now unlocked below!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────
              INTERACTIVE SPONSOR AD BOX (CLICK TO TRIGGER ADSTERRA REDIRECT)
              ───────────────────────────────────────────────────────────── */}
          <div
            ref={adBoxRef}
            onClick={handleAdInteraction}
            className={`w-full max-w-xl rounded-2xl border-2 transition-all p-4 cursor-pointer relative group ${
              isAdVerified
                ? "border-green-500/40 bg-green-950/10"
                : "border-primaryBtn/50 bg-[#171822] hover:border-primaryBtn hover:shadow-[0_0_25px_rgba(128,90,213,0.3)]"
            }`}
          >
            {/* Click to verify banner bar */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primaryBtn flex items-center gap-1.5">
                <FaHandPointer className="animate-bounce" />
                Click Ad Below to Verify (5 Seconds)
              </span>

              <span className="text-[10px] font-bold text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors">
                Open Sponsor <FaExternalLinkAlt className="text-[9px]" />
              </span>
            </div>

            {/* Ad Container with Native & Banner ad components */}
            <div className="w-full min-h-[140px] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden pointer-events-auto">
              <AdComponent type="adInFeed" />
              <AdComponent type="adBanner" />
              {/* Fallback visual banner if ads blocked or loading */}
              <div className="py-6 px-4 text-center">
                <p className="text-xs sm:text-sm font-black text-white group-hover:text-purple-300 transition-colors flex items-center justify-center gap-2">
                  <FaExternalLinkAlt className="text-primaryBtn" />
                  Click Here to Open Sponsor Ad
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Stay for 5 seconds on the opened page, then return here.
                </p>
              </div>
            </div>

            {/* Interactive verification pulse button */}
            {!isAdVerified && (
              <div className="mt-3">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-primaryBtn hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <FaHandPointer />
                  Click to Open Ad & Wait 5 Seconds
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: DESTINATION LINK SECTION (LOCKED / UNLOCKED)
            ───────────────────────────────────────────────────────────── */}
        <div ref={destinationRef} id="get-link-destination" className="pt-8 border-t border-white/10">
          <div className="flex flex-col items-center text-center">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-primaryBtn mb-3">
              Destination Link
            </h4>

            {isAdVerified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                {/* UNLOCKED: "Get Link / Download" Button */}
                <button
                  onClick={handleGetLinkClick}
                  className="w-full py-4 px-8 rounded-full font-black text-sm uppercase tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl shadow-green-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {contentType === "Telegram" ? (
                    <>
                      <PiTelegramLogo className="text-xl" />
                      <span>Get Telegram File</span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="text-base" />
                      <span>Get Link / Download Now</span>
                    </>
                  )}
                </button>

                {hasStartedDownload && (
                  <p className="mt-3 text-xs text-green-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <FaCheckCircle /> Action initiated! You can now return back to the site.
                  </p>
                )}
              </motion.div>
            ) : (
              /* LOCKED BUTTON: User must click ad & wait 5 seconds */
              <div className="w-full max-w-md flex flex-col items-center">
                <button
                  onClick={() => {
                    handleAdInteraction();
                    if (adBoxRef.current) {
                      adBoxRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="w-full py-4 px-8 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-white/10 hover:bg-white/15 border border-white/20 text-gray-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <FaLock className="text-yellow-400" />
                  <span>Click Ad Above & Wait 5s to Unlock</span>
                </button>

                <p className="text-[11px] text-gray-400 mt-2 italic">
                  Complete the 5-second sponsor visit to activate this download button.
                </p>
              </div>
            )}

            {/* Return to website link */}
            <div className="mt-8">
              <Link
                to="/"
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors underline underline-offset-4"
              >
                ← Return to AnimeToon Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad Component */}
      <div className="w-full mt-8 flex justify-center">
        <AdComponent type="adFooter" />
      </div>
    </div>
  );
}
