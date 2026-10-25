import React, { useState, useEffect, useCallback } from 'react';
import { createPlayer, usePlayer } from '@videojs/react';
import { videoFeatures, VideoSkin, Video } from '@videojs/react/video';
import '@videojs/react/video/skin.css';
import { MdSettings } from 'react-icons/md';

// Create a single player instance (must be outside component)
const Player = createPlayer({ features: videoFeatures });

// ─── Quality Selector (lives inside Player.Provider context) ───
const QualitySelector = ({ sources, currentSrc, onQualityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlsVisible = usePlayer((s) => s.controlsVisible);

  // Hide menu when controls hide
  useEffect(() => {
    if (!controlsVisible) setIsOpen(false);
  }, [controlsVisible]);

  if (!sources || sources.length <= 1) return null;

  return (
    <div
      className={`vjsx-quality ${controlsVisible ? 'vjsx-quality--visible' : ''}`}
    >
      {/* Dropdown menu */}
      <div className={`vjsx-quality-menu ${isOpen ? 'vjsx-quality-menu--open' : ''}`}>
        <div className="vjsx-quality-header">Quality</div>
        {sources.map((source, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              onQualityChange(source);
              setIsOpen(false);
            }}
            className={`vjsx-quality-item ${
              currentSrc === source.src ? 'vjsx-quality-item--active' : ''
            }`}
          >
            <span>{source.label || `Quality ${i + 1}`}</span>
            {currentSrc === source.src && <span className="vjsx-quality-dot" />}
          </button>
        ))}
      </div>

      {/* Gear trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`vjsx-quality-btn ${isOpen ? 'vjsx-quality-btn--active' : ''}`}
        aria-label="Quality"
      >
        <MdSettings />
      </button>
    </div>
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
            onError={(e) => {
              setError(true);
            }}
          />
          
          {/* Quality selector — moved inside VideoSkin so it's visible in fullscreen */}
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
             Theme — orange accent
             ═══════════════════════════════════════ */
          .vjsx-skin {
            --media-primary-color: #ff8c00;
            --media-border-radius: 0;
          }
          .vjsx-skin .media-slider__fill {
            background: linear-gradient(90deg, #ff8c00, #ff4500) !important;
          }
          .vjsx-skin .media-slider__thumb {
            background: #fff !important;
            box-shadow: 0 0 8px rgba(255, 140, 0, 0.5);
          }

          /* ═══════════════════════════════════════
             Hide PiP, Cast & Mute buttons (CSS only, no JS polling)
             ═══════════════════════════════════════ */
          .vjsx-skin .media-button--pip,
          .vjsx-skin .media-button--cast,
          .vjsx-skin .media-button--mute {
            display: none !important;
          }

          /* ═══════════════════════════════════════
             Quality Selector — responsive for all viewports
             ═══════════════════════════════════════ */
          .vjsx-quality {
            position: absolute;
            z-index: 50;
            /* Mobile default: above the wrapped 2-row control bar */
            bottom: 6rem;
            right: 1rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity 200ms ease;
          }
          .vjsx-quality--visible {
            opacity: 1;
            pointer-events: auto;
          }

          /* Desktop: single-row control bar, sit safely above it */
          @media (min-width: 672px) {
            .vjsx-quality {
              bottom: 4rem;
              right: 1.5rem;
            }
          }

          /* Fullscreen: adjust for full viewport */
          :fullscreen .vjsx-quality,
          :-webkit-full-screen .vjsx-quality {
            bottom: 6.5rem;
            right: 1.5rem;
          }
          @media (min-width: 672px) {
            :fullscreen .vjsx-quality,
            :-webkit-full-screen .vjsx-quality {
              bottom: 4.5rem;
              right: 2rem;
            }
          }

          .vjsx-quality-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 200ms;
            font-size: 26px !important;
          }
          .vjsx-quality-btn:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }
          .vjsx-quality-btn--active {
            color: #ff8c00 !important;
            transform: rotate(90deg);
          }

          .vjsx-quality-menu {
            position: absolute;
            bottom: calc(100% + 0.5rem);
            right: 0;
            min-width: 140px;
            max-width: calc(100vw - 2rem);
            padding: 0.375rem;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(16px) saturate(1.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 0.875rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            opacity: 0;
            scale: 0.85;
            pointer-events: none;
            transform-origin: bottom right;
            transition: opacity 150ms, scale 150ms;
          }
          .vjsx-quality-menu--open {
            opacity: 1;
            scale: 1;
            pointer-events: auto;
          }

          /* On small screens, flip menu to open left if near right edge */
          @media (max-width: 400px) {
            .vjsx-quality-menu {
              right: auto;
              left: 0;
              transform-origin: bottom left;
            }
          }

          .vjsx-quality-header {
            padding: 6px 10px 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(255, 255, 255, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .vjsx-quality-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 10px 12px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            cursor: pointer;
            transition: all 120ms;
          }
          .vjsx-quality-item:hover {
            background: rgba(255, 255, 255, 0.06);
            color: #fff;
          }
          .vjsx-quality-item--active {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            font-weight: 600;
          }

          .vjsx-quality-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #ff8c00;
            box-shadow: 0 0 6px rgba(255, 140, 0, 0.7);
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
            background: rgba(255, 140, 0, 0.05);
            border: 1px solid rgba(255, 140, 0, 0.1);
            border-radius: 0.75rem;
            padding: 0.5rem 0.75rem;
            margin-bottom: 1rem;
            max-width: 16rem;
            line-height: 1.5;
          }
          .vjsx-error-hint strong {
            color: #ff8c00;
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
