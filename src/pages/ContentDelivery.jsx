import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaClock, 
  FaArrowDown, 
  FaFilm, 
  FaTv 
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

  // 10-Second Wait State
  const INITIAL_COUNTDOWN = 10;
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [isReadyToGetLink, setIsReadyToGetLink] = useState(false);
  const [hasStartedDownload, setHasStartedDownload] = useState(false);

  const destinationRef = useRef(null);

  // Countdown timer logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTimerFinished(true);
    }
  }, [countdown]);

  // Handle "Continue" click -> Smooth scroll to destination section
  const handleContinueClick = () => {
    setIsReadyToGetLink(true);
    setTimeout(() => {
      if (destinationRef.current) {
        destinationRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Handle "Get Link" click -> Trigger download or redirect
  const handleGetLinkClick = () => {
    if (!targetUrl) return;
    setHasStartedDownload(true);

    // If an adSmartlink is configured, open in background/new tab once
    if (settings.adSmartlink && settings.showAds) {
      try {
        const smartUrlMatch = settings.adSmartlink.match(/https?:\/\/[^\s"']+/);
        if (smartUrlMatch && smartUrlMatch[0]) {
          window.open(smartUrlMatch[0], "_blank", "noopener noreferrer");
        }
      } catch {
        // ignore smartlink error
      }
    }

    // Trigger target action
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

  const progressPercent = Math.round(((INITIAL_COUNTDOWN - countdown) / INITIAL_COUNTDOWN) * 100);

  return (
    <div className="min-h-screen bg-bgColor text-primaryTextColor pt-24 pb-20 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col items-center">
      {/* Intermediate delivery page should have noindex to protect SEO health */}
      <SEO
        title={`Secure Content Gateway - ${title} | ${settings.siteName || "AnimeToon"}`}
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
      <div className="w-full my-3 flex justify-center">
        <AdComponent type="adBanner" />
      </div>

      {/* Main Delivery Glassmorphic Card */}
      <div className="w-full bg-[#12131b]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/20 backdrop-blur-xl relative overflow-hidden">
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
              High speed cloud link with verified file integrity. Free direct access provided by AnimeToon.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: 10-SECOND COUNTDOWN & VIEWABILITY SECTION
            ───────────────────────────────────────────────────────────── */}
        <div className="py-8 flex flex-col items-center text-center">
          {!isTimerFinished ? (
            <div className="flex flex-col items-center">
              {/* Radial Progress Timer */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    stroke="url(#purpleGradient)"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#805ad5" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {countdown}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Seconds</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
                  <FaClock className="text-primaryBtn animate-spin text-sm" />
                  Generating Your Secure Link...
                </h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Please wait {countdown} seconds while we prepare the high-speed download server.
                </p>
              </div>
            </div>
          ) : (
            /* Timer Finished -> Shows "Continue" Button */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full max-w-md"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-2xl mb-4 shadow-lg shadow-green-500/20">
                <FaCheckCircle />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                Your Link is Ready!
              </h3>
              <p className="text-xs text-gray-300 mb-6">
                Click the continue button below to scroll down and reveal your direct access link.
              </p>

              {/* Continue Button */}
              <button
                onClick={handleContinueClick}
                className="w-full py-4 px-8 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-primaryBtn via-purple-600 to-pink-600 hover:opacity-95 text-white shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Continue to Link</span>
                <FaArrowDown className="animate-bounce" />
              </button>
            </motion.div>
          )}

          {/* Adsterra Middle Ad Placement for Maximum Duration & Viewability */}
          <div className="w-full my-6 flex justify-center">
            <AdComponent type="adInFeed" />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: DESTINATION SECTION (REVEALED BY CONTINUE CLICK)
            ───────────────────────────────────────────────────────────── */}
        <div ref={destinationRef} id="get-link-destination" className="pt-8 border-t border-white/10">
          <div className="flex flex-col items-center text-center">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-primaryBtn mb-2">
              Destination Link
            </h4>

            {isReadyToGetLink ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                {/* Final Action Button: "Get Link" */}
                <button
                  onClick={handleGetLinkClick}
                  className="w-full py-4 px-8 rounded-full font-black text-sm uppercase tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl shadow-green-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {contentType === "Telegram" ? (
                    <>
                      <PiTelegramLogo className="text-xl" />
                      <span>Get Telegram File</span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="text-base" />
                      <span>Get Link / Download</span>
                    </>
                  )}
                </button>

                {hasStartedDownload && (
                  <p className="mt-3 text-xs text-green-400 font-semibold flex items-center gap-1.5">
                    <FaCheckCircle /> Link opened! You can now return back to the site.
                  </p>
                )}
              </motion.div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                {isTimerFinished
                  ? "Click the 'Continue to Link' button above to unlock your link."
                  : "Please wait for the 10-second timer to finish."}
              </p>
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
