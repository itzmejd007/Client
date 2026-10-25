// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: EpisodeMenuModal - 3-Dot Quick Action Menu for Episodes
// Allows users to Download, send to Telegram, open in Other Player (MX Player),
// or open external links with quality selection.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCloudDownloadAlt, 
  FaPlay, 
  FaTimes, 
  FaExternalLinkAlt 
} from "react-icons/fa";
import { PiTelegramLogo, PiPlayBold, PiGlobeBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";
import { addToRecentlyWatched } from "../utils/watchHistory";
import { requestStrictAdBlockCheck } from "./AdBlockDetector";
import Spinner from "./svg/Spinner";

export default function EpisodeMenuModal({
  isOpen,
  onClose,
  episode,
  movieData,
  seasonNumber,
  onPlayEpisode
}) {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_BASE_URL;
  const rawUsername = settings?.tgUsername || import.meta.env.VITE_TG_USERNAME || "AnimeToonX_bot";
  const USERNAME = String(rawUsername).trim().replace(/^@/, "");
  const API_URL = settings?.shortenerApiUrl || import.meta.env.VITE_API_URL;
  const API_KEY = settings?.shortenerApiKey || import.meta.env.VITE_API_KEY;

  const [loading, setLoading] = useState({});

  if (!isOpen || !episode) return null;

  const shortenUrl = async (url) => {
    try {
      const response = await axios.get(API_URL, {
        params: { api: API_KEY, url: url, format: "json" },
      });
      const data = response.data;
      return data?.shortenedUrl || data?.short || data?.url || url;
    } catch (error) {
      console.error("Error shortening URL:", error);
      return url;
    }
  };

  const handleDownloadClick = async (q, isPlayer = false) => {
    const actionDesc = isPlayer ? "open in external player" : "download this anime file";
    requestStrictAdBlockCheck(actionDesc, async () => {
      addToRecentlyWatched(movieData);
      setLoading((prev) => ({ ...prev, [`${isPlayer ? 'player_' : 'dl_'}${q.quality}`]: true }));

      const downloadUrl = `${BASE}/download/${q.id}/${encodeURIComponent(q.name)}`;
      const rawUrl = isPlayer 
        ? `intent:${downloadUrl}#Intent;type=video/x-matroska;action=android.intent.action.VIEW;end;`
        : downloadUrl;

      const shortenerToggle = isPlayer ? settings.useShortenerPlayer : settings.useShortenerDownload;
      const useShortener = shortenerToggle !== false && !movieData.disable_shortener;

      let finalUrl = rawUrl;
      try {
        if (useShortener && API_KEY && API_URL) {
          finalUrl = await shortenUrl(rawUrl);
        }
      } catch (e) {
        console.error("Shortener error:", e);
      } finally {
        setLoading((prev) => ({ ...prev, [`${isPlayer ? 'player_' : 'dl_'}${q.quality}`]: false }));
      }

      onClose();

      const params = new URLSearchParams({
        url: finalUrl,
        title: `${movieData.title || "Anime"} - S${String(seasonNumber).padStart(2, "0")}E${String(episode.episode_number).padStart(2, "0")}`,
        quality: q.quality || "",
        type: isPlayer ? "MX Player" : "Download",
        poster: episode.episode_backdrop || movieData.backdrop || movieData.poster || "",
        size: q.size || ""
      });

      navigate(`/content-delivery?${params.toString()}`);
    });
  };

  const handleTelegramClick = async (q) => {
    requestStrictAdBlockCheck("access Telegram anime files", async () => {
      addToRecentlyWatched(movieData);
      setLoading((prev) => ({ ...prev, [`tg_${q.quality}`]: true }));

      const qClean = (q.quality || "HD").replace(/\s+/g, "");
      let botUrl = `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${seasonNumber}_${episode.episode_number}_${qClean}`;

      const useShortener = settings?.useShortenerTelegram !== false && !movieData.disable_shortener;
      let finalUrl = botUrl;
      try {
        if (useShortener && API_KEY && API_URL) {
          finalUrl = await shortenUrl(botUrl);
        }
      } catch (e) {
        console.error("Shortener error:", e);
      } finally {
        setLoading((prev) => ({ ...prev, [`tg_${q.quality}`]: false }));
      }

      onClose();

      const params = new URLSearchParams({
        url: finalUrl,
        title: `${movieData.title || "Anime"} - S${String(seasonNumber).padStart(2, "0")}E${String(episode.episode_number).padStart(2, "0")}`,
        quality: q.quality || "",
        type: "Telegram",
        poster: episode.episode_backdrop || movieData.backdrop || movieData.poster || "",
        size: q.size || ""
      });

      navigate(`/content-delivery?${params.toString()}`);
    });
  };

  const handleExternalLinkClick = async (e, url) => {
    addToRecentlyWatched(movieData);
    const useShortener = settings.useShortenerExternal !== false && !movieData.disable_shortener;
    if (!useShortener || !API_KEY || !API_URL) return;

    e.preventDefault();
    try {
      const response = await axios.get(API_URL, {
        params: { api: API_KEY, url: url, format: "json" }
      });
      const shortUrl = response.data?.shortenedUrl || response.data?.short || response.data?.url || url;
      window.open(shortUrl, "_blank", "noopener noreferrer");
    } catch (error) {
      console.error("Error shortening external link:", error);
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  const qualities = episode.telegram || [];
  const thumbnail = episode.episode_backdrop || movieData.backdrop || movieData.poster;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35 }}
          className="relative bg-[#161722] border border-white/10 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl z-10 text-primaryTextColor"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-secondaryTextColor hover:text-white p-1 rounded-full transition-colors bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>

          {/* Episode Info Header */}
          <div className="flex gap-4 items-center pb-4 border-b border-white/10 pr-8">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={episode.title}
                className="w-20 aspect-video object-cover rounded-xl border border-white/10 shrink-0"
              />
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-otherColor block">
                Season {seasonNumber} • Episode {episode.episode_number}
              </span>
              <h3 className="text-white font-bold text-sm line-clamp-1 mt-0.5">
                {episode.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-5">
            {/* Stream Directly in Player Button */}
            <button
              onClick={() => {
                onPlayEpisode(episode);
                onClose();
              }}
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-otherColor hover:opacity-95 text-bgColor shadow-lg shadow-otherColor/20 transition-all cursor-pointer font-bold"
            >
              <PiPlayBold className="text-base" />
              Stream / Play Now
            </button>

            {/* Quality Section: Direct Download */}
            {settings.showDownloadButton !== false && (
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-gray-300">
                  <FaCloudDownloadAlt className="text-otherColor text-sm" />
                  <span>Direct Cloud Download:</span>
                </div>
                {qualities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {qualities.map((q, idx) => (
                      <button
                        key={idx}
                        disabled={loading[`dl_${q.quality}`]}
                        onClick={() => handleDownloadClick(q, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primaryBtn hover:opacity-90 text-bgColor text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading[`dl_${q.quality}`] ? <Spinner className="w-3.5 h-3.5" /> : null}
                        <span>{q.quality}</span>
                        {q.size && <span className="opacity-75 text-[10px]">({q.size})</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 px-1">Download links coming soon</p>
                )}
              </div>
            )}

            {/* Quality Section: Telegram Bot */}
            {settings.showTelegramButton !== false && (
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-gray-300">
                  <PiTelegramLogo className="text-blue-400 text-base" />
                  <span>Get in Telegram:</span>
                </div>
                {qualities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {qualities.map((q, idx) => (
                      <button
                        key={idx}
                        disabled={loading[`tg_${q.quality}`]}
                        onClick={() => handleTelegramClick(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading[`tg_${q.quality}`] ? <Spinner className="w-3.5 h-3.5" /> : null}
                        <span>{q.quality}</span>
                        {q.size && <span className="opacity-75 text-[10px]">({q.size})</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 px-1">Telegram links coming soon</p>
                )}
              </div>
            )}

            {/* Quality Section: MX Player / External Player */}
            {qualities.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-gray-300">
                  <FaPlay className="text-purple-400 text-xs" />
                  <span>Open in Other Player (MX Player / VLC):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualities.map((q, idx) => (
                    <button
                      key={idx}
                      disabled={loading[`player_${q.quality}`]}
                      onClick={() => handleDownloadClick(q, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading[`player_${q.quality}`] ? <Spinner className="w-3.5 h-3.5" /> : null}
                      <span>{q.quality}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* External Links if available */}
            {settings.showExternalLinks !== false && episode.external_links?.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-gray-300">
                  <PiGlobeBold className="text-green-400 text-sm" />
                  <span>External Streaming Links:</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {episode.external_links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      onClick={(e) => handleExternalLinkClick(e, link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white transition-all group"
                    >
                      <span className="line-clamp-1">{link.name || `Link ${idx + 1}`}</span>
                      <FaExternalLinkAlt className="text-xs text-gray-400 group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
