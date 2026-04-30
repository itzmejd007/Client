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

  const [heroPopularMovies, setHeroPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [combinedTrending, setCombinedTrending] = useState([]);
  
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isTrendingMoviesLoading, setIsTrendingMoviesLoading] = useState(true);
  const [isTrendingTvLoading, setIsTrendingTvLoading] = useState(true);
  const [isCombinedTrendingLoading, setIsCombinedTrendingLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch Hero immediately
    axios.get(`${BASE}/api/trending?page=1&page_size=10`)
      .then((response) => {
        setHeroPopularMovies(response.data.results || []);
        setIsHeroLoading(false);
      })
      .catch((err) => console.error("Error fetching hero:", err));

    // Fetch Combined Trending
    Promise.all([
      axios.get(`${BASE}/api/movies?sort_by=views:desc&page=1&page_size=15`),
      axios.get(`${BASE}/api/tvs?sort_by=views:desc&page=1&page_size=15`)
    ]).then(([moviesRes, tvsRes]) => {
      const m = moviesRes.data.movies || [];
      const t = tvsRes.data.tv_shows || [];
      const combined = [...m, ...t].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
      setCombinedTrending(combined);
      setIsCombinedTrendingLoading(false);
    }).catch((err) => console.error("Error fetching combined trending:", err));

    // Fetch Latest Movies
    axios.get(`${BASE}/api/movies?sort_by=updated_on:desc&page=1&page_size=20`)
      .then((response) => {
        setTrendingMovies(response.data.movies || []);
        setIsTrendingMoviesLoading(false);
      })
      .catch((err) => console.error("Error fetching latest movies:", err));

    // Fetch Latest TV Shows
    axios.get(`${BASE}/api/tvs?sort_by=updated_on:desc&page=1&page_size=20`)
      .then((response) => {
        setTrendingTv(response.data.tv_shows || []);
        setIsTrendingTvLoading(false);
      })
      .catch((err) => console.error("Error fetching latest tv shows:", err));
      
  }, [BASE]);

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Watch Free Movies & TV Shows`}
        description={`Discover a world of entertainment where every show, movie, and exclusive content takes you on a journey beyond the screen. ${SITENAME} offers endless options for every mood, helping you relax, escape, and imagine more. Stream your favorites, dream big, and repeat the experience, only with ${SITENAME}.`}
        name={SITENAME}
        type="website"
        keywords="watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
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
