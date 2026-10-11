import React, { useState, useEffect } from "react";
import { FiRefreshCw, FiAlertTriangle, FiSend, FiShield, FiWifiOff } from "react-icons/fi";
import { useSettings } from "../context/SettingsContext";

const MaintenanceScreen = ({ message, isServerDown = false, onRetry }) => {
  const { settings } = useSettings();
  const [countdown, setCountdown] = useState(10);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-retry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleManualRetry();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRetry]);

  const handleManualRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } catch (err) {
      console.warn("Retry failed:", err);
    } finally {
      setIsRetrying(false);
      setCountdown(10);
    }
  };

  const telegramUrl = settings.telegramUrl || import.meta.env.VITE_TG_URL || "";
  const siteName = settings.siteName || import.meta.env.VITE_SITENAME || "AnimeToon";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#090a10] px-4 py-8 text-white overflow-y-auto selection:bg-purple-600 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: "1.5s" }} />

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-xl mx-auto backdrop-blur-2xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-black/60 z-10 transition-all">
        {/* Animated Icon Badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-3xl opacity-20 blur-md animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner">
            {isServerDown ? (
              <FiWifiOff className="text-3xl sm:text-4xl text-purple-400 animate-bounce" style={{ animationDuration: "2s" }} />
            ) : (
              <FiShield className="text-3xl sm:text-4xl text-purple-400" />
            )}
          </div>
        </div>

        {/* Site Branding */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          {siteName} System Notice
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
          Under <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Maintenance</span>
        </h1>

        {/* Description / Message */}
        <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed mb-8 max-w-md mx-auto">
          {message || (isServerDown
            ? "We are currently optimizing and updating our streaming servers to provide you with the best experience. We'll be back online shortly!"
            : "We're currently performing some scheduled maintenance. Everything will resume automatically once complete.")}
        </p>

        {/* Status & Auto-Reconnect Banner */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRetrying ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRetrying ? "bg-amber-500" : "bg-emerald-500"}`} />
            </span>
            <span>{isRetrying ? "Checking connection..." : `Auto-reconnecting in ${countdown}s`}</span>
          </div>

          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <FiRefreshCw className={`text-xs ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Checking..." : "Retry Now"}</span>
          </button>
        </div>

        {/* External Channels & Help */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-semibold tracking-wide transition-all"
            >
              <FiSend className="text-sm" />
              <span>Join Telegram Channel</span>
            </a>
          )}
        </div>

        {/* Footer Admin Link */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center text-xs text-gray-500">
          <a
            href="/admin"
            className="hover:text-purple-400 transition-colors underline decoration-dotted underline-offset-4"
          >
            Admin Portal Access
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
