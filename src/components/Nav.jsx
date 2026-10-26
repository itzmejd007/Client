import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { useSettings } from "../context/SettingsContext";

import { FiSearch, FiX } from "react-icons/fi";
import { BiHomeAlt2, BiSolidMovie, BiStar, BiLibrary } from "react-icons/bi";
import { BsTv } from "react-icons/bs";
import { LuCalendarDays } from "react-icons/lu";
import { PiHeartFill } from "react-icons/pi";
import posterPlaceholder from "../assets/images/poster-placeholder.png";
import siteLogo from "../assets/images/logo.png";
import ThemeToggle from "./ThemeToggle";
import ScheduleModal from "./ScheduleModal";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function Nav() {
  const { settings } = useSettings();
  const SITENAME = settings?.siteName || "AnimeToon";
  const BASE = import.meta.env.VITE_BASE_URL;

  // Search States
  const [query, setQuery] = useState("");
  const [debouncedVal, setDebouncedVal] = useState("");
  const [searcResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Nav & Modals
  const [navStatus, setNavStatus] = useState("Home");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [showThemeToggle, setShowThemeToggle] = useState(() => {
    return localStorage.getItem("showThemeToggle") !== "false";
  });

  const location = useLocation();
  const searchInputRef = useRef(null);
  const closeSearchResultsDropDown = useRef();

  // Listen for admin toggle visibility changes
  useEffect(() => {
    const handleStorageChange = () => {
      setShowThemeToggle(localStorage.getItem("showThemeToggle") !== "false");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeToggleVisibilityChanged", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeToggleVisibilityChanged", handleStorageChange);
    };
  }, []);

  // Update navStatus based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setNavStatus("Home");
    } else if (path.startsWith("/mov") || path.startsWith("/movies") || path.startsWith("/Movies")) {
      setNavStatus("Movies");
    } else if (path.startsWith("/ser") || path.startsWith("/series") || path.startsWith("/Series")) {
      setNavStatus("Series");
    } else if (path.startsWith("/watchlist")) {
      setNavStatus("Watchlist");
    } else if (path.startsWith("/collections") || path.startsWith("/collection")) {
      setNavStatus("Collections");
    } else if (path.startsWith("/search")) {
      setNavStatus("Search");
    } else {
      setNavStatus("");
    }
  }, [location.pathname]);

  // Query Data Fetcher
  useEffect(() => {
    if (!debouncedVal || debouncedVal.trim() === "") {
      setSearchResult([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${BASE}/api/search/?query=${encodeURIComponent(debouncedVal)}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        setSearchResult(data.results || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [debouncedVal, BASE]);

  // Debouncing Function
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(query);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside to close search dropdown
  useEffect(() => {
    const closeDropdownHandler = (event) => {
      if (
        closeSearchResultsDropDown.current &&
        !closeSearchResultsDropDown.current.contains(event.target)
      ) {
        setDebouncedVal("");
      }
    };
    document.addEventListener("mousedown", closeDropdownHandler);
    return () => {
      document.removeEventListener("mousedown", closeDropdownHandler);
    };
  }, []);

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [mobileSearchOpen]);

  // Logo font injection
  useEffect(() => {
    if (settings?.logoCustomFontUrl) {
      const linkId = "custom-logo-font";
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = settings.logoCustomFontUrl;
    }

    if (settings?.logoTextFont && !settings?.logoCustomFontUrl) {
      const linkId = "default-logo-font";
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${settings.logoTextFont.replace(
        / /g,
        "+"
      )}:wght@400;700;900&display=swap`;
    }
  }, [settings?.logoCustomFontUrl, settings?.logoTextFont]);

  const getLogoFontFamily = () => {
    if (settings?.logoCustomFontUrl) {
      try {
        const match = settings.logoCustomFontUrl.match(/family=([^&:]+)/);
        if (match && match[1]) {
          return decodeURIComponent(match[1]).replace(/\+/g, " ");
        }
      } catch (e) {
        console.warn("Font extraction failed", e);
      }
    }
    return settings?.logoTextFont;
  };

  const logoFontFamily = getLogoFontFamily();

  // Desktop navigation items
  const desktopNavItems = [
    { icon: BiHomeAlt2, name: "Home", path: "/" },
    { icon: BsTv, name: "Series", path: "/series" },
    { icon: BiSolidMovie, name: "Movies", path: "/movies" },
    { icon: LuCalendarDays, name: "Schedule", isAction: true, onClick: () => setScheduleModalOpen(true) },
    { icon: BiLibrary, name: "Collections", path: "/collections" },
  ];

  // Mobile Bottom Navigator items (Home, Series, Movies, Schedule, Collections)
  const mobileBottomNavItems = [
    { icon: BiHomeAlt2, label: "Home", path: "/" },
    { icon: BsTv, label: "Series", path: "/series" },
    { icon: BiSolidMovie, label: "Movies", path: "/movies" },
    { icon: LuCalendarDays, label: "Schedule", isAction: true, onClick: () => setScheduleModalOpen(true) },
    { icon: BiLibrary, label: "Collections", path: "/collections" },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          TOP HEADER (Desktop + Mobile Compact) — AniAbyss Style
          ══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-white/[0.08] bg-black/65 backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
        <div className="max-w-[1700px] mx-auto px-5 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          
          {/* LEFT: LOGO / SITE TITLE */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 group cursor-pointer"
              style={
                logoFontFamily
                  ? {
                      fontFamily: `"${logoFontFamily}", sans-serif`,
                      fontSize: `${settings?.logoFontSize || 22}px`,
                      textTransform: "none",
                    }
                  : {
                      fontSize: `${settings?.logoFontSize || 22}px`,
                    }
              }
            >
              {settings?.logoImageUrl ? (
                <img
                  src={settings.logoImageUrl}
                  alt={settings?.siteName || SITENAME}
                  className="w-auto object-contain transition-transform group-hover:scale-105"
                  style={{ height: `${settings?.logoImageSize || 36}px` }}
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:to-pink-500 transition-all flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-zinc-950 border border-pink-500/50 shadow-[0_0_12px_rgba(255,42,133,0.45)] flex items-center justify-center p-0.5 shrink-0 group-hover:scale-110 transition-transform">
                    <img
                      src={siteLogo}
                      alt={settings?.siteName || SITENAME}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span>{settings?.siteName || SITENAME}</span>
                </span>
              )}
            </Link>
          </div>

          {/* CENTER: DESKTOP NAVIGATION MENU (AniAbyss Inspired) */}
          <nav className="hidden md:flex items-center justify-center gap-2 lg:gap-3 text-xs font-bold text-zinc-400 mx-auto">
            {desktopNavItems.map((item, index) => {
              const isActive = navStatus === item.name;

              if (item.isAction) {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:text-white hover:bg-white/[0.06] cursor-pointer text-zinc-300 active:scale-95"
                  >
                    <item.icon className="text-sm text-pink-500" />
                    <span>{item.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-[9px] font-extrabold uppercase tracking-wider">
                      Soon
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setNavStatus(item.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white bg-white/[0.12] font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      : "hover:text-white hover:bg-white/[0.06] text-zinc-300"
                  }`}
                >
                  <item.icon className={`text-sm ${isActive ? "text-pink-500" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: SEARCH BAR + THEME TOGGLE (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0" ref={closeSearchResultsDropDown}>
            
            {/* Desktop Real-time Search Input */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative hidden md:block w-48 lg:w-72 group"
            >
              <div className="relative flex items-center">
                <FiSearch className="absolute left-3.5 text-zinc-400 text-sm group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime database..."
                  className="w-full bg-white/[0.07] hover:bg-white/[0.11] focus:bg-white/[0.15] border border-white/15 hover:border-white/25 focus:border-pink-500/70 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] focus:shadow-[0_0_15px_rgba(255,42,133,0.3)] transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDebouncedVal("");
                    }}
                    className="absolute right-3 text-zinc-400 hover:text-white transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Search Results Dropdown (Desktop) */}
              {debouncedVal && (
                <div className="absolute top-full mt-2.5 right-0 w-80 lg:w-96 max-h-[70vh] overflow-y-auto bg-[#0d0e15]/95 border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 p-2 space-y-1">
                  {isLoading ? (
                    <div className="p-6 flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] text-zinc-400">Searching anime...</span>
                    </div>
                  ) : searcResult.length > 0 ? (
                    <>
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-white/5">
                        Found {searcResult.length} Titles
                      </div>
                      {searcResult.map((result) => (
                        <Link
                          key={result._id || result.id || result.tmdb_id}
                          to={
                            result.media_type === "movie"
                              ? `/mov/${result.tmdb_id || result._id}/${result.slug || slugify(result.title)}`
                              : `/ser/${result.tmdb_id || result._id}/${result.slug || slugify(result.title)}`
                          }
                          onClick={() => {
                            setQuery("");
                            setDebouncedVal("");
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group cursor-pointer"
                        >
                          <img
                            src={result.poster || posterPlaceholder}
                            alt={result.title}
                            className="w-10 h-14 object-cover rounded-lg shrink-0 bg-zinc-900 border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors truncate">
                              {result.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                              <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono uppercase text-[9px]">
                                {result.media_type === "tv" ? "TV" : "Movie"}
                              </span>
                              {result.release_year && <span>{result.release_year}</span>}
                              {result.rating && (
                                <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                                  <BiStar className="text-[10px]" />
                                  {(parseFloat(result.rating) || 0).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        to={`/search/${debouncedVal}`}
                        onClick={() => {
                          setQuery("");
                          setDebouncedVal("");
                        }}
                        className="block text-center py-2 text-xs font-bold text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-xl transition-all mt-1"
                      >
                        View all results →
                      </Link>
                    </>
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No anime found for "{debouncedVal}".
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Mobile Search Button (triggers mobile search bar) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-zinc-200 hover:text-white backdrop-blur-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
              aria-label="Open Search"
            >
              <FiSearch size={18} />
            </button>

            {/* Theme Toggle (Desktop Only) */}
            {showThemeToggle && (
              <div className="hidden sm:block shrink-0">
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MOBILE SEARCH EXPANDABLE BAR (When Search Icon Clicked)
            ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/10 bg-black/95 px-4 py-3 shadow-2xl overflow-hidden"
            >
              <div className="relative flex items-center">
                <FiSearch className="absolute left-3 text-pink-500 text-sm pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime database..."
                  className="w-full bg-white/10 border border-white/20 focus:border-pink-500 rounded-full pl-9 pr-9 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMobileSearchOpen(false);
                  }}
                  className="absolute right-3 text-zinc-400 hover:text-white p-1"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Mobile Search Results list */}
              {debouncedVal && (
                <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-1 divide-y divide-white/5">
                  {isLoading ? (
                    <div className="p-4 text-center text-xs text-zinc-400">Searching...</div>
                  ) : searcResult.length > 0 ? (
                    searcResult.slice(0, 8).map((result) => (
                      <Link
                        key={result._id || result.id || result.tmdb_id}
                        to={
                          result.media_type === "movie"
                            ? `/mov/${result.tmdb_id || result._id}/${result.slug || slugify(result.title)}`
                            : `/ser/${result.tmdb_id || result._id}/${result.slug || slugify(result.title)}`
                        }
                        onClick={() => {
                          setQuery("");
                          setMobileSearchOpen(false);
                        }}
                        className="flex items-center gap-3 py-2 text-left"
                      >
                        <img
                          src={result.poster || posterPlaceholder}
                          alt={result.title}
                          className="w-9 h-12 object-cover rounded-md shrink-0 bg-zinc-900 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{result.title}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {result.media_type === "tv" ? "TV Series" : "Movie"} • {result.release_year || "Anime"}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      No results for "{debouncedVal}"
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATOR BAR — AniAbyss Inspired (Fixed Bottom)
          Requested Items: Home, Series, Movies, Schedule, Search
          ══════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090f]/95 backdrop-blur-2xl border-t border-white/[0.12] px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {mobileBottomNavItems.map((item, index) => {
            const isActive =
              (item.label === "Home" && location.pathname === "/") ||
              (item.label === "Series" && (location.pathname.startsWith("/ser") || location.pathname.startsWith("/series"))) ||
              (item.label === "Movies" && (location.pathname.startsWith("/mov") || location.pathname.startsWith("/movies"))) ||
              (item.label === "Collections" && (location.pathname.startsWith("/collections") || location.pathname.startsWith("/collection")));

            if (item.isAction) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                    item.label === "Search" && mobileSearchOpen
                      ? "text-pink-500"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <item.icon className="text-xl mb-0.5" />
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                  isActive ? "text-pink-500 font-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <item.icon className={`text-xl mb-0.5 ${isActive ? "text-pink-500 scale-110" : ""}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 w-4 h-1 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(255,42,133,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* SCHEDULE NOTIFICATION MODAL */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
    </>
  );
}
