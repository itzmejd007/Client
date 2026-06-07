// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    PiPencilSimpleFill, PiTrashFill, PiPlusBold, PiMagnifyingGlassBold,
    PiCaretRightBold, PiCaretDownBold, PiXBold, PiListFill,
    PiPlusFill, PiMagnifyingGlassFill, PiXFill, PiCheckBold, PiGearFill
} from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";

const presetColors = [
    { name: "Cyberpunk Pink", value: "#ec4899", hover: "#db2777" },
    { name: "Neon Violet", value: "#8b5cf6", hover: "#7c3aed" },
    { name: "Electric Cyan", value: "#06b6d4", hover: "#0891b2" },
    { name: "Vibrant Indigo", value: "#6366f1", hover: "#4f46e5" },
    { name: "Success Emerald", value: "#10b981", hover: "#059669" },
    { name: "Molten Orange", value: "#f59e0b", hover: "#d97706" }
];

const structuralThemes = [
    { id: "theme-default", name: "Default (Modern Sans)" },
    { id: "theme-glassmorphism", name: "Glassmorphism" },
    { id: "theme-neubrutalism", name: "Neubrutalism" },
    { id: "theme-aurora", name: "Aurora Gradient" },
    { id: "theme-neumorphism", name: "Neumorphism" },
    { id: "theme-retro-web", name: "Retro Web (90s)" },
    { id: "theme-cyberpunk", name: "Cyberpunk 2077" },
    { id: "theme-material", name: "Material Design" },
    { id: "theme-ios-soft", name: "iOS Soft" },
    { id: "theme-brutalist-flat", name: "Brutalist Flat" }
];

const BASE = import.meta.env.VITE_BASE_URL;

const Admin = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuth") === "true");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [activeTab, setActiveTab] = useState("settings");

    // --- Settings State ---
    const [buttonColor, setButtonColor] = useState(localStorage.getItem("buttonColor") || "#805ad5");
    const [hoverColor, setHoverColor] = useState(localStorage.getItem("buttonHoverColor") || "#6b46c1");
    const [defaultTheme, setDefaultTheme] = useState(localStorage.getItem("defaultTheme") || "dark");
    const [structuralTheme, setStructuralTheme] = useState(localStorage.getItem("structuralTheme") || "theme-default");
    const [showThemeToggle, setShowThemeToggle] = useState(localStorage.getItem("showThemeToggle") !== "false");
    const [showAds, setShowAds] = useState(localStorage.getItem("showAds") === "true");
    const [siteName, setSiteName] = useState(localStorage.getItem("siteName") || "MovieStream");
    const [telegramUrl, setTelegramUrl] = useState(localStorage.getItem("telegramUrl") || "");

    // Ads State
    const [adHeader, setAdHeader] = useState(localStorage.getItem("adHeader") || "");
    const [adFooter, setAdFooter] = useState(localStorage.getItem("adFooter") || "");
    const [adSidebar, setAdSidebar] = useState(localStorage.getItem("adSidebar") || "");
    const [adPopup, setAdPopup] = useState(localStorage.getItem("adPopup") || "");
    const [adBanner, setAdBanner] = useState(localStorage.getItem("adBanner") || "");
    const [adInFeed, setAdInFeed] = useState(localStorage.getItem("adInFeed") || "");
    const [adPlayerBottom, setAdPlayerBottom] = useState(localStorage.getItem("adPlayerBottom") || "");
    const [adTop, setAdTop] = useState(localStorage.getItem("adTop") || "");

    // --- CMS State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSource, setSearchSource] = useState("tmdb");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [existingContent, setExistingContent] = useState([]);
    const [existingMediaType, setExistingMediaType] = useState("movie");
    const [existingContentQuery, setExistingContentQuery] = useState("");
    const [isFetchingExisting, setIsFetchingExisting] = useState(false);

    const [editingMedia, setEditingMedia] = useState(null);
    const [editingSeason, setEditingSeason] = useState(null);
    const [editingEpisode, setEditingEpisode] = useState(null);

    // --- Manual DB State ---
    const [manualFiles, setManualFiles] = useState([]);
    const [manualPage, setManualPage] = useState(1);
    const [manualTotal, setManualTotal] = useState(0);
    const [isFetchingManual, setIsFetchingManual] = useState(false);
    const [manualSearchQuery, setManualSearchQuery] = useState("");
    const [selectedManualFiles, setSelectedManualFiles] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [linkingFile, setLinkingFile] = useState(null);

    // --- Analytics State ---
    const [stats, setStats] = useState(null);
    const [isFetchingStats, setIsFetchingStats] = useState(false);

    // --- Add/Edit Flow Flag ---
    const [isNewAddition, setIsNewAddition] = useState(false);
    const [originalTitle, setOriginalTitle] = useState(null);

    // Fetch Analytics
    const fetchAnalytics = useCallback(async () => {
        setIsFetchingStats(true);
        try {
            const res = await axios.get(`${BASE}/api/admin/analytics`);
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
        setIsFetchingStats(false);
    }, []);

    // Fetch existing content list
    const fetchExistingContent = useCallback(async () => {
        setIsFetchingExisting(true);
        try {
            const res = await axios.get(`${BASE}/api/${existingMediaType}s`, {
                params: { page_size: 100, sort_by: "updated_on:desc" }
            });
            setExistingContent(existingMediaType === "movie" ? (res.data.movies || []) : (res.data.tv_shows || []));
        } catch (error) {
            console.error("Failed to fetch existing content:", error);
        }
        setIsFetchingExisting(false);
    }, [existingMediaType]);

    // Fetch manual files
    const fetchManualFiles = useCallback(async () => {
        setIsFetchingManual(true);
        try {
            const res = await axios.get(`${BASE}/api/admin/manual/files`, {
                params: { page: manualPage, page_size: 10, query: manualSearchQuery }
            });
            setManualFiles(res.data.files || []);
            setManualTotal(res.data.total_count || 0);
        } catch (error) {
            console.error("Failed to fetch manual files:", error);
        }
        setIsFetchingManual(false);
    }, [manualPage, manualSearchQuery]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchExistingContent();
            fetchManualFiles();
            fetchAnalytics();
        }
    }, [isAuthenticated, fetchExistingContent, fetchManualFiles, fetchAnalytics]);

    const handleSyncManual = async () => {
        setIsSyncing(true);
        try {
            const res = await axios.post(`${BASE}/api/admin/manual/sync`);
            alert(res.data.message);
            fetchManualFiles();
            fetchAnalytics();
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed: " + (error.response?.data?.detail || error.message));
        }
        setIsSyncing(false);
    };

    // Handle External Search
    const handleExternalSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await axios.get(`${BASE}/api/admin/external/search`, {
                params: { query: searchQuery, media_type: "movie", source: searchSource }
            });
            const movieResults = res.data.map(item => ({ ...item, type: "movie" }));

            const resTv = await axios.get(`${BASE}/api/admin/external/search`, {
                params: { query: searchQuery, media_type: "tv", source: searchSource }
            });
            const tvResults = resTv.data.map(item => ({ ...item, type: "tv" }));

            setSearchResults([...movieResults, ...tvResults]);
        } catch (error) {
            console.error("Search failed:", error);
        }
        setIsSearching(false);
    };

    const handleAddFromExternal = async (tmdb_id, type) => {
        try {
            const details = await axios.get(`${BASE}/api/admin/external/details`, {
                params: { id: tmdb_id, media_type: type, source: searchSource }
            });
            const data = { ...details.data, media_type: type };
            setEditingMedia(data);
            setIsNewAddition(true);
            setEditingSeason(null);
            setEditingEpisode(null);
            setActiveTab("content");
            alert("Loaded into editor. You can now change the title for versioning before saving.");
        } catch (error) {
            console.error("Fetch failed:", error);
            alert("Fetch failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleEditExisting = async (tmdb_id, type, title = null) => {
        try {
            const res = await axios.get(`${BASE}/api/id/${tmdb_id}`, { params: { title } });
            // Force media_type from list context if missing in payload
            const data = res.data;
            if (!data.media_type) data.media_type = (type === "tv" || data.seasons) ? "tv" : "movie";
            setEditingMedia(data);
            setIsNewAddition(false);
            setOriginalTitle(data.title);
            setEditingSeason(null);
            setEditingEpisode(null);
        } catch (error) {
            console.error("Failed to load details:", error);
            alert("Failed to load details. Ensure backend is running and ID is correct.");
        }
    };

    const handleDeleteMedia = async (tmdb_id, type, title = null, doc_id = null) => {
        const target_id = doc_id || editingMedia?._id || editingMedia?.id;
        console.log("handleDeleteMedia triggered", { tmdb_id, type, title, doc_id: target_id });
        if (!window.confirm(`Are you sure you want to delete "${title || type}"? (ID: ${target_id})`)) return;

        try {
            const apiType = (type === "movie" || type === "mov") ? "mov" : "tv";
            const url = `${BASE}/api/admin/media/${apiType}/${tmdb_id}`;
            console.log("Attempting standard DELETE:", url);

            try {
                await axios.delete(url, { params: { title, doc_id: target_id }, timeout: 5000 });
            } catch (delErr) {
                console.warn("Standard DELETE failed, trying POST fallback:", delErr.message);
                await axios.post(`${url}/delete`, null, { params: { title, doc_id: target_id }, timeout: 5000 });
            }

            alert("SUCCESS: Media purged from repository.");
            setEditingMedia(null);
            fetchExistingContent();
            fetchAnalytics();
        } catch (error) {
            console.error("Delete failed:", error);
            const msg = error.response?.data?.detail || error.message;
            alert(`DELETE FAILED (Final): ${msg}`);
        }
    };

    const handleUpdateQuality = async (quality_id, updated_data, season = null, episode = null) => {
        try {
            const type = (editingMedia.media_type === "movie" || editingMedia.media_type === "mov") ? "movie" : "tv";
            await axios.put(`${BASE}/api/admin/media/${type}/${editingMedia.tmdb_id}/quality/${quality_id}`, updated_data, {
                params: { season, episode, title: originalTitle }
            });
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) {
            console.error("Quality update failed:", error);
            alert("Update failed (404/400). Ensure the link still exists in database.");
        }
    };

    const handleDeleteQuality = async (quality_id, season = null, episode = null) => {
        const doc_id = editingMedia?._id || editingMedia?.id;
        console.log("handleDeleteQuality triggered", { quality_id, season, episode, originalTitle, doc_id });
        if (!window.confirm("Delete this quality link?")) return;

        try {
            const apiType = (editingMedia.media_type === "movie" || editingMedia.media_type === "mov") ? "mov" : "tv";
            const url = `${BASE}/api/admin/media/${apiType}/${editingMedia.tmdb_id}/quality/${quality_id}`;

            try {
                console.log("Attempting quality DELETE:", url);
                await axios.delete(url, { params: { season, episode, title: originalTitle, doc_id }, timeout: 5000 });
            } catch (delErr) {
                console.warn("Quality DELETE failed, trying POST fallback:", delErr.message);
                await axios.post(`${url}/delete`, null, { params: { season, episode, title: originalTitle, doc_id }, timeout: 5000 });
            }

            alert("SUCCESS: Stream link removed.");
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) {
            console.error("Quality delete failed:", error);
            const msg = error.response?.data?.detail || error.message;
            alert(`STREAM DELETE FAILED (Final): ${msg}`);
        }
    };

    const handleUpdateEpisode = async (season_number, episode_number, updated_data) => {
        try {
            await axios.put(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}/episode/${episode_number}`, updated_data);
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) { console.error(error); }
    };

    const handleDeleteSeason = async (season_number) => {
        if (!window.confirm(`Delete ALL episodes in Season ${season_number}?`)) return;
        try {
            await axios.delete(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}`);
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) { console.error(error); }
    };

    const handleDeleteEpisode = async (season_number, episode_number) => {
        if (!window.confirm(`Delete Episode ${episode_number}?`)) return;
        try {
            await axios.delete(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}/episode/${episode_number}`);
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) { console.error(error); }
    };

    const handleSaveMedia = async () => {
        console.log("handleSaveMedia called", { isNewAddition, editingMedia });
        try {
            const type = (editingMedia.media_type === "movie" || editingMedia.media_type === "mov") ? "movie" : "tv";
            
            // Handle audio languages string-to-array conversion & filtering
            let mediaToSave = { ...editingMedia };
            if (typeof mediaToSave.languages === 'string') {
                mediaToSave.languages = mediaToSave.languages.split(',')
                    .map(l => {
                        const trimmed = l.trim();
                        // Strip site prefixes like "site.com - " or "Site - "
                        return trimmed.includes(' - ') ? trimmed.split(' - ').pop().trim() : trimmed;
                    })
                    .filter(l => l);
            }
            // Ensure unique audio tracks
            if (Array.isArray(mediaToSave.languages)) {
                mediaToSave.languages = [...new Set(mediaToSave.languages)];
            }

            if (isNewAddition) {
                await axios.post(`${BASE}/api/admin/media/add`, mediaToSave);
                alert("Media added to database!");
                setIsNewAddition(false);
            } else {
                // Update details
                await axios.put(`${BASE}/api/admin/media/${type}/${editingMedia.tmdb_id}/details`, { ...mediaToSave, originalTitle });
                alert("Metadata updated!");
            }
            handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
            fetchExistingContent();
            fetchAnalytics();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Save failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleLinkFile = async (payload) => {
        try {
            const res = await axios.post(`${BASE}/api/admin/manual/link`, payload);
            alert(res.data.message);
            setLinkingFile(null);
            setSelectedManualFiles([]);
            fetchManualFiles();
            if (editingMedia) handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) {
            console.error("Link failed:", error);
            const msg = error.response?.data?.detail || error.message;
            alert(`Link failed: ${msg}`);
        }
    };

    const handleBulkLink = async (target) => {
        if (!selectedManualFiles.length) return;
        const auto = window.confirm(`Bulk Link ${selectedManualFiles.length} files to "${target.title}"?\n\nThis will use auto-detected Season/Episode for series.`);
        if (!auto) return;

        try {
            const res = await axios.post(`${BASE}/api/admin/manual/bulk_link`, {
                file_ids: selectedManualFiles,
                tmdb_id: target.tmdb_id,
                media_type: existingMediaType,
                title: target.title
            });
            alert(res.data.message + (res.data.errors?.length ? `\n\nErrors:\n${res.data.errors.join('\n')}` : ""));
            setSelectedManualFiles([]);
            setLinkingFile(null);
            fetchManualFiles();
            if (editingMedia) handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) {
            alert("Bulk link failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteManualFile = async (file_id) => {
        if (!window.confirm("Purge this file from manual database?")) return;
        try {
            await axios.delete(`${BASE}/api/admin/manual/files/${file_id}`);
            fetchManualFiles();
            fetchAnalytics();
        } catch (error) { console.error(error); }
    };

    const handleBulkDelete = async () => {
        if (!selectedManualFiles.length || !window.confirm(`Delete ${selectedManualFiles.length} files permanently?`)) return;
        try {
            await axios.delete(`${BASE}/api/admin/manual/bulk_delete`, { data: { file_ids: selectedManualFiles } });
            setSelectedManualFiles([]);
            fetchManualFiles();
            fetchAnalytics();
        } catch (e) {
            alert("Bulk delete failed: " + e.message);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const envUser = import.meta.env.VITE_ADMIN_USER;
        const envPass = import.meta.env.VITE_ADMIN_PASS;

        if (username === envUser && password === envPass) {
            setIsAuthenticated(true);
            sessionStorage.setItem("adminAuth", "true");
            setLoginError("");
        } else {
            setLoginError("Invalid credentials");
        }
    };

    const handleSaveSettings = async () => {
        // Save to LocalStorage
        const settings = {
            buttonColor, buttonHoverColor: hoverColor, defaultTheme, structuralTheme,
            showThemeToggle, showAds, adHeader, adFooter, adSidebar, adPopup, adBanner,
            adInFeed, adPlayerBottom, adTop, siteName, telegramUrl
        };
        Object.entries(settings).forEach(([k, v]) => localStorage.setItem(k, v));

        // Apply styles
        document.documentElement.style.setProperty('--color-primary', buttonColor);
        document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
        document.documentElement.classList.remove(...structuralThemes.map(t => t.id));
        if (structuralTheme !== "theme-default") document.documentElement.classList.add(structuralTheme);

        try {
            const res = await axios.post(`${BASE}/api/settings`, settings);
            if (res.status === 200) alert("Settings saved globally to database!");
            else alert("Saved locally (Backend API mismatch).");
        } catch (error) {
            console.error("Save to backend failed:", error);
            alert("Saved locally! (Ensure backend has /api/settings endpoint).");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-bgColor text-primaryTextColor transition-colors duration-500">
                <div className="w-full max-w-md bg-bgColorSecondary p-10 rounded-3xl border border-secondaryTextColor/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primaryBtn shadow-[0_0_20px_rgba(128,90,213,0.5)]"></div>
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primaryBtn/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primaryBtn/20 shadow-inner">
                            <PiPencilSimpleFill className="text-4xl text-primaryBtn" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal</h1>
                        <p className="text-secondaryTextColor text-sm mt-2">Manage your media library and site settings</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondaryTextColor mb-2 ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 rounded-xl bg-bgColor border border-secondaryTextColor/20 outline-none focus:border-primaryBtn focus:ring-4 focus:ring-primaryBtn/10 transition-all font-medium"
                                placeholder="Enter admin username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondaryTextColor mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 rounded-xl bg-bgColor border border-secondaryTextColor/20 outline-none focus:border-primaryBtn focus:ring-4 focus:ring-primaryBtn/10 transition-all font-medium"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{loginError}</p>}
                        <button type="submit" className="w-full py-4 bg-primaryBtn text-white font-bold rounded-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all">Secure Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bgColor text-primaryTextColor p-4 md:p-8 font-sans selection:bg-primaryBtn selection:text-white pb-32">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
                            <PiPencilSimpleFill className="text-primaryBtn animate-pulse" />
                            Admin Console
                        </h1>
                        <p className="text-secondaryTextColor font-medium mt-1">Refining {siteName} Control Center</p>
                    </div>
                    <div className="flex bg-bgColorSecondary p-1.5 rounded-2xl border border-secondaryTextColor/10 shadow-lg">
                        {[
                            { id: "dashboard", icon: <PiGearFill />, label: "Dashboard" },
                            { id: "settings", icon: <PiPencilSimpleFill />, label: "Settings" },
                            { id: "content", icon: <PiTrashFill />, label: "Content CMS" },
                            { id: "manual", icon: <PiListFill />, label: "Manual Files" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-primaryBtn text-white shadow-xl shadow-primaryBtn/20 scale-105" : "text-secondaryTextColor hover:text-primaryTextColor hover:bg-bgColor/50"}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total Movies", value: stats?.stats?.movies || 0, color: "from-pink-500 to-rose-500" },
                                { label: "TV Series", value: stats?.stats?.tv_shows || 0, color: "from-violet-500 to-indigo-500" },
                                { label: "Unlinked Files", value: stats?.stats?.manual_files || 0, color: "from-amber-500 to-orange-500" },
                                { label: "Total Library", value: stats?.stats?.total_content || 0, color: "from-emerald-500 to-teal-500" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10 shadow-xl relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                    <p className="text-secondaryTextColor font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-5xl font-black mt-2 tracking-tighter">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                    Recent Movies
                                </h3>
                                <div className="space-y-4">
                                    {stats?.recent?.movies?.map(m => (
                                        <div key={m.tmdb_id} className="flex items-center gap-4 p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(m.tmdb_id, "movie"); }}>
                                            <img src={m.poster} className="w-12 h-16 object-cover rounded-lg shadow-md" alt="" />
                                            <div>
                                                <p className="font-bold text-sm group-hover:text-primaryBtn transition-colors">{m.title}</p>
                                                <p className="text-[10px] text-secondaryTextColor uppercase font-mono">{m.release_year} • {m.rating} ★</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    Recent Series
                                </h3>
                                <div className="space-y-4">
                                    {stats?.recent?.tv_shows?.map(t => (
                                        <div key={t.tmdb_id} className="flex items-center gap-4 p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(t.tmdb_id, "tv"); }}>
                                            <img src={t.poster} className="w-12 h-16 object-cover rounded-lg shadow-md" alt="" />
                                            <div>
                                                <p className="font-bold text-sm group-hover:text-primaryBtn transition-colors">{t.title}</p>
                                                <p className="text-[10px] text-secondaryTextColor uppercase font-mono">{t.release_year} • {t.rating} ★</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Theming Section */}
                        <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <PiPencilSimpleFill className="text-primaryBtn" />
                                Custom Interface
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Brand Primary Color</label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {presetColors.map(c => (
                                            <button
                                                key={c.name}
                                                onClick={() => { setButtonColor(c.value); setHoverColor(c.hover); }}
                                                className={`aspect-square rounded-full border-4 transition-all scale-95 hover:scale-110 shadow-lg ${buttonColor === c.value ? "border-white" : "border-transparent"}`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-4 items-center pt-2">
                                        <div className="flex-1">
                                            <input type="text" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-full bg-bgColor p-3 rounded-xl border border-secondaryTextColor/20 text-sm font-mono" />
                                        </div>
                                        <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-10 h-10 rounded-md overflow-hidden border-none bg-transparent" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Structural Theme</label>
                                        <select value={structuralTheme} onChange={(e) => setStructuralTheme(e.target.value)} className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium outline-none focus:border-primaryBtn">
                                            {structuralThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Default Mode</label>
                                        <div className="flex bg-bgColor p-1 rounded-xl border border-secondaryTextColor/20">
                                            <button onClick={() => setDefaultTheme("dark")} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${defaultTheme === "dark" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Dark</button>
                                            <button onClick={() => setDefaultTheme("light")} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${defaultTheme === "light" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Light</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Management Section - Compact */}
                        <div className="bg-btnColor/5 p-8 rounded-3xl border border-secondaryTextColor/5 flex flex-col gap-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <PiGearFill className="text-primaryBtn" />
                                Ad Network Logic
                            </h2>
                            <div className="flex items-center justify-between p-4 bg-bgColor/40 rounded-2xl border border-secondaryTextColor/10">
                                <span className="font-bold">Global Ads Visibility</span>
                                <button onClick={() => setShowAds(!showAds)} className={`w-14 h-8 rounded-full relative transition-all ${showAds ? "bg-primaryBtn" : "bg-secondaryTextColor/20"}`}>
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${showAds ? "left-7" : "left-1"}`} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                {[
                                    { k: adHeader, s: setAdHeader, l: "Header Script" },
                                    { k: adFooter, s: setAdFooter, l: "Footer Script" },
                                    { k: adPopup, s: setAdPopup, l: "Pop/Redirect Script" },
                                    { k: adPlayerBottom, s: setAdPlayerBottom, l: "Player Bottom Script" },
                                    { k: adInFeed, s: setAdInFeed, l: "Grid Ad Script" },
                                    { k: adTop, s: setAdTop, l: "Sticky Top Script" }
                                ].map((ad, idx) => (
                                    <div key={idx} className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold uppercase text-secondaryTextColor ml-1">{ad.l}</label>
                                        <textarea value={ad.k} onChange={(e) => ad.s(e.target.value)} placeholder="HTML/JS Here..." className="w-full h-24 p-3 rounded-xl bg-bgColor/50 border border-secondaryTextColor/10 text-[10px] font-mono resize-none focus:border-primaryBtn" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "content" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Form Search Section */}
                        <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10">
                            <h2 className="text-2xl font-bold mb-6">Database Enrichment</h2>
                            <form onSubmit={handleExternalSearch} className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search TMDB or IMDb to import media..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-4 pl-12 rounded-xl bg-bgColor border border-secondaryTextColor/20 outline-none focus:border-primaryBtn text-lg"
                                    />
                                    <PiMagnifyingGlassBold className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryTextColor text-xl" />
                                </div>
                                <select value={searchSource} onChange={(e) => setSearchSource(e.target.value)} className="p-4 rounded-xl bg-bgColor border border-secondaryTextColor/20">
                                    <option value="tmdb">TMDB</option>
                                    <option value="imdb">IMDb</option>
                                </select>
                                <button type="submit" className="px-10 bg-primaryBtn text-white font-bold rounded-xl hover:shadow-xl transition-all" disabled={isSearching}>
                                    {isSearching ? "Working..." : "Search"}
                                </button>
                            </form>

                            {searchResults.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto p-1 pr-3 scrollbar-thin">
                                    {searchResults.map(res => (
                                        <div key={`${res.type}-${res.tmdb_id}`} className="group relative bg-bgColor p-2 rounded-xl border border-secondaryTextColor/10 hover:border-primaryBtn transition-all shadow-sm">
                                            <img src={res.poster} className="w-full aspect-[2/3] object-cover rounded-lg" alt="" />
                                            <div className="mt-2 text-center">
                                                <p className="text-xs font-bold truncate px-1">{res.title}</p>
                                                <p className="text-[10px] text-secondaryTextColor">{res.year} • {res.type.toUpperCase()}</p>
                                            </div>
                                            <button onClick={() => handleAddFromExternal(res.tmdb_id, res.type)} className="absolute inset-0 bg-primaryBtn/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold rounded-xl transition-opacity">Add to Site</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Existing Content Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* List Panel */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-bgColorSecondary p-5 rounded-2xl border border-secondaryTextColor/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            Library
                                            <span className="text-[10px] bg-primaryBtn/10 text-primaryBtn px-2 py-0.5 rounded-full">{existingContent.length}</span>
                                        </h3>
                                        <div className="flex p-1 bg-bgColor rounded-lg border border-secondaryTextColor/10">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const r = await axios.get(`${BASE}/api/ping`);
                                                        alert(`Backend is ONLINE\nVersion: ${r.data.version}\nDB: ${r.data.db}`);
                                                    } catch (e) {
                                                        alert(`Backend CONNECTION ERROR: ${e.message}\nURL: ${BASE}`);
                                                    }
                                                }}
                                                className="px-3 py-1 text-[10px] font-bold rounded hover:bg-white/5 mr-2 text-primaryBtn"
                                            >
                                                PING
                                            </button>
                                            <button onClick={() => setExistingMediaType("movie")} className={`px-3 py-1 text-[10px] font-bold rounded ${existingMediaType === "movie" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Movies</button>
                                            <button onClick={() => setExistingMediaType("tv")} className={`px-3 py-1 text-[10px] font-bold rounded ${existingMediaType === "tv" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>TV</button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Filter ${existingMediaType}s...`}
                                        className="w-full p-2 bg-bgColor rounded-lg text-xs border border-secondaryTextColor/10 outline-none focus:border-primaryBtn mb-4"
                                        value={existingContentQuery}
                                        onChange={(e) => setExistingContentQuery(e.target.value)}
                                    />
                                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                        {isFetchingExisting ? <div className="text-center py-20 animate-pulse text-secondaryTextColor">Loading Library...</div> :
                                            existingContent.filter(m => m.title.toLowerCase().includes(existingContentQuery.toLowerCase())).map(item => (
                                                <div key={item._id || item.id} onClick={() => handleEditExisting(item.tmdb_id, existingMediaType, item.title)} className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${(editingMedia?.tmdb_id === item.tmdb_id && editingMedia?.title === item.title) ? "bg-primaryBtn/10 border-primaryBtn shadow-inner" : "hover:bg-btnColor/20 border-transparent"}`}>
                                                    <img src={item.poster} className="w-10 h-14 object-cover rounded shadow-sm" alt="" />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-xs font-bold truncate">{item.title}</p>
                                                        <p className="text-[9px] text-secondaryTextColor uppercase font-mono">{item.release_year}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Editor Panel - REWRITTEN FOR STABILITY */}
                            <div className="lg:col-span-8">
                                {editingMedia ? (
                                    <div className="bg-bgColorSecondary p-8 rounded-2xl border border-secondaryTextColor/20 shadow-xl h-full flex flex-col min-h-[700px]">
                                        <div className="flex justify-between items-start border-b border-secondaryTextColor/10 pb-6 mb-6">
                                            <div className="flex gap-6 w-full">
                                                <div className="relative group shrink-0">
                                                    <img src={editingMedia.poster} className="w-24 h-36 object-cover rounded-xl shadow-lg border border-secondaryTextColor/10" alt="" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                        <PiPencilSimpleFill className="text-white text-2xl" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 pr-4">
                                                            <input
                                                                type="text"
                                                                value={editingMedia.title}
                                                                onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                                                                className="text-3xl font-black tracking-tight bg-transparent border-none p-0 w-full focus:ring-0"
                                                            />
                                                            <div className="flex gap-4 mt-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingMedia.release_year}
                                                                    onChange={(e) => setEditingMedia({ ...editingMedia, release_year: e.target.value })}
                                                                    className="text-secondaryTextColor font-mono text-xs uppercase tracking-widest bg-btnColor/20 px-2 py-0.5 rounded w-20"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editingMedia.rating}
                                                                    onChange={(e) => setEditingMedia({ ...editingMedia, rating: e.target.value })}
                                                                    className="text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded w-16"
                                                                />
                                                                <div className="flex-1">
                                                                    <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Audio Languages (en, hi, ta...)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={typeof editingMedia.languages === 'string' ? editingMedia.languages : (editingMedia.languages?.join(', ') || '')}
                                                                        placeholder="e.g. English, Hindi"
                                                                        onChange={(e) => setEditingMedia({ ...editingMedia, languages: e.target.value })}
                                                                        className="w-full bg-btnColor/20 px-3 py-1 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primaryBtn"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={handleSaveMedia} className="p-3 bg-primaryBtn text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><PiCheckBold /> {isNewAddition ? "ADD TO DB" : "SAVE"}</button>
                                                            <button onClick={() => setEditingMedia(null)} className="p-3 bg-secondaryTextColor/10 text-secondaryTextColor rounded-xl hover:text-primaryTextColor transition-all"><PiXBold /></button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={editingMedia.description}
                                                        onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                                                        className="mt-3 text-xs text-secondaryTextColor bg-transparent border-none p-0 resize-none h-16 focus:ring-0 scrollbar-none"
                                                        placeholder="Description..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
                                            {editingMedia.media_type === "movie" ? (
                                                <div className="space-y-6">
                                                    <h4 className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-secondaryTextColor bg-bgColor/50 p-3 rounded-lg border-l-4 border-primaryBtn">
                                                        Available Streams
                                                        <span className="text-[10px] font-medium opacity-60">Total {editingMedia.telegram?.length || 0} Links</span>
                                                    </h4>
                                                    <div className="grid gap-4">
                                                        {editingMedia.telegram?.map((link, idx) => (
                                                            <div key={link.id} className="bg-bgColor/30 p-4 rounded-2xl border border-secondaryTextColor/10 flex flex-col md:flex-row gap-4 items-center">
                                                                <div className="flex-1 w-full space-y-3">
                                                                    <div className="flex flex-col">
                                                                        <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase ml-1">Stream Display Title</label>
                                                                        <input
                                                                            type="text"
                                                                            value={link.name}
                                                                            onChange={(e) => {
                                                                                const m = { ...editingMedia };
                                                                                m.telegram[idx].name = e.target.value;
                                                                                setEditingMedia(m);
                                                                            }}
                                                                            className="w-full bg-transparent p-0 border-none font-bold text-sm focus:ring-0"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-4">
                                                                        <div className="w-24">
                                                                            <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1">Quality</label>
                                                                            <input type="text" value={link.quality} onChange={(e) => { const m = { ...editingMedia }; m.telegram[idx].quality = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 p-1.5 rounded-lg border border-secondaryTextColor/10 text-[10px]" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1">Size</label>
                                                                            <input type="text" value={link.size} onChange={(e) => { const m = { ...editingMedia }; m.telegram[idx].size = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 p-1.5 rounded-lg border border-secondaryTextColor/10 text-[10px]" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleUpdateQuality(link.id, { quality: link.quality, name: link.name, size: link.size })} className="p-3 bg-primaryBtn/20 text-primaryBtn rounded-xl hover:bg-primaryBtn hover:text-white transition-all shadow-lg"><PiCheckBold /></button>
                                                                    <button onClick={() => handleDeleteQuality(link.id)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"><PiTrashFill /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!editingMedia.telegram || editingMedia.telegram.length === 0) && <div className="text-center py-20 text-secondaryTextColor italic border-2 border-dashed border-secondaryTextColor/10 rounded-3xl">No streams available for this movie. Use Manual Database to link files.</div>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {editingMedia.seasons?.map((season) => (
                                                        <div key={season.season_number} className="bg-bgColor/20 rounded-2xl border border-secondaryTextColor/10 overflow-hidden">
                                                            <div className="w-full flex items-center justify-between p-4 bg-bgColor hover:bg-btnColor/10 transition-colors">
                                                                <button
                                                                    className="flex-1 text-left flex items-center"
                                                                    onClick={() => setEditingSeason(editingSeason === season.season_number ? null : season.season_number)}
                                                                >
                                                                    <span className="font-bold text-lg">Season {season.season_number} <span className="text-secondaryTextColor font-normal text-xs ml-2">({season.episodes?.length || 0} episodes)</span></span>
                                                                    {editingSeason === season.season_number ? <PiCaretDownBold className="ml-2" /> : <PiCaretRightBold className="ml-2" />}
                                                                </button>
                                                                <button onClick={() => handleDeleteSeason(season.season_number)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors"><PiTrashFill /></button>
                                                            </div>

                                                            {editingSeason === season.season_number && (
                                                                <div className="p-4 space-y-3 bg-bgColor/5 border-t border-secondaryTextColor/5">
                                                                    {season.episodes?.map((episode) => (
                                                                        <div key={episode.episode_number} className="bg-bgColor/40 p-3 rounded-xl border border-secondaryTextColor/5">
                                                                            <div className="w-full flex items-center justify-between group">
                                                                                <button
                                                                                    className="flex-1 text-left flex items-center"
                                                                                    onClick={() => setEditingEpisode(editingEpisode === episode.episode_number ? null : episode.episode_number)}
                                                                                >
                                                                                    <span className="text-secondaryTextColor font-mono text-[10px] w-6">E{episode.episode_number}</span>
                                                                                    <span className="font-bold text-sm tracking-tight group-hover:text-primaryBtn transition-colors">{episode.title}</span>
                                                                                    <PiPlusBold className={`transition-transform duration-300 ml-auto ${editingEpisode === episode.episode_number ? "rotate-45" : ""}`} />
                                                                                </button>
                                                                                <button onClick={() => handleDeleteEpisode(season.season_number, episode.episode_number)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><PiTrashFill /></button>
                                                                            </div>

                                                                            {editingEpisode === episode.episode_number && (
                                                                                <div className="mt-4 pt-4 border-t border-secondaryTextColor/10 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                                                    <div className="grid md:grid-cols-2 gap-4">
                                                                                        <div>
                                                                                            <label className="text-[9px] font-black uppercase text-secondaryTextColor">Episode Title</label>
                                                                                            <input type="text" value={episode.title} onChange={(e) => {
                                                                                                const m = { ...editingMedia };
                                                                                                const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                m.seasons[sIdx].episodes[eIdx].title = e.target.value;
                                                                                                setEditingMedia(m);
                                                                                            }} className="w-full bg-bgColor p-2.5 rounded-lg border border-secondaryTextColor/20 text-xs shadow-inner" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <label className="text-[9px] font-black uppercase text-secondaryTextColor">Backdrop (Original Size)</label>
                                                                                            <input type="text" value={episode.episode_backdrop} onChange={(e) => {
                                                                                                const m = { ...editingMedia };
                                                                                                const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                m.seasons[sIdx].episodes[eIdx].episode_backdrop = e.target.value;
                                                                                                setEditingMedia(m);
                                                                                            }} className="w-full bg-bgColor p-2.5 rounded-lg border border-secondaryTextColor/20 text-xs shadow-inner" />
                                                                                        </div>
                                                                                        <div className="md:col-span-2 flex justify-end">
                                                                                            <button onClick={() => handleUpdateEpisode(season.season_number, episode.episode_number, { title: episode.title, episode_backdrop: episode.episode_backdrop })} className="px-4 py-2 bg-primaryBtn text-white text-[10px] font-black rounded-lg hover:shadow-lg transition-all">SAVE METADATA</button>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-3">
                                                                                        <p className="text-[10px] uppercase font-black tracking-widest text-primaryBtn border-b border-primaryBtn/20 pb-1">Video Streams</p>
                                                                                        {episode.telegram?.map((link, lIdx) => (
                                                                                            <div key={link.id} className="bg-bgColor/50 p-3 rounded-xl border border-secondaryTextColor/10 flex items-center justify-between group">
                                                                                                <div className="flex-1 min-w-0 pr-4">
                                                                                                    <input type="text" value={link.name} onChange={(e) => {
                                                                                                        const m = { ...editingMedia };
                                                                                                        const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                        const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                        m.seasons[sIdx].episodes[eIdx].telegram[lIdx].name = e.target.value;
                                                                                                        setEditingMedia(m);
                                                                                                    }} className="w-full bg-transparent border-none p-0 text-xs font-bold leading-tight" />
                                                                                                    <div className="flex gap-4 mt-2">
                                                                                                        <div className="w-16"><input type="text" value={link.quality} onChange={(e) => { const m = { ...editingMedia }; const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number); const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number); m.seasons[sIdx].episodes[eIdx].telegram[lIdx].quality = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 rounded p-1 text-[9px] text-center" /></div>
                                                                                                        <div className="flex-1"><input type="text" value={link.size} onChange={(e) => { const m = { ...editingMedia }; const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number); const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number); m.seasons[sIdx].episodes[eIdx].telegram[lIdx].size = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 rounded p-1 text-[9px] text-center" /></div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                    <button onClick={() => handleUpdateQuality(link.id, { quality: link.quality, name: link.name, size: link.size }, season.season_number, episode.episode_number)} className="p-2 bg-primaryBtn/10 text-primaryBtn rounded hover:bg-primaryBtn hover:text-white transition-all"><PiCheckBold /></button>
                                                                                                    <button onClick={() => handleDeleteQuality(link.id, season.season_number, episode.episode_number)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all"><PiTrashFill /></button>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-8 border-t border-secondaryTextColor/10 flex justify-center">
                                            <button onClick={() => handleDeleteMedia(editingMedia.tmdb_id, editingMedia.media_type, originalTitle, editingMedia._id || editingMedia.id)} className="flex items-center gap-3 px-12 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 group">
                                                <PiTrashFill className="text-xl group-hover:scale-110 transition-transform" />
                                                PURGE FROM REPOSITORY
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-bgColorSecondary/30 h-full min-h-[700px] flex flex-col items-center justify-center p-20 text-center rounded-2xl border-2 border-dashed border-secondaryTextColor/10">
                                        <div className="w-24 h-24 rounded-3xl bg-primaryBtn/10 flex items-center justify-center text-primaryBtn text-4xl mb-6 shadow-xl shadow-primaryBtn/5">
                                            <PiPencilSimpleFill />
                                        </div>
                                        <h3 className="text-3xl font-black mb-2 tracking-tight">Select Content to Manage</h3>
                                        <p className="text-secondaryTextColor max-w-sm">Use the library panel on the left to select a movie or series. You can then edit metadata, seasons, and stream links.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "manual" && (
                    <div className="tab-content-wrapper">
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10">
                                <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                                    <PiListFill className="text-primaryBtn" />
                                    Orphan Files Hub
                                    <button
                                        onClick={handleSyncManual}
                                        disabled={isSyncing}
                                        className="ml-auto flex items-center gap-2 px-6 py-2 bg-primaryBtn/10 text-primaryBtn rounded-xl text-xs font-black border border-primaryBtn/20 hover:bg-primaryBtn hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {isSyncing ? "Syncing..." : "Synchronize Repository"}
                                    </button>
                                </h2>
                                <div className="relative mb-10 max-w-xl">
                                    <input
                                        type="text"
                                        placeholder="Search orphan files by name..."
                                        className="w-full p-4 pl-12 bg-bgColor rounded-2xl border border-secondaryTextColor/20 focus:border-primaryBtn outline-none font-bold text-sm shadow-inner"
                                        value={manualSearchQuery}
                                        onChange={e => { setManualSearchQuery(e.target.value); setManualPage(1); }}
                                    />
                                    <PiMagnifyingGlassFill className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-secondaryTextColor/50" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {isFetchingManual ? <div className="col-span-full py-32 text-center text-secondaryTextColor font-bold">Querying Manual Database...</div> : manualFiles.map(file => (
                                        <div key={file._id} className={`bg-bgColor p-6 rounded-2xl border ${selectedManualFiles.includes(file._id) ? "border-primaryBtn scale-[0.98] shadow-inner" : "border-secondaryTextColor/10"} flex flex-col justify-between hover:border-primaryBtn/50 transition-all relative group overflow-hidden`}>
                                            <div
                                                onClick={() => {
                                                    if (selectedManualFiles.includes(file._id)) {
                                                        setSelectedManualFiles(selectedManualFiles.filter(id => id !== file._id));
                                                    } else {
                                                        setSelectedManualFiles([...selectedManualFiles, file._id]);
                                                    }
                                                }}
                                                className={`absolute top-4 left-4 w-5 h-5 rounded-md border-2 cursor-pointer z-10 flex items-center justify-center transition-all ${selectedManualFiles.includes(file._id) ? "bg-primaryBtn border-primaryBtn" : "bg-bgColor/50 border-white/10"}`}
                                            >
                                                {selectedManualFiles.includes(file._id) && <PiCheckBold className="text-white text-[10px]" />}
                                            </div>
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primaryBtn/20 to-transparent -rotate-45 translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-all duration-700" />
                                            <div className="cursor-pointer" onClick={() => setLinkingFile(file)}>
                                                <div className="flex gap-2 mb-4 pl-8">
                                                    <span className="px-2 py-0.5 bg-primaryBtn text-white text-[9px] font-black rounded uppercase tracking-tighter">{file.size}</span>
                                                    {file.detected?.quality && <span className="px-2 py-0.5 bg-secondaryTextColor/10 text-secondaryTextColor text-[9px] font-bold rounded uppercase">{file.detected.quality}</span>}
                                                </div>
                                                <h4 className="font-bold text-sm mb-2 leading-snug line-clamp-2">{file.name}</h4>
                                                {file.detected && (
                                                    <div className="flex gap-2 mb-2">
                                                        {file.detected.season !== undefined && file.detected.season !== null && <span className="text-[9px] font-black text-primaryBtn bg-primaryBtn/10 px-2 py-0.5 rounded">S{file.detected.season}</span>}
                                                        {file.detected.episode !== undefined && file.detected.episode !== null && <span className="text-[9px] font-black text-primaryBtn bg-primaryBtn/10 px-2 py-0.5 rounded">E{file.detected.episode}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-6">
                                                <button
                                                    onClick={() => setLinkingFile(file)}
                                                    className="flex-1 py-3 bg-primaryBtn text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    <PiPlusBold /> Link
                                                </button>
                                                {!selectedManualFiles.length && <button
                                                    onClick={() => handleDeleteManualFile(file._id)}
                                                    className="p-3 bg-red-400/10 text-red-400 rounded-xl hover:bg-red-400 hover:text-white transition-all border border-red-400/10"
                                                >
                                                    <PiTrashFill />
                                                </button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedManualFiles.length > 0 && (
                                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-bgColor border border-primaryBtn/30 p-4 px-8 rounded-3xl shadow-2xl z-[100] flex items-center gap-6 animate-in slide-in-from-bottom-10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-tighter text-primaryBtn">{selectedManualFiles.length} Selected</span>
                                            <span className="text-[10px] text-secondaryTextColor font-medium tracking-tight">Ready for Bulk Link</span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-secondaryTextColor/20" />
                                        <div className="flex gap-2">
                                            <button onClick={() => setLinkingFile({ _id: "bulk" })} className="px-6 py-2.5 bg-primaryBtn text-white rounded-2xl text-[10px] font-black tracking-widest hover:-translate-y-0.5 transition-all shadow-lg shadow-primaryBtn/20">SET TARGET MEDIA</button>
                                            <button onClick={handleBulkDelete} className="p-2.5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><PiTrashFill /></button>
                                        </div>
                                        <button onClick={() => setSelectedManualFiles([])} className="text-[10px] font-black text-secondaryTextColor hover:text-white transition-colors">CANCEL</button>
                                    </div>
                                )}
                                {manualFiles.length === 0 && !isFetchingManual && <div className="col-span-full py-32 text-center text-secondaryTextColor bg-bgColor/30 border-2 border-dashed border-secondaryTextColor/10 rounded-3xl">Great job! All files have been linked.</div>}

                                {manualTotal > 10 && (
                                    <div className="flex justify-center gap-4 mt-12">
                                        <button disabled={manualPage === 1} onClick={() => setManualPage(p => p - 1)} className="p-3 bg-bgColor/50 rounded-xl disabled:opacity-30 border border-secondaryTextColor/10"><PiCaretRightBold className="rotate-180" /></button>
                                        <span className="flex items-center text-sm font-black w-24 justify-center bg-bgColor rounded-xl border border-secondaryTextColor/10 uppercase tracking-widest">{manualPage} / {Math.ceil(manualTotal / 10)}</span>
                                        <button disabled={manualPage >= Math.ceil(manualTotal / 10)} onClick={() => setManualPage(p => p + 1)} className="p-3 bg-bgColor/50 rounded-xl disabled:opacity-30 border border-secondaryTextColor/10"><PiCaretRightBold /></button>
                                    </div>
                                )}
                            </div>

                            {/* Search and Link Modal */}
                            {linkingFile && (
                                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => setLinkingFile(null)}>
                                    <div className="bg-bgColorSecondary w-full max-w-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tight">Attach Unlinked File</h2>
                                                <p className="text-secondaryTextColor text-xs mt-1 truncate max-w-sm">{linkingFile.name || `${selectedManualFiles.length} files selected`}</p>
                                            </div>
                                            <button onClick={() => setLinkingFile(null)} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><PiXBold /></button>
                                        </div>
                                        <div className="p-8 space-y-8 overflow-y-auto">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondaryTextColor">1. Find Database Entry</label>
                                                    <div className="flex gap-2 p-1 bg-bgColor rounded-lg border border-white/5">
                                                        <button onClick={() => { if(isFetchingExisting) return; setExistingMediaType("movie"); }} className={`px-4 py-1 text-[10px] font-black rounded ${existingMediaType === "movie" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>MOVIES</button>
                                                        <button onClick={() => { if(isFetchingExisting) return; setExistingMediaType("tv"); }} className={`px-4 py-1 text-[10px] font-black rounded ${existingMediaType === "tv" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>SERIES</button>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter title already in your database..."
                                                        className="w-full p-5 pl-14 bg-bgColor rounded-2xl border border-white/10 focus:border-primaryBtn outline-none font-bold"
                                                        value={existingContentQuery}
                                                        onChange={e => setExistingContentQuery(e.target.value)}
                                                    />
                                                    <PiMagnifyingGlassFill className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-secondaryTextColor" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 mt-2">
                                                    {existingContent.filter(m => m.title.toLowerCase().includes(existingContentQuery.toLowerCase())).slice(0, 10).map(target => (
                                                        <div key={target._id} className="p-3 bg-bgColor hover:bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 group cursor-pointer transition-all" onClick={() => {
                                                            if (selectedManualFiles.length > 0) {
                                                                handleBulkLink(target);
                                                                return;
                                                            }
                                                            const qual = prompt("Quality (e.g. 1080p, 720p, 4K)?", linkingFile.detected?.quality || "1080p");
                                                            if (!qual) return;
                                                            const p = { file_id: linkingFile._id, tmdb_id: target.tmdb_id, media_type: existingMediaType, quality: qual, title: target.title };
                                                            if (existingMediaType === "tv") {
                                                                const s = prompt("Season Number?", linkingFile.detected?.season || "1");
                                                                const ep = prompt("Episode Number?", linkingFile.detected?.episode || "1");
                                                                if (!s || !ep) return;
                                                                p.season = s; p.episode = ep;
                                                            }
                                                            handleLinkFile(p);
                                                        }}
                                                        >
                                                            <img src={target.poster} className="w-10 h-14 object-cover rounded-lg group-hover:scale-95 transition-transform" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black truncate">{target.title}</p>
                                                                <p className="text-[10px] text-secondaryTextColor">{target.release_year}</p>
                                                            </div>
                                                            <PiPlusBold className="text-primaryBtn opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-bgColor via-bgColor/90 to-transparent flex justify-center z-[500]">
                <div className="bg-bgColorSecondary/80 backdrop-blur-xl px-2 py-2 rounded-3xl border border-secondaryTextColor/20 shadow-2xl flex items-center gap-2">
                    <button onClick={handleSaveSettings} className="flex items-center gap-2 px-8 py-3 bg-primaryBtn text-white font-black rounded-2xl shadow-xl shadow-primaryBtn/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">
                        <PiCheckBold /> Publish Global Changes
                    </button>
                    <div className="w-[1px] h-8 bg-secondaryTextColor/20 mx-2" />
                    <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="p-3 text-secondaryTextColor hover:text-red-500 transition-colors" title="Lock & Logout"><PiXBold className="text-xl" /></button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
