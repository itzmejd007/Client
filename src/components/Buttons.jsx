import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { FaCloudDownloadAlt, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Spinner from "./svg/Spinner";
import { useSettings } from "../context/SettingsContext";
import { addToRecentlyWatched } from "../utils/watchHistory";
import { requestStrictAdBlockCheck } from "./AdBlockDetector";

const DownloadButton = ({ movieData, btnType, seasonNumber, episodeNumber, episodeData }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const API_URL = settings.shortenerApiUrl || import.meta.env.VITE_API_URL;
  const API_KEY = settings.shortenerApiKey || import.meta.env.VITE_API_KEY;

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [qualities, setQualities] = useState(() => {
    if (episodeData?.telegram && episodeData.telegram.length > 0) {
      return episodeData.telegram;
    }
    return [];
  });
  const [loading, setLoading] = useState({});

  useEffect(() => {
    // If episodeData was passed directly with qualities, use them immediately
    if (episodeData?.telegram && episodeData.telegram.length > 0) {
      setQualities(episodeData.telegram);
      return;
    }

    if (seasonNumber && episodeNumber) {
      setSelectedSeason(seasonNumber);
      setSelectedEpisode(episodeNumber);
      const season = movieData.seasons?.find(
        (s) => String(s.season_number) === String(seasonNumber)
      );
      if (season) {
        const eps = season.episodes || [];
        // 1. Direct match by episode_number (e.g. 25 or 1)
        let episode = eps.find(
          (e) => String(e.episode_number) === String(episodeNumber) || e.episode_number === parseInt(episodeNumber)
        );
        // 2. Relative index match (e.g. S2 Ep 1 matches index 0 where episode_number is 25)
        if (!episode && eps.length > 0) {
          const sortedEps = eps.slice().sort((a, b) => a.episode_number - b.episode_number);
          const epNum = parseInt(episodeNumber);
          if (!isNaN(epNum) && epNum >= 1 && epNum <= sortedEps.length) {
            episode = sortedEps[epNum - 1];
          }
        }
        if (episode) {
          setQualities(episode.telegram || []);
        }
      }
    } else if (selectedSeason) {
      const season = movieData.seasons?.find(
        (s) => String(s.season_number) === String(selectedSeason)
      );
      if (season) {
        setEpisodes(season.episodes || []);
        setSelectedEpisode("");
        setQualities([]);
      }
    }
  }, [selectedSeason, seasonNumber, episodeNumber, movieData.seasons, episodeData]);

  useEffect(() => {
    if (!seasonNumber && !episodeNumber && selectedEpisode) {
      const eps = episodes || [];
      let episode = eps.find(
        (e) => String(e.episode_number) === String(selectedEpisode) || e.episode_number === parseInt(selectedEpisode)
      );
      if (!episode && eps.length > 0) {
        const sortedEps = eps.slice().sort((a, b) => a.episode_number - b.episode_number);
        const epNum = parseInt(selectedEpisode);
        if (!isNaN(epNum) && epNum >= 1 && epNum <= sortedEps.length) {
          episode = sortedEps[epNum - 1];
        }
      }
      if (episode) {
        setQualities(episode.telegram || []);
        setSelectedQuality("");
      }
    }
  }, [selectedEpisode, episodes, seasonNumber, episodeNumber]);

  const shortenUrl = async (url) => {
    try {
      // Flexible structure for various APIs
      const response = await axios.get(API_URL, {
        params: {
          api: API_KEY,   // ✅ Correct key name
          url: url,       // ✅ Correct param for URL
          format: "json", // ✅ Optional but good to include for clarity
        },
      });

      const data = response.data;

      // Adjust this based on expected field in your API response
      return data?.shortenedUrl || data?.short || data?.url || url;
    } catch (error) {
      console.error("Error shortening URL:", error);
      return url;
    }
  };


  const generateUrl = (id, name) => {
    const downloadUrl = `${BASE}/download/${id}/${encodeURIComponent(name)}`;
    if (btnType === "Download") return downloadUrl;
    return `intent:${downloadUrl}#Intent;type=video/x-matroska;action=android.intent.action.VIEW;end;`;
  };

  const handleButtonClick = async (id, name, quality) => {
    const actionDesc = btnType === "Download" ? "download this anime file" : "open in external player";
    
    // Strict AdBlock verification: forces blocker off for downloads with NO cancel button
    requestStrictAdBlockCheck(actionDesc, async () => {
      addToRecentlyWatched(movieData);
      setLoading((prev) => ({ ...prev, [quality]: true }));
      const rawUrl = generateUrl(id, name);
      
      // Determine which shortener toggle to check
      const shortenerToggle = btnType === "Download" ? settings.useShortenerDownload : settings.useShortenerPlayer;
      const useShortener = shortenerToggle !== false && !movieData.disable_shortener;

      let finalUrl = rawUrl;
      try {
        if (useShortener && API_KEY && API_URL) {
          finalUrl = await shortenUrl(rawUrl);
        }
      } catch (error) {
        console.error("Error shortening URL:", error);
      }

      setLoading((prev) => ({ ...prev, [quality]: false }));

      // Find size if available
      const qObj = movieData.telegram?.find((item) => item.quality === quality) || qualities?.find((item) => item.quality === quality);
      const sizeVal = qObj?.size || "";

      // Route to Content Delivery Page for monetization & 10s countdown
      const params = new URLSearchParams({
        url: finalUrl,
        title: movieData.title || "Anime File",
        quality: quality || "",
        type: btnType || "Download",
        poster: movieData.backdrop || movieData.poster || "",
        size: sizeVal
      });

      navigate(`/content-delivery?${params.toString()}`);
    });
  };

  const renderMovieButtons = () =>
    movieData.telegram?.map((q, i) => (
      <Button
        key={i}
        onClick={() => handleButtonClick(q.id, q.name, q.quality)}
        size="sm"
        className="bg-primaryBtn rounded-full"
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {settings.showQuality !== false ? q.quality : ""}
        {settings.showQuality !== false && settings.showSize !== false && q.size ? " | " : ""}
        {settings.showSize !== false && q.size ? q.size : ""}
      </Button>
    ));

  const renderEpisodeButtons = () => {
    if (!qualities || qualities.length === 0) {
      return (
        <div className="py-2 px-3 text-center text-xs text-secondaryTextColor font-medium">
          Download links coming soon for this episode
        </div>
      );
    }
    return qualities.map((q, i) => (
      <Button
        key={i}
        onClick={() => handleButtonClick(q.id, q.name, q.quality)}
        size="sm"
        className="bg-primaryBtn rounded-full text-bgColor font-medium shadow-md"
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {settings.showQuality !== false ? q.quality : ""}
        {settings.showQuality !== false && settings.showSize !== false && q.size ? " | " : ""}
        {settings.showSize !== false && q.size ? q.size : ""}
      </Button>
    ));
  };

  const renderShowSelectors = () => (
    <div className="px-1 py-2 flex flex-col gap-2">

      {/* SEASON */}
      <Select
        isRequired
        variant="bordered"
        aria-label="Select season"
        placeholder="Select season"
        className="w-40 mb-2"
        selectedKeys={selectedSeason ? new Set([selectedSeason]) : new Set()}
        onSelectionChange={(keys) => {
          setSelectedSeason(Array.from(keys)[0]);
        }}
        classNames={{
          trigger: "bg-btnColor border-otherColor text-primaryTextColor",
          value: "text-primaryTextColor",
          innerWrapper: "text-primaryTextColor",
          selectorIcon: "text-primaryTextColor",
        }}
      >
        {(movieData.seasons || [])
          .slice()
          .sort((a, b) => a.season_number - b.season_number)
          .map((s) => (
            <SelectItem key={String(s.season_number)} textValue={`Season ${s.season_number}`}>
              Season {s.season_number}
            </SelectItem>
          ))}
      </Select>

      {/* EPISODE */}
      <Select
        isRequired
        variant="bordered"
        aria-label="Select episode"
        placeholder="Select episode"
        className="w-40 mb-2"
        disabled={!selectedSeason}
        selectedKeys={selectedEpisode ? new Set([selectedEpisode]) : new Set()}
        onSelectionChange={(keys) => {
          setSelectedEpisode(Array.from(keys)[0]);
        }}
        classNames={{
          trigger: "bg-btnColor border-otherColor text-primaryTextColor",
          value: "text-primaryTextColor",
          innerWrapper: "text-primaryTextColor",
          selectorIcon: "text-primaryTextColor",
        }}
      >
        {(episodes || [])
          .slice()
          .sort((a, b) => a.episode_number - b.episode_number)
          .map((e) => (
            <SelectItem key={String(e.episode_number)} textValue={`Episode ${e.episode_number}`}>
              Episode {e.episode_number}
            </SelectItem>
          ))}
      </Select>

      {/* QUALITY */}
      <Select
        isRequired
        variant="bordered"
        aria-label="Select quality"
        placeholder="Select quality"
        className="w-40 mb-2"
        disabled={!selectedEpisode}
        selectedKeys={selectedQuality ? new Set([selectedQuality]) : new Set()}
        onSelectionChange={(keys) => {
          setSelectedQuality(Array.from(keys)[0]);
        }}
        classNames={{
          trigger: "bg-btnColor border-otherColor text-primaryTextColor",
          value: "text-primaryTextColor",
          innerWrapper: "text-primaryTextColor",
          selectorIcon: "text-primaryTextColor",
        }}
      >
        {qualities?.map((q) => (
          <SelectItem key={String(q.quality)} textValue={`${settings.showQuality !== false ? q.quality : ""} ${settings.showSize !== false && q.size ? `| ${q.size}` : ""}`}>
            {settings.showQuality !== false ? q.quality : ""}
            {settings.showQuality !== false && settings.showSize !== false && q.size ? " | " : ""}
            {settings.showSize !== false && q.size ? q.size : ""}
          </SelectItem>
        ))}
      </Select>

      <Button
        onClick={() => {
          const q = qualities.find((q) => q.quality === selectedQuality);
          if (q) handleButtonClick(q.id, q.name, q.quality);
        }}
        size="sm"
        className="bg-primaryBtn rounded-full"
        disabled={!selectedQuality}
        isLoading={loading[selectedQuality]}
        spinner={<Spinner />}
      >
        {btnType === "Download" ? "Download" : "Open in Player"}
      </Button>

    </div>
  );

  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <button className="flex justify-center items-center gap-2 uppercase text-otherColor w-full h-8 sm:h-9 text-[9px] rounded-full border-2 border-otherColor font-black tracking-wider transition-all">
          {btnType === "Download" ? (
            <>
              <FaCloudDownloadAlt className="text-base" /> Download
            </>
          ) : (
            <>
              <FaPlay className="text-base" /> Player
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-btnColor max-w-[calc(100vw-2rem)] shadow-2xl">
        {movieData.media_type === "movie"
          ? <div className="px-1 py-2 flex gap-1 flex-wrap justify-center">{renderMovieButtons()}</div>
          : (seasonNumber && episodeNumber)
            ? <div className="px-1 py-2 flex gap-1 flex-wrap justify-center">{renderEpisodeButtons()}</div>
            : renderShowSelectors()}
      </PopoverContent>
    </Popover>
  );
};

export default DownloadButton;