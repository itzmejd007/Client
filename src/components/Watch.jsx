import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdComponent from "./AdComponent";
import { VideoJS } from "./VideoJS";
import { requestStrictAdBlockCheck } from "./AdBlockDetector";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen) {
        requestStrictAdBlockCheck("stream this anime", async () => {
          try {
            let videoSources = [];
            let selectedPoster = "";

          if (props.popUpType === "movie") {
            const manualUrl = props.id.manual_stream_url;
            if (manualUrl) {
              videoSources = [{
                src: manualUrl,
                type: manualUrl.endsWith(".mp4") ? "video/mp4" : undefined,
                label: "Manual Stream"
              }];
            } else {
              videoSources = (props.id.telegram || []).map((q) => {
                const name = q.name.toLowerCase();
                const type = name.endsWith(".webm") ? "video/webm" : "video/mp4";

                return {
                  src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
                  type: type,
                  label: q.quality || `Quality`,
                };
              });
            }
            selectedPoster = props.id.backdrop;
          } else if (props.popUpType === "episode") {
            let episode = null;
            // 1. Direct check in props.episodes
            if (props.episodes && props.episodes.length > 0) {
              episode = props.episodes.find(
                (ep) => String(ep.episode_number) === String(props.episodeNumber) || ep.episode_number === parseInt(props.episodeNumber)
              );
              if (!episode) {
                const sortedEps = props.episodes.slice().sort((a, b) => a.episode_number - b.episode_number);
                const epNum = parseInt(props.episodeNumber);
                if (!isNaN(epNum) && epNum >= 1 && epNum <= sortedEps.length) {
                  episode = sortedEps[epNum - 1];
                }
              }
            }

            // 2. Fallback check in props.id.seasons
            if (!episode) {
              const season = (props.id.seasons || []).find(
                (season) => String(season.season_number) === String(props.seasonNumber)
              );

              if (season) {
                const eps = season.episodes || [];
                episode = eps.find(
                  (ep) => String(ep.episode_number) === String(props.episodeNumber) || ep.episode_number === parseInt(props.episodeNumber)
                );
                if (!episode && eps.length > 0) {
                  const sortedEps = eps.slice().sort((a, b) => a.episode_number - b.episode_number);
                  const epNum = parseInt(props.episodeNumber);
                  if (!isNaN(epNum) && epNum >= 1 && epNum <= sortedEps.length) {
                    episode = sortedEps[epNum - 1];
                  }
                }
              }
            }

            if (episode) {
              const manualUrl = episode.manual_stream_url;
              if (manualUrl) {
                videoSources = [{
                  src: manualUrl,
                  type: manualUrl.endsWith(".mp4") ? "video/mp4" : undefined,
                  label: "Manual Stream"
                }];
              } else {
                videoSources = (episode.telegram || []).map((q) => {
                  const name = q.name.toLowerCase();
                  const type = name.endsWith(".webm") ? "video/webm" : "video/mp4";

                  return {
                    src: `${BASE}/stream/${q.id}/${encodeURIComponent(q.name)}`,
                    type: type,
                    label: q.quality || `Quality`,
                  };
                });
              }
              selectedPoster = episode.episode_backdrop;
            }
          }


          setSources(videoSources);
          setPoster(selectedPoster);
          setIsModalOpen(true);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      });
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

  // Check if the source is an embed/iframe URL
  const isEmbedSource = sources.length === 1 && (
    sources[0].src.includes("embed") || 
    sources[0].src.includes("/e/") || 
    !sources[0].src.match(/\.(mp4|mkv|webm|m3u8|mpd)$/i)
  );

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
            className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg relative bg-black aspect-video"
          >
            {isEmbedSource ? (
              <iframe
                src={sources[0].src}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title="Manual Stream"
              />
            ) : (
              <VideoJS
                options={{
                  autoplay: false,
                  poster: poster,
                  sources: sources,
                }}
              />
            )}
            <AdComponent type="adPlayerBottom" className="mt-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
