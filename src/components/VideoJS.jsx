import React, { useState, useEffect, useCallback } from 'react';
import { createPlayer, usePlayer } from '@videojs/react';
import { videoFeatures, VideoSkin, Video } from '@videojs/react/video';
import '@videojs/react/video/skin.css';
import { MdSettings, MdCheck } from 'react-icons/md';
import { FiX } from 'react-icons/fi';

// Create a single player instance (must be outside component)
const Player = createPlayer({ features: videoFeatures });

// ─── Quality Selector (lives inside Player.Provider context) ───
const QualitySelector = ({ sources, currentSrc, onQualityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlsVisible = usePlayer((s) => s.controlsVisible);

  if (!sources || sources.length <= 1) return null;

  return (
    <>
      {/* Gear Trigger Button — cleanly positioned inside player controls */}
      <div
        className={`vjsx-quality-trigger ${controlsVisible || isOpen ? 'vjsx-quality-trigger--visible' : ''}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className={`vjsx-quality-btn ${isOpen ? 'vjsx-quality-btn--active' : ''}`}
          aria-label="Video Quality Settings"
          title="Change Quality"
        >
          <MdSettings />
        </button>
      </div>

      {/* Responsive In-Player Quality Sheet / Modal (Works in non-fullscreen vertical mode & fullscreen) */}
      {isOpen && (
        <div
          className="vjsx-quality-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="vjsx-quality-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="vjsx-quality-header">
              <div className="flex items-center gap-1.5">
                <MdSettings className="text-pink-500 text-sm" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Video Quality
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="vjsx-quality-close-btn"
                aria-label="Close"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Quality Options List */}
            <div className="vjsx-quality-list">
              {sources.map((source, i) => {
                const isActive = currentSrc === source.src;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onQualityChange(source);
                      setIsOpen(false);
                    }}
                    className={`vjsx-quality-option ${isActive ? 'vjsx-quality-option--active' : ''}`}
                  >
                    <span className="font-semibold text-xs tracking-wide">
                      {source.label || `Quality ${i + 1}`}
                    </span>
                    {isActive ? (
                      <span className="vjsx-quality-active-badge">
                        <MdCheck size={14} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Main VideoJS Component ───
export const VideoJS = ({ options, onReady, onEnded }) => {
  const [currentSource, setCurrentSource] = useState(options.sources?.[0] || {});
  const [error, setError] = useState(false);
  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const switchingRef = React.useRef(false);

  // ── Landscape lock on fullscreen (mobile Chrome) ──
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const orientation = screen?.orientation;
      if (!orientation) return;

      try {
        if (isFullscreen) {
          await orientation.lock('landscape');
        } else {
          orientation.unlock();
        }
      } catch {
        // Orientation lock not supported or not allowed — ignore silently
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync when sources change externally
  useEffect(() => {
    if (options.sources?.length > 0) {
      const exists = options.sources.find((s) => s.src === currentSource.src);
      if (!exists) setCurrentSource(options.sources[0]);
    }
  }, [options.sources, currentSource.src]);

  // Compatibility shim
  useEffect(() => {
    if (onReady) {
      onReady({
        on: () => {},
        off: () => {},
        dispose: () => {},
        src: (s) => setCurrentSource(typeof s === 'string' ? { src: s } : s),
        currentTime: () => videoRef.current?.currentTime || 0,
        paused: () => videoRef.current?.paused ?? true,
        play: () => videoRef.current?.play().catch(() => {}),
      });
    }
  }, [onReady]);

  const handleQualityChange = useCallback(
    (source) => {
      if (source.src === currentSource.src) return;
      const video = videoRef.current;
      if (video) {
        switchingRef.current = { time: video.currentTime, playing: !video.paused };
        video.pause();
      }
      setCurrentSource(source);
      setError(false);
    },
    [currentSource.src]
  );

  const handleLoadedMetadata = useCallback((e) => {
    if (switchingRef.current) {
      const { time, playing } = switchingRef.current;
      e.target.currentTime = time;
      if (playing) e.target.play().catch(() => {});
      switchingRef.current = false;
    }
  }, []);

  return (
    <Player.Provider>
      <div className="vjsx-root" ref={containerRef}>
        {/* VideoSkin provides the full control bar with all icons, tooltips, 
            hotkeys, gestures, buffering indicator, error dialog, and overlay */}
        <VideoSkin poster={options.poster} className="vjsx-skin">
          <Video
            key={currentSource.src}
            ref={videoRef}
            src={currentSource.src}
            type={currentSource.type}
            autoPlay={options.autoplay}
            preload="auto"
            controls={false}
            crossOrigin="anonymous"
            disablePictureInPicture
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={(e) => {
              if (options?.onEnded) options.onEnded(e);
              if (onEnded) onEnded(e);
            }}
            onError={() => {
              setError(true);
            }}
          />
          
          {/* Quality selector — responsive in both non-fullscreen vertical mode and fullscreen */}
          <QualitySelector
            sources={options.sources}
            currentSrc={currentSource.src}
            onQualityChange={handleQualityChange}
          />
        </VideoSkin>

        {/* Custom codec-aware error overlay */}
        {error && (
          <div className="vjsx-error">
            <div className="vjsx-error-badge">!</div>
            <h3 className="vjsx-error-title">Playback Error</h3>
            <p className="vjsx-error-desc">
              This video format may not be supported by your browser.
            </p>
            <div className="vjsx-error-hint">
              <strong>Audio issue?</strong> Files with AC3/DTS audio won't play
              in browsers. Use an external player instead.
            </div>
            <div className="vjsx-error-actions">
              <button onClick={() => window.location.reload()} className="vjsx-btn vjsx-btn--ghost">
                Retry
              </button>
              <a href={currentSource.src} className="vjsx-btn vjsx-btn--solid" target="_blank" rel="noopener noreferrer">
                External Player
              </a>
            </div>
          </div>
        )}

        <style>{`
          /* ═══════════════════════════════════════
             Root
             ═══════════════════════════════════════ */
          .vjsx-root {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
          }

          /* ═══════════════════════════════════════
             Theme — pink accent
             ═══════════════════════════════════════ */
          .vjsx-skin {
            --media-primary-color: #ff2a85;
            --media-border-radius: 0;
          }
          .vjsx-skin .media-slider__fill {
            background: linear-gradient(90deg, #ff2a85, #ec4899) !important;
          }
          .vjsx-skin .media-slider__thumb {
            background: #fff !important;
            box-shadow: 0 0 8px rgba(255, 42, 133, 0.8);
          }

          /* ═══════════════════════════════════════
             Hide PiP, Cast & Mute buttons
             ═══════════════════════════════════════ */
          .vjsx-skin .media-button--pip,
          .vjsx-skin .media-button--cast,
          .vjsx-skin .media-button--mute {
            display: none !important;
          }

          /* ═══════════════════════════════════════
             Quality Trigger Button
             Positioned in player controls area
             ═══════════════════════════════════════ */
          .vjsx-quality-trigger {
            position: absolute;
            z-index: 50;
            bottom: 3.25rem;
            right: 0.75rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity 200ms ease;
          }
          .vjsx-quality-trigger--visible {
            opacity: 1;
            pointer-events: auto;
          }

          @media (min-width: 672px) {
            .vjsx-quality-trigger {
              bottom: 3.5rem;
              right: 1.25rem;
            }
          }

          :fullscreen .vjsx-quality-trigger,
          :-webkit-full-screen .vjsx-quality-trigger {
            bottom: 4.5rem;
            right: 1.5rem;
          }

          .vjsx-quality-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            color: rgba(255, 255, 255, 0.9);
            cursor: pointer;
            transition: all 200ms;
            font-size: 20px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          }
          .vjsx-quality-btn:hover {
            color: #fff;
            border-color: rgba(255, 42, 133, 0.8);
            background: rgba(255, 42, 133, 0.2);
            transform: scale(1.05);
          }
          .vjsx-quality-btn--active {
            color: #ff2a85 !important;
            border-color: #ff2a85 !important;
            background: rgba(255, 42, 133, 0.25) !important;
            transform: rotate(90deg);
          }

          /* ═══════════════════════════════════════
             Quality Selection Modal / Overlay
             Fixes vertical non-fullscreen clipping!
             ═══════════════════════════════════════ */
          .vjsx-quality-overlay {
            position: absolute;
            inset: 0;
            z-index: 100;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            pointer-events: auto;
            animation: vjsxFadeIn 150ms ease-out;
          }

          @keyframes vjsxFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .vjsx-quality-modal {
            width: 100%;
            max-width: 240px;
            max-height: calc(100% - 16px);
            display: flex;
            flex-direction: column;
            background: rgba(13, 14, 22, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 8px 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 42, 133, 0.25);
            overflow: hidden;
            animation: vjsxScaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes vjsxScaleIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }

          .vjsx-quality-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 6px 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 4px;
            flex-shrink: 0;
          }

          .vjsx-quality-close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            transition: all 120ms;
          }
          .vjsx-quality-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
          }

          .vjsx-quality-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
            max-height: 180px;
            padding-right: 2px;
          }

          .vjsx-quality-list::-webkit-scrollbar {
            width: 3px;
          }
          .vjsx-quality-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .vjsx-quality-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 7px 10px;
            border: 1px solid transparent;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.85);
            cursor: pointer;
            transition: all 120ms;
            text-align: left;
          }
          .vjsx-quality-option:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.1);
          }
          .vjsx-quality-option--active {
            background: rgba(255, 42, 133, 0.18) !important;
            border-color: rgba(255, 42, 133, 0.5) !important;
            color: #ff2a85 !important;
            font-weight: 700;
          }

          .vjsx-quality-active-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff2a85;
          }

          /* ═══════════════════════════════════════
             Error Overlay
             ═══════════════════════════════════════ */
          .vjsx-error {
            position: absolute;
            inset: 0;
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            text-align: center;
            background: rgba(0, 0, 0, 0.96);
            backdrop-filter: blur(12px);
          }
          .vjsx-error-badge {
            width: 3rem;
            height: 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #ef4444;
            font-size: 1.25rem;
            font-weight: 900;
            margin-bottom: 0.75rem;
          }
          .vjsx-error-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 0.25rem;
          }
          .vjsx-error-desc {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.4);
            margin: 0 0 0.75rem;
          }
          .vjsx-error-hint {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.35);
            background: rgba(255, 42, 133, 0.05);
            border: 1px solid rgba(255, 42, 133, 0.15);
            border-radius: 0.75rem;
            padding: 0.5rem 0.75rem;
            margin-bottom: 1rem;
            max-width: 16rem;
            line-height: 1.5;
          }
          .vjsx-error-hint strong {
            color: #ff2a85;
          }
          .vjsx-error-actions {
            display: flex;
            gap: 0.5rem;
          }
          .vjsx-btn {
            padding: 0.5rem 1.25rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 150ms;
            text-decoration: none;
            border: none;
          }
          .vjsx-btn--ghost {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .vjsx-btn--ghost:hover { background: rgba(255, 255, 255, 0.1); }
          .vjsx-btn--solid {
            background: #fff;
            color: #000;
          }
          .vjsx-btn--solid:hover { background: #e5e5e5; }
        `}</style>
      </div>
    </Player.Provider>
  );
};

export default VideoJS;
