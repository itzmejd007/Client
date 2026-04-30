// src/pages/Collection.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";

export default function Collection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("updated:desc");

  useEffect(() => {
    setIsLoading(true);
    
    // Initial fetch for collection metadata
    axios.get(`${BASE}/api/collections/${id}`)
      .then(async (res) => {
        const colData = res.data;
        setCollection({ ...colData, populated_items: [] });
        setIsLoading(false);

        // Then stream the items for "Hybrid" performance
        try {
          const response = await fetch(`${BASE}/api/collections/${colData._id}/stream?sort_by=${sortBy}`, {
            mode: 'cors',
            credentials: 'omit'
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
        } catch (error) {
          console.error("Error streaming collection items, falling back to standard fetch:", error);
          // Fallback to standard non-streaming fetch if NDJSON fails (CORS or Network Error)
          axios.get(`${BASE}/api/collections/${id}`, { params: { sort_by: sortBy } })
            .then(res => setCollection(res.data))
            .catch(err => console.error("Fallback fetch also failed", err));
        }
      })
      .catch(err => {
        console.error("Error fetching collection metadata", err);
        setIsLoading(false);
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
          <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
            <p className="text-gray-300 font-medium">{collection.populated_items?.length || 0} Items Curated for You</p>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 px-3 rounded-xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sort:</span>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-[11px] font-black text-white outline-none cursor-pointer p-1"
                >
                    <option value="updated:desc" className="bg-bgColor text-white">Recently Added</option>
                    <option value="rating:desc" className="bg-bgColor text-white">Top Rated</option>
                    <option value="year:desc" className="bg-bgColor text-white">Newest First</option>
                    <option value="title:asc" className="bg-bgColor text-white">Name (A-Z)</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-x-2 gap-y-6 grid-cols-2 md:grid-cols-3 bsmmd:grid-cols-4 lg:grid-cols-5 blgxl:grid-cols-6 xl:grid-cols-7">
        {collection.populated_items?.map((item) => (
          <MovieCard key={item.tmdb_id} movie={item} />
        ))}
      </div>
    </div>
  );
}
