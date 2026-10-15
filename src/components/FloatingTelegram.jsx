import React from "react";
import { useLocation } from "react-router-dom";
import { FaTelegramPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../context/SettingsContext";

export default function FloatingTelegram() {
  const { settings } = useSettings();
  const location = useLocation();

  const telegramUrl = (settings?.telegramUrl || "").trim();

  // Hide if no URL configured or if user is in Admin panel
  if (!telegramUrl || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Telegram Community"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60]"
      >
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-[#0d0f18]/90 hover:bg-[#141724] border border-[#229ED9]/40 hover:border-[#229ED9] text-white shadow-[0_8px_30px_rgba(34,158,217,0.25)] hover:shadow-[0_10px_40px_rgba(34,158,217,0.45)] backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {/* Pulsing Aura */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#229ED9]/30 to-purple-600/30 blur-sm group-hover:opacity-100 opacity-60 transition duration-500 -z-10 animate-pulse" />

          {/* Telegram Icon with Circular Background */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-md shadow-[#229ED9]/40 shrink-0 group-hover:scale-110 transition-transform">
            <FaTelegramPlane className="text-base sm:text-lg -ml-0.5" />
          </div>

          {/* Text Information */}
          <div className="flex flex-col text-left pr-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#229ED9] leading-tight">
              Official Channel
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight group-hover:text-white/95">
              Join our Telegram Channel
            </span>
          </div>

          {/* Subtle Live Dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </a>
      </motion.aside>
    </AnimatePresence>
  );
}
