// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import MovieCard from "./MovieCard";
import MovieCardSkeleton, { SingleMovieCardSkeleton } from "./MovieCardSkeleton";

/**
 * MoviesAndSeriesSections
 * ──────────────────────────────────────────────────────────────────────────────
 * Supports two rendering modes:
 *
 * 1. Classic mode (isStreaming = false):
 *    - isMovieDataLoading = true  → show full skeleton grid
 *    - isMovieDataLoading = false → show all cards
 *
 * 2. Hybrid streaming mode (isStreaming = true):
 *    - cards already arrived are rendered immediately
 *    - remaining slots show SingleMovieCardSkeleton placeholders
 *    - no full-page spinner ever blocks the view
 *
 * The SKELETON_COUNT is a reasonable estimate so that the grid doesn't
 * collapse when only a few cards have arrived yet.
 */
const SKELETON_COUNT = 20;

export default function MoviesAndSeriesSections(props) {
  const { isMovieDataLoading, isStreaming, movieData = [] } = props;

  // Number of skeleton placeholder cards to append while streaming
  const skeletonSlots =
    isStreaming && movieData.length < SKELETON_COUNT
      ? SKELETON_COUNT - movieData.length
      : 0;

  return (
    <>
      {/* ── Header: title + filters ───────────────────────────────────────── */}
      <div className="mt-[5rem] flex items-center flex-wrap gap-5 text-primaryTextColor pb-[1.5rem]">
        <div className="pl-[1rem] border-l-2 border-primaryBtn">
          <p className="text-[0.8rem] uppercase font-bold sm:text-[1rem]">
            {props.sectionTitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-6 text-secondaryTextColor w-full sm:w-auto mt-2 sm:mt-0">
          {/* Sort Dropdown */}
          {(props.dataType === "movies" || props.dataType === "series") && (
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-primaryTextColor">
                Sort By:
              </span>
              <select
                value={props.movieFilterVal}
                onChange={(e) => {
                  props.setMovieFilterVal(e.target.value);
                  props.setMovieFilter(e.target.value);
                }}
                className="bg-btnColor text-primaryTextColor text-xs sm:text-sm py-1.5 px-3 rounded-full outline-none border border-transparent focus:border-otherColor cursor-pointer transition-colors"
                style={{
                  appearance: "none",
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b1b1b1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem top 50%",
                  backgroundSize: "0.65rem auto",
                  paddingRight: "1.8rem",
                }}
              >
                <option value="updated_on">Latest</option>
                <option value="views">Trending</option>
                <option value="rating">Top Rated</option>
                <option value="release_year">New</option>
              </select>
            </div>
          )}

          {/* Filter Dropdowns */}
          {(props.dataType === "movies" || props.dataType === "series") && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-primaryTextColor">
                Filters:
              </span>

              {/* Genre */}
              <select
                value={props.genre}
                onChange={(e) => props.setGenre(e.target.value)}
                className="bg-btnColor text-primaryTextColor text-xs sm:text-sm py-1.5 px-3 rounded-full outline-none border border-transparent focus:border-otherColor cursor-pointer transition-colors"
                style={{
                  appearance: "none",
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b1b1b1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem top 50%",
                  backgroundSize: "0.65rem auto",
                  paddingRight: "1.8rem",
                }}
              >
                <option value="all">All Genres</option>
                <option value="action">Action</option>
                <option value="adventure">Adventure</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="fantasy">Fantasy</option>
                <option value="horror">Horror</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
                <option value="animation">Animation</option>
                <option value="crime">Crime</option>
                <option value="family">Family</option>
              </select>

              {/* Year */}
              <select
                value={props.year}
                onChange={(e) => props.setYear(e.target.value)}
                className="bg-btnColor text-primaryTextColor text-xs sm:text-sm py-1.5 px-3 rounded-full outline-none border border-transparent focus:border-otherColor cursor-pointer transition-colors"
                style={{
                  appearance: "none",
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b1b1b1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem top 50%",
                  backgroundSize: "0.65rem auto",
                  paddingRight: "1.8rem",
                }}
              >
                <option value="all">Any Year</option>
                {Array.from(
                  new Array(40),
                  (_, i) => new Date().getFullYear() - i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Audio */}
              <select
                value={props.audio}
                onChange={(e) => props.setAudio(e.target.value)}
                className="bg-btnColor text-primaryTextColor text-xs sm:text-sm py-1.5 px-3 rounded-full outline-none border border-transparent focus:border-otherColor cursor-pointer transition-colors"
                style={{
                  appearance: "none",
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b1b1b1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem top 50%",
                  backgroundSize: "0.65rem auto",
                  paddingRight: "1.8rem",
                }}
              >
                <option value="all">Any Audio</option>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
                <option value="bn">Bengali</option>
                <option value="mr">Marathi</option>
                <option value="gu">Gujarati</option>
                <option value="pa">Punjabi</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      <div>
        {/* Full skeleton – only shown before any item has arrived */}
        {isMovieDataLoading ? (
          <MovieCardSkeleton />
        ) : (
          <div className="relative">
            <div className="grid gap-x-2 gap-y-6 grid-cols-2 md:grid-cols-3 bsmmd:grid-cols-4 lg:grid-cols-5 blgxl:grid-cols-6 xl:grid-cols-7">
              {/* Real cards that have already streamed in */}
              {movieData.map((movie, index) => (
                <MovieCard key={movie._id || index} movie={movie} />
              ))}

              {/* Skeleton placeholders for slots not yet filled by the stream */}
              {skeletonSlots > 0 &&
                [...Array(skeletonSlots)].map((_, i) => (
                  <SingleMovieCardSkeleton key={`sk-${i}`} />
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
