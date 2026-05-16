import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MoviesAndSeriesDetailsSections from "../components/MoviesAndSeriesDetailsSections";
import Similars from "../components/Similars";
import SEO from "../components/SEO"; // import SEO
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSettings } from "../context/SettingsContext";

export default function MovieDetails() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base URL for backend
  const { settings } = useSettings();
  const SITENAME = settings.siteName || import.meta.env.VITE_SITENAME;

  let { movieID, slug } = useParams();

  // States
  const [movieDetail, setMovieDetail] = useState({});
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isDetailsLoading, setDetailsIsLoading] = useState(true);
  const [isSimilarLoading, setIsSimilarLoading] = useState(true);

  // Fetch Movie Details Data
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);

    setDetailsIsLoading(true);

    const titleParam = slug ? decodeURIComponent(slug) : undefined;

    axios
      .get(`${BASE}/api/id/${movieID}`, { params: { title: titleParam } })
      .then((response) => {
        setMovieDetail(response.data);
        setDetailsIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        setDetailsIsLoading(false);
      });

    // Increment View Count
    axios.post(`${BASE}/api/view/movie/${movieID}`, null, { params: { title: titleParam } }).catch(() => { });
  }, [movieID, slug, BASE]);

  // Fetch Similar Movies
  useEffect(() => {
    setIsSimilarLoading(true);

    axios
      .get(`${BASE}/api/similar/`, {
        params: {
          tmdb_id: movieID,
          media_type: "movie",
          limit: 10,
        },
      })
      .then((response) => {
        setSimilarMovies(response.data.similar_media);
        setIsSimilarLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching similar movies:", error);
        setIsSimilarLoading(false);
      });
  }, [movieID, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <ToastContainer style={{ fontSize: "0.8rem" }} />

      <SEO
        title={movieDetail.title ? `${movieDetail.title} - ${SITENAME}` : SITENAME}
        description={movieDetail.description || `Watch ${movieDetail.title || "movies"} online free on ${SITENAME}.`}
        name={SITENAME}
        type="video.movie"
        keywords={movieDetail.genres ? movieDetail.genres.join(", ") : "watch movies online, watch hd movies"}
        link={window.location.href}
        image={movieDetail.backdrop || movieDetail.poster}
      />
      {/* Call MoviesAndSeriesDetailsSections Component */}
      <MoviesAndSeriesDetailsSections
        movieData={movieDetail}
        isMovieDataLoading={isDetailsLoading}
        detailType="movie"
      />
      <Similars
        movieData={similarMovies}
        isMovieDataLoading={isSimilarLoading}
        sectionTitle="You may also like"
        detailType="similarMovies"
        seeMoreButtonLink={`/similarMov/${movieID}`}
      />
    </div>
  );
}
