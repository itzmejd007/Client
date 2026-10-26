import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaTelegramPlane } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../context/SettingsContext";

export default function FloatingTelegram() {
  const { settings } = useSettings();
  const location = useLocation();
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem("animetoon_tg_dismissed") === "true";
  });

  const telegramUrl = (settings?.telegramUrl || "").trim();

  // Hide if no URL configured, user dismissed, or in Admin panel
  if (!telegramUrl || isDismissed || location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem("animetoon_tg_dismissed", "true");
  };

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Telegram Community"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 md:bottom-8 md:right-8 z-40 max-w-[calc(100vw-1.5rem)]"
      >
        <div className="relative group">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full bg-[#0d0f18]/95 hover:bg-[#141724] border border-[#229ED9]/40 hover:border-[#229ED9] text-white shadow-[0_8px_30px_rgba(34,158,217,0.3)] hover:shadow-[0_10px_40px_rgba(34,158,217,0.5)] backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Pulsing Aura */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#229ED9]/30 to-purple-600/30 blur-sm group-hover:opacity-100 opacity-60 transition duration-500 -z-10 animate-pulse" />

            {/* Telegram Icon with Circular Background */}
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-md shadow-[#229ED9]/40 shrink-0 group-hover:scale-110 transition-transform">
              <FaTelegramPlane className="text-sm sm:text-lg -ml-0.5" />
            </div>

            {/* Text Information */}
            <div className="flex flex-col text-left pr-1 min-w-0">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#229ED9] leading-tight truncate">
                Official Channel
              </span>
              <span className="text-[11px] sm:text-sm font-extrabold text-white tracking-tight leading-tight group-hover:text-white/95 truncate">
                Join our Telegram Channel
              </span>
            </div>

            {/* Subtle Live Dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </a>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss Telegram prompt"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-900 border border-white/20 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-90"
            title="Dismiss"
          >
            <IoClose className="text-xs" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
