import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Autoplay, Navigation, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaPlay } from "react-icons/fa";
import { PiStarFill } from "react-icons/pi";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function HeroSlider({ movieData, isMovieDataLoading }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
      {!isMovieDataLoading ? (
        <div className="relative group">
          <Swiper
            modules={[Autoplay, Navigation, A11y]}
            grabCursor={true}
            loop={true}
            navigation={{
              prevEl: ".heroSlidePrev",
              nextEl: ".heroSlideNext",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={0}
            className="w-full"
          >
            {movieData.map((movie, index) => {
              const targetUrl =
                movie.media_type === "tv" || movie.media_type === "tvshow" || movie.media_type === "series"
                  ? `/ser/${movie._id || movie.tmdb_id}/${movie.slug || slugify(movie.title)}`
                  : `/mov/${movie._id || movie.tmdb_id}/${movie.slug || slugify(movie.title)}`;

              return (
                <SwiperSlide key={movie._id || movie.tmdb_id || index}>
                  <div className="relative w-full h-[360px] xs:h-[400px] sm:h-[460px] md:h-[520px] bg-zinc-950 overflow-hidden">
                    {/* Backdrop Image */}
                    {index === 0 ? (
                      <img
                        src={movie.backdrop || movie.poster}
                        className="w-full h-full object-cover object-top sm:object-center brightness-105 contrast-[1.03]"
                        alt={movie.title}
                        fetchPriority="high"
                        loading="eager"
                      />
                    ) : (
                      <LazyLoadImage
                        src={movie.backdrop || movie.poster}
                        className="w-full h-full object-cover object-top sm:object-center brightness-105 contrast-[1.03]"
                        effect="black-and-white"
                        alt={movie.title}
                      />
                    )}

                    {/* Gradient Overlays (AniAbyss style) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent z-10 w-full md:w-3/4 pointer-events-none" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 md:p-10 max-w-2xl space-y-2 sm:space-y-3">
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
                          ★ Featured
                        </span>

                        {movie.rating && (
                          <span className="flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-md border border-white/20 text-[10px] sm:text-[11px] font-bold text-amber-300 backdrop-blur-md">
                            <PiStarFill className="text-yellow-400 text-xs" />
                            {(parseFloat(movie.rating) || 0).toFixed(1)}
                          </span>
                        )}

                        <span className="font-mono text-zinc-300 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-white/10 uppercase">
                          {movie.media_type === "tv" ? "TV Series" : "Movie"}
                        </span>

                        {movie.release_year && (
                          <>
                            <span className="text-zinc-500">•</span>
                            <span className="text-[11px] text-zinc-300 font-medium">
                              {movie.release_year}
                            </span>
                          </>
                        )}

                        {movie.genres && movie.genres[0] && (
                          <>
                            <span className="text-zinc-500">•</span>
                            <span className="text-[11px] text-pink-300 font-bold">
                              {movie.genres[0]}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <Link
                        to={targetUrl}
                        className="text-xl sm:text-3xl md:text-4xl font-black text-white hover:text-pink-300 transition-colors line-clamp-1 sm:line-clamp-2 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                        title={movie.title}
                      >
                        {movie.title}
                      </Link>

                      {/* Languages & Rip tags */}
                      {movie.languages && movie.languages.length > 0 && (
                        <div className="hidden xs:flex items-center gap-1.5 flex-wrap text-[10px] sm:text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-red-950/90 border border-red-500/40 text-red-200 font-bold uppercase tracking-tight">
                            {movie.languages.slice(0, 3).map((l) => l.slice(0, 3).toUpperCase()).join(" / ")}
                          </span>
                          {movie.rip && (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-zinc-300 font-mono">
                              {movie.rip}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {movie.description && (
                        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-300 line-clamp-2 leading-relaxed max-w-xl font-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {movie.description}
                        </p>
                      )}

                      {/* Watch Action Buttons */}
                      <div className="flex items-center gap-3 pt-1">
                        <Link
                          to={targetUrl}
                          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-all cursor-pointer active:scale-95"
                        >
                          <FaPlay className="text-xs" />
                          <span>Watch Now</span>
                        </Link>
                        <Link
                          to={targetUrl}
                          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95"
                        >
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Controls (Floating arrows) */}
          <button
            type="button"
            aria-label="Previous Slide"
            className="heroSlidePrev absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-pink-500 hover:text-white text-white border border-white/20 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            <BiChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            className="heroSlideNext absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-pink-500 hover:text-white text-white border border-white/20 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            <BiChevronRight size={24} />
          </button>
        </div>
      ) : (
        <div className="relative w-full h-[360px] xs:h-[400px] sm:h-[460px] md:h-[520px] bg-zinc-950 animate-pulse flex flex-col justify-end p-6 sm:p-10">
          <div className="h-4 bg-white/10 rounded-full w-32 mb-3"></div>
          <div className="h-8 sm:h-12 bg-white/10 rounded-full w-2/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded-full w-1/2 mb-4"></div>
          <div className="h-10 bg-white/10 rounded-full w-36"></div>
        </div>
      )}
    </div>
  );
}
