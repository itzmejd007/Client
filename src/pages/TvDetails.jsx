import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MoviesAndSeriesDetailsSections from "../components/MoviesAndSeriesDetailsSections";
import Similars from "../components/Similars";
import SEO from "../components/SEO"; // import SEO
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSettings } from "../context/SettingsContext";

export default function TvDetails() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base URL for backend
  const { settings } = useSettings();
  const SITENAME = settings.siteName || import.meta.env.VITE_SITENAME;

  let { seriesID, slug } = useParams();
  const titleParam = slug ? decodeURIComponent(slug) : undefined;

  // States
  const [seriesDetail, setSeriesDetail] = useState({});
  const [similarSeries, setSimilarSeries] = useState([]);
  const [isDetailsLoading, setDetailsIsLoading] = useState(true);
  const [isSimilarLoading, setIsSimilarLoading] = useState(true);

  const [episodeNumber, setEpisodeNumber] = useState();
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(true);
  const [episodes, setEpisodes] = useState([]);

  // Fetch Series Details Data
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    };
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);

    setDetailsIsLoading(true);
 
     axios
       .get(`${BASE}/api/id/${seriesID}`)
      .then((response) => {
        const sortedSeasons = (response.data.seasons || []).sort(
          (a, b) => a.season_number - b.season_number
        );

        setSeriesDetail({ ...response.data, seasons: sortedSeasons });

        if (sortedSeasons.length > 0 && sortedSeasons[0]) {
          setSeasonNumber(sortedSeasons[0].season_number);
        }

        setDetailsIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching series details:", error);
        setDetailsIsLoading(false);
      });

    // Increment View Count
    axios.post(`${BASE}/api/view/tv/${seriesID}`).catch(() => { });
  }, [seriesID, BASE]);

  // Fetch Similar Series
  useEffect(() => {
    setIsSimilarLoading(true);

    axios
      .get(`${BASE}/api/similar/`, {
        params: {
          tmdb_id: seriesID,
          media_type: "tvshow",
          limit: 10,
        },
      })
      .then((response) => {
        setSimilarSeries(response.data.similar_media);
        setIsSimilarLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching similar series:", error);
        setIsSimilarLoading(false);
      });
  }, [seriesID, BASE]);

  // Fetch Episode List for each season
  useEffect(() => {
    if (!seriesID || seasonNumber === undefined) return;

    setIsEpisodesLoading(true);

    const params = { season_number: seasonNumber };

    axios
      .get(`${BASE}/api/id/${seriesID}`, { params })
      .then((response) => {
        setEpisodes(response.data.episodes || []);
        setIsEpisodesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching episodes:", error);
        setEpisodes([]);
        setIsEpisodesLoading(false);
      });
  }, [seasonNumber, seriesID, BASE]);

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />

      {/* SEO SECTION */}
      <SEO
        title={seriesDetail.title ? `${seriesDetail.title} - ${SITENAME}` : SITENAME}
        description={seriesDetail.description || `Watch ${seriesDetail.title || "series"} online free on ${SITENAME}.`}
        name={SITENAME}
        type="video.tv_show"
        keywords={seriesDetail.genres ? seriesDetail.genres.join(", ") : "watch series online, watch hd series"}
        link={window.location.href}
        image={seriesDetail.backdrop || seriesDetail.poster}
      />
      {/* Call MoviesAndSeriesDetailsSections Component */}
      <MoviesAndSeriesDetailsSections
        movieData={seriesDetail}
        isMovieDataLoading={isDetailsLoading}
        detailType="series"
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        setEpisodeNumber={setEpisodeNumber}
        setSeasonNumber={setSeasonNumber}
        isEpisodesLoading={isEpisodesLoading}
        episodes={episodes}
        setEpisodes={setEpisodes}
      />

      <Similars
        movieData={similarSeries}
        isMovieDataLoading={isSimilarLoading}
        sectionTitle="You may also like"
        detailType="similarMovies"
        seeMoreButtonLink={`/similarSeries/${seriesID}`}
      />
    </div>
  );
}
