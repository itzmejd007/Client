import React, { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { PiTelegramLogo } from "react-icons/pi";
import axios from "axios";
import { Button } from "@nextui-org/button";
import Spinner from "./svg/Spinner";
import { useLocation, useNavigate } from "react-router-dom";
import { addToRecentlyWatched } from "../utils/watchHistory";
import { requestStrictAdBlockCheck } from "./AdBlockDetector";

const TelegramButton = ({ movieData, seasonNumber, episodeNumber, episodeData }) => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const rawUsername = settings?.tgUsername || import.meta.env.VITE_TG_USERNAME || "AnimeToonX_bot";
  const USERNAME = String(rawUsername).trim().replace(/^@/, "");
  const API_URL = settings?.shortenerApiUrl || import.meta.env.VITE_API_URL;
  const API_KEY = settings?.shortenerApiKey || import.meta.env.VITE_API_KEY;

  const [shortenedUrls, setShortenedUrls] = useState({});
  const [loading, setLoading] = useState({});
  const location = useLocation();

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


  const handleButtonClick = async (originalUrl, quality) => {
    // Strict AdBlock verification: forces blocker off for Telegram files with NO cancel button
    requestStrictAdBlockCheck("access Telegram anime files", async () => {
      addToRecentlyWatched(movieData);
      setLoading((prev) => ({ ...prev, [quality]: true }));
      let shortUrl = originalUrl;

      const useShortener = settings?.useShortenerTelegram !== false && !movieData.disable_shortener;

      try {
        if (useShortener && API_KEY && API_URL) {
          shortUrl = await shortenUrl(originalUrl);
        }
        setShortenedUrls((prev) => ({ ...prev, [originalUrl]: shortUrl }));
      } catch (error) {
        console.error("Error processing URL:", error);
      } finally {
        setLoading((prev) => ({ ...prev, [quality]: false }));

        // Route to Content Delivery Page for monetization & 10s countdown
        const params = new URLSearchParams({
          url: shortUrl,
          title: movieData.title || "Anime File",
          quality: quality || "",
          type: "Telegram",
          poster: movieData.backdrop || movieData.poster || ""
        });

        navigate(`/content-delivery?${params.toString()}`);
      }
    });
  };

  const renderQualityButtons = (qualityDetails) => {
    if (!qualityDetails || qualityDetails.length === 0) {
      return (
        <div className="py-2 px-3 text-center text-xs text-secondaryTextColor font-medium">
          Telegram links coming soon for this episode
        </div>
      );
    }
    return qualityDetails.map(({ quality, size, id }, index) => (
      <Button
        key={index}
        onClick={() =>
          handleButtonClick(
            `https://t.me/${USERNAME}?start=get_${id}`,
            quality
          )
        }
        size="sm"
        className="bg-primaryBtn rounded-full shadow-md"
        isLoading={loading[quality]}
        spinner={<Spinner />}
      >
        {settings.showQuality !== false ? quality : ""}
        {settings.showQuality !== false && settings.showSize !== false && size ? " | " : ""}
        {settings.showSize !== false && size ? size : ""}
      </Button>
    ));
  };

  const renderSeasonButtons = () =>
    (movieData.seasons || []).map((season, seasonIndex) => {
      const availableQualities = new Set();
      (season.episodes || []).forEach((episode) => {
        episode.telegram?.forEach(({ quality }) =>
          availableQualities.add(quality)
        );
      });

      return (
        <Popover
          key={seasonIndex}
          placement="left"
          showArrow={true}
          offset={20}
        >
          <PopoverTrigger>
            <button className="text-left bg-otherColor text-bgColor py-1 px-3 rounded-full border-2 border-otherColor">
              Season {season.season_number}
            </button>
          </PopoverTrigger>
          <PopoverContent className="bg-btnColor">
            <div className="px-1 py-2 flex gap-1 flex-wrap">
              {Array.from(availableQualities).map((quality, qualityIndex) => (
                <Button
                  key={qualityIndex}
                  onClick={() =>
                    handleButtonClick(
                      `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${season.season_number}_${quality}`,
                      quality
                    )
                  }
                  size="sm"
                  className="bg-primaryBtn rounded-full"
                  isLoading={loading[quality]}
                  spinner={<Spinner />}
                >
                  {quality}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    });

  const getEpisodeQualityDetails = () => {
    if (episodeData?.telegram && episodeData.telegram.length > 0) {
      return episodeData.telegram;
    }
    const season = movieData.seasons?.find(s => String(s.season_number) === String(seasonNumber));
    if (!season) return [];
    const eps = season.episodes || [];
    // 1. Direct match
    let episode = eps.find(e => String(e.episode_number) === String(episodeNumber) || e.episode_number === parseInt(episodeNumber));
    // 2. Relative index fallback
    if (!episode && eps.length > 0) {
      const sortedEps = eps.slice().sort((a, b) => a.episode_number - b.episode_number);
      const epNum = parseInt(episodeNumber);
      if (!isNaN(epNum) && epNum >= 1 && epNum <= sortedEps.length) {
        episode = sortedEps[epNum - 1];
      }
    }
    return episode?.telegram || [];
  };

  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <button className="uppercase flex items-center justify-center gap-2 bg-otherColor w-full h-8 sm:h-9 text-bgColor text-[9px] rounded-full border-2 border-otherColor font-black tracking-wider transition-all">
          <PiTelegramLogo className="text-base" /> Telegram
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-btnColor">
        <div className="px-1 py-2 flex gap-1 flex-wrap flex-col">
          {movieData.media_type === "movie"
            ? renderQualityButtons(movieData.telegram || [])
            : (seasonNumber && episodeNumber)
              ? renderQualityButtons(getEpisodeQualityDetails())
              : renderSeasonButtons()}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TelegramButton;
