// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";
import AdComponent from "./AdComponent";
import Watch from "./Watch";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
// Import Swiper React components
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { BiListUl, BiPlay, BiTime, BiShow } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { BsListStars } from "react-icons/bs";
import { PiStarFill } from "react-icons/pi";
import { LuLanguages } from "react-icons/lu";
import TelegramButton from "./TelegramButtons";
import DownloadButton from "./Buttons";
import { MdOutlineHighQuality } from "react-icons/md";
import { useWatchlist } from "../context/WatchlistContext";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { PiPlusBold, PiCheckBold, PiDownloadSimpleBold, PiGlobeBold } from "react-icons/pi";
import { addToRecentlyWatched } from "../utils/watchHistory";

export default function MoviesAndSeriesDetailsSections(props) {
  const [isWatchMoviePopupOpen, setIsWatchMoviePopupOpen] = useState(false);
  const [isWatchEpisodePopupOpen, setIsWatchEpisodePopupOpen] = useState(false);
  const [isSeasonsOpen, setIsSeasonspOpen] = useState(false);
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodePage, setEpisodePage] = useState(1);
  const { settings } = useSettings();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    setEpisodePage(1);
  }, [props.seasonNumber]);

  const inWatchlist = isInWatchlist(props.movieData.tmdb_id);
  const showViews = settings?.showViews !== false; // Default to true if not specified

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(props.movieData.tmdb_id);
    } else {
      addToWatchlist(props.movieData);
    }
  };

  const API_URL = settings.shortenerApiUrl || import.meta.env.VITE_API_URL;
  const API_KEY = settings.shortenerApiKey || import.meta.env.VITE_API_KEY;

  const handleExternalLinkClick = async (e, url) => {
    addToRecentlyWatched(props.movieData);
    const useShortener = settings.useShortenerExternal !== false && !props.movieData.disable_shortener;
    if (!useShortener || !API_KEY || !API_URL) return;

    e.preventDefault();
    try {
      const response = await axios.get(API_URL, {
        params: { api: API_KEY, url: url, format: "json" }
      });
      const shortUrl = response.data?.shortenedUrl || response.data?.short || response.data?.url || url;
      window.open(shortUrl, "_blank", "noopener noreferrer");
    } catch (error) {
      console.error("Error shortening external link:", error);
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  return (
    <div className="relative bg-btnColor/40 p-3 md:p-10 rounded-3xl ">
      {!props.isMovieDataLoading ? (
        <>
          <div className="grid lg:grid-cols-2 content-center items-center gap-5 ">
            <div
              onClick={() => {
                if (props.detailType === "movie") {
                  addToRecentlyWatched(props.movieData);
                  setIsWatchMoviePopupOpen(true);
                }
              }}
              className="aspect-video w-full relative flex items-center shrink-0 bg-btnColor  rounded-3xl cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 "
            >
              <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-otherColor  bg-otherColor/50 cursor-pointer rounded-full text-4xl sm:text-5xl">
                {(props.detailType === "movie" && settings.showPlayerButton !== false) ? <BiPlay /> : null}
              </div>

              <LazyLoadImage
                src={props.movieData.backdrop}
                effect="black-and-white"
                alt={props.movieData.title}
                className=" aspect-video w-full rounded-3xl shrink-0 bg-btnColor"
              />
            </div>
            <div className="p-5">
              {props.movieData.genres && (
                <div className="text-otherColor flex gap-2 flex-wrap text-sm xl:text-md">
                  {props.movieData.genres.map((genre, index) => {
                    return <p key={index}>{genre}</p>;
                  })}
                </div>
              )}
              <h1 className="text-primaryTextColor  font-extrabold line-clamp-1 text-2xl xl:text-3xl">
                {props.movieData.title}
              </h1>

              {props.movieData.media_type == "tv" && props.movieData.status !== "Returning Series" && props.movieData.status !== "Unknown" ? (
                <p className="bg-otherColor/40 text-otherColor px-5 rounded-full w-fit line-clamp-1 text-sm xl:text-md">
                  {props.movieData.status}
                </p>
              ) : null}
              <p className="text-secondaryTextColor  line-clamp-2 mt-2 text-xs xl:text-sm">
                {props.movieData.description}
              </p>
              <div className="flex gap-2 text-primaryTextColor flex-wrap mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Media Type Icon and Info */}
                  <div className="flex items-center gap-2">
                    {props.movieData.media_type === "movie" ? (
                      <BiTime className="text-secondaryTextColor text-xl xl:text-2xl" />
                    ) : (
                      <BsListStars className="text-secondaryTextColor text-xl xl:text-2xl" />
                    )}
                    {props.movieData.media_type === "movie" ? (
                      <p className="text-xs xl:text-sm">
                        {props.movieData.runtime} min
                      </p>
                    ) : (
                      <>
                        <p className="text-xs xl:text-sm">
                          {props.movieData.total_seasons} Seasons
                        </p>
                        <span className="text-xs xl:text-sm mx-2">|</span>
                        <p className="text-xs xl:text-sm">
                          {props.movieData.total_episodes} Eps
                        </p>
                      </>
                    )}
                  </div>

                  {/* Release Year */}
                  {props.movieData.media_type === "movie" &&
                    props.movieData.release_year && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-secondaryTextColor text-lg xl:text-xl" />
                        <p className="text-xs xl:text-sm">
                          {props.movieData.release_year}
                        </p>
                      </div>
                    )}

                  {/* Languages */}
                  {props.movieData.languages && (
                    <div className="flex items-center gap-2">
                      <LuLanguages className="text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm">
                        {(props.movieData.languages || [])
                          .map(
                            (lang) =>
                              lang.charAt(0).toUpperCase() + lang.slice(1)
                          )
                          .join("-")}
                      </p>
                    </div>
                  )}
                  {/* Quality */}
                  {settings.showQuality !== false && props.movieData.rip && props.movieData.rip !== "Unknown" && (
                    <div className="flex items-center gap-2">
                      <MdOutlineHighQuality className="text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm">
                        {props.movieData.rip}
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  {props.movieData.rating && (
                    <div className="flex items-center gap-2">
                      <PiStarFill className="text-yellow-300 text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm">
                        {(parseFloat(props.movieData.rating) || 0).toFixed(1)}
                      </p>
                    </div>
                  )}

                  {/* Views */}
                  {showViews && props.movieData.views !== undefined && (
                    <div className="flex items-center gap-2 border-l border-secondaryTextColor/30 pl-2">
                      <BiShow className="text-secondaryTextColor text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm font-medium">
                        {props.movieData.views.toLocaleString()} Views
                      </p>
                    </div>
                  )}

                  {/* Simplified Watchlist Toggle (placed after views) */}
                  <button
                    onClick={handleWatchlistToggle}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 border ml-1 ${inWatchlist
                      ? "bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30"
                      : "bg-bgColorSecondary dark:bg-white/10 text-primaryTextColor/70 dark:text-white/70 hover:bg-otherColor/10 border-secondaryTextColor/20 dark:border-white/10"
                      }`}
                    title={inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  >
                    {inWatchlist ? (
                      <PiCheckBold className="text-sm animate-in zoom-in duration-300" />
                    ) : (
                      <PiPlusBold className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
              {/* Consolidated Action Buttons Grid - Adaptive Layout (Only for movies) */}
              {props.detailType === "movie" && (
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 text-primaryTextColor mt-5 w-full">
                  {settings.showTelegramButton !== false && (
                    <div className="col-span-1 md:flex-1 md:min-w-[120px]">
                      <TelegramButton movieData={props.movieData} />
                    </div>
                  )}

                  {settings.showDownloadButton !== false && (
                    <div className="col-span-1 md:flex-1 md:min-w-[120px]">
                      <DownloadButton
                        movieData={props.movieData}
                        btnType="Download"
                      />
                    </div>
                  )}

                  {settings.showExternalLinks !== false && props.movieData.external_links?.length > 0 && (
                    <div className="col-span-1 md:flex-1 md:min-w-[120px]">
                      <Popover placement="bottom" showArrow={true}>
                        <PopoverTrigger>
                          <button className="flex items-center justify-center gap-2 w-full h-8 sm:h-9 bg-otherColor/10 text-otherColor border-2 border-otherColor rounded-full font-black text-[9px] uppercase tracking-wider hover:bg-otherColor hover:text-bgColor transition-all">
                            <PiGlobeBold className="text-base" />
                            External Links
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-bgColorSecondary dark:bg-btnColor border border-secondaryTextColor/20 p-2 min-w-[160px] max-w-[calc(100vw-2rem)] shadow-2xl overflow-hidden">
                          <div className="flex flex-col gap-1 w-full overflow-hidden">
                            <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-secondaryTextColor font-bold">Links</p>
                            {props.movieData.external_links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                onClick={(e) => handleExternalLinkClick(e, link.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-otherColor/10 rounded-xl text-xs text-primaryTextColor transition-all group w-full"
                              >
                                <span className="font-medium break-all line-clamp-2">{link.name || `Link ${idx + 1}`}</span>
                                <PiGlobeBold className="text-otherColor opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                              </a>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  <div className="col-span-1 md:hidden">
                    <DownloadButton
                      movieData={props.movieData}
                      btnType="MX Player"
                    />
                  </div>
                </div>
              )}
              <AdComponent type="adSidebar" className="mt-5" />
            </div>
          </div>
          {/* Epsiodes */}
          {props.detailType === "series" && (
            <div className="text-primaryTextColor flex flex-col gap-4 content-center items-start lg:mt-6 w-full">
              <div className="col-span-1 flex items-center">
                <div className="relative bg-btnColor/70 px-5 py-2 rounded-md">
                  <button
                    onClick={() => setIsSeasonspOpen((prev) => !prev)}
                    className="relative uppercase text-xs sm:text-md flex items-center gap-3"
                  >
                    <BiListUl className="text-2xl text-secondaryTextColor" />
                    Season {props.seasonNumber}
                    <IoIosArrowDown className="text-2xl text-secondaryTextColor" />
                  </button>
                  <AnimatePresence>
                    {isSeasonsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          type: "tween",
                          duration: 0.3,
                        }}
                        className="absolute top-11 border-2 border-secondaryTextColor/10 left-0 right-0 z-10 max-h-[30dvh] overflow-y-scroll py-4 text-secondaryTextColor text-md rounded-lg bg-btnColor"
                      >
                        {(props.movieData.seasons || [])
                          .slice()
                          .sort((a, b) => a.season_number - b.season_number)
                          .map((season, index) => {
                            return (
                              season.season_number !== 0 && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    props.setSeasonNumber(season.season_number);
                                    setIsSeasonspOpen(false);
                                  }}
                                  className="py-1 px-3 flex items-center gap-2 transition-all duration-300 ease-in-out cursor-pointer hover:bg-otherColor/20 hover:text-primaryTextColor"
                                >
                                  <BiListUl />
                                  <span>Season {season.season_number}</span>
                                </div>
                              )
                            );
                          })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {(() => {
                const sortedEpisodes = (props.episodes || [])
                  .slice()
                  .sort((a, b) => a.episode_number - b.episode_number);

                const itemsPerPage = 15;
                const totalPages = Math.max(1, Math.ceil(sortedEpisodes.length / itemsPerPage));
                const currentPage = Math.min(Math.max(1, typeof episodePage === 'number' ? episodePage : 1), totalPages);

                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedEpisodes = sortedEpisodes.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <>
                    {/* Desktop Grid Layout */}
                    <div className="hidden sm:grid relative w-full p-4 md:p-6 gap-6 bg-btnColor/70 rounded-3xl grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {!props.isEpisodesLoading ? (
                        paginatedEpisodes.map((eps, index) => {
                          const thumbnailSrc = eps.episode_backdrop || props.movieData.backdrop;
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedEpisode(eps);
                                setIsActionPopupOpen(true);
                              }}
                              className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border border-white/5 dark:shadow-lg shadow-none bg-bgColorSecondary/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
                            >
                              {/* Image backdrop */}
                              {thumbnailSrc ? (
                                <img
                                  src={thumbnailSrc}
                                  alt={eps.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-bgColorSecondary text-secondaryTextColor">
                                  <BiPlay className="text-4xl opacity-50" />
                                </div>
                              )}

                              {/* Dark gradient bottom-up fade overlay (hidden in light mode) */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10 z-[1] group-hover:via-black/45 transition-colors duration-300 dark:block hidden" />

                              {/* Top-left Pill Badge (SXX EXX format) */}
                              <div className="absolute top-3 left-3 bg-black/60 dark:bg-black/60 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10 dark:border-white/10 z-[2]">
                                S{String(props.seasonNumber).padStart(2, "0")} E{String(eps.episode_number).padStart(2, "0")}
                              </div>

                              {/* Bottom-left Episode Title */}
                              <div className="absolute bottom-3 left-3 right-3 z-[2] text-left">
                                <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm line-clamp-2 break-all group-hover:text-otherColor transition-colors duration-300">
                                  {eps.title}
                                </h3>
                              </div>

                              {/* Hover Play icon overlay in the center */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[2]">
                                <div className="bg-otherColor text-bgColor p-2.5 rounded-full text-xl shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                  <BiPlay />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-10 flex justify-center">
                          <div className="loader-episode"></div>
                        </div>
                      )}
                    </div>

                    {/* Mobile List Layout */}
                    <div className="flex sm:hidden flex-col relative w-full p-3 gap-3 bg-btnColor/70 rounded-3xl">
                      {!props.isEpisodesLoading ? (
                        paginatedEpisodes.map((eps, index) => {
                          const thumbnailSrc = eps.episode_backdrop || props.movieData.backdrop;
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedEpisode(eps);
                                setIsActionPopupOpen(true);
                              }}
                              className="flex items-center gap-4 p-3 bg-btnColor/30 dark:bg-btnColor/30 hover:bg-btnColor/50 dark:hover:bg-btnColor/50 dark:shadow-lg shadow-none rounded-2xl border border-secondaryTextColor/10 dark:border-white/5 cursor-pointer group transition-all duration-300 w-full"
                            >
                              {/* Thumbnail */}
                              <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-bgColorSecondary/50 border border-secondaryTextColor/10 dark:border-white/5">
                                {thumbnailSrc ? (
                                  <img
                                    src={thumbnailSrc}
                                    alt={eps.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-bgColorSecondary text-secondaryTextColor">
                                    <BiPlay className="text-2xl opacity-50" />
                                  </div>
                                )}
                              </div>

                              {/* Right details */}
                              <div className="flex-1 flex flex-col justify-center min-w-0 text-left">
                                <span className="text-secondaryTextColor font-medium text-[10px] tracking-wider mb-0.5">
                                  S{String(props.seasonNumber).padStart(2, "0")} E{String(eps.episode_number).padStart(2, "0")}
                                </span>
                                <h3 className="text-primaryTextColor font-bold text-xs sm:text-sm line-clamp-3 break-all group-hover:text-otherColor transition-colors duration-300">
                                  {eps.title}
                                </h3>
                              </div>

                              {/* Play indicator icon */}
                              <div className="text-otherColor text-xl pr-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                                <BiPlay />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-10 flex justify-center">
                          <div className="loader-episode"></div>
                        </div>
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {!props.isEpisodesLoading && sortedEpisodes.length > 0 && (
                      <div className="flex items-center justify-center gap-3 mt-6 pb-2 w-full select-none">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setEpisodePage(currentPage - 1)}
                          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-btnColor hover:bg-otherColor/20 text-primaryTextColor disabled:opacity-40 disabled:hover:bg-transparent transition-all border border-white/5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-secondaryTextColor">
                          <span>Page</span>
                          <input
                            type="text"
                            value={episodePage}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              if (valStr === "") {
                                setEpisodePage("");
                                return;
                              }
                              const val = parseInt(valStr, 10);
                              if (!isNaN(val)) {
                                setEpisodePage(Math.min(Math.max(1, val), totalPages));
                              }
                            }}
                            onBlur={() => {
                              if (episodePage === "" || isNaN(parseInt(episodePage, 10))) {
                                setEpisodePage(currentPage);
                              }
                            }}
                            className="w-12 sm:w-16 px-2 py-1 text-center font-bold text-primaryTextColor bg-btnColor/80 rounded-lg border border-white/5 focus:outline-none focus:border-otherColor transition-all"
                          />
                          <span>of {totalPages}</span>
                        </div>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setEpisodePage(currentPage + 1)}
                          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-btnColor hover:bg-otherColor/20 text-primaryTextColor disabled:opacity-40 disabled:hover:bg-transparent transition-all border border-white/5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </>
      ) : (
        <div className="min-h-[50dvh] flex justify-center content-center items-center ">
          <div className="loader"></div>
        </div>
      )}

      {/* Watch Movie Popup */}
      {props.detailType === "movie" && (
        <Watch
          isWatchMoviePopupOpen={isWatchMoviePopupOpen}
          id={props.movieData}
          setIsWatchMoviePopupOpen={setIsWatchMoviePopupOpen}
          popUpType="movie"
        />
      )}

      {/* Watch Episode Popup */}
      {props.detailType === "series" && (
        <Watch
          isWatchEpisodePopupOpen={isWatchEpisodePopupOpen}
          id={props.movieData}
          setIsWatchEpisodePopupOpen={setIsWatchEpisodePopupOpen}
          popUpType="episode"
          seasonNumber={props.seasonNumber}
          episodeNumber={props.episodeNumber}
        />
      )}

      {/* Episode Action Popup Modal */}
      <AnimatePresence>
        {isActionPopupOpen && selectedEpisode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActionPopupOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-bgColorSecondary dark:bg-btnColor border border-secondaryTextColor/20 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsActionPopupOpen(false)}
                className="absolute top-4 right-4 text-secondaryTextColor hover:text-primaryTextColor transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col gap-5 text-center mt-2">
                <div>
                  <span className="text-otherColor font-black text-xs uppercase tracking-wider block mb-1">
                    Season {props.seasonNumber} • Episode {selectedEpisode.episode_number}
                  </span>
                  <h2 className="text-primaryTextColor font-black text-lg md:text-xl px-4 line-clamp-2">
                    {selectedEpisode.title}
                  </h2>
                </div>

                {/* Modal Episode Backdrop Preview */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-bgColorSecondary/50 border border-white/5">
                  <img
                    src={selectedEpisode.episode_backdrop || props.movieData.backdrop}
                    alt={selectedEpisode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Action Buttons Grid in Popup */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    onClick={() => {
                      addToRecentlyWatched(props.movieData);
                      props.setEpisodeNumber(selectedEpisode.episode_number);
                      setIsActionPopupOpen(false);
                      setIsWatchEpisodePopupOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-otherColor hover:bg-otherColor/90 text-bgColor text-xs font-black uppercase tracking-wider rounded-full py-3 px-6 shadow-lg shadow-otherColor/20 transition-all cursor-pointer w-full font-bold"
                  >
                    <BiPlay className="text-lg shrink-0" />
                    Stream / Play Episode
                  </button>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    {settings.showDownloadButton !== false && (
                      <DownloadButton
                        movieData={props.movieData}
                        btnType="Download"
                        seasonNumber={props.seasonNumber}
                        episodeNumber={selectedEpisode.episode_number}
                      />
                    )}

                    {settings.showTelegramButton !== false && (
                      <TelegramButton
                        movieData={props.movieData}
                        seasonNumber={props.seasonNumber}
                        episodeNumber={selectedEpisode.episode_number}
                      />
                    )}
                  </div>

                  {(() => {
                    const hasExternalLinks = settings.showExternalLinks !== false && selectedEpisode.external_links?.length > 0;
                    if (hasExternalLinks) {
                      return (
                        <div className="grid grid-cols-2 gap-3 w-full">
                          {/* MX Player Button (visible on mobile/tablet, hidden on desktop md:hidden) */}
                          <div className="md:hidden col-span-1">
                            <DownloadButton
                              movieData={props.movieData}
                              btnType="MX Player"
                              seasonNumber={props.seasonNumber}
                              episodeNumber={selectedEpisode.episode_number}
                            />
                          </div>
                          
                          {/* Links Button */}
                          <div className="col-span-1 md:col-span-2">
                            <Popover placement="bottom" showArrow={true}>
                              <PopoverTrigger>
                                <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-otherColor/10 text-otherColor border-2 border-otherColor rounded-full font-black text-[9px] uppercase tracking-wider hover:bg-otherColor hover:text-bgColor transition-all">
                                  <PiGlobeBold className="text-xs shrink-0" />
                                  Links
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="bg-bgColorSecondary dark:bg-btnColor border border-secondaryTextColor/20 p-2 min-w-[160px] max-w-[calc(100vw-2rem)] shadow-2xl overflow-hidden">
                                <div className="flex flex-col gap-1 w-full overflow-hidden">
                                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-secondaryTextColor font-bold">Links</p>
                                  {selectedEpisode.external_links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      onClick={(e) => handleExternalLinkClick(e, link.url)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-otherColor/10 rounded-xl text-xs text-primaryTextColor transition-all group w-full"
                                    >
                                      <span className="font-medium break-all line-clamp-2">{link.name || `Link ${idx + 1}`}</span>
                                      <PiGlobeBold className="text-otherColor opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="md:hidden w-full">
                          <DownloadButton
                            movieData={props.movieData}
                            btnType="MX Player"
                            seasonNumber={props.seasonNumber}
                            episodeNumber={selectedEpisode.episode_number}
                          />
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
