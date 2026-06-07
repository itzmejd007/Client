// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Collection.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton, { SingleMovieCardSkeleton } from "../components/MovieCardSkeleton";

export default function Collection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("custom");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    setIsLoading(true);
    setIsStreaming(false);

    // Initial fetch for collection metadata
    axios.get(`${BASE}/api/collections/${id}`)
      .then(async (res) => {
        const colData = res.data;

        // SEO Redirect
        if (colData.slug && id !== colData.slug) {
          navigate(`/collection/${colData.slug}`, { replace: true });
          return;
        }

        setCollection({ ...colData, populated_items: [] });
        setIsLoading(false);
        setIsStreaming(true);

        // Then stream the items for "Hybrid" performance
        try {
          const response = await fetch(`${BASE}/api/collections/${colData._id}/stream?sort_by=${sortBy}`, {
            mode: 'cors',
            credentials: 'omit',
            headers: { 'Accept': 'application/x-ndjson' }
          });

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
            setCollection(prev => ({ ...prev, populated_items: [...streamedItems] }));
          }
          setIsStreaming(false);
        } catch (error) {
          console.error("Error streaming collection items, falling back to standard fetch:", error);
          setIsStreaming(false);
          // Fallback
          axios.get(`${BASE}/api/collections/${id}`, { params: { sort_by: sortBy } })
            .then(res => setCollection(res.data))
            .catch(err => console.error("Fallback fetch also failed", err));
        }
      })
      .catch(err => {
        console.error("Error fetching collection metadata", err);
        setIsLoading(false);
        setIsStreaming(false);
      });
  }, [BASE, id, sortBy]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="relative w-full aspect-[21/9] md:aspect-[32/9] rounded-[2rem] overflow-hidden mb-12 shadow-2xl bg-bgColorSecondary animate-pulse"></div>
        <MovieCardSkeleton />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Collection not found</h2>
        <button onClick={() => navigate('/collections')} className="bg-primaryBtn px-6 py-2 rounded-xl text-white font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SEO
        title={`${collection.title} - ${SITENAME}`}
        description={`Explore the ${collection.title} collection on ${SITENAME}.`}
        name={SITENAME}
        type="website"
      />

      <div className="relative w-full aspect-[21/9] md:aspect-[32/9] rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
        <img src={collection.thumbnail} alt={collection.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{collection.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <p className="text-gray-300 text-sm md:text-base font-medium">
              {collection.populated_items?.length || 0} / {collection.items?.length || 0} Items Curated for You
            </p>

            {/* Sort Control - Desktop (Visible on sm and up) */}
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 px-4 rounded-xl border border-white/20 w-fit">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[12px] font-bold text-white outline-none cursor-pointer p-0.5"
              >
                <option value="custom" className="bg-bgColor text-white">Custom Order</option>
                <option value="updated:desc" className="bg-bgColor text-white">Recently Added</option>
                <option value="rating:desc" className="bg-bgColor text-white">Top Rated</option>
                <option value="year:desc" className="bg-bgColor text-white">Newest First</option>
                <option value="title:asc" className="bg-bgColor text-white">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Control - Mobile (Visible only on xs/sm, hidden on sm and up) */}
      <div className="flex sm:hidden justify-center mb-8">
        <div className="flex items-center gap-2 bg-bgColorSecondary p-2 px-6 rounded-2xl border border-white/5 shadow-xl w-full max-w-[280px] justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-secondaryTextColor">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-[13px] font-black text-primaryTextColor outline-none cursor-pointer"
          >
            <option value="custom" className="bg-bgColor text-white">Custom Order</option>
            <option value="updated:desc" className="bg-bgColor text-white">Recently Added</option>
            <option value="rating:desc" className="bg-bgColor text-white">Top Rated</option>
            <option value="year:desc" className="bg-bgColor text-white">Newest First</option>
            <option value="title:asc" className="bg-bgColor text-white">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Streaming Progress Indicator */}
      {isStreaming && (
        <div className="w-full h-1 bg-bgColorSecondary rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primaryBtn animate-loading-bar shadow-[0_0_10px_#f97316]"></div>
        </div>
      )}

      <div className="grid gap-x-2 gap-y-6 grid-cols-2 md:grid-cols-3 bsmmd:grid-cols-4 lg:grid-cols-5 blgxl:grid-cols-6 xl:grid-cols-7">
        {collection.populated_items?.map((item) => (
          <MovieCard key={item._id || item.id} movie={item} />
        ))}

        {/* Loading skeletons for remaining items in the stream */}
        {collection.items && collection.populated_items && collection.items.length > collection.populated_items.length && (
          [...Array(collection.items.length - collection.populated_items.length)].map((_, i) => (
            <SingleMovieCardSkeleton key={`skeleton-${i}`} />
          ))
        )}
      </div>
    </div>
  );
}
