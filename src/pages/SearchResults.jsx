import React, { useState, useEffect } from "react";
import axios from "axios";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import Pagination from "../components/Pagination";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO"; // import SEO

export default function SimilarMovies() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base URL for backend
  const SITENAME = localStorage.getItem("siteName") || import.meta.env.VITE_SITENAME;


  // States
  const [movies, setMovies] = useState([]);
  const [isMoviesDataLoading, setIsMoviesDataLoading] = useState(true);
  const [moviesDataForPageCount, setMoviesDataForPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { searchResult } = useParams();

  // Fetch Movie Data Section
  useEffect(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    setIsMoviesDataLoading(true);

    axios
      .get(`${BASE}/api/search/`, {
        params: {
          query: searchResult,
          page: currentPage,
          page_size: 20,
        },
      })
      .then((response) => {
        setMovies(response.data.results);
        setMoviesDataForPageCount(response.data.total_count);
        setIsMoviesDataLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
        setIsMoviesDataLoading(false);
      });
  }, [searchResult, currentPage, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`Search results for "${searchResult}" - ${SITENAME}`}
        description={`Search results for ${searchResult} on ${SITENAME}. Find your favorite movies and tv shows to watch.`}
        name={SITENAME}
        type="website"
        keywords={`search, ${searchResult}, watch hd movies, watch full movies`}
        link={typeof window !== "undefined" ? `${window.location.origin}/search/${encodeURIComponent(searchResult)}` : undefined}
      />
      {/* Movies Component */}
      <MoviesAndSeriesSections
        movieData={movies}
        isMovieDataLoading={isMoviesDataLoading}
        dataType="searchResult"
        sectionTitle={`results for : ${searchResult}`}
      />
      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        total={moviesDataForPageCount}
        pagesNum={Math.ceil(moviesDataForPageCount / 20)}
        onPageChange={(p) => {
          setCurrentPage(p);
        }}
        limit={20}
      />
    </div>
  );
}
