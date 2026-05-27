import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import MovieCard from "./MovieCard";
import { SingleMovieCardSkeleton } from "./MovieCardSkeleton";
import { BiArrowFromLeft } from "react-icons/bi";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";

import "swiper/css";
import "swiper/css/navigation";

export default function TrendingSlider({ movieData, isMovieDataLoading, sectionTitle, sectionSeeMoreButtonLink, sectionId }) {
    const prevClass = `trending-prev-${sectionId || "default"}`;
    const nextClass = `trending-next-${sectionId || "default"}`;

    return (
        <div className="mt-[2.5rem] md:mt-[5rem]">
            {/* Title */}
            <div className="flex items-center justify-between text-primaryTextColor pb-[1.5rem]">
                <div className="flex items-center gap-5">
                    <div className="pl-[1rem] border-l-2 border-primaryBtn">
                        <p className="text-[0.8rem] uppercase font-black sm:text-[1rem] tracking-widest">
                            {sectionTitle}
                        </p>
                    </div>

                    {/* See All Button */}
                    <Link
                        to={sectionSeeMoreButtonLink}
                        className="flex gap-2 items-center py-[0.5rem] px-[1rem] text-[0.7rem] rounded-full transition-all duration-300 ease-in-out text-secondaryTextColor hover:text-primaryBtn bg-bgColorSecondary/50 border border-secondaryTextColor/10"
                        style={{ textDecoration: "none" }}
                    >
                        <p className="font-bold">See all</p>
                        <BiArrowFromLeft style={{ fontSize: "1rem" }} />
                    </Link>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <BsArrowLeftCircle className={`${prevClass} text-[2rem] text-secondaryTextColor cursor-pointer hover:text-primaryBtn transition-colors`} />
                    <BsArrowRightCircle className={`${nextClass} text-[2rem] text-secondaryTextColor cursor-pointer hover:text-primaryBtn transition-colors`} />
                </div>
            </div>

            {/* Slider */}
            <div className="relative">
                {!isMovieDataLoading ? (
                    <Swiper
                        modules={[Navigation, A11y, Autoplay]}
                        spaceBetween={15}
                        slidesPerView={2}
                        navigation={{
                            prevEl: `.${prevClass}`,
                            nextEl: `.${nextClass}`,
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                            1280: { slidesPerView: 6 },
                            1536: { slidesPerView: 7 },
                        }}
                        grabCursor={true}
                        className="trending-swiper"
                    >
                        {movieData.map((movie, index) => (
                            <SwiperSlide key={index}>
                                <MovieCard movie={movie} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="grid grid-flow-col auto-cols-[calc(50%-7.5px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(25%-11.25px)] lg:auto-cols-[calc(20%-12px)] xl:auto-cols-[calc(16.666%-12.5px)] gap-[15px] overflow-hidden">
                        {[...Array(7)].map((_, i) => <SingleMovieCardSkeleton key={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
