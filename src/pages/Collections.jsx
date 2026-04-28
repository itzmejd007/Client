// src/pages/Collections.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";

export default function Collections() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${BASE}/api/collections`)
      .then(res => {
        setCollections(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching collections", err);
        setIsLoading(false);
      });
  }, [BASE]);

  return (
    <div className="w-full">
      <SEO
        title={`Collections - ${SITENAME}`}
        description={`Browse our curated collections of movies and series on ${SITENAME}.`}
        name={SITENAME}
        type="website"
      />
      <div className="flex flex-col gap-6 md:gap-8 mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-primaryTextColor flex items-center gap-2 relative z-10 w-fit">
          Curated Collections
          <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primaryBtn rounded-full blur-sm opacity-50 mix-blend-screen"></span>
          <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primaryBtn rounded-full"></span>
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-video bg-bgColorSecondary rounded-2xl w-full"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(col => (
            <Link to={`/collection/${col._id}`} key={col._id} className="group relative rounded-2xl overflow-hidden aspect-video block bg-bgColorSecondary transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primaryBtn/20">
              <img src={col.thumbnail} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-primaryBtn transition-colors">{col.title}</h2>
                <p className="text-sm text-gray-300 font-medium">{col.items?.length || 0} Items</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
