// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Component: MoviesAndSeriesDetailsSections
// Features: YouTube-style Inline Video Player, Episode Auto-Play, 
// Direct Action Buttons below Player (Download, Telegram, MX Player, Links),
// Season Switcher, Episode List with 3-Dot Quick Action Menus.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";
import AdComponent from "./AdComponent";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { BiListUl, BiPlay, BiTime, BiShow } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { BsListStars, BsThreeDotsVertical } from "react-icons/bs";
import { PiStarFill, PiPlusBold, PiCheckBold, PiGlobeBold, PiPlayBold } from "react-icons/pi";
import { LuLanguages } from "react-icons/lu";
import TelegramButton from "./TelegramButtons";
import DownloadButton from "./Buttons";
import { MdOutlineHighQuality } from "react-icons/md";
import { useWatchlist } from "../context/WatchlistContext";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { addToRecentlyWatched } from "../utils/watchHistory";
import { requestStrictAdBlockCheck } from "./AdBlockDetector";
import { VideoJS } from "./VideoJS";
import EpisodeMenuModal from "./EpisodeMenuModal";

export default function MoviesAndSeriesDetailsSections(props) {
  const BASE = import.meta.env.VITE_BASE_URL;
  const { settings } = useSettings();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Playback & Selection States
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [menuEpisode, setMenuEpisode] = useState(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isSeasonsOpen, setIsSeasonsOpen] = useState(false);
  const [episodePage, setEpisodePage] = useState(1);

  // Auto Next Episode Toggle (Default ON / true)
  const [isAutoNextEpisode, setIsAutoNextEpisode] = useState(() => {
    try {
      const saved = localStorage.getItem("autoNextEpisode");
      return saved !== "false";
    } catch (e) {
      return true;
    }
  });

  const playerContainerRef = useRef(null);

  // Auto-select episode when season or episode list changes
  useEffect(() => {
    setEpisodePage(1);
    if (props.detailType === "series" && props.episodes && props.episodes.length > 0) {
      const sorted = props.episodes.slice().sort((a, b) => a.episode_number - b.episode_number);
      // Check if current selectedEpisode is still valid for this season
      const exists = sorted.find((ep) => ep.episode_number === selectedEpisode?.episode_number);
      if (!exists) {
        setSelectedEpisode(sorted[0]);
        if (props.setEpisodeNumber) {
          props.setEpisodeNumber(sorted[0].episode_number);
        }
      }
    }
  }, [props.seasonNumber, props.episodes, props.detailType]);

  const inWatchlist = isInWatchlist(props.movieData.tmdb_id);
  const showViews = settings?.showViews !== false;

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
        params: { api: API_KEY, url: url, format: "json" },
      });
      const shortUrl = response.data?.shortenedUrl || response.data?.short || response.data?.url || url;
      window.open(shortUrl, "_blank", "noopener noreferrer");
    } catch (error) {
      console.error("Error shortening external link:", error);
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  // Compute video sources for current media (movie or active episode)
  const getVideoSources = () => {
    let videoSources = [];
    let poster = props.movieData?.backdrop || props.movieData?.poster || "";

    if (props.detailType === "movie") {
      const manualUrl = props.movieData?.manual_stream_url;
      if (manualUrl) {
        videoSources = [{
          src: manualUrl,
          type: manualUrl.endsWith(".mp4") ? "video/mp4" : undefined,
          label: "Manual Stream"
        }];
      } else if (props.movieData?.telegram && props.movieData.telegram.length > 0) {
        videoSources = props.movieData.telegram.map((q) => {
          const name = q.name.toLowerCase();
          const type = name.endsWith(".webm") ? "video/webm" : "video/mp4";
          return {
            src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
            type: type,
            label: q.quality || "Quality",
          };
        });
      }
      poster = props.movieData?.backdrop || props.movieData?.poster;
    } else if (props.detailType === "series" && selectedEpisode) {
      const manualUrl = selectedEpisode.manual_stream_url;
      if (manualUrl) {
        videoSources = [{
          src: manualUrl,
          type: manualUrl.endsWith(".mp4") ? "video/mp4" : undefined,
          label: "Manual Stream"
        }];
      } else if (selectedEpisode.telegram && selectedEpisode.telegram.length > 0) {
        videoSources = selectedEpisode.telegram.map((q) => {
          const name = q.name.toLowerCase();
          const type = name.endsWith(".webm") ? "video/webm" : "video/mp4";
          return {
            src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
            type: type,
            label: q.quality || "Quality",
          };
        });
      }
      poster = selectedEpisode.episode_backdrop || props.movieData?.backdrop;
    }

    const isEmbed = videoSources.length === 1 && (
      videoSources[0].src.includes("embed") || 
      videoSources[0].src.includes("/e/") || 
      !videoSources[0].src.match(/\.(mp4|mkv|webm|m3u8|mpd)$/i)
    );

    return { sources: videoSources, poster, isEmbed };
  };

  const { sources: currentSources, poster: currentPoster, isEmbed: isEmbedSource } = getVideoSources();

  // Start Playback handler
  const handleStartPlay = () => {
    const actionDesc = props.detailType === "movie" ? "stream this anime movie" : "stream this anime episode";
    requestStrictAdBlockCheck(actionDesc, () => {
      addToRecentlyWatched(props.movieData);
      setIsPlaying(true);
    });
  };

  // Play a specific episode clicked from list (YouTube-style instant stream)
  const handlePlayEpisode = (eps) => {
    requestStrictAdBlockCheck("stream this anime episode", () => {
      addToRecentlyWatched(props.movieData);
      setSelectedEpisode(eps);
      if (props.setEpisodeNumber) {
        props.setEpisodeNumber(eps.episode_number);
      }
      setIsPlaying(true);
      playerContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  // Auto Next Episode handler when current video finishes
  const handleVideoEnded = () => {
    if (!isAutoNextEpisode || props.detailType !== "series") return;

    const sorted = (props.episodes || []).slice().sort((a, b) => a.episode_number - b.episode_number);
    if (!selectedEpisode || sorted.length === 0) return;

    const currentIndex = sorted.findIndex((ep) => ep.episode_number === selectedEpisode.episode_number);

    if (currentIndex !== -1 && currentIndex + 1 < sorted.length) {
      const nextEp = sorted[currentIndex + 1];
      handlePlayEpisode(nextEp);
    } else {
      // Last episode of season: check if next season exists
      const sortedSeasons = (props.movieData?.seasons || [])
        .slice()
        .filter((s) => s.season_number !== 0)
        .sort((a, b) => a.season_number - b.season_number);

      const currentSeasonNum = props.seasonNumber;
      const nextSeason = sortedSeasons.find((s) => s.season_number > currentSeasonNum);

      if (nextSeason) {
        props.setSeasonNumber(nextSeason.season_number);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="relative bg-btnColor/40 p-3 md:p-10 rounded-3xl">
      {!props.isMovieDataLoading ? (
        <>
          {/* Main Hero & Player Section */}
          <div className="grid lg:grid-cols-2 content-start items-start gap-6">
            {/* Left Column: YouTube-Style Video Player & Direct Action Buttons */}
            <div className="flex flex-col w-full">
              {/* Player Top Bar: Live Status & Auto Next Episode Switch */}
              <div className="flex items-center justify-between pb-2.5 px-1 w-full">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPlaying ? "bg-red-500 animate-pulse" : "bg-otherColor"}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-primaryTextColor line-clamp-1">
                    {props.detailType === "series" && selectedEpisode
                      ? `S${String(props.seasonNumber).padStart(2, "0")} E${String(selectedEpisode.episode_number).padStart(2, "0")}: ${selectedEpisode.title}`
                      : props.movieData?.title || "Live Stream"}
                  </span>
                </div>

                {/* Auto Next Episode Toggle Switch */}
                {props.detailType === "series" && (
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <span className="text-[11px] font-bold text-secondaryTextColor">
                      Auto Next
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isAutoNextEpisode}
                      onClick={() => {
                        setIsAutoNextEpisode((prev) => {
                          const nextVal = !prev;
                          try {
                            localStorage.setItem("autoNextEpisode", String(nextVal));
                          } catch (e) {}
                          return nextVal;
                        });
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAutoNextEpisode ? "bg-otherColor" : "bg-white/20"
                      }`}
                      title={`Auto Next Episode: ${isAutoNextEpisode ? "ON" : "OFF"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isAutoNextEpisode ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Player Container */}
              <div
                ref={playerContainerRef}
                id="inline-player-container"
                className="aspect-video w-full relative flex items-center shrink-0 bg-btnColor rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/5"
              >
                {isPlaying && currentSources.length > 0 ? (
                  isEmbedSource ? (
                    <iframe
                      src={currentSources[0].src}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      title={props.movieData.title}
                    />
                  ) : (
                    <VideoJS
                      options={{
                        autoplay: true,
                        poster: currentPoster,
                        sources: currentSources,
                        onEnded: handleVideoEnded,
                      }}
                      onEnded={handleVideoEnded}
                    />
                  )
                ) : (
                  /* YouTube-Style Hero Video Box */
                  <div
                    onClick={handleStartPlay}
                    className="w-full h-full relative flex items-center justify-center cursor-pointer group"
                  >
                    <LazyLoadImage
                      src={currentPoster}
                      effect="black-and-white"
                      alt={props.movieData.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

                    {/* Big YouTube Style Glowing Play Button */}
                    <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-otherColor text-bgColor flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-otherColor/40 transform group-hover:scale-110 transition-transform duration-300 pl-1">
                      <BiPlay />
                    </div>

                    {/* Badge at Bottom-Left */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                      <span className="bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-lg line-clamp-1 inline-block">
                        {props.detailType === "series" && selectedEpisode
                          ? `▶ Play S${String(props.seasonNumber).padStart(2, "0")} E${String(selectedEpisode.episode_number).padStart(2, "0")}: ${selectedEpisode.title}`
                          : `▶ Play ${props.movieData.title}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Directly Below Video Player */}
              <div className="mt-4 w-full">
                {props.detailType === "series" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-otherColor">
                        Episode Actions:
                      </span>
                      {selectedEpisode && (
                        <span className="text-[11px] font-bold text-secondaryTextColor">
                          S{String(props.seasonNumber).padStart(2, "0")} E{String(selectedEpisode.episode_number).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons Grid for Current Episode */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 text-primaryTextColor w-full">
                      {settings.showDownloadButton !== false && (
                        <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                          <DownloadButton
                            movieData={props.movieData}
                            btnType="Download"
                            seasonNumber={props.seasonNumber}
                            episodeNumber={selectedEpisode?.episode_number}
                            episodeData={selectedEpisode}
                          />
                        </div>
                      )}

                      {settings.showTelegramButton !== false && (
                        <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                          <TelegramButton
                            movieData={props.movieData}
                            seasonNumber={props.seasonNumber}
                            episodeNumber={selectedEpisode?.episode_number}
                            episodeData={selectedEpisode}
                          />
                        </div>
                      )}

                      <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                        <DownloadButton
                          movieData={props.movieData}
                          btnType="MX Player"
                          seasonNumber={props.seasonNumber}
                          episodeNumber={selectedEpisode?.episode_number}
                          episodeData={selectedEpisode}
                        />
                      </div>

                      {settings.showExternalLinks !== false && (selectedEpisode?.external_links?.length > 0 || props.movieData.external_links?.length > 0) && (
                        <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                          <Popover placement="bottom" showArrow={true}>
                            <PopoverTrigger>
                              <button className="flex items-center justify-center gap-1.5 w-full h-8 sm:h-9 bg-otherColor/10 text-otherColor border-2 border-otherColor rounded-full font-black text-[9px] uppercase tracking-wider hover:bg-otherColor hover:text-bgColor transition-all">
                                <PiGlobeBold className="text-base" />
                                Links
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-bgColorSecondary dark:bg-btnColor border border-secondaryTextColor/20 p-2 min-w-[160px] max-w-[calc(100vw-2rem)] shadow-2xl overflow-hidden">
                              <div className="flex flex-col gap-1 w-full overflow-hidden">
                                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-secondaryTextColor font-bold">Links</p>
                                {((selectedEpisode?.external_links?.length > 0) ? selectedEpisode.external_links : props.movieData.external_links || []).map((link, idx) => (
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
                    </div>
                  </div>
                ) : (
                  /* Movie Action Buttons Grid */
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 text-primaryTextColor w-full">
                    {settings.showDownloadButton !== false && (
                      <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                        <DownloadButton
                          movieData={props.movieData}
                          btnType="Download"
                        />
                      </div>
                    )}

                    {settings.showTelegramButton !== false && (
                      <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                        <TelegramButton movieData={props.movieData} />
                      </div>
                    )}

                    <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                      <DownloadButton
                        movieData={props.movieData}
                        btnType="MX Player"
                      />
                    </div>

                    {settings.showExternalLinks !== false && props.movieData.external_links?.length > 0 && (
                      <div className="col-span-1 sm:flex-1 sm:min-w-[120px]">
                        <Popover placement="bottom" showArrow={true}>
                          <PopoverTrigger>
                            <button className="flex items-center justify-center gap-2 w-full h-8 sm:h-9 bg-otherColor/10 text-otherColor border-2 border-otherColor rounded-full font-black text-[9px] uppercase tracking-wider hover:bg-otherColor hover:text-bgColor transition-all">
                              <PiGlobeBold className="text-base" />
                              Links
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
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Media Information & Metadata */}
            <div className="flex flex-col justify-start">
              {props.movieData.genres && (
                <div className="text-otherColor flex gap-2 flex-wrap text-sm xl:text-md mb-2">
                  {props.movieData.genres.map((genre, index) => (
                    <span key={index} className="bg-otherColor/10 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-primaryTextColor font-black text-2xl xl:text-4xl leading-tight">
                {props.movieData.title}
              </h1>

              {props.movieData.media_type === "tv" && props.movieData.status !== "Returning Series" && props.movieData.status !== "Unknown" ? (
                <p className="bg-otherColor/30 text-otherColor px-3 py-0.5 rounded-full w-fit text-xs font-bold mt-2">
                  {props.movieData.status}
                </p>
              ) : null}

              <p className="text-secondaryTextColor mt-3 text-xs sm:text-sm leading-relaxed">
                {props.movieData.description}
              </p>

              {/* Meta Badges (Time, Seasons, Year, Languages, Quality, Rating, Views) */}
              <div className="flex flex-wrap items-center gap-3 text-primaryTextColor mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {props.movieData.media_type === "movie" ? (
                    <BiTime className="text-secondaryTextColor text-xl" />
                  ) : (
                    <BsListStars className="text-secondaryTextColor text-xl" />
                  )}
                  {props.movieData.media_type === "movie" ? (
                    <span className="text-xs sm:text-sm font-medium">{props.movieData.runtime} min</span>
                  ) : (
                    <span className="text-xs sm:text-sm font-medium">
                      {props.movieData.total_seasons} Seasons | {props.movieData.total_episodes} Eps
                    </span>
                  )}
                </div>

                {props.movieData.release_year && (
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="text-secondaryTextColor text-lg" />
                    <span className="text-xs sm:text-sm font-medium">{props.movieData.release_year}</span>
                  </div>
                )}

                {props.movieData.languages && (
                  <div className="flex items-center gap-1.5">
                    <LuLanguages className="text-lg text-otherColor" />
                    <span className="text-xs sm:text-sm font-medium">
                      {(props.movieData.languages || [])
                        .map((lang) => lang.charAt(0).toUpperCase() + lang.slice(1))
                        .join("-")}
                    </span>
                  </div>
                )}

                {settings.showQuality !== false && props.movieData.rip && props.movieData.rip !== "Unknown" && (
                  <div className="flex items-center gap-1.5">
                    <MdOutlineHighQuality className="text-lg text-otherColor" />
                    <span className="text-xs sm:text-sm font-medium">{props.movieData.rip}</span>
                  </div>
                )}

                {props.movieData.rating && (
                  <div className="flex items-center gap-1.5">
                    <PiStarFill className="text-yellow-400 text-lg" />
                    <span className="text-xs sm:text-sm font-bold">
                      {(parseFloat(props.movieData.rating) || 0).toFixed(1)}
                    </span>
                  </div>
                )}

                {showViews && props.movieData.views !== undefined && (
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
                    <BiShow className="text-secondaryTextColor text-lg" />
                    <span className="text-xs sm:text-sm font-medium">
                      {props.movieData.views.toLocaleString()} Views
                    </span>
                  </div>
                )}

                {/* Watchlist Toggle Button */}
                <button
                  onClick={handleWatchlistToggle}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 border ml-1 cursor-pointer ${
                    inWatchlist
                      ? "bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30"
                      : "bg-bgColorSecondary dark:bg-white/10 text-primaryTextColor/70 dark:text-white/70 hover:bg-otherColor/10 border-white/10"
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

              {/* Sidebar Ad Slot */}
              <AdComponent type="adSidebar" className="mt-5" />
            </div>
          </div>

          {/* Episodes Listing Section for Series */}
          {props.detailType === "series" && (
            <div className="text-primaryTextColor flex flex-col gap-4 content-center items-start mt-8 w-full">
              {/* Season Switcher Dropdown */}
              <div className="flex items-center justify-between w-full">
                <div className="relative bg-btnColor/80 px-4 py-2 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setIsSeasonsOpen((prev) => !prev)}
                    className="relative uppercase text-xs sm:text-sm font-bold flex items-center gap-3 cursor-pointer"
                  >
                    <BiListUl className="text-2xl text-otherColor" />
                    <span>Season {props.seasonNumber}</span>
                    <IoIosArrowDown className="text-xl text-secondaryTextColor" />
                  </button>

                  <AnimatePresence>
                    {isSeasonsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "tween", duration: 0.2 }}
                        className="absolute top-12 border border-white/10 left-0 min-w-[180px] z-30 max-h-[40dvh] overflow-y-auto py-2 text-secondaryTextColor text-sm rounded-2xl bg-[#171822] shadow-2xl backdrop-blur-xl"
                      >
                        {(props.movieData.seasons || [])
                          .slice()
                          .sort((a, b) => a.season_number - b.season_number)
                          .map((season, index) => {
                            if (season.season_number === 0) return null;
                            const isCurrentSeason = season.season_number === props.seasonNumber;
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  props.setSeasonNumber(season.season_number);
                                  setIsSeasonsOpen(false);
                                  setIsPlaying(false);
                                }}
                                className={`py-2 px-4 flex items-center gap-2.5 transition-all cursor-pointer ${
                                  isCurrentSeason
                                    ? "bg-otherColor/20 text-otherColor font-bold"
                                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                                }`}
                              >
                                <BiListUl />
                                <span>Season {season.season_number}</span>
                              </div>
                            );
                          })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-xs font-semibold text-secondaryTextColor">
                  {props.episodes?.length || 0} Episodes Available
                </span>
              </div>

              {/* Episodes Grid & List */}
              {(() => {
                const sortedEpisodes = (props.episodes || [])
                  .slice()
                  .sort((a, b) => a.episode_number - b.episode_number);

                const itemsPerPage = 15;
                const totalPages = Math.max(1, Math.ceil(sortedEpisodes.length / itemsPerPage));
                const currentPage = Math.min(Math.max(1, typeof episodePage === "number" ? episodePage : 1), totalPages);

                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedEpisodes = sortedEpisodes.slice(startIndex, startIndex + itemsPerPage);
                const isAbsoluteNumbering = sortedEpisodes.length > 0 && sortedEpisodes[0].episode_number > 1 && sortedEpisodes[0].episode_number !== 1;

                return (
                  <>
                    {/* Desktop Grid Layout */}
                    <div className="hidden sm:grid relative w-full p-4 md:p-6 gap-6 bg-btnColor/70 rounded-3xl grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {!props.isEpisodesLoading ? (
                        paginatedEpisodes.map((eps, index) => {
                          const thumbnailSrc = eps.episode_backdrop || props.movieData.backdrop;
                          const relativeEpNumber = startIndex + index + 1;
                          const epBadge = isAbsoluteNumbering
                            ? `S${String(props.seasonNumber).padStart(2, "0")} E${String(relativeEpNumber).padStart(2, "0")} (Ep ${eps.episode_number})`
                            : `S${String(props.seasonNumber).padStart(2, "0")} E${String(eps.episode_number).padStart(2, "0")}`;

                          const isCurrentActive = selectedEpisode?.episode_number === eps.episode_number;

                          return (
                            <div
                              key={index}
                              onClick={() => handlePlayEpisode(eps)}
                              className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border transition-all duration-300 bg-bgColorSecondary/30 hover:scale-[1.02] hover:shadow-xl ${
                                isCurrentActive
                                  ? "border-otherColor ring-2 ring-otherColor/60 shadow-lg shadow-otherColor/20"
                                  : "border-white/5 hover:border-white/20 shadow-none"
                              }`}
                            >
                              {/* 3-Dot Quick Action Menu Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuEpisode(eps);
                                  setIsMenuModalOpen(true);
                                }}
                                className="absolute top-2.5 right-2.5 z-[10] w-7 h-7 flex items-center justify-center rounded-full bg-black/65 hover:bg-otherColor text-white hover:text-bgColor transition-all backdrop-blur-md border border-white/10 shadow-lg cursor-pointer"
                                title="Download / Telegram / Player Options"
                              >
                                <BsThreeDotsVertical className="text-xs" />
                              </button>

                              {/* Thumbnail Image */}
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

                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10 z-[1] group-hover:via-black/45 transition-colors duration-300" />

                              {/* Top-Left Episode Badge */}
                              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10 z-[2]">
                                {epBadge}
                              </div>

                              {/* Active Playing Badge */}
                              {isCurrentActive && isPlaying && (
                                <div className="absolute top-2.5 left-28 bg-otherColor text-bgColor text-[9px] font-black uppercase px-2 py-0.5 rounded-full z-[2] shadow-md animate-pulse">
                                  Playing
                                </div>
                              )}

                              {/* Bottom Episode Title */}
                              <div className="absolute bottom-3 left-3 right-3 z-[2] text-left">
                                <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm line-clamp-2 break-all group-hover:text-otherColor transition-colors duration-300">
                                  {eps.title}
                                </h3>
                              </div>

                              {/* Hover Play Icon in Center */}
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
                          const relativeEpNumber = startIndex + index + 1;
                          const epBadge = isAbsoluteNumbering
                            ? `S${String(props.seasonNumber).padStart(2, "0")} E${String(relativeEpNumber).padStart(2, "0")} (Ep ${eps.episode_number})`
                            : `S${String(props.seasonNumber).padStart(2, "0")} E${String(eps.episode_number).padStart(2, "0")}`;

                          const isCurrentActive = selectedEpisode?.episode_number === eps.episode_number;

                          return (
                            <div
                              key={index}
                              onClick={() => handlePlayEpisode(eps)}
                              className={`flex items-center gap-3 p-2.5 bg-btnColor/30 hover:bg-btnColor/50 rounded-2xl border transition-all duration-300 w-full cursor-pointer group ${
                                isCurrentActive
                                  ? "border-otherColor ring-1 ring-otherColor/50"
                                  : "border-white/5"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0 bg-bgColorSecondary/50 border border-white/5">
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

                              {/* Details */}
                              <div className="flex-1 flex flex-col justify-center min-w-0 text-left">
                                <span className="text-secondaryTextColor font-medium text-[10px] tracking-wider mb-0.5">
                                  {epBadge} {isCurrentActive && isPlaying && <span className="text-otherColor font-bold ml-1">• Playing</span>}
                                </span>
                                <h3 className="text-primaryTextColor font-bold text-xs line-clamp-2 break-all group-hover:text-otherColor transition-colors duration-300">
                                  {eps.title}
                                </h3>
                              </div>

                              {/* Play Indicator */}
                              <div className="text-otherColor text-xl pr-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                                <BiPlay />
                              </div>

                              {/* 3-Dot Menu Button on Mobile */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuEpisode(eps);
                                  setIsMenuModalOpen(true);
                                }}
                                className="p-2 text-secondaryTextColor hover:text-otherColor transition-colors shrink-0 cursor-pointer"
                                title="Download / Telegram / Player Options"
                              >
                                <BsThreeDotsVertical className="text-base" />
                              </button>
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
        <div className="min-h-[50dvh] flex justify-center content-center items-center">
          <div className="loader"></div>
        </div>
      )}

      {/* 3-Dot Quick Action Episode Modal (Download, Telegram, MX Player, Links) */}
      <EpisodeMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        episode={menuEpisode}
        movieData={props.movieData}
        seasonNumber={props.seasonNumber}
        onPlayEpisode={handlePlayEpisode}
      />
    </div>
  );
}
