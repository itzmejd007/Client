// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: Collection Detail Page (Supports Manual + Auto Franchises + Type Filter)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton, { SingleMovieCardSkeleton } from "../components/MovieCardSkeleton";
import { KNOWN_FRANCHISES } from "../utils/franchiseCollections";
import CustomDropdown from "../components/CustomDropdown";
import { BiSort, BiCameraMovie, BiTv, BiGridAlt } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";

export default function Collection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings?.siteName || "AnimeToon";

  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating:desc");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all"); // 'all' | 'tv' | 'movie'
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setIsLoading(true);
    setIsStreaming(false);

    // ── Check if this is an auto franchise collection (starts with 'auto-') ──
    if (id && id.startsWith("auto-")) {
      const franchiseKey = id.replace("auto-", "");
      const franchiseDef = KNOWN_FRANCHISES.find((f) => f.key === franchiseKey);

      if (!franchiseDef) {
        setIsLoading(false);
        return;
      }

      // Fetch tv shows and movies to find matches
      Promise.all([
        axios.get(`${BASE}/api/tvshows?page=1&page_size=200`).catch(() => ({ data: { tv_shows: [] } })),
        axios.get(`${BASE}/api/movies?page=1&page_size=200`).catch(() => ({ data: { movies: [] } })),
      ])
        .then(([tvRes, movRes]) => {
          const allItems = [
            ...(tvRes.data?.tv_shows || []).map((t) => ({ ...t, media_type: "tv" })),
            ...(movRes.data?.movies || []).map((m) => ({ ...m, media_type: "movie" })),
          ];

          const matchingItems = allItems.filter((item) => {
            const title = (item.title || item.name || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();
            return franchiseDef.pattern.test(title) || franchiseDef.pattern.test(desc);
          });

          const bestCover =
            matchingItems.find((m) => m.backdrop)?.backdrop ||
            matchingItems[0]?.backdrop ||
            matchingItems[0]?.poster ||
            franchiseDef.cover;

          setCollection({
            _id: id,
            title: franchiseDef.title,
            description: franchiseDef.description,
            thumbnail: bestCover,
            isAuto: true,
            items: matchingItems,
            populated_items: matchingItems,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading auto collection:", err);
          setIsLoading(false);
        });

      return;
    }

    // ── Regular manual collection fetch from API ────────────────────────────
    axios
      .get(`${BASE}/api/collections/${id}`)
      .then(async (res) => {
        const colData = res.data;

        // SEO Redirect if slug differs
        if (colData.slug && id !== colData.slug) {
          navigate(`/collection/${colData.slug}`, { replace: true });
          return;
        }

        setCollection({ ...colData, populated_items: [] });
        setIsLoading(false);
        setIsStreaming(true);

        // Stream collection items for performance
        try {
          const response = await fetch(
            `${BASE}/api/collections/${colData._id}/stream?sort_by=${sortBy}`,
            {
              mode: "cors",
              credentials: "omit",
              headers: { Accept: "application/x-ndjson" },
            }
          );

          if (!response.ok) throw new Error("Stream request failed");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let partialChunk = "";
          let streamedItems = [];

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = (partialChunk + chunk).split("\n");
            partialChunk = lines.pop();

            for (const line of lines) {
              if (line.trim()) {
                try {
                  streamedItems.push(JSON.parse(line));
                } catch (e) {
                  console.error("Error parsing NDJSON:", e);
                }
              }
            }
            setCollection((prev) => ({
              ...prev,
              populated_items: [...streamedItems],
            }));
          }
          setIsStreaming(false);
        } catch (error) {
          console.error("Stream fallback fetch:", error);
          setIsStreaming(false);
          axios
            .get(`${BASE}/api/collections/${id}`, { params: { sort_by: sortBy } })
            .then((res2) => setCollection(res2.data))
            .catch((err2) => console.error("Fallback fetch error:", err2));
        }
      })
      .catch((err) => {
        console.error("Error fetching collection metadata", err);
        setIsLoading(false);
        setIsStreaming(false);
      });
  }, [BASE, id, sortBy, navigate]);

  // ── Filter by Series vs Movies & Sort items ───────────────────────────────
  const itemsList = collection?.populated_items || collection?.items || [];

  const seriesCount = useMemo(
    () => itemsList.filter((m) => m.media_type === "tv" || m.media_type === "series").length,
    [itemsList]
  );

  const moviesCount = useMemo(
    () => itemsList.filter((m) => m.media_type === "movie").length,
    [itemsList]
  );

  const filteredAndSortedItems = useMemo(() => {
    let result = [...itemsList];

    // Filter by media type
    if (mediaTypeFilter === "tv") {
      result = result.filter((m) => m.media_type === "tv" || m.media_type === "series");
    } else if (mediaTypeFilter === "movie") {
      result = result.filter((m) => m.media_type === "movie");
    }

    // Sort
    if (sortBy === "rating:desc") {
      result.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === "year:desc") {
      result.sort((a, b) => (parseInt(b.release_year, 10) || 0) - (parseInt(a.release_year, 10) || 0));
    } else if (sortBy === "title:asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [itemsList, mediaTypeFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="w-full space-y-8">
        <div className="relative w-full aspect-[21/9] md:aspect-[32/9] rounded-3xl overflow-hidden shadow-2xl bg-white/[0.05] border border-white/10 animate-pulse" />
        <MovieCardSkeleton />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white">Collection not found</h2>
        <button
          onClick={() => navigate("/collections")}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-pink-500/20"
        >
          <FiArrowLeft />
          <span>Back to Collections</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <SEO
        title={`${collection.title} - ${SITENAME}`}
        description={`Explore the ${collection.title} collection with complete series and movies on ${SITENAME}.`}
        name={SITENAME}
        type="website"
      />

      {/* Hero Collection Banner */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[30/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        <img
          src={collection.thumbnail}
          alt={collection.title}
          className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {collection.isAuto ? (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                ★ Auto Franchise
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                ★ Curated Collection
              </span>
            )}
            <span className="text-xs text-zinc-300 font-medium">
              {itemsList.length} Total Titles ({seriesCount} Series, {moviesCount} Movies)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Filter & Sorting Control Bar (Series vs Movies Filter requested by user) ── */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-[#0b0c14]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg">
        
        {/* Left: Type Filter Tabs (All / Series / Movies) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMediaTypeFilter("all")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              mediaTypeFilter === "all"
                ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(255,42,133,0.4)]"
                : "bg-white/[0.06] text-zinc-300 hover:text-white border border-white/10 hover:bg-white/[0.1]"
            }`}
          >
            <BiGridAlt size={15} />
            <span>All ({itemsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaTypeFilter("tv")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              mediaTypeFilter === "tv"
                ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(255,42,133,0.4)]"
                : "bg-white/[0.06] text-zinc-300 hover:text-white border border-white/10 hover:bg-white/[0.1]"
            }`}
          >
            <BiTv size={15} />
            <span>Series ({seriesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaTypeFilter("movie")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              mediaTypeFilter === "movie"
                ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(255,42,133,0.4)]"
                : "bg-white/[0.06] text-zinc-300 hover:text-white border border-white/10 hover:bg-white/[0.1]"
            }`}
          >
            <BiCameraMovie size={15} />
            <span>Movies ({moviesCount})</span>
          </button>
        </div>

        {/* Right: Sort Dropdown */}
        <CustomDropdown
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          options={[
            { label: "Top Rated", value: "rating:desc" },
            { label: "Newest First", value: "year:desc" },
            { label: "Name (A-Z)", value: "title:asc" },
          ]}
          icon={BiSort}
          placeholder="Sort By"
          isActive={sortBy !== "rating:desc"}
          align="right"
        />
      </div>

      {/* Streaming Progress Bar if active */}
      {isStreaming && (
        <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-pink-500 animate-loading-bar shadow-[0_0_10px_#ff2a85]" />
        </div>
      )}

      {/* Anime Items Grid */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 font-medium">
          No {mediaTypeFilter === "tv" ? "series" : mediaTypeFilter === "movie" ? "movies" : "items"} found in this collection.
        </div>
      ) : (
        <div className="grid gap-x-3 gap-y-6 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {filteredAndSortedItems.map((item) => (
            <MovieCard key={item._id || item.id} movie={item} />
          ))}

          {/* Loading skeletons for remaining stream slots */}
          {collection.items &&
            collection.populated_items &&
            collection.items.length > collection.populated_items.length &&
            [...Array(collection.items.length - collection.populated_items.length)].map((_, i) => (
              <SingleMovieCardSkeleton key={`skeleton-${i}`} />
            ))}
        </div>
      )}
    </div>
  );
}
