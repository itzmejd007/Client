import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCalendarDays } from "react-icons/lu";
import { FiClock, FiX } from "react-icons/fi";
import { PiTelegramLogo } from "react-icons/pi";
import { useSettings } from "../context/SettingsContext";

export default function ScheduleModal({ isOpen, onClose }) {
  const { settings } = useSettings();
  const TG_URL = settings?.telegramUrl || "https://t.me/AnimeToonXYZ";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#13141f] to-[#0a0a0f] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>

          {/* Glowing Calendar Icon */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 text-3xl sm:text-4xl shadow-[0_0_30px_rgba(255,42,133,0.3)] mb-5">
            <LuCalendarDays />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold border-2 border-black">
              <FiClock size={12} />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">
            <span>Weekly Anime Broadcast</span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Schedule Updating Soon!
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-2.5 mb-6 max-w-sm mx-auto">
            இப்போதைக்கு அப்டேட் எதுவும் இல்லை. வாராந்திர Anime வெளியீட்டு அட்டவணை (Broadcast Schedule) விரைவில் அப்டேட் செய்யப்படும்!
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-400 mb-6 -mt-3">
            Weekly release timings for ongoing episodes will be updated here soon. Join our Telegram for live airing alerts!
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {TG_URL && (
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2AABEE]/20 hover:bg-[#2AABEE]/30 text-[#2AABEE] hover:text-white border border-[#2AABEE]/40 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <PiTelegramLogo className="text-base" />
                <span>Join Telegram</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 px-5 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
            >
              சரி (Got It)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
