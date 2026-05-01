import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import AdComponent from "./AdComponent";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = (props.id.telegram || []).map((q) => {
              const name = q.name.toLowerCase();
              const type = name.endsWith(".mp4") ? "video/mp4" : 
                           name.endsWith(".webm") ? "video/webm" : 
                           name.endsWith(".mkv") ? "video/webm" : // Some browsers handle MKV as webm/mp4
                           undefined; // Let browser guess

              return {
                src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
                type: type,
                size: parseInt(q.quality.replace("p", ""), 10),
              };
            });
            selectedPoster = props.id.backdrop;
          } else if (props.popUpType === "episode") {
            const season = (props.id.seasons || []).find(
              (season) => season.season_number === props.seasonNumber
            );

            if (season) {
              const episode = season.episodes.find(
                (ep) => ep.episode_number === props.episodeNumber
              );

              if (episode) {
                videoSources = (episode.telegram || []).map((q) => {
                  const name = q.name.toLowerCase();
                  const type = name.endsWith(".mp4") ? "video/mp4" : 
                               name.endsWith(".webm") ? "video/webm" : 
                               name.endsWith(".mkv") ? "video/webm" : 
                               undefined;

                  return {
                    src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
                    type: type,
                    size: parseInt(q.quality.replace("p", ""), 10),
                  };
                });
                selectedPoster = episode.episode_backdrop;
              }
            }
          }

          setSources(videoSources);
          setPoster(selectedPoster);
          setIsModalOpen(true);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    };

    fetchData();
  }, [
    props.isWatchMoviePopupOpen,
    props.isWatchEpisodePopupOpen,
    props.popUpType,
    props.id,
    props.seasonNumber,
    props.episodeNumber,
    BASE,
  ]);

  const closeModal = () => {
    setIsModalOpen(false);
    if (props.popUpType === "trailer") {
      props.setIsTrailerPopupOpen(false);
    } else if (props.popUpType === "movie") {
      props.setIsWatchMoviePopupOpen(false);
    } else {
      props.setIsWatchEpisodePopupOpen(false);
    }
  };

  const plyrProps = {
    source: {
      type: "video",
      sources: sources,
    },
    options: {
      poster: poster,
      settings: ["captions", "quality", "speed"],
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "fullscreen",
      ],
    },
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 w-full h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center"
        >
          <button
            onClick={closeModal}
            className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl z-[60] transition-all"
          >
            <AiOutlineClose />
          </button>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg relative bg-black"
          >
            <Plyr ref={playerRef} {...plyrProps} id="player" />
            <AdComponent type="adPlayerBottom" className="mt-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
