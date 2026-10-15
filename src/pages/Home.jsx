// src/pages/Home.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Movie-Stream Frontend — Home Page (Streaming)
// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import HeroSlider from "../components/HomeHero";
import HomeSections from "../components/HomeSections";
import TrendingSlider from "../components/TrendingSlider";
import SEO from "../components/SEO";
import AdComponent from "../components/AdComponent";
import { useSettings } from "../context/SettingsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const DEFAULT_FALLBACK_SECTIONS = [
  { _id: "default-trending", title: "Trending Now", layout: "slider", section_type: "trending", media_type: "both", limit: 14, enabled: true },
  { _id: "default-series", title: "Latest Anime Series", layout: "slider", section_type: "latest", media_type: "tv", limit: 14, enabled: true },
  { _id: "default-movies", title: "Latest Movies", layout: "slider", section_type: "latest", media_type: "movie", limit: 14, enabled: true },
];

function HomeSectionRow({ section, BASE, seeMoreLink }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (section.section_type === "loading") {
      setIsLoading(true);
      return;
    }

    if (section.section_type === "recently_watched") {
      try {
        const localList = JSON.parse(localStorage.getItem("recently_watched") || "[]");
        setItems(localList.slice(0, section.limit || 14));
      } catch (e) {
        console.error("Failed to parse recently watched:", e);
      }
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const fallbackFetch = () => {
      if (section.section_type === "trending" || section._id === "default-trending") {
        axios.get(`${BASE}/api/trending?page=1&page_size=${section.limit || 14}`)
          .then((res) => { if (active) { setItems(res.data.results || []); setIsLoading(false); } })
          .catch(() => { if (active) setIsLoading(false); });
      } else if (section.media_type === "tv" || section._id === "default-series") {
        axios.get(`${BASE}/api/tvshows?sort_by=updated_on:desc&page=1&page_size=${section.limit || 14}`)
          .then((res) => {
            if (active) {
              const tvs = (res.data.tv_shows || []).map(t => ({ ...t, media_type: "tv" }));
              setItems(tvs);
              setIsLoading(false);
            }
          })
          .catch(() => { if (active) setIsLoading(false); });
      } else if (section.media_type === "movie" || section._id === "default-movies") {
        axios.get(`${BASE}/api/movies?sort_by=updated_on:desc&page=1&page_size=${section.limit || 14}`)
          .then((res) => {
            if (active) {
              const movs = (res.data.movies || []).map(m => ({ ...m, media_type: "movie" }));
              setItems(movs);
              setIsLoading(false);
            }
          })
          .catch(() => { if (active) setIsLoading(false); });
      } else {
        if (active) setIsLoading(false);
      }
    };

    if (section._id && section._id.startsWith("default-")) {
      fallbackFetch();
      return () => { active = false; };
    }

    axios.get(`${BASE}/api/home-sections/${section._id}/items`)
      .then((res) => {
        if (active) {
          const fetchedItems = res.data.items || [];
          if (fetchedItems.length > 0) {
            setItems(fetchedItems);
            setIsLoading(false);
          } else {
            fallbackFetch();
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch section items, using fallback:", err);
        fallbackFetch();
      });

    return () => {
      active = false;
    };
  }, [section, BASE]);

  if (!isLoading && items.length === 0 && section.section_type !== "loading") return null;

  return (
    <>
      <TrendingSlider
        movieData={isLoading ? [] : items}
        isMovieDataLoading={isLoading}
        sectionTitle={section.title}
        sectionSeeMoreButtonLink={seeMoreLink}
        sectionId={section._id}
      />
    </>
  );
}

export default function Home() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  const [heroPopularMovies, setHeroPopularMovies] = useState([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);

  const loadHomeData = useCallback(() => {
    setHeroPopularMovies([]);
    setIsHeroLoading(true);
    setSections([]);
    setIsSectionsLoading(true);

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;

    // 1. Fetch Hero popular movies
    axios.get(`${BASE}/api/trending?page=1&page_size=10`)
      .then((res) => {
        setHeroPopularMovies(res.data.results || []);
        setIsHeroLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch Hero popular movies:", err);
        setIsHeroLoading(false);
      });

    // 2. Fetch Section definitions
    axios.get(`${BASE}/api/home-sections`)
      .then((res) => {
        // filter out disabled sections
        const active = (res.data || []).filter(s => s.enabled !== false);
        if (active.length > 0) {
          setSections(active);
        } else {
          setSections(DEFAULT_FALLBACK_SECTIONS);
        }
        setIsSectionsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch home sections list, using fallback:", err);
        setSections(DEFAULT_FALLBACK_SECTIONS);
        setIsSectionsLoading(false);
      });
  }, [BASE]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Mock loading sections shown while fetching section definitions
  const mockLoadingSections = [
    { title: "Recently Watched", layout: "slider", _id: "loading-recent", section_type: "loading" },
    { title: "Trending Now", layout: "slider", _id: "loading-trending", section_type: "loading" },
    { title: "Latest Movies", layout: "grid", _id: "loading-movies", section_type: "loading" },
    { title: "Latest Series", layout: "grid", _id: "loading-series", section_type: "loading" }
  ];

  const activeSections = isSectionsLoading ? mockLoadingSections : sections;

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Watch Anime in Tamil, Hindi & Telugu Dubbed Online`}
        description={`Watch the latest Tamil dubbed anime online in HD quality, 480p, 720p and 1080p. Explore Hindi, Telugu, English and multi audio anime episodes updated daily on ${SITENAME}.`}
        name={SITENAME}
        type="website"
        keywords="watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
        link={`https://${SITENAME}.com`}
      />

      {/* Semantic H1 for SEO without affecting UI design */}
      <h1 className="sr-only">{SITENAME} — Watch Anime Online in Tamil, Hindi, Telugu & English Dubbed</h1>

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

      {activeSections.map((section, idx) => {
        const seeMoreLink = section.media_type === "tv" ? "/Series" : "/Movies";

        return (
          <React.Fragment key={section._id || idx}>
            <HomeSectionRow section={section} BASE={BASE} seeMoreLink={seeMoreLink} />
            {idx === 0 && <AdComponent type="adHomeTrending" />}
            {idx === 1 && <AdComponent type="adHomeLatest" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
