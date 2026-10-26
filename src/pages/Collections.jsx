// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: Collections Page (Manual Admin Curated + Auto-Detected Franchises)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import { FiSearch, FiLayers, FiCheckCircle } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { detectFranchiseCollections } from "../utils/franchiseCollections";

export default function Collections() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings?.siteName || "AnimeToon";

  const [manualCollections, setManualCollections] = useState([]);
  const [autoCollections, setAutoCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'manual' | 'auto'
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setIsLoading(true);

    // 1. Fetch manual collections from API
    const fetchManual = axios.get(`${BASE}/api/collections?page=1&page_size=100`);

    // 2. Fetch movies and series to auto-detect franchises
    const fetchTv = axios.get(`${BASE}/api/tvshows?page=1&page_size=200`).catch(() => ({ data: { tv_shows: [] } }));
    const fetchMov = axios.get(`${BASE}/api/movies?page=1&page_size=200`).catch(() => ({ data: { movies: [] } }));

    Promise.all([fetchManual, fetchTv, fetchMov])
      .then(([manualRes, tvRes, movRes]) => {
        const manual = (manualRes.data?.collections || []).map((col) => ({
          ...col,
          isAuto: false,
        }));
        setManualCollections(manual);

        const allItems = [
          ...(tvRes.data?.tv_shows || []).map((t) => ({ ...t, media_type: "tv" })),
          ...(movRes.data?.movies || []).map((m) => ({ ...m, media_type: "movie" })),
        ];

        const detected = detectFranchiseCollections(allItems);
        setAutoCollections(detected);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading collections:", err);
        setIsLoading(false);
      });
  }, [BASE]);

  // Combine and search collections
  const filteredCollections = useMemo(() => {
    const list = [...manualCollections, ...autoCollections];

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [manualCollections, autoCollections, searchQuery]);

  return (
    <div className="w-full space-y-8">
      <SEO
        title={`Anime Collections - ${SITENAME}`}
        description={`Explore curated anime collections, movie sagas & complete universe franchises on ${SITENAME}.`}
        name={SITENAME}
        type="website"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-6 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(255,42,133,0.8)] inline-block" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anime Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Curated anthologies, movie sagas & complete universe franchises
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white placeholder-zinc-400 outline-none border border-white/10 focus:border-pink-500/70 text-xs font-medium shadow-md transition-all"
          />
          <FiSearch className="absolute left-3 text-zinc-400 pointer-events-none" size={15} />
        </div>
      </div>

      {/* Grid of Collections */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-video bg-white/[0.05] rounded-2xl w-full border border-white/10" />
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 font-medium space-y-2">
          <p>No collections found matching "{searchQuery}".</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-bold cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((col) => {
            const count = col.itemsCount || col.populated_items?.length || col.items?.length || 0;
            const targetUrl = `/collection/${col.slug || col._id}`;

            return (
              <Link
                to={targetUrl}
                key={col._id || col.id}
                className="group relative rounded-2xl overflow-hidden aspect-video block bg-[#10111a] border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_30px_rgba(255,42,133,0.25)] select-none cursor-pointer"
              >
                <img
                  src={col.thumbnail}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-95"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200";
                  }}
                  loading="lazy"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-pink-500/30 text-pink-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Collection
                  </span>

                  <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-zinc-200 text-[10px] font-mono font-bold">
                    {count} {count === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Bottom Title & Description Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-5">
                  <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-pink-400 transition-colors line-clamp-1 drop-shadow-md">
                    {col.title}
                  </h2>
                  {col.description && (
                    <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5 font-normal">
                      {col.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
