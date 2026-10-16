import React, { useEffect, useState } from 'react';

const GlobalAd = ({ placement = 'header' }) => {
    const [adHtml, setAdHtml] = useState(null);

    useEffect(() => {
        // 1. Check if Ads are globally enabled
        const showAds = localStorage.getItem("showAds") === "true";
        if (!showAds) {
            setAdHtml(null);
            return;
        }

        // 2. Fetch the specific ad placement code
        let adCode = "";
        switch (placement) {
            case 'header':
                adCode = localStorage.getItem("adHeader");
                break;
            case 'footer':
                adCode = localStorage.getItem("adFooter");
                break;
            case 'sidebar':
                adCode = localStorage.getItem("adSidebar");
                break;
            case 'popup':
                adCode = localStorage.getItem("adPopup");
                break;
            case 'banner':
                adCode = localStorage.getItem("adBanner");
                break;
            case 'inFeed':
                adCode = localStorage.getItem("adInFeed");
                break;
            case 'playerBottom':
                adCode = localStorage.getItem("adPlayerBottom");
                break;
            case 'top':
                adCode = localStorage.getItem("adTop");
                break;
            default:
                adCode = null;
        }

        // Filter out popunder/redirect scripts on regular pages
        const isContentDelivery = typeof window !== 'undefined' && window.location.pathname.startsWith('/content-delivery');
        if (!isContentDelivery && adCode && (adCode.includes('effectivegatecpm') || adCode.includes('profitablecpmrate') || adCode.includes('73396f53e4d0e2635a379ba01777a0aa') || placement === 'popup' || placement === 'header')) {
            adCode = "";
        }

        if (adCode) {
            setAdHtml(adCode);
        } else {
            setAdHtml(null);
        }

        // Function to handle dynamic ad updates without full reload
        const handleAdUpdate = () => {
            const updatedShowAds = localStorage.getItem("showAds") === "true";
            if (!updatedShowAds) {
                setAdHtml(null);
                return;
            }

            let updatedAdCode = "";
            switch (placement) {
                case 'header':
                    updatedAdCode = localStorage.getItem("adHeader");
                    break;
                case 'footer':
                    updatedAdCode = localStorage.getItem("adFooter");
                    break;
                case 'sidebar':
                    updatedAdCode = localStorage.getItem("adSidebar");
                    break;
                case 'popup':
                    updatedAdCode = localStorage.getItem("adPopup");
                    break;
                case 'banner':
                    updatedAdCode = localStorage.getItem("adBanner");
                    break;
                case 'inFeed':
                    updatedAdCode = localStorage.getItem("adInFeed");
                    break;
                case 'playerBottom':
                    updatedAdCode = localStorage.getItem("adPlayerBottom");
                    break;
                case 'top':
                    updatedAdCode = localStorage.getItem("adTop");
                    break;
                default:
                    updatedAdCode = null;
            }
            setAdHtml(updatedAdCode || null);
        };

        // Listen for custom event triggered by Admin Panel save
        window.addEventListener("adsConfigChanged", handleAdUpdate);
        return () => window.removeEventListener("adsConfigChanged", handleAdUpdate);

    }, [placement]);

    // If no ad HTML is set or ads are disabled, render nothing
    if (!adHtml) return null;

    return (
        <div
            className={`ad-container ad-${placement} w-full flex justify-center items-center my-4 overflow-hidden`}
            dangerouslySetInnerHTML={{ __html: adHtml }}
        />
    );
};

export default GlobalAd;
