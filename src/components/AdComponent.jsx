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

// Helper: Check if code is an aggressive direct-redirect/popunder script wrongly placed in a display banner slot
const isRogueRedirectScript = (code) => {
    if (!code) return false;
    const lower = code.toLowerCase();
    const hasRedirectDomain = lower.includes("profitablecpmrate") || lower.includes("effectivegatecpm") || lower.includes("alwingulla.com");
    const hasBannerDeclaration = lower.includes("atoptions") || lower.includes("<ins") || lower.includes("<iframe") || lower.includes("google_ad");
    // If it points to an auto-redirect network and has NO banner format declaration, it is a rogue redirect
    return hasRedirectDomain && !hasBannerDeclaration;
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

            // Frequency Cap Check: Limit intrusive redirect/popunder ads
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

        // Guard against rogue redirect scripts in display slots
        if (isRogueRedirectScript(adCode)) {
            console.warn(`[AdComponent] Suppressed rogue auto-redirect script from display slot: ${type}`);
            return;
        }

        const timer = setTimeout(() => {
            try {
                // If the ad contains an iframe or script, isolate inside a sandboxed iframe to prevent top-frame hijacking
                // sandbox="allow-scripts allow-same-origin allow-popups allow-forms" strictly blocks parent window navigation!
                const isScriptOrBanner = adCode.includes("<script") || adCode.includes("atOptions") || adCode.includes("<iframe");
                
                if (isScriptOrBanner) {
                    const iframe = document.createElement("iframe");
                    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
                    iframe.setAttribute("scrolling", "no");
                    iframe.setAttribute("frameborder", "0");
                    iframe.className = "w-full max-w-[728px] mx-auto border-0 overflow-hidden";
                    iframe.style.cssText = "display: block; border: none; overflow: hidden; min-height: 90px; width: 100%; max-width: 100%; background: transparent;";

                    // Calculate reasonable dimensions based on atOptions or slot
                    let bannerHeight = 90;
                    if (adCode.includes("'height'") || adCode.includes('"height"')) {
                        const hMatch = adCode.match(/['"]height['"]\s*:\s*(\d+)/i);
                        if (hMatch && hMatch[1]) bannerHeight = parseInt(hMatch[1], 10);
                    } else if (type === "adSidebar" || type === "adInFeed") {
                        bannerHeight = 250;
                    }
                    iframe.style.height = `${bannerHeight}px`;

                    container.appendChild(iframe);

                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                        doc.open();
                        doc.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <base target="_blank">
                                <style>
                                    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; display: flex; justify-content: center; align-items: center; }
                                    iframe { max-width: 100% !important; border: none !important; }
                                </style>
                            </head>
                            <body>
                                ${adCode}
                            </body>
                            </html>
                        `);
                        doc.close();
                    }
                } else {
                    injectNodesAndScripts(container, adCode);
                }
            } catch (error) {
                console.error(`Ad injection failed for ${type}:`, error);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (container) container.innerHTML = "";
        };
    }, [adCode, showAds, type, isOverlay]);

    if (!showAds || !adCode || isOverlay || isRogueRedirectScript(adCode)) return null;

    return (
        <div 
            ref={containerRef} 
            className={`ad-container flex justify-center items-center overflow-hidden my-4 ${className}`}
            id={`ad-${type}`}
        />
    );
};

export default AdComponent;
