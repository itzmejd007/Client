import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import MovieCard from "./MovieCard";
import { SingleMovieCardSkeleton } from "./MovieCardSkeleton";
import { BiChevronRight, BiChevronLeft, BiTrendingUp } from "react-icons/bi";
import { FaFire } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

export default function TrendingSlider({
    movieData = [],
    isMovieDataLoading,
    sectionTitle,
    sectionSeeMoreButtonLink,
    sectionId,
    isRanked: explicitRanked
}) {
    const [timeRange, setTimeRange] = React.useState("overall"); // 'overall' | 'week' | 'month'
    const swiperRef = React.useRef(null);

    const prevClass = `trending-prev-${sectionId || "default"}`;
    const nextClass = `trending-next-${sectionId || "default"}`;

    // Automatically rank if marked or title implies trending / top
    const isRanked = explicitRanked !== undefined 
        ? explicitRanked 
        : (sectionTitle && (
            sectionTitle.toLowerCase().includes("trending") || 
            sectionTitle.toLowerCase().includes("top") || 
            sectionId === "default-trending"
          ));

    // Dynamic items based on timeRange
    const displayedItems = React.useMemo(() => {
        if (!movieData || movieData.length === 0) return [];
        let list = [...movieData];

        if (timeRange === "week") {
            // Sort favoring newest releases and top ratings
            list.sort((a, b) => {
                const yearA = parseInt(a.release_year, 10) || 0;
                const yearB = parseInt(b.release_year, 10) || 0;
                if (yearB !== yearA) return yearB - yearA;
                return (b.rating || 0) - (a.rating || 0);
            });
        } else if (timeRange === "month") {
            // Sort by views / popularity
            list.sort((a, b) => {
                const viewsA = a.views || 0;
                const viewsB = b.views || 0;
                if (viewsB !== viewsA) return viewsB - viewsA;
                return (b.rating || 0) - (a.rating || 0);
            });
        }

        return isRanked ? list.slice(0, 10) : list;
    }, [movieData, timeRange, isRanked]);

    // Handle tab change and reset swiper position to start
    const handleTabChange = (range) => {
        setTimeRange(range);
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideTo(0);
        }
    };

    return (
        <section className="mt-8 sm:mt-12 md:mt-14 space-y-4 w-full max-w-full overflow-hidden">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                {/* Title & Badge & Time Range Switcher */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                            isRanked 
                                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                                : "bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/30 text-pink-400 shadow-[0_0_15px_rgba(255,42,133,0.2)]"
                        }`}>
                            {isRanked ? <FaFire className="text-sm sm:text-base animate-pulse" /> : <BiTrendingUp className="text-lg sm:text-xl" />}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight truncate">
                                    {sectionTitle}
                                </h2>
                                {isRanked && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                        Top 10
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Time Range Tabs for Trending (Overall, This Week, This Month) */}
                    {isRanked && (
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => handleTabChange("overall")}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                                    timeRange === "overall"
                                        ? "bg-pink-500 text-white shadow-[0_0_10px_rgba(255,42,133,0.5)]"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                Overall
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange("week")}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                                    timeRange === "week"
                                        ? "bg-pink-500 text-white shadow-[0_0_10px_rgba(255,42,133,0.5)]"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                This Week
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange("month")}
                                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                                    timeRange === "month"
                                        ? "bg-pink-500 text-white shadow-[0_0_10px_rgba(255,42,133,0.5)]"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                This Month
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: See All (Only for non-trending sections) + Navigation Controls */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                    {!isRanked && sectionSeeMoreButtonLink && (
                        <Link
                            to={sectionSeeMoreButtonLink}
                            className="flex items-center gap-1 py-1.5 px-3 rounded-full text-[11px] sm:text-xs font-bold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all active:scale-95"
                        >
                            <span>See All</span>
                            <BiChevronRight className="text-sm" />
                        </Link>
                    )}

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            aria-label="Previous Slide"
                            className={`${prevClass} w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90`}
                        >
                            <BiChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            aria-label="Next Slide"
                            className={`${nextClass} w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90`}
                        >
                            <BiChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slider Content - Enclosed in strict overflow-hidden container */}
            <div className="relative pt-1 overflow-hidden w-full max-w-full">
                {!isMovieDataLoading ? (
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, A11y, Autoplay]}
                        spaceBetween={14}
                        slidesPerView={2.2}
                        navigation={{
                            prevEl: `.${prevClass}`,
                            nextEl: `.${nextClass}`,
                        }}
                        autoplay={{
                            delay: 4500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        breakpoints={{
                            480: { slidesPerView: 2.5, spaceBetween: 14 },
                            640: { slidesPerView: 3.2, spaceBetween: 16 },
                            768: { slidesPerView: 4.2, spaceBetween: 16 },
                            1024: { slidesPerView: 5.2, spaceBetween: 18 },
                            1280: { slidesPerView: 6.2, spaceBetween: 18 },
                            1536: { slidesPerView: 7.2, spaceBetween: 20 },
                        }}
                        grabCursor={true}
                        className="trending-swiper w-full overflow-hidden"
                    >
                        {displayedItems.map((movie, index) => (
                            <SwiperSlide key={movie._id || movie.tmdb_id || index}>
                                <MovieCard
                                    movie={movie}
                                    rank={isRanked ? index + 1 : undefined}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="grid grid-flow-col auto-cols-[calc(45%-7px)] sm:auto-cols-[calc(30%-10px)] md:auto-cols-[calc(23%-11px)] lg:auto-cols-[calc(19%-12px)] xl:auto-cols-[calc(15.5%-12.5px)] gap-[14px] overflow-hidden">
                        {[...Array(7)].map((_, i) => <SingleMovieCardSkeleton key={i} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
