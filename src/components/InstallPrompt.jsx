import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { MdInstallMobile, MdInstallDesktop, MdOutlineInstallMobile } from "react-icons/md";
import { FaFirefoxBrowser, FaSafari, FaChrome } from "react-icons/fa";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ 
    isFirefox: false, 
    isSafari: false, 
    isChromium: false,
    isLinux: false 
  });

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detector logic
    const ua = navigator.userAgent;
    const isFirefox = ua.includes("Firefox");
    const isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    const isChromium = ua.includes("Chrome") || ua.includes("Edg") || ua.includes("OPR");
    const isLinux = ua.includes("Linux");
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(ua);

    setBrowserInfo({ isFirefox, isSafari, isChromium, isLinux });
    setIsMobile(isMobileDevice);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const lastDismissed = localStorage.getItem("installPromptDismissed");
      const clearToShow = !lastDismissed || (Date.now() - parseInt(lastDismissed)) > 24 * 60 * 60 * 1000;

      if (clearToShow) {
        setIsOpen(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Fallback for Firefox/Safari/iOS where beforeinstallprompt isn't supported
    if (!isChromium) {
      const lastDismissed = localStorage.getItem("installPromptDismissed");
      const clearToShow = !lastDismissed || (Date.now() - parseInt(lastDismissed)) > 24 * 60 * 60 * 1000;

      if (clearToShow) {
        // Show after a delay for non-chromium browsers
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsOpen(false);
      } else {
        localStorage.setItem("installPromptDismissed", Date.now().toString());
        setIsOpen(false);
      }
    } else {
      // For browsers without programmatic install, just close and mark as "seen"
      // Users usually read the instructions and do it manually
      localStorage.setItem("installPromptDismissed", Date.now().toString());
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("installPromptDismissed", Date.now().toString());
    setIsOpen(false);
  };

  const renderInstructions = () => {
    if (browserInfo.isFirefox) {
      if (isMobile) {
        return (
          <div className="text-left space-y-2 text-sm text-gray-400">
            <p>1. Tap the <span className="text-white font-bold">three dots menu</span> (⋮) in the bottom right.</p>
            <p>2. Select <span className="text-white font-bold">"Install"</span> or <span className="text-white font-bold">"Add to Home Screen"</span>.</p>
          </div>
        );
      } else if (browserInfo.isLinux) {
        return (
          <div className="text-left space-y-2 text-sm text-gray-400">
            <p>Firefox on Linux doesn't support one-click installation.</p>
            <p>For the best experience, we recommend using <span className="text-white font-bold">Chrome or Edge</span> to install "AnimeToon" as a desktop app.</p>
          </div>
        );
      }
    }

    if (browserInfo.isSafari && isMobile) {
      return (
        <div className="text-left space-y-2 text-sm text-gray-400">
          <p>1. Tap the <span className="text-white font-bold">Share icon</span> (square with arrow).</p>
          <p>2. Scroll down and select <span className="text-white font-bold">"Add to Home Screen"</span>.</p>
        </div>
      );
    }

    return (
      <p className="text-gray-400 font-medium">
        Install "AnimeToon" on your device for a smoother experience and easier access to movies and TV shows.
      </p>
    );
  };

  const renderIcon = () => {
    if (browserInfo.isFirefox) return <FaFirefoxBrowser className="text-4xl text-orange-500" />;
    if (browserInfo.isSafari) return <FaSafari className="text-4xl text-blue-400" />;
    return isMobile ? <MdInstallMobile className="text-4xl text-blue-500" /> : <MdInstallDesktop className="text-4xl text-blue-500" />;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      backdrop="blur" 
      size="sm"
      className="bg-[#121212] text-white border border-white/10"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
                {renderIcon()}
              </div>
              <h2 className="text-xl font-bold font-outfit uppercase tracking-wider">
                {deferredPrompt ? "Install App" : "Add to Home Screen"}
              </h2>
            </ModalHeader>
            <ModalBody className="text-center px-6 pb-6 pt-0">
              {renderInstructions()}
            </ModalBody>
            <ModalFooter className="flex flex-col gap-2 pb-8 px-6">
              {deferredPrompt ? (
                <Button 
                  color="primary" 
                  className="w-full font-bold h-12 text-md transition-all duration-300 transform active:scale-95 bg-blue-600" 
                  onClick={handleInstallClick}
                >
                  INSTALL NOW
                </Button>
              ) : (
                <Button 
                  color="primary" 
                  className="w-full font-bold h-12 text-md transition-all duration-300 transform active:scale-95 bg-blue-600" 
                  onClick={handleDismiss}
                >
                  GOT IT
                </Button>
              )}
              <Button 
                variant="light" 
                className="w-full font-semibold text-gray-500 hover:text-white" 
                onClick={handleDismiss}
              >
                Maybe Later
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default InstallPrompt;
