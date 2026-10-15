// src/pages/Movies.jsx
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
import axios from "axios";
import { streamNDJSON, buildQueryString } from "../utils/ndjsonStream";

export default function Movies() {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = settings.siteName;

  // ── state ──────────────────────────────────────────────────────────────────
  const [movies, setMovies]               = useState([]);
  const [isStreaming, setIsStreaming]     = useState(true); // true = skeletons visible
  const [movieFilter, setMovieFilter]     = useState("updated_on");
  const [movieFilterVal, setMovieFilterVal] = useState("updated_on");
  const [genre, setGenre]                 = useState("all");
  const [year, setYear]                   = useState("all");
  const [audio, setAudio]                 = useState("all");

  // keep a ref to the abort function so filter changes can cancel in-flight streams
  const abortRef = useRef(null);

  // ── streaming fetch ────────────────────────────────────────────────────────
  const startStream = useCallback(() => {
    // Cancel any previous stream
    if (abortRef.current) abortRef.current();

    setMovies([]);
    setIsStreaming(true);
    window.scrollTo(0, 0);

    const qs = buildQueryString({
      sort_by: `${movieFilter}:desc`,
      genre:   genre !== "all" ? genre : undefined,
      year:    year  !== "all" ? year  : undefined,
    });

    let itemsLoaded = 0;

    const abort = streamNDJSON(
      `${BASE}/api/movies/stream${qs}`,
      // onItem – push each card as it arrives
      (item) => {
        itemsLoaded++;
        setMovies((prev) => [...prev, item]);
      },
      // onDone
      () => {
        if (itemsLoaded === 0) {
          // Fallback if stream was empty
          axios.get(`${BASE}/api/movies?page=1&page_size=60${qs ? `&${qs.replace(/^\?/, '')}` : ''}`)
            .then(res => {
              const list = (res.data?.movies || []).map(m => ({ ...m, media_type: "movie" }));
              setMovies(list);
            })
            .catch(e => console.error("[Movies] REST fallback failed:", e))
            .finally(() => setIsStreaming(false));
        } else {
          setIsStreaming(false);
        }
      },
      // onError – fall back to standard REST API immediately
      (err) => {
        console.warn("[Movies] Stream failed, using REST API fallback:", err);
        axios.get(`${BASE}/api/movies?page=1&page_size=60${qs ? `&${qs.replace(/^\?/, '')}` : ''}`)
          .then(res => {
            const list = (res.data?.movies || []).map(m => ({ ...m, media_type: "movie" }));
            setMovies(list);
          })
          .catch(e => console.error("[Movies] REST fallback failed:", e))
          .finally(() => setIsStreaming(false));
      }
    );

    abortRef.current = abort;
  }, [BASE, movieFilter, genre, year, audio]);

  useEffect(() => {
    startStream();
    return () => abortRef.current?.(); // cleanup on unmount
  }, [startStream]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* SEO */}
      <SEO
        title={`Movies - ${SITENAME}`}
        description={`Browse our massive catalog of the latest and greatest Movies on ${SITENAME}. Stream them in HD for free.`}
        name={SITENAME}
        type="website"
        keywords="watch movies online, free streaming movie, watch movies free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online"
        link={`https://${SITENAME}.com/movies`}
      />

      {/* Slim streaming progress bar – only shows while the NDJSON stream is open */}
      {isStreaming && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-bgColorSecondary overflow-hidden">
          <div className="h-full bg-primaryBtn animate-loading-bar shadow-[0_0_8px] shadow-primaryBtn" />
        </div>
      )}

      {/* Semantic H1 for SEO without affecting UI design */}
      <h1 className="sr-only">Browse Full Anime Movies Online in HD - {SITENAME}</h1>

      <MoviesAndSeriesSections
        movieData={movies}
        isMovieDataLoading={isStreaming && movies.length === 0}
        isStreaming={isStreaming}
        dataType="movies"
        sectionTitle="Browse Movies"
        setMovieFilter={setMovieFilter}
        movieFilterVal={movieFilterVal}
        setMovieFilterVal={setMovieFilterVal}
        genre={genre}
        setGenre={(val) => { setGenre(val); }}
        year={year}
        setYear={(val) => { setYear(val); }}
        audio={audio}
        setAudio={(val) => { setAudio(val); }}
      />

      {/* Stream status footer */}
      {movies.length > 0 && (
        <p className="text-center text-xs text-secondaryTextColor py-6 opacity-60">
          {isStreaming
            ? `Loading… ${movies.length} movies so far`
            : `${movies.length} movies loaded`}
        </p>
      )}
    </div>
  );
}
