import React, { useState, useEffect, useCallback } from 'react';
import { 
  createPlayer, 
  usePlayer, 
  Container, 
  Tooltip,
  Popover,
  mediaProps
} from '@videojs/react';
import { videoFeatures, VideoSkin, Video } from '@videojs/react/video';
import '@videojs/react/video/skin.css';
import { MdSettings } from 'react-icons/md';

// Create the player instance outside to avoid re-creation
const Player = createPlayer({ features: videoFeatures });

// Quality Selector Component
const QualitySelector = ({ sources, currentSrc, onQualityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlsVisible = usePlayer((s) => s.controlsVisible);
  
  if (!sources || sources.length === 0) return null;

  return (
    <div 
      className={`media-button-quality absolute bottom-[12px] right-[190px] z-[999] transition-all duration-300 ${
        controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="relative">
        {/* Quality Menu */}
        <div className={`absolute bottom-full right-0 mb-4 p-2 min-w-[160px] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}>
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2 flex items-center justify-between border-b border-white/5 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Quality</span>
              <span className="text-[8px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold uppercase">HQ</span>
            </div>
            {sources.map((source, index) => (
              <button
                key={index}
                onClick={() => {
                  onQualityChange(source);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs text-left transition-all flex justify-between items-center group/item ${
                  currentSrc === source.src 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'hover:bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                   <span className="tracking-wide">{source.label || `Quality ${index + 1}`}</span>
                </div>
                {currentSrc === source.src ? (
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,140,0,1)]" />
                ) : (
                   <div className="w-1 h-1 rounded-full bg-white/10 group-hover/item:bg-white/30 transition-all" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Gear Button */}
        <button 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-[2.5rem] h-[2.5rem] rounded-full transition-all duration-300 border-2 ${
            isOpen ? 'bg-orange-500 border-orange-500 text-white scale-110 rotate-90 shadow-[0_0_20px_rgba(255,140,0,0.4)]' : 'bg-black/20 border-white/10 text-white/60 hover:text-white hover:border-white/30'
          }`}
        >
          <MdSettings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export const VideoJS = (props) => {
  const { options, onReady } = props;
  const [currentSource, setCurrentSource] = useState(options.sources?.[0] || {});
  const [error, setError] = useState(false);
  const videoRef = React.useRef(null);
  const switchingRef = React.useRef(false);

  useEffect(() => {
    if (options.sources?.length > 0) {
      const exists = options.sources.find(s => s.src === currentSource.src);
      if (!exists) {
        setCurrentSource(options.sources[0]);
      }
    }
  }, [options.sources, currentSource.src]);

  // Extreme PiP Hiding fail-safe
  useEffect(() => {
    const hidePip = () => {
      const selectors = [
        '[aria-label*="Picture"]', 
        '[title*="Picture"]', 
        '[aria-label*="PIP"]',
        '.vjs-picture-in-picture-control',
        '.vjs-pip-control',
        '.media-button-pip'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (el.style.display !== 'none') {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        });
      });
    };
    hidePip();
    const interval = setInterval(hidePip, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock onReady for compatibility
  useEffect(() => {
    if (onReady) {
      const playerShim = {
        on: (event, cb) => {},
        off: (event, cb) => {},
        dispose: () => {},
        src: (newSrc) => {
           if (typeof newSrc === 'string') setCurrentSource({ src: newSrc });
           else if (newSrc?.src) setCurrentSource(newSrc);
        },
        currentTime: (t) => videoRef.current ? videoRef.current.currentTime : 0,
        paused: () => videoRef.current ? videoRef.current.paused : true,
        play: () => videoRef.current && videoRef.current.play().catch(() => {}),
      };
      onReady(playerShim);
    }
  }, [onReady]);

  const handleQualityChange = useCallback((source) => {
    if (source.src === currentSource.src) return;

    const video = videoRef.current;
    if (video) {
      const currTime = video.currentTime;
      const wasPlaying = !video.paused;
      switchingRef.current = { time: currTime, playing: wasPlaying };
      // Force pause and clear src to prevent fetch abort errors
      video.pause();
    }

    setCurrentSource(source);
    setError(false);
  }, [currentSource.src]);

  // Handle seeking back after source change
  const handleLoadedMetadata = useCallback((e) => {
    if (switchingRef.current) {
      const { time, playing } = switchingRef.current;
      const video = e.target;
      
      // Use a slightly safer approach for setting time
      const seekAndPlay = () => {
        video.currentTime = time;
        if (playing) {
          video.play().catch(() => {});
        }
        switchingRef.current = false;
      };

      if (video.readyState >= 1) {
        seekAndPlay();
      } else {
        video.addEventListener('loadedmetadata', seekAndPlay, { once: true });
      }
    }
  }, []);

  return (
    <Player.Provider>
      <div className="w-full h-full relative bg-black group select-none">
        <VideoSkin 
          poster={options.poster}
          className="media-default-skin-custom"
        >
          <Video 
            key={currentSource.src} // Force remount on source change to stop fetch abort issues
            ref={videoRef}
            src={currentSource.src} 
            type={currentSource.type}
            autoPlay={options.autoplay}
            controls={false}
            crossOrigin="anonymous"
            disablePictureInPicture={true}
            className="w-full h-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              const err = e.target.error;
              // Ignore abort error (code 4)
              if (err && err.code !== 4) { 
                setError(true);
              }
            }}
          />
          

          <QualitySelector 
            sources={options.sources} 
            currentSrc={currentSource.src} 
            onQualityChange={handleQualityChange} 
          />
        </VideoSkin>

        {/* Custom Error Overlay with Audio Troubleshooting */}
        {error && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-10 text-center z-[100] backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
              <span className="text-red-500 text-4xl font-black">!</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Playback Error</h3>
            <p className="text-sm text-white/40 max-w-sm mb-4 leading-relaxed">
              This video format or audio codec might not be supported by your browser.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 max-w-xs">
              <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest mb-1">Audio Troubleshooting</p>
              <p className="text-[10px] text-white/50 italic">
                If you see video but hear no audio, the file likely uses AC3 or DTS which browsers do not support natively. Try using an external player.
              </p>
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={() => window.location.reload()}
                 className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all text-white"
               >
                 Retry
               </button>
               <a 
                 href={currentSource.src}
                 className="px-8 py-3 bg-white text-black rounded-2xl text-xs font-bold transition-all hover:bg-gray-200"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 External Player
               </a>
            </div>
          </div>
        )}

        <style>{`
          .media-default-skin-custom {
            --media-primary-color: #ff8c00; /* Use orange accent from v10 logo */
            --media-border-radius: 0px;
            --media-button-icon-size: 1.5rem;
          }
          
          /* Match the screenshot's progress bar look */
          .media-slider__fill {
            background: linear-gradient(90deg, #ff8c00, #ff4500) !important;
          }
          
          .media-slider__thumb {
            background: #fff !important;
            box-shadow: 0 0 10px rgba(255,140,0,0.5);
          }

          /* Hide default quality settings if any, but we added our own */
          
          /* Hide native PiP button with absolute extreme prejudice */
          body .video-js .vjs-picture-in-picture-control,
          body .vjs-picture-in-picture-control,
          body .vjs-pip-control,
          body .vjs-pip-button,
          body .media-pip-button,
          body .vjs-icon-picture-in-picture-enter,
          body .vjs-icon-picture-in-picture-exit,
          button[aria-label*="Picture"],
          button[title*="Picture"],
          button[aria-label*="PIP"],
          button[title*="PIP"],
          .media-button:has(svg path[d*="M19"]),
          .media-button:has(svg path[d*="M21"]),
          [class*="pip-button"],
          [class*="pip-toggle"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
            z-index: -999 !important;
          }
          
          /* Custom transitions for icons */
          .media-icon {
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .media-button:hover .media-icon {
            transform: scale(1.15);
          }
          
          /* Position the quality button carefully in the control bar */
          .media-button-quality {
            bottom: 12px;
            right: 190px; /* Move it well to the left of Volume/Fullscreen */
          }
          
          @media (max-width: 640px) {
            .media-button-quality {
              right: 180px;
              bottom: 8px;
            }
          }
        `}</style>
      </div>
    </Player.Provider>
  );
};

export default VideoJS;
