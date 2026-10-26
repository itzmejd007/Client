// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: DMCA Disclaimer & Copyright Protection Policy Page
// Complies with 17 U.S.C. 512 (DMCA) and international copyright directives.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaFileContract } from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";

export default function DMCA() {
  const { settings } = useSettings();
  const SITENAME = settings.siteName || "AnimeToon";
  const TG_URL = settings.telegramUrl || "https://t.me/AnimeToonXYZ";

  return (
    <div className="min-h-screen text-primaryTextColor py-4 sm:py-8 max-w-4xl mx-auto px-3 sm:px-6 w-full overflow-hidden">
      <SEO
        title={`DMCA Copyright Notice & Disclaimer | ${SITENAME}`}
        description={`DMCA copyright compliance, takedown policy, and disclaimer of content for ${SITENAME}. Contact our designated copyright agent for content removal.`}
        link={window.location.href}
        type="website"
        keywords="DMCA, copyright disclaimer, content takedown, anime dmca, anime streaming copyright"
      />

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-900/30 via-btnColor/80 to-pink-900/30 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-10 mb-6 sm:mb-8 text-center overflow-hidden shadow-2xl backdrop-blur-xl w-full"
      >
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-otherColor/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-otherColor/10 border border-otherColor/30 text-otherColor text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4 shadow-[0_0_20px_rgba(80,180,152,0.2)]">
          <FaShieldAlt />
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight break-words">
          DMCA & Copyright Policy
        </h1>
        <p className="text-secondaryTextColor text-xs sm:text-sm max-w-2xl mx-auto mt-2 sm:mt-3 leading-relaxed break-words px-2">
          Digital Millennium Copyright Act (17 U.S.C. § 512) Notification, Content Hosting Disclaimer, and Takedown Procedure for <span className="text-otherColor font-bold">{SITENAME}</span>.
        </p>
      </motion.div>

      {/* Main Content Body */}
      <div className="flex flex-col gap-4 sm:gap-6 text-xs sm:text-sm leading-relaxed text-secondaryTextColor w-full">
        {/* Section 1: Non-Hosting Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-btnColor/40 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg backdrop-blur-md w-full overflow-hidden"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <FaFileContract className="text-otherColor text-lg sm:text-xl shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-white break-words">
              1. Non-Hosting & Content Disclaimer
            </h2>
          </div>
          <p className="mb-3 break-words">
            <strong className="text-white">{SITENAME}</strong> functions purely as an online index and information portal. We do <strong>not</strong> host, upload, archive, or store any media, videos, or copyrighted files on our web servers.
          </p>
          <p className="mb-3 break-words">
            All video streams, files, and links displayed on this website are hosted and maintained by non-affiliated, independent third-party services (such as Telegram, cloud storage providers, and external video hosts) that are beyond our control.
          </p>
          <p className="break-words">
            {SITENAME} operates under the provisions of the Digital Millennium Copyright Act (DMCA) and the safe harbor protections of 17 U.S.C. § 512.
          </p>
        </motion.div>

        {/* Section 2: Notice of Infringement (Takedown Notice Requirements) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-btnColor/40 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg backdrop-blur-md w-full overflow-hidden"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <FaExclamationTriangle className="text-amber-400 text-lg sm:text-xl shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-white break-words">
              2. Notification of Copyright Infringement
            </h2>
          </div>
          <p className="mb-4 break-words">
            If you are a copyright owner or an authorized agent acting on behalf of one, and you believe that any link or content indexed on <span className="text-white font-medium">{SITENAME}</span> infringes upon your copyright, please submit a written DMCA notice containing the following mandatory information:
          </p>

          <div className="grid gap-3 w-full">
            <div className="flex flex-col sm:flex-row items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 w-full min-w-0">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">1</span>
              <div className="w-full min-w-0">
                <strong className="text-white block mb-0.5 break-words">Identification of the Copyrighted Work:</strong>
                <span className="break-words">A clear description and title of the copyrighted material that you claim has been infringed.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 w-full min-w-0">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">2</span>
              <div className="w-full min-w-0">
                <strong className="text-white block mb-0.5 break-words">Exact Location (URL):</strong>
                <span className="break-words">The exact URL link(s) on our site where the material is listed (e.g. </span>
                <code className="bg-black/60 text-pink-300 px-1.5 py-0.5 rounded text-xs break-all inline-block max-w-full my-1">
                  https://{window.location.host}/ser/123/anime-title
                </code>
                <span className="break-words">).</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 w-full min-w-0">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">3</span>
              <div className="w-full min-w-0">
                <strong className="text-white block mb-0.5 break-words">Contact Information:</strong>
                <span className="break-words">Your official full name, postal address, telephone number, and verifiable electronic contact information.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 w-full min-w-0">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">4</span>
              <div className="w-full min-w-0">
                <strong className="text-white block mb-0.5 break-words">Statement of Good Faith:</strong>
                <span className="break-words">A statement that you have a good-faith belief that the use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 w-full min-w-0">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">5</span>
              <div className="w-full min-w-0">
                <strong className="text-white block mb-0.5 break-words">Statement Under Penalty of Perjury & Signature:</strong>
                <span className="break-words">A statement, under penalty of perjury, that the information in your notice is accurate and that you are authorized to act on behalf of the owner, accompanied by a physical or electronic signature.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Response & Removal Timeframe */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-btnColor/40 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg backdrop-blur-md w-full overflow-hidden"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <FaCheckCircle className="text-emerald-400 text-lg sm:text-xl shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-white break-words">
              3. Takedown Timeframe (24 - 48 Hours)
            </h2>
          </div>
          <p className="break-words">
            Upon receipt of a valid and complete DMCA takedown notice, our designated team will review and remove the disputed links from our index within <strong className="text-white font-semibold">24 to 48 hours</strong>. Please note that sending notices directly to third-party file hosts will remove the media across the entire internet.
          </p>
        </motion.div>

        {/* Section 4: Official Contact Agent Card (Gmail removed, Telegram support retained) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#12131c] to-[#0c0d14] border border-otherColor/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center shadow-xl relative overflow-hidden w-full"
        >
          <h2 className="text-base sm:text-xl font-black text-white mb-2 break-words">
            Designated Copyright Agent Contact
          </h2>
          <p className="text-xs sm:text-sm text-secondaryTextColor mb-5 max-w-lg mx-auto break-words px-2">
            Please direct all official copyright infringement and DMCA inquiries through our verified communications channel:
          </p>

          <div className="flex items-center justify-center w-full">
            {TG_URL && (
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 border border-pink-500/40 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,42,133,0.2)] active:scale-95 cursor-pointer"
              >
                <PiTelegramLogo className="text-xl" />
                <span>Contact via Official Telegram Support</span>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
