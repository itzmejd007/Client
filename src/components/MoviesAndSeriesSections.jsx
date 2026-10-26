import React, { useMemo } from "react";
import MovieCard from "./MovieCard";
import MovieCardSkeleton, { SingleMovieCardSkeleton } from "./MovieCardSkeleton";
import CustomDropdown from "./CustomDropdown";
import { BiSort, BiCategory, BiCalendar, BiReset } from "react-icons/bi";
import { FiFilter } from "react-icons/fi";

const SKELETON_COUNT = 21;

// Verified release years of animes currently present in the database
const DATABASE_CATALOG_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 
  2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 
  2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1995, 
  1994, 1993, 1992, 1991, 1990, 1988, 1986
];

// Verified genres of animes currently present in the database
const DATABASE_CATALOG_GENRES = [
  "Action", "Action & Adventure", "Adventure", "Animation", "Comedy", 
  "Crime", "Drama", "Family", "Fantasy", "Horror", "Kids", 
  "Music", "Mystery", "Romance", "Sci-Fi", "Sci-Fi & Fantasy", 
  "Science Fiction", "Supernatural", "TV Movie", "War & Politics"
];

export default function MoviesAndSeriesSections(props) {
  const { isMovieDataLoading, isStreaming, movieData = [] } = props;

  // Number of skeleton placeholder cards to append while streaming
  const skeletonSlots =
    isStreaming && movieData.length < SKELETON_COUNT
      ? SKELETON_COUNT - movieData.length
      : 0;

  // ── Dynamic Years: Full catalog years + any dynamically loaded items ───────
  const dynamicYears = useMemo(() => {
    const yearsSet = new Set(DATABASE_CATALOG_YEARS);
    movieData.forEach((item) => {
      if (item.release_year) {
        const y = parseInt(item.release_year, 10);
        if (!isNaN(y) && y >= 1970 && y <= 2030) {
          yearsSet.add(y);
        }
      }
    });

    if (props.year && props.year !== "all") {
      const activeY = parseInt(props.year, 10);
      if (!isNaN(activeY)) yearsSet.add(activeY);
    }

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [movieData, props.year]);

  // ── Dynamic Genres: Full catalog genres + any dynamically loaded items ─────
  const dynamicGenres = useMemo(() => {
    const genresSet = new Set(DATABASE_CATALOG_GENRES);
    movieData.forEach((item) => {
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g) => {
          if (g && typeof g === "string" && g.trim()) {
            genresSet.add(g.trim());
          }
        });
      }
    });

    if (props.genre && props.genre !== "all") {
      genresSet.add(props.genre);
    }

    return Array.from(genresSet).sort((a, b) => a.localeCompare(b));
  }, [movieData, props.genre]);

  const sortOptions = [
    { label: "Latest Added", value: "updated_on" },
    { label: "Most Popular", value: "views" },
    { label: "Top Rated", value: "rating" },
    { label: "Release Year", value: "release_year" },
  ];

  const genreOptions = [
    { label: "All Genres", value: "all" },
    ...dynamicGenres.map((g) => ({ label: g, value: g.toLowerCase() })),
  ];

  const yearOptions = [
    { label: "All Years", value: "all" },
    ...dynamicYears.map((y) => ({ label: String(y), value: String(y) })),
  ];

  const hasActiveFilters =
    (props.genre && props.genre !== "all") ||
    (props.year && props.year !== "all") ||
    (props.movieFilterVal && props.movieFilterVal !== "updated_on");

  const handleResetFilters = () => {
    if (props.setGenre) props.setGenre("all");
    if (props.setYear) props.setYear("all");
    if (props.setMovieFilterVal) props.setMovieFilterVal("updated_on");
    if (props.setMovieFilter) props.setMovieFilter("updated_on");
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Modern "Lite" Filter Bar (Custom Curved / Rounded Dropdowns) ───── */}
      <div className="relative z-30 p-3 sm:p-4 rounded-2xl bg-[#0b0c14]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Section Title & Active Count */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-7 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(255,42,133,0.8)]" />
          <div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
              {props.sectionTitle}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {movieData.length > 0 ? `${movieData.length} anime available` : "Discover anime"}
            </p>
          </div>
        </div>

        {/* Right: Custom Curved Glass Dropdowns (Sort, Genre, Year) */}
        {(props.dataType === "movies" || props.dataType === "series") && (
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full md:w-auto">
            
            {/* Custom Sort Dropdown */}
            <CustomDropdown
              value={props.movieFilterVal}
              onChange={(val) => {
                props.setMovieFilterVal(val);
                props.setMovieFilter(val);
              }}
              options={sortOptions}
              icon={BiSort}
              placeholder="Sort By"
              isActive={props.movieFilterVal && props.movieFilterVal !== "updated_on"}
              align="left"
            />

            {/* Custom Genre Dropdown */}
            <CustomDropdown
              value={props.genre}
              onChange={(val) => props.setGenre(val)}
              options={genreOptions}
              icon={BiCategory}
              placeholder="All Genres"
              isActive={props.genre && props.genre !== "all"}
              align="left"
            />

            {/* Custom Year Dropdown */}
            <CustomDropdown
              value={props.year}
              onChange={(val) => props.setYear(val)}
              options={yearOptions}
              icon={BiCalendar}
              placeholder="All Years"
              isActive={props.year && props.year !== "all"}
              align="right"
            />

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 transition-all cursor-pointer active:scale-95"
                title="Reset all filters"
              >
                <BiReset size={16} />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Anime Grid ───────────────────────────────────────────────────────── */}
      <div className="relative z-0">
        {isMovieDataLoading ? (
          <MovieCardSkeleton />
        ) : movieData.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FiFilter className="text-3xl text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400 font-medium">
              No anime found matching selected filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-pink-400 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-x-3 gap-y-6 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {movieData.map((movie, index) => (
              <MovieCard key={movie._id || index} movie={movie} />
            ))}

            {/* Skeleton placeholders while streaming */}
            {skeletonSlots > 0 &&
              [...Array(skeletonSlots)].map((_, i) => (
                <SingleMovieCardSkeleton key={`sk-${i}`} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
