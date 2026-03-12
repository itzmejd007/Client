// src/pages/Movies.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import Pagination from "../components/Pagination";
import SEO from "../components/SEO"; // import SEO

export default function Movies() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = localStorage.getItem("siteName") || import.meta.env.VITE_SITENAME;

  // States
  const [movies, setMovies] = useState([]);
  const [isMoviesDataLoading, setIsMoviesDataLoading] = useState(true);
  const [moviesDataForPageCount, setMoviesDataForPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movieFilter, setMovieFilter] = useState("updated_on");
  const [movieFilterVal, setMovieFilterVal] = useState("updated_on");
  const [genre, setGenre] = useState("all");
  const [year, setYear] = useState("all");
  const [audio, setAudio] = useState("all");

  // FETCH MOVIE DATA SECTION
  useEffect(() => {
    setIsMoviesDataLoading(true);
    window.scrollTo(0, 0);

    const apiParams = {
      sort_by: `${movieFilter}:desc`,
      page: currentPage,
      page_size: 20,
    };

    if (genre !== "all") apiParams.genre = genre;
    if (year !== "all") apiParams.year = year;
    if (audio !== "all") apiParams.audio = audio;

    axios
      .get(`${BASE}/api/movies`, { params: apiParams })
      .then((response) => {
        setMovies(response.data.movies);
        setMoviesDataForPageCount(response.data.total_count);
        setIsMoviesDataLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setIsMoviesDataLoading(false);
      });
  }, [movieFilter, currentPage, genre, year, audio, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`Movies - ${SITENAME}`}
        description={`Browse our massive catalog of the latest and greatest Movies on ${SITENAME}. Stream them in HD for free.`}
        name={SITENAME}
        type="website"
        keywords="watch movies online, free streaming movie, watch movies free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online"
        link={`https://${SITENAME}.com/movies`}
      />
      <MoviesAndSeriesSections
        movieData={movies}
        isMovieDataLoading={isMoviesDataLoading}
        dataType="movies"
        sectionTitle="Browse Movies"
        setMovieFilter={setMovieFilter}
        movieFilterVal={movieFilterVal}
        setMovieFilterVal={setMovieFilterVal}
        genre={genre}
        setGenre={(val) => { setGenre(val); setCurrentPage(1); }}
        year={year}
        setYear={(val) => { setYear(val); setCurrentPage(1); }}
        audio={audio}
        setAudio={(val) => { setAudio(val); setCurrentPage(1); }}
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
