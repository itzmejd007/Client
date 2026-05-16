import React, { useState } from "react";
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

export default function MoviesAndSeriesDetailsSections(props) {
  const [isWatchMoviePopupOpen, setIsWatchMoviePopupOpen] = useState(false);
  const [isWatchEpisodePopupOpen, setIsWatchEpisodePopupOpen] = useState(false);
  const [isSeasonsOpen, setIsSeasonspOpen] = useState(false);
  const { settings } = useSettings();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
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
                props.detailType === "movie"
                  ? setIsWatchMoviePopupOpen(true)
                  : null;
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
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 border ml-1 ${
                      inWatchlist 
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
              {/* Consolidated Action Buttons Grid - Adaptive Layout */}
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
              <AdComponent type="adSidebar" className="mt-5" />
            </div>
          </div>
          {/* Epsiodes */}
          {props.detailType === "series" && (
            <div className="text-primaryTextColor flex flex-col gap-2 content-center items-start lg:mt-4 ">
              <div className=" col-span-1 flex items-center">
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
                        exit={{ opacity: 0, y: 10 }} // Smooth exit animation
                        transition={{
                          type: "tween",
                          duration: 0.3,
                        }}
                        className="absolute top-11  border-2 border-secondaryTextColor/10 left-0 right-0 z-10 max-h-[30dvh] overflow-y-scroll py-4 text-secondaryTextColor text-md rounded-lg bg-btnColor"
                      >
                        {(props.movieData.seasons || [])
                          .slice()
                          .sort((a, b) => a.season_number - b.season_number)
                          .map((season, index) => {
                            return (
                              season.season_number !== 0 && (
                                <div
                                  key={index} // Unique key for seasons
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

              <div className="relative grid content-center items-center w-full  p-5 gap-1 bg-btnColor/70 rounded-xl overflow-y-scroll grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {!props.isEpisodesLoading ? (
                  (props.episodes || [])
                    .slice()
                    .sort((a, b) => a.episode_number - b.episode_number)
                    .map((eps, index) => (
                      <div
                        key={index} // Unique key for episodes
                        onClick={() => {
                          props.setEpisodeNumber(eps.episode_number);
                          setIsWatchEpisodePopupOpen(true);
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-btnColor rounded-full transition-all duration-300 ease-in-out hover:bg-otherColor/20 cursor-pointer sm:text-md"
                      >
                        <BiPlay className="text-secondaryTextColor shrink-0" />
                        <span className="shrink-0">
                          Eps {eps.episode_number}:
                        </span>
                        <span className="line-clamp-1 text-sm text-secondaryTextColor">
                          {eps.title}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="grid p-10">
                    <div className="loader-episode"></div>
                  </div>
                )}
              </div>
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
    </div>
  );
}
