// src/pages/Series.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import SEO from "../components/SEO"; // import SEO
import { useSettings } from "../context/SettingsContext";

export default function Series() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL; // Base URL for backend
  const SITENAME = settings.siteName;


  // States
  const [series, setSeries] = useState([]);
  const [isSeriesDataLoading, setIsSeriesDataLoading] = useState(true);
  const [seriesDataForPageCount, setSeriesDataForPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [seriesFilter, setSeriesFilter] = useState("updated_on");
  const [seriesFilterVal, setSeriesFilterVal] = useState("updated_on");
  const [genre, setGenre] = useState("all");
  const [year, setYear] = useState("all");
  const [audio, setAudio] = useState("all");

  // FETCH SERIES DATA SECTION
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);

    setIsSeriesDataLoading(true);

    const apiParams = {
      sort_by: `${seriesFilter}:desc`,
      page: currentPage,
      page_size: 20
    };

    if (genre !== "all") apiParams.genre = genre;
    if (year !== "all") apiParams.year = year;
    if (audio !== "all") apiParams.audio = audio;

    axios.get(`${BASE}/api/tvshows`, { params: apiParams })
      .then(response => {
        setSeries(response.data.tv_shows);
        setSeriesDataForPageCount(response.data.total_count);
        setIsSeriesDataLoading(false);
      })
      .catch(error => {
        console.error("Error fetching series:", error);
        setIsSeriesDataLoading(false);
      });
  }, [seriesFilter, currentPage, genre, year, audio, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`Anime Series - ${SITENAME}`}
        description={`Browse the latest anime series in Tamil, Hindi, Telugu and English dubbed on ${SITENAME}. Stream episodes in HD quality.`}
        name={SITENAME}
        type="website"
        keywords="anime series, Tamil dubbed anime series, Hindi dubbed anime series, Telugu dubbed anime, watch anime episodes online"
        link={`https://${SITENAME}.com/series`}
      />
      <MoviesAndSeriesSections
        movieData={series}
        isMovieDataLoading={isSeriesDataLoading}
        dataType="series"
        sectionTitle="Browse Series"
        setMovieFilter={setSeriesFilter}
        movieFilterVal={seriesFilterVal}
        setMovieFilterVal={setSeriesFilterVal}
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
        total={seriesDataForPageCount}
        pagesNum={Math.ceil(seriesDataForPageCount / 20)}
        onPageChange={(p) => {
          setCurrentPage(p);
        }}
        limit={20}
      />
    </div>
  );
}
