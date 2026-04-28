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

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${BASE}/api/collections/${id}`)
      .then(res => {
        setCollection(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching collection", err);
        setIsLoading(false);
      });
  }, [BASE, id]);

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
        <div className="absolute inset-0 bg-gradient-to-t from-bgColor via-bgColor/50 to-transparent flex flex-col justify-end p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{collection.title}</h1>
          <p className="text-gray-300 mt-2 font-medium">{collection.populated_items?.length || 0} Items Curated for You</p>
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
