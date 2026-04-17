// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import HeroSlider from "../components/HomeHero";
import HomeSections from "../components/HomeSections";
import TrendingSlider from "../components/TrendingSlider";
import SEO from "../components/SEO";
import AdComponent from "../components/AdComponent";
import { useSettings } from "../context/SettingsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = settings.siteName;

  // States
  const [heroPopularMovies, setHeroPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [combinedTrending, setCombinedTrending] = useState([]);

  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isTrendingMoviesLoading, setIsTrendingMoviesLoading] = useState(true);
  const [isTrendingTvLoading, setIsTrendingTvLoading] = useState(true);
  const [isCombinedTrendingLoading, setIsCombinedTrendingLoading] = useState(true);

  useEffect(() => {
    setIsHeroLoading(true);
    window.scrollTo(0, 0);
    axios
      .get(`${BASE}/api/trending`, {
        params: {
          page: 1,
          page_size: 10,
        },
      })
      .then((response) => {
        setHeroPopularMovies(response.data.results);
        setIsHeroLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trending media:", error);
        setIsHeroLoading(false);
      });
  }, [BASE]);

  useEffect(() => {
    setIsTrendingMoviesLoading(true);
    axios
      .get(`${BASE}/api/movies`, {
        params: {
          sort_by: "updated_on:desc",
          page: 1,
          page_size: 20,
        },
      })
      .then((response) => {
        setTrendingMovies(response.data.movies);
        setIsTrendingMoviesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trending movies:", error);
        setIsTrendingMoviesLoading(false);
      });
  }, [BASE]);

  useEffect(() => {
    setIsTrendingTvLoading(true);
    axios
      .get(`${BASE}/api/tvshows`, {
        params: {
          sort_by: "updated_on:desc",
          page: 1,
          page_size: 20,
        },
      })
      .then((response) => {
        setTrendingTv(response.data.tv_shows);
        setIsTrendingTvLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trending TV shows:", error);
        setIsTrendingTvLoading(false);
      });
  }, [BASE]);

  // Combined Trending (Movies + Series)
  useEffect(() => {
    setIsCombinedTrendingLoading(true);

    const fetchTrending = async () => {
      try {
        const [movieRes, tvRes] = await Promise.all([
          axios.get(`${BASE}/api/movies`, { params: { sort_by: "views:desc", page: 1, page_size: 15 } }),
          axios.get(`${BASE}/api/tvshows`, { params: { sort_by: "views:desc", page: 1, page_size: 15 } })
        ]);

        const merged = [
          ...(movieRes.data.movies || []),
          ...(tvRes.data.tv_shows || [])
        ];

        // Sort merged by views
        merged.sort((a, b) => (b.views || 0) - (a.views || 0));

        setCombinedTrending(merged);
      } catch (error) {
        console.error("Error fetching combined trending:", error);
      } finally {
        setIsCombinedTrendingLoading(false);
      }
    };

    fetchTrending();
  }, [BASE]);

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Watch Anime in Tamil, Hindi & Telugu Dubbed Online`}
        description={`Watch the latest Tamil dubbed anime online in HD quality, 480p, 720p and 1080p. Explore Hindi, Telugu, English and multi audio anime episodes updated daily on ${SITENAME}.`}
        name={SITENAME}
        type="website"
        keywords="Tamil dubbed anime, watch anime in Tamil, AnimeToon, Hindi dubbed anime, Telugu dubbed anime, English dubbed anime, multi audio anime, anime online, HD anime streaming"
        link={`https://${SITENAME}.com`}
      />

      {/* HEADER - Hero and boxoffice */}
      <div className="col-span-1 lg:col-span-2">
        <HeroSlider
          movieData={heroPopularMovies}
          isMovieDataLoading={isHeroLoading}
          dataType="heroPopularMovies"
          sliderTypePrev="slideHeroTrendingMovies-prev"
          sliderTypeNext="slideHeroTrendingMovies-next"
        />
      </div>

      {/* Combined Trending Section (Slider) */}
      <TrendingSlider
        movieData={combinedTrending}
        isMovieDataLoading={isCombinedTrendingLoading}
        sectionTitle="Trending Now"
        sectionSeeMoreButtonLink="/Movies"
      />
      <AdComponent type="adHomeTrending" />

      {/* Latest Movies Section */}
      <HomeSections
        movieData={trendingMovies}
        isMovieDataLoading={isTrendingMoviesLoading}
        sectionTitle="Latest Movies"
        sectionSeeMoreButtonLink="/Movies"
        dataType="latestMovies"
      />
      <AdComponent type="adHomeLatest" />

      {/* Latest TV SHOWS Section */}
      <HomeSections
        movieData={trendingTv}
        isMovieDataLoading={isTrendingTvLoading}
        sectionTitle="Latest Series"
        sectionSeeMoreButtonLink="/Series"
        dataType="latestTv"
      />
    </div>
  );
}
