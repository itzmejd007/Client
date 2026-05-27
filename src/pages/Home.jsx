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
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);

    axios.get(`${BASE}/api/home`)
      .then(res => {
        setHeroPopularMovies(res.data.hero || []);
        setIsHeroLoading(false);
        setSections(res.data.sections || []);
        setIsSectionsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching home data:", err);
        setIsSectionsLoading(false);
      });
  }, [BASE]);

  const getSectionItems = (section) => {
    if (section.section_type === "recently_watched") {
      try {
        const localList = JSON.parse(localStorage.getItem("recently_watched") || "[]");
        return localList.slice(0, section.limit || 10);
      } catch (e) {
        console.error("Failed to parse recently watched:", e);
        return [];
      }
    }
    return section.items || [];
  };

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

      {(() => {
        const mockLoadingSections = [
          { title: "Recently Watched", layout: "slider", _id: "loading-recent" },
          { title: "Trending Now", layout: "slider", _id: "loading-trending" },
          { title: "Latest Movies", layout: "grid", _id: "loading-movies" },
          { title: "Latest Series", layout: "grid", _id: "loading-series" }
        ];

        const activeSections = isSectionsLoading ? mockLoadingSections : sections;

        return activeSections.map((section, idx) => {
          const items = getSectionItems(section);
          if (!isSectionsLoading && items.length === 0) return null;

          const seeMoreLink = section.media_type === "tv" ? "/Series" : "/Movies";

          return (
            <React.Fragment key={section._id || idx}>
              {section.layout === "slider" ? (
                <TrendingSlider
                  movieData={isSectionsLoading ? [] : items}
                  isMovieDataLoading={isSectionsLoading}
                  sectionTitle={section.title}
                  sectionSeeMoreButtonLink={seeMoreLink}
                  sectionId={section._id}
                />
              ) : (
                <HomeSections
                  movieData={isSectionsLoading ? [] : items}
                  isMovieDataLoading={isSectionsLoading}
                  sectionTitle={section.title}
                  sectionSeeMoreButtonLink={seeMoreLink}
                  dataType={section._id}
                />
              )}
              {idx === 0 && <AdComponent type="adHomeTrending" />}
              {idx === 1 && <AdComponent type="adHomeLatest" />}
            </React.Fragment>
          );
        });
      })()}
    </div>
  );
}
