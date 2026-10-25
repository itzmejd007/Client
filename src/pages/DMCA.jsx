// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: DMCA Disclaimer & Copyright Protection Policy Page
// Complies with 17 U.S.C. 512 (DMCA) and international copyright directives.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaFileContract } from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";

export default function DMCA() {
  const { settings } = useSettings();
  const SITENAME = settings.siteName || "AnimeToon";
  const TG_URL = settings.telegramUrl || "https://t.me/AnimeToonXYZ";
  const CONTACT_EMAIL = "animetoonxyz@gmail.com";

  return (
    <div className="min-h-screen text-primaryTextColor py-8 max-w-4xl mx-auto px-4 sm:px-6">
      <SEO
        title={`DMCA Copyright Notice & Disclaimer | ${SITENAME}`}
        description={`DMCA copyright compliance, takedown policy, and disclaimer of content for ${SITENAME}. Contact our designated copyright agent for content removal.`}
        link={window.location.href}
        type="website"
        keywords="DMCA, copyright disclaimer, content takedown, animetoon dmca, anime streaming copyright"
      />

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-900/40 via-btnColor/60 to-purple-900/40 border border-white/10 rounded-3xl p-8 sm:p-12 mb-8 text-center overflow-hidden shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-otherColor/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-otherColor/10 border border-otherColor/30 text-otherColor text-3xl mx-auto mb-4">
          <FaShieldAlt />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          DMCA & Copyright Policy
        </h1>
        <p className="text-secondaryTextColor text-xs sm:text-sm max-w-2xl mx-auto mt-3 leading-relaxed">
          Digital Millennium Copyright Act (17 U.S.C. § 512) Notification, Content Hosting Disclaimer, and Takedown Procedure for <span className="text-otherColor font-bold">{SITENAME}</span>.
        </p>
      </motion.div>

      {/* Main Content Body */}
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-secondaryTextColor">
        {/* Section 1: Non-Hosting Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-btnColor/40 border border-white/5 rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaFileContract className="text-otherColor text-xl shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              1. Non-Hosting & Content Disclaimer
            </h2>
          </div>
          <p className="mb-3">
            <strong className="text-white">{SITENAME} (animetoon.in)</strong> functions purely as an online index and information portal. We do <strong>not</strong> host, upload, archive, or store any media, videos, or copyrighted files on our web servers.
          </p>
          <p className="mb-3">
            All video streams, files, and links displayed on this website are hosted and maintained by non-affiliated, independent third-party services (such as Telegram, cloud storage providers, and external video hosts) that are beyond our control.
          </p>
          <p>
            {SITENAME} operates under the provisions of the Digital Millennium Copyright Act (DMCA) and the safe harbor protections of 17 U.S.C. § 512.
          </p>
        </motion.div>

        {/* Section 2: Notice of Infringement (Takedown Notice Requirements) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-btnColor/40 border border-white/5 rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaExclamationTriangle className="text-yellow-400 text-xl shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              2. Notification of Copyright Infringement
            </h2>
          </div>
          <p className="mb-4">
            If you are a copyright owner or an authorized agent acting on behalf of one, and you believe that any link or content indexed on <span className="text-white font-medium">{SITENAME}</span> infringes upon your copyright, please submit a written DMCA notice containing the following mandatory information:
          </p>

          <div className="grid gap-3 text-xs sm:text-sm">
            <div className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-white block mb-0.5">Identification of the Copyrighted Work:</strong>
                A clear description and title of the copyrighted material that you claim has been infringed.
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-white block mb-0.5">Exact Location (URL):</strong>
                The exact URL link(s) on <code className="bg-black/40 text-otherColor px-1.5 py-0.5 rounded text-xs">animetoon.in</code> where the material is listed (e.g. <code className="text-gray-300">https://animetoon.in/ser/123/anime-title</code>).
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-white block mb-0.5">Contact Information:</strong>
                Your official full name, postal address, telephone number, and verifiable email address.
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className="text-white block mb-0.5">Statement of Good Faith:</strong>
                A statement that you have a good-faith belief that the use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <span className="w-6 h-6 rounded-full bg-otherColor/20 text-otherColor font-black text-xs flex items-center justify-center shrink-0">5</span>
              <div>
                <strong className="text-white block mb-0.5">Statement Under Penalty of Perjury & Signature:</strong>
                A statement, under penalty of perjury, that the information in your notice is accurate and that you are authorized to act on behalf of the owner, accompanied by a physical or electronic signature.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Response & Removal Timeframe */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-btnColor/40 border border-white/5 rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaCheckCircle className="text-green-400 text-xl shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              3. Takedown Timeframe (24 - 48 Hours)
            </h2>
          </div>
          <p>
            Upon receipt of a valid and complete DMCA takedown notice, our designated team will review and remove the disputed links from our index within <strong className="text-white">24 to 48 hours</strong>. Please note that sending notices to third-party hosts directly will remove the media across the entire internet.
          </p>
        </motion.div>

        {/* Section 4: Official Contact Agent Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#171824] to-[#12131c] border-2 border-otherColor/30 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden"
        >
          <h2 className="text-lg sm:text-xl font-black text-white mb-2">
            Designated Copyright Agent Contact
          </h2>
          <p className="text-xs sm:text-sm text-secondaryTextColor mb-6 max-w-lg mx-auto">
            Please direct all official copyright infringement and DMCA notices to our dedicated communications channel:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=DMCA%20Takedown%20Request%20-%20AnimeToon`}
              className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-full bg-otherColor hover:opacity-95 text-bgColor font-black text-xs uppercase tracking-wider shadow-lg shadow-otherColor/20 transition-all cursor-pointer"
            >
              <FaEnvelope className="text-base" />
              <span>{CONTACT_EMAIL}</span>
            </a>

            {TG_URL && (
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <PiTelegramLogo className="text-lg" />
                <span>Telegram Support</span>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
