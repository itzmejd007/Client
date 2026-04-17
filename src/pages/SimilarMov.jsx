// src/pages/SimilarMovies.jsx
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
  const { movieID } = useParams();
  const [title, setTitle] = useState("");

  // FETCH SIMILAR MOVIE DATA SECTION
  useEffect(() => {
    setIsMoviesDataLoading(true);
    window.scrollTo(0, 0);

    axios.get(`${BASE}/api/similar/`, {
      params: {
        tmdb_id: movieID,
        media_type: "movie",
        limit: 20,
        page: currentPage
      }
    })
      .then(response => {
        setMovies(response.data.similar_media);
        setMoviesDataForPageCount(response.data.total_count);
        setIsMoviesDataLoading(false);
      })
      .catch(error => {
        console.error("Error fetching similar movies:", error);
        setIsMoviesDataLoading(false);
      });
  }, [currentPage, movieID, BASE]);

  // FETCH MOVIE TITLE DATA SECTION
  useEffect(() => {
    axios.get(`${BASE}/api/id/${movieID}`)
      .then(response => {
        setTitle(response.data.title);
      })
      .catch(error => {
        console.error("Error fetching movie title:", error);
      });
  }, [movieID, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Related Anime Movies`}
        description={`Discover similar anime movies in Tamil, Hindi, Telugu and English dubbed on ${SITENAME}. Watch online in HD quality.`}
        name={SITENAME}
        type="text/html"
        keywords="similar anime movies, Tamil dubbed anime, anime recommendations, anime movies online"
        link={`https://${SITENAME}.com`}
      />
      {/* Movies component */}
      <MoviesAndSeriesSections
        movieData={movies}
        isMovieDataLoading={isMoviesDataLoading}
        dataType="similarMovies"
        sectionTitle={`Similar with: ${title}`}
      />
      {/* Call Pagination Component */}
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
