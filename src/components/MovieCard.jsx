import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { PiStarFill, PiPencilSimpleFill } from "react-icons/pi";
import { BsPlayFill } from "react-icons/bs";
import posterPlaceholder from "../assets/images/poster-placeholder.png";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const MovieCard = ({ movie, rank }) => {
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  const [openId, setOpenId] = useState();

  const showPlay = () => {
    setOpenId(movie.tmdb_id);
    setShowPlayBtn(true);
  };

  const hidePlay = () => {
    setOpenId(movie.tmdb_id);
    setShowPlayBtn(false);
  };

  const linkTarget =
    movie.media_type === "movie"
      ? `/mov/${movie._id || movie.tmdb_id}/${movie.slug || slugify(movie.title)}`
      : `/ser/${movie._id || movie.tmdb_id}/${movie.slug || slugify(movie.title)}`;

  // Styling helper for AniAbyss-style rank numbers
  const getRankGradient = (r) => {
    if (r === 1) {
      return "from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]";
    } else if (r === 2) {
      return "from-zinc-100 via-pink-200 to-pink-500 drop-shadow-[0_4px_12px_rgba(255,42,133,0.6)]";
    } else if (r === 3) {
      return "from-amber-500 via-orange-300 to-amber-700 drop-shadow-[0_4px_12px_rgba(249,115,22,0.5)]";
    }
    return "from-white via-zinc-200 to-zinc-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]";
  };

  return (
    <div className="group relative flex flex-col select-none">
      {/* Poster Container */}
      <Link
        to={linkTarget}
        className="relative block aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.08] group-hover:border-zinc-500 transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.6)] cursor-pointer"
        onMouseEnter={showPlay}
        onMouseLeave={hidePlay}
      >
        <LazyLoadImage
          src={movie.poster ? movie.poster : posterPlaceholder}
          width="100%"
          height="100%"
          effect="black-and-white"
          alt={movie.title}
          className="aspect-[2/3] w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Ambient poster gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Top-Left: Rating & Type Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
          {movie.rating ? (
            <div className="flex items-center gap-1 bg-black/80 text-white text-[10px] sm:text-[11px] py-0.5 px-2 rounded-lg backdrop-blur-md border border-white/10 shadow-sm font-bold text-amber-300">
              <PiStarFill className="text-yellow-400 text-xs" />
              <span>
                {typeof movie.rating === "number"
                  ? movie.rating.toFixed(1)
                  : !isNaN(parseFloat(movie.rating))
                  ? parseFloat(movie.rating).toFixed(1)
                  : "0.0"}
              </span>
            </div>
          ) : null}

          <div className="bg-black/80 text-zinc-300 text-[9px] sm:text-[10px] uppercase font-mono py-0.5 px-1.5 rounded-lg backdrop-blur-md border border-white/10">
            {movie.media_type === "tv" ? "TV" : "Movie"}
          </div>
        </div>

        {/* Admin Edit button (if admin) */}
        {sessionStorage.getItem("adminAuth") === "true" && (
          <Link
            to={`/admin?tmdb_id=${movie.tmdb_id}&type=${movie.media_type}`}
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-primaryBtn text-white rounded-lg z-20 backdrop-blur-sm shadow-lg border border-white/20 hover:scale-110 transition-transform cursor-pointer"
            title="Edit Details"
          >
            <PiPencilSimpleFill className="text-xs" />
          </Link>
        )}

        {/* Language Badge */}
        {movie.languages && movie.languages.length > 0 ? (
          <div className="absolute top-8 left-2 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-md bg-red-950/85 border border-red-500/40 text-[9px] font-black uppercase text-red-200 backdrop-blur-md shadow-sm">
              {movie.languages.slice(0, 2).map((l) => l.slice(0, 3).toUpperCase()).join("/")}
            </span>
          </div>
        ) : null}

        {/* Quality / Rip tag */}
        {movie.rip && movie.rip !== "Unknown" && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-md bg-black/80 border border-white/15 text-[9px] font-mono font-bold text-zinc-200 backdrop-blur-md">
              {movie.rip}
            </span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            ANIABYSS-STYLE RANKING NUMERAL (1, 2, 3...)
            ══════════════════════════════════════════════════════════ */}
        {rank !== undefined && rank !== null && (
          <div
            className="absolute -bottom-2 right-1 sm:right-1.5 z-20 pointer-events-none select-none"
            style={{ lineHeight: 0.75 }}
          >
            <span
              className={`block text-6xl sm:text-7xl lg:text-8xl font-black italic bg-gradient-to-t ${getRankGradient(
                rank
              )} bg-clip-text text-transparent`}
              style={{
                WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.85)",
              }}
            >
              {rank}
            </span>
          </div>
        )}

        {/* Center Hover Play Icon Button */}
        <AnimatePresence>
          {openId === movie.tmdb_id && showPlayBtn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:flex absolute inset-0 items-center justify-center z-30 pointer-events-none"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,42,133,0.8)] pl-0.5">
                <BsPlayFill />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Title & Metadata */}
      <div className="pt-2 px-0.5 space-y-1">
        <Link
          to={linkTarget}
          className="block text-xs sm:text-sm font-bold text-white hover:text-pink-400 transition-colors line-clamp-1 leading-snug cursor-pointer"
          title={movie.title}
        >
          {movie.title}
        </Link>
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400">
          {movie.release_year && <span>{movie.release_year}</span>}
          {movie.release_year && <span>•</span>}
          <span className="uppercase font-mono text-[9px] text-zinc-400">
            {movie.media_type === "tv" ? "Series" : "Movie"}
          </span>
          {movie.genres && movie.genres[0] && (
            <>
              <span>•</span>
              <span className="text-pink-300 font-medium truncate max-w-[80px]">
                {movie.genres[0]}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;