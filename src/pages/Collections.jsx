// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Collections.jsx
// src/pages/Collections.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import { FiSearch } from "react-icons/fi";
import Pagination from "../components/Pagination";

export default function Collections() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("updated_on:desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    setIsLoading(true);
    axios.get(`${BASE}/api/collections`, {
      params: {
        page: currentPage,
        page_size: limit,
        sort_by: sortBy,
        query: searchQuery
      }
    })
      .then(res => {
        setCollections(res.data.collections || []);
        setTotalCount(res.data.total_count || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching collections", err);
        setIsLoading(false);
      });
  }, [BASE, sortBy, currentPage, searchQuery]);

  return (
    <div className="w-full">
      <SEO
        title={`Collections - ${SITENAME}`}
        description={`Browse our curated collections of movies and series on ${SITENAME}.`}
        name={SITENAME}
        type="website"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-primaryTextColor flex items-center gap-2 relative z-10 w-fit">
          Curated Collections
          <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primaryBtn rounded-full blur-sm opacity-50 mix-blend-screen"></span>
          <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primaryBtn rounded-full"></span>
        </h1>

        {/* Search Input */}
        <div className="relative flex items-center w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-4 pr-10 rounded-xl bg-bgColorSecondary text-primaryTextColor placeholder-secondaryTextColor outline-none border border-secondaryTextColor/10 focus:border-primaryBtn/50 transition-all text-sm font-medium shadow-md"
          />
          <FiSearch className="absolute right-3.5 text-secondaryTextColor pointer-events-none" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-video bg-bgColorSecondary rounded-2xl w-full"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.length === 0 ? (
              <div className="col-span-full py-20 text-center text-secondaryTextColor font-medium">
                No collections found matching "{searchQuery}"
              </div>
            ) : (
              collections.map(col => (
                <Link to={`/collection/${col.slug || col._id}`} key={col._id} className="group relative rounded-2xl overflow-hidden aspect-video block bg-bgColorSecondary transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primaryBtn/20">
                  <img src={col.thumbnail} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-primaryBtn transition-colors">{col.title}</h2>
                    <p className="text-sm text-gray-300 font-medium">{col.items?.length || 0} Items</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!isLoading && totalCount > limit && (
            <div className="flex justify-center mt-12">
              <Pagination
                currentPage={currentPage}
                total={totalCount}
                limit={limit}
                onPageChange={(page) => setCurrentPage(page)}
                pagesNum={Math.ceil(totalCount / limit)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
