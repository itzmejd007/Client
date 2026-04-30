import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { FaCloudDownloadAlt, FaPlay } from "react-icons/fa";
import Spinner from "./svg/Spinner";
import { useSettings } from "../context/SettingsContext";

const DownloadButton = ({ movieData, btnType }) => {
  const { settings } = useSettings();
  const BASE = import.meta.env.VITE_BASE_URL;
  const API_URL = settings.shortenerApiUrl || import.meta.env.VITE_API_URL;
  const API_KEY = settings.shortenerApiKey || import.meta.env.VITE_API_KEY;

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (selectedSeason) {
      const season = movieData.seasons.find(
        (s) => s.season_number === parseInt(selectedSeason)
      );
      if (season) {
        setEpisodes(season.episodes);
        setSelectedEpisode("");
        setQualities([]);
      }
    }
  }, [selectedSeason, movieData.seasons]);

  useEffect(() => {
    if (selectedEpisode) {
      const episode = episodes.find(
        (e) => e.episode_number === parseInt(selectedEpisode)
      );
      if (episode) {
        setQualities(episode.telegram);
        setSelectedQuality("");
      }
    }
  }, [selectedEpisode, episodes]);

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
    setLoading((prev) => ({ ...prev, [quality]: true }));
    const rawUrl = generateUrl(id, name);
    const shortUrl = await shortenUrl(rawUrl);
    setLoading((prev) => ({ ...prev, [quality]: false }));
    window.open(shortUrl, "_blank", "noopener noreferrer");
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
        {q.quality} {q.size ? `| ${q.size}` : ""}
      </Button>
    ));

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
          const [value] = keys;
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
          const value = Array.from(keys)[0];
          setSelectedEpisode(value);
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
          const value = Array.from(keys)[0];
          setSelectedQuality(value);
        }}
        classNames={{
          trigger: "bg-btnColor border-otherColor text-primaryTextColor",
          value: "text-primaryTextColor",
          innerWrapper: "text-primaryTextColor",
          selectorIcon: "text-primaryTextColor",
        }}
      >
        {qualities?.map((q) => (
          <SelectItem key={String(q.quality)} textValue={`${q.quality} ${q.size ? `| ${q.size}` : ""}`}>
            {q.quality} {q.size ? `| ${q.size}` : ""}
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
      <PopoverContent className="bg-btnColor">
        {movieData.media_type === "movie"
          ? <div className="px-1 py-2 flex gap-1 flex-wrap">{renderMovieButtons()}</div>
          : renderShowSelectors()}
      </PopoverContent>
    </Popover>
  );
};

export default DownloadButton;