import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteName: localStorage.getItem("siteName") || import.meta.env.VITE_SITENAME || "MovieStream",
        telegramUrl: localStorage.getItem("telegramUrl") || import.meta.env.VITE_TG_URL || "",
        buttonColor: localStorage.getItem("buttonColor") || "#805ad5",
        buttonHoverColor: localStorage.getItem("buttonHoverColor") || "#6b46c1",
        defaultTheme: localStorage.getItem("defaultTheme") || "dark",
        structuralTheme: localStorage.getItem("structuralTheme") || "theme-default",
        showThemeToggle: localStorage.getItem("showThemeToggle") !== "false",
        showAds: localStorage.getItem("showAds") === "true",
        tgUsername: localStorage.getItem("tgUsername") || import.meta.env.VITE_TG_USERNAME || "",
        showViews: localStorage.getItem("showViews") !== "false",
        shortenerApiUrl: localStorage.getItem("shortenerApiUrl") || import.meta.env.VITE_API_URL || "",
        shortenerApiKey: localStorage.getItem("shortenerApiKey") || import.meta.env.VITE_API_KEY || "",
        // Ad scripts
        adFooter: localStorage.getItem("adFooter") || "",
        adSidebar: localStorage.getItem("adSidebar") || "",
        adPopup: localStorage.getItem("adPopup") || "",
        adBanner: localStorage.getItem("adBanner") || "",
        adInFeed: localStorage.getItem("adInFeed") || "",
        adPlayerBottom: localStorage.getItem("adPlayerBottom") || "",
        adHomeTrending: localStorage.getItem("adHomeTrending") || "",
        adHomeLatest: localStorage.getItem("adHomeLatest") || "",
        adSocialBar: localStorage.getItem("adSocialBar") || "",
        adSmartlink: localStorage.getItem("adSmartlink") || "",
        language_priority: localStorage.getItem("language_priority") ? localStorage.getItem("language_priority").split(",") : [],
    });

    const BASE = import.meta.env.VITE_BASE_URL;

    const applyStyles = useCallback((data) => {
        if (data.buttonColor) document.documentElement.style.setProperty('--color-primary', data.buttonColor);
        if (data.buttonHoverColor) document.documentElement.style.setProperty('--color-primary-hover', data.buttonHoverColor);

        // Structure themes
        const structureClasses = [
            'theme-glassmorphism', 'theme-neubrutalism', 'theme-aurora',
            'theme-neumorphism', 'theme-retro-web', 'theme-cyberpunk',
            'theme-material', 'theme-ios-soft', 'theme-brutalist-flat'
        ];
        document.documentElement.classList.remove(...structureClasses);
        if (data.structuralTheme && data.structuralTheme !== "theme-default") {
            document.documentElement.classList.add(data.structuralTheme);
        }

        // Default Theme (Light/Dark)
        if (data.defaultTheme === 'dark' && !localStorage.getItem("theme")) {
            document.documentElement.classList.add('dark');
        } else if (data.defaultTheme === 'light' && !localStorage.getItem("theme")) {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE}/api/settings`);
            const data = res.data;
            if (data) {
                setSettings(prev => {
                    const newSettings = { ...prev, ...data };
                    // Sync to localStorage
                    Object.entries(newSettings).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            localStorage.setItem(key, value.toString());
                        }
                    });
                    return newSettings;
                });
                applyStyles(data);
            }
        } catch (error) {
            console.warn("Failed to fetch settings from backend, using local cache.", error);
        }
    }, [BASE, applyStyles]);

    useEffect(() => {
        // Initial style application
        applyStyles(settings);
        fetchSettings();
    }, [fetchSettings, applyStyles]);

    useEffect(() => {
        // Dynamic Title Update
        if (settings.siteName) {
            // document.title = settings.siteName; // We could do this, but SEO component handles it too.
            // However, for parts without SEO component or initial load:
            if (!document.title.includes(settings.siteName)) {
                // Optionally update if needed
            }
        }
    }, [settings.siteName]);

    const updateSettings = async (newSettings, persistToBackend = false) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            Object.entries(newSettings).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    localStorage.setItem(key, value.toString());
                }
            });
            applyStyles(updated);
            return updated;
        });

        if (persistToBackend) {
            try {
                await axios.post(`${BASE}/api/settings`, newSettings);
            } catch (error) {
                console.error("Failed to persist settings to backend:", error);
                throw error;
            }
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
