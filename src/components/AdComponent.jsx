import React, { useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import { canTriggerRedirectAd, recordRedirectAd } from "../utils/adManager";

/**
 * Safely parses and injects HTML + executable scripts into a target container.
 * Browser prevents execution of script tags injected via innerHTML,
 * so we must explicitly recreate each script tag element.
 */
const injectNodesAndScripts = (targetContainer, htmlCode) => {
    if (!targetContainer || !htmlCode) return;

    // Use a parser div to separate scripts from DOM elements (divs, banners, iframes)
    const parser = document.createElement("div");
    parser.innerHTML = htmlCode;

    // Separate script tags
    const scripts = Array.from(parser.querySelectorAll("script"));
    scripts.forEach((s) => s.parentNode && s.parentNode.removeChild(s));

    // Append non-script HTML first (like container divs for native ads)
    if (parser.innerHTML.trim()) {
        targetContainer.innerHTML = parser.innerHTML;
    }

    // Re-create and append executable scripts in order
    scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
            newScript.text = oldScript.innerHTML;
        }
        targetContainer.appendChild(newScript);
    });
};

const AdComponent = ({ type, className = "" }) => {
    const { settings } = useSettings();
    const containerRef = useRef(null);

    const adCode = settings?.[type];
    const showAds = settings?.showAds !== false; // Active if enabled

    const isOverlay = ["adPopup", "adSocialBar", "adSmartlink"].includes(type);
    const isRedirectAd = ["adPopup", "adSmartlink"].includes(type);
    const isContentDelivery = typeof window !== "undefined" && window.location.pathname.startsWith("/content-delivery");

    useEffect(() => {
        if (!showAds || !adCode) return;

        // Overlay / Popunder / Redirect scripts MUST ONLY run on /content-delivery
        if (isOverlay) {
            if (!isContentDelivery) {
                return; // Absolutely prohibited on normal browsing pages
            }

            // Frequency Cap Check: Limit intrusive redirect/popunder ads to 2-3 times per user
            if (isRedirectAd && !canTriggerRedirectAd()) {
                return;
            }

            if (isRedirectAd) {
                recordRedirectAd();
            }

            const overlayContainer = document.createElement("div");
            overlayContainer.id = `ad-overlay-${type}`;
            overlayContainer.style.cssText = "position: absolute; width: 0; height: 0; overflow: hidden; opacity: 0; pointer-events: none;";
            document.body.appendChild(overlayContainer);

            injectNodesAndScripts(overlayContainer, adCode);

            return () => {
                if (overlayContainer && overlayContainer.parentNode) {
                    overlayContainer.parentNode.removeChild(overlayContainer);
                }
            };
        }

        // 2. For Inline Banners / Native In-Feed Ads:
        if (!containerRef.current) return;
        const container = containerRef.current;
        container.innerHTML = "";

        const timer = setTimeout(() => {
            try {
                injectNodesAndScripts(container, adCode);
            } catch (error) {
                console.error(`Ad injection failed for ${type}:`, error);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (container) container.innerHTML = "";
        };
    }, [adCode, showAds, type, isOverlay]);

    if (!showAds || !adCode || isOverlay) return null;

    return (
        <div 
            ref={containerRef} 
            className={`ad-container flex justify-center items-center overflow-hidden my-4 ${className}`}
            id={`ad-${type}`}
        />
    );
};

export default AdComponent;
