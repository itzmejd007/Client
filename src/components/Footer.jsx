// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: AniAbyss-inspired Anime Platform Footer
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();
  const TG_URL = settings?.telegramUrl || "https://t.me/AnimeToonXYZ";
  const SITENAME = settings?.siteName || "AnimeToon";

  return (
    <footer className="relative pt-10 pb-20 md:pb-8 border-t border-white/[0.08] bg-[#07070b]/90 backdrop-blur-2xl text-zinc-400 mt-12 w-full">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* TOP OF FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-8 border-b border-white/[0.06]">
          
          {/* LEFT: BRAND INFO */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,42,133,0.8)]"></span>
                {SITENAME}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Watch and explore your favorite anime in Hindi Dubbed, Tamil Dubbed, Multi Audio, and English Subbed with high speed streaming in HD.
            </p>
            <p className="text-[11px] text-zinc-300 leading-normal">
              Disclaimer: This site does not host or store any video files on its servers. All media is indexed from third-party hosting services including Telegram.
            </p>

            {/* Telegram Community Button */}
            {TG_URL && (
              <div className="pt-2">
                <a
                  href={TG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 text-[#2AABEE] hover:text-white border border-[#2AABEE]/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <PiTelegramLogo className="text-base" />
                  <span>Join Telegram Channel</span>
                </a>
              </div>
            )}
          </div>

          {/* MIDDLE: ANIME CATEGORIES (Replaces old KDrama/TV labels with anime-tailored tags) */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">
              Anime Categories
            </h3>
            <div className="flex gap-2 flex-wrap">
              {[
                "Anime Series",
                "Anime Movies",
                "Hindi Dubbed",
                "Tamil Dubbed",
                "English Subbed",
                "Multi Audio",
                "Top Airing",
                "Action Anime",
              ].map((category, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 transition-colors"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: QUICK MENU & DMCA LINK */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/series" className="hover:text-white transition-colors">
                  Anime Series
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition-colors">
                  Anime Movies
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-white transition-colors">
                  Watchlist
                </Link>
              </li>
              {/* Highlighted DMCA Policy Link */}
              <li className="col-span-2 pt-1">
                <Link
                  to="/dmca"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 text-xs font-bold transition-all"
                >
                  <FaShieldAlt className="text-xs text-red-400" />
                  <span>DMCA Copyright Notice</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>&copy; {new Date().getFullYear()} <strong className="text-zinc-200">{SITENAME}</strong>. All rights reserved.</span>
            <span className="text-zinc-700">•</span>
            <Link to="/dmca" className="hover:text-pink-400 underline underline-offset-4 transition-colors">
              DMCA Takedown Policy
            </Link>
          </div>
          <div className="text-[11px] text-zinc-300">
            High Quality Anime Streaming Experience
          </div>
        </div>
      </div>
    </footer>
  );
}
