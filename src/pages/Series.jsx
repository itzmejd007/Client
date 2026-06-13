// src/pages/Series.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Hybrid streaming page: uses the backend NDJSON stream endpoint so that cards
// render progressively instead of waiting for the full paginated response.
//
// JSON stack used:
//   Backend  : orjson (serialise) + NDJSON framing
//   Frontend : native JSON.parse inside ndjsonStream util (fastest browser path)
//
// For filter/sort changes the stream is aborted and re-started immediately.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import { streamNDJSON, buildQueryString } from "../utils/ndjsonStream";

export default function Series() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  // ── state ──────────────────────────────────────────────────────────────────
  const [series, setSeries]                 = useState([]);
  const [isStreaming, setIsStreaming]       = useState(true);
  const [seriesFilter, setSeriesFilter]     = useState("updated_on");
  const [seriesFilterVal, setSeriesFilterVal] = useState("updated_on");
  const [genre, setGenre]                   = useState("all");
  const [year, setYear]                     = useState("all");
  const [audio, setAudio]                   = useState("all");

  const abortRef = useRef(null);

  // ── streaming fetch ────────────────────────────────────────────────────────
  const startStream = useCallback(() => {
    if (abortRef.current) abortRef.current();

    setSeries([]);
    setIsStreaming(true);
    window.scrollTo(0, 0);

    const qs = buildQueryString({
      sort_by: `${seriesFilter}:desc`,
      genre:   genre !== "all" ? genre : undefined,
      year:    year  !== "all" ? year  : undefined,
    });

    const abort = streamNDJSON(
      `${BASE}/api/tvshows/stream${qs}`,
      (item) => setSeries((prev) => [...prev, item]),
      () => setIsStreaming(false),
      (err) => {
        console.error("[Series] Stream error:", err);
        setIsStreaming(false);
      }
    );

    abortRef.current = abort;
  }, [BASE, seriesFilter, genre, year, audio]);

  useEffect(() => {
    startStream();
    return () => abortRef.current?.();
  }, [startStream]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* SEO */}
      <SEO
        title={`Tamil Dubbed Anime Series | Watch Free Online HD - ${SITENAME}`}
        description={`Watch Tamil, Hindi, Telugu and English dubbed anime series online free. Stream HD anime episodes and discover the latest releases on ${SITENAME}.`}
        name={SITENAME}
        type="website"
        keywords="Tamil dubbed anime, anime series, watch anime online, Tamil anime episodes, Hindi dubbed anime, Telugu dubbed anime"
        link={`https://www.animetoon.in/series`}
      />

      {/* Slim streaming progress bar */}
      {isStreaming && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-bgColorSecondary overflow-hidden">
          <div className="h-full bg-primaryBtn animate-loading-bar shadow-[0_0_8px] shadow-primaryBtn" />
        </div>
      )}

      <MoviesAndSeriesSections
        movieData={series}
        isMovieDataLoading={isStreaming && series.length === 0}
        isStreaming={isStreaming}
        dataType="series"
        sectionTitle="Browse Series"
        setMovieFilter={setSeriesFilter}
        movieFilterVal={seriesFilterVal}
        setMovieFilterVal={setSeriesFilterVal}
        genre={genre}
        setGenre={(val) => { setGenre(val); }}
        year={year}
        setYear={(val) => { setYear(val); }}
        audio={audio}
        setAudio={(val) => { setAudio(val); }}
      />

      {/* Stream status footer */}
      {series.length > 0 && (
        <p className="text-center text-xs text-secondaryTextColor py-6 opacity-60">
          {isStreaming
            ? `Loading… ${series.length} series so far`
            : `${series.length} series loaded`}
        </p>
      )}
    </div>
  );
}
