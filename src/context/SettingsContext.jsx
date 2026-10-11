import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
        logoTextFont: localStorage.getItem("logoTextFont") || "",
        logoCustomFontUrl: localStorage.getItem("logoCustomFontUrl") || "",
        logoImageUrl: localStorage.getItem("logoImageUrl") || "",
        logoFontSize: parseInt(localStorage.getItem("logoFontSize") || "24"),
        logoImageSize: parseInt(localStorage.getItem("logoImageSize") || "40"),
        telegramCaption: localStorage.getItem("telegramCaption") || "",
        showPlayerButton: localStorage.getItem("showPlayerButton") !== "false",
        showTelegramButton: localStorage.getItem("showTelegramButton") !== "false",
        showDownloadButton: localStorage.getItem("showDownloadButton") !== "false",
        showExternalLinks: localStorage.getItem("showExternalLinks") !== "false",
        useShortenerPlayer: localStorage.getItem("useShortenerPlayer") !== "false",
        useShortenerTelegram: localStorage.getItem("useShortenerTelegram") !== "false",
        useShortenerDownload: localStorage.getItem("useShortenerDownload") !== "false",
        useShortenerExternal: localStorage.getItem("useShortenerExternal") !== "false",
        showQuality: localStorage.getItem("showQuality") !== "false",
        showSize: localStorage.getItem("showSize") !== "false",
        maintenanceMode: localStorage.getItem("maintenanceMode") === "true",
        maintenanceMessage: localStorage.getItem("maintenanceMessage") || "",
    });

    const [isBackendConnected, setIsBackendConnected] = useState(null); // null = checking, true = up, false = down
    const [isCheckingBackend, setIsCheckingBackend] = useState(true);
    const checkingRef = useRef(false);

    const BASE = import.meta.env.VITE_BASE_URL;

    const applyStyles = useCallback((data) => {
        if (!data) return;
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

    const checkBackendConnection = useCallback(async () => {
        if (!BASE || BASE.trim() === "") {
            setIsBackendConnected(false);
            setIsCheckingBackend(false);
            return false;
        }

        try {
            // First try ping endpoint with short timeout
            const pingRes = await axios.get(`${BASE}/api/ping`, { timeout: 5000 });
            if (pingRes.status >= 200 && pingRes.status < 400) {
                setIsBackendConnected(true);
                setIsCheckingBackend(false);
                return true;
            }
        } catch {
            // If /api/ping fails or 404s, try /api/settings as fallback
            try {
                const settingsRes = await axios.get(`${BASE}/api/settings`, { timeout: 5000 });
                if (settingsRes.status >= 200 && settingsRes.status < 400) {
                    setIsBackendConnected(true);
                    setIsCheckingBackend(false);
                    return true;
                }
            } catch {
                // Both failed -> backend is definitely unreachable
            }
        }

        setIsBackendConnected(false);
        setIsCheckingBackend(false);
        return false;
    }, [BASE]);

    const fetchSettings = useCallback(async () => {
        if (checkingRef.current) return;
        checkingRef.current = true;

        if (!BASE || BASE.trim() === "") {
            setIsBackendConnected(false);
            setIsCheckingBackend(false);
            checkingRef.current = false;
            return;
        }

        try {
            const res = await axios.get(`${BASE}/api/settings`, { timeout: 6000 });
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
            setIsBackendConnected(true);
            setIsCheckingBackend(false);
        } catch (error) {
            console.warn("Failed to fetch settings from backend:", error?.message || error);
            // Double-check with ping to verify if backend is completely down
            const alive = await checkBackendConnection();
            if (!alive) {
                setIsBackendConnected(false);
            }
            setIsCheckingBackend(false);
        } finally {
            checkingRef.current = false;
        }
    }, [BASE, applyStyles, checkBackendConnection]);

    const retryConnection = useCallback(async () => {
        setIsCheckingBackend(true);
        const alive = await checkBackendConnection();
        if (alive) {
            await fetchSettings();
        }
        return alive;
    }, [checkBackendConnection, fetchSettings]);

    // Initial check & load
    useEffect(() => {
        applyStyles(settings);
        fetchSettings();
    }, [fetchSettings, applyStyles]);

    // Dynamic Title Update
    useEffect(() => {
        if (settings.siteName) {
            if (!document.title.includes(settings.siteName)) {
                // document.title = settings.siteName;
            }
        }
    }, [settings.siteName]);

    // Auto-reconnect poll when backend is unreachable
    useEffect(() => {
        if (isBackendConnected === false) {
            const interval = setInterval(async () => {
                const alive = await checkBackendConnection();
                if (alive) {
                    fetchSettings();
                }
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [isBackendConnected, checkBackendConnection, fetchSettings]);

    // Global Axios Response Interceptor for live connection dropouts
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const url = error.config?.url || "";
                if (BASE && url.startsWith(BASE)) {
                    // Check if server is unreachable (network error or gateway drop)
                    const isNetworkErr = !error.response;
                    const isGatewayErr = error.response && [502, 503, 504].includes(error.response.status);
                    const isSilentCall = url.includes("/api/view/") || url.includes("/api/ping");

                    if ((isNetworkErr || isGatewayErr) && !isSilentCall) {
                        // Mark disconnected so maintenance mode protects user experience
                        setIsBackendConnected(false);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [BASE]);

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
        <SettingsContext.Provider value={{
            settings,
            updateSettings,
            fetchSettings,
            isBackendConnected,
            isCheckingBackend,
            retryConnection
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
