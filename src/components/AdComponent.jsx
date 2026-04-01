import React, { useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";

const AdComponent = ({ type, className = "" }) => {
    const { settings } = useSettings();
    const containerRef = useRef(null);

    // Get the specific ad code from settings
    const adCode = settings[type];
    const showAds = settings.showAds;

    const isOverlay = ["adPopup", "adSocialBar", "adSmartlink", "adFooter"].includes(type);
    
    useEffect(() => {
        if (!showAds || !adCode || !containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = "";

        try {
            const range = document.createRange();
            range.selectNode(container);
            const documentFragment = range.createContextualFragment(adCode);
            container.appendChild(documentFragment);
        } catch (error) {
            console.error("Ad injection failed:", error);
        }

        return () => {
            if (container) container.innerHTML = "";
        };
    }, [adCode, showAds]);

    if (!showAds || !adCode) return null;

    // For overlay/script-only ads, we use a hidden container to prevent layout shifts or raw text rendering
    const containerClasses = isOverlay 
        ? "hidden h-0 w-0 overflow-hidden" 
        : `ad-container flex justify-center items-center overflow-hidden my-4 ${className}`;

    return (
        <div 
            ref={containerRef} 
            className={containerClasses}
            id={`ad-${type}`}
        />
    );
};

export default AdComponent;
