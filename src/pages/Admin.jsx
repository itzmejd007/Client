// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    PiPencilSimpleFill, PiTrashFill, PiPlusBold, PiMagnifyingGlassBold,
    PiCaretRightBold, PiCaretDownBold, PiXBold, PiListFill,
    PiPlusFill, PiMagnifyingGlassFill, PiXFill, PiCheckBold, PiGearFill, PiGlobeBold, PiLinkBold,
    PiCloudArrowDownBold, PiDeviceMobileBold, PiCloudArrowUpBold, PiEyeBold
} from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

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

const COMMON_LANGUAGES = [
    "Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Japanese", "Korean",
    "Spanish", "French"
];

const ViewsGraph = ({ data, period }) => {
    if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-secondaryTextColor/40 italic">No historical data available</div>;

    const maxViews = Math.max(...data.map(d => d.views), 1);
    const chartHeight = 150;
    const chartWidth = 800;
    const padding = 20;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * (chartWidth - padding * 2) + padding;
        const y = chartHeight - (d.views / maxViews) * (chartHeight - padding * 2) - padding;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto drop-shadow-lg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "var(--primary-btn-color, #ec4899)", stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: "var(--primary-btn-color, #ec4899)", stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path d={`M ${padding},${chartHeight} ${points.split(" ").map((p, i) => i === 0 ? `L ${p}` : `L ${p}`).join(" ")} L ${chartWidth - padding},${chartHeight} Z`} fill="url(#grad)" />
                <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} className="text-primaryBtn" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1 || 1)) * (chartWidth - padding * 2) + padding;
                    const y = chartHeight - (d.views / maxViews) * (chartHeight - padding * 2) - padding;
                    return (
                        <g key={i} className="group/dot">
                            <circle cx={x} cy={y} r="4" fill="white" className="stroke-primaryBtn stroke-2" />
                            <rect x={x - 20} y={y - 25} width="40" height="15" rx="4" className="fill-bgColorSecondary opacity-0 group-hover/dot:opacity-100 transition-opacity" />
                            <text x={x} y={y - 14} fontSize="8" fontWeight="bold" textAnchor="middle" className="fill-primaryTextColor opacity-0 group-hover/dot:opacity-100 transition-opacity">{d.views}</text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex justify-between mt-2 px-2">
                <span className="text-[10px] font-bold text-secondaryTextColor/50 uppercase tracking-tighter">{data[0].date}</span>
                <span className="text-[10px] font-bold text-secondaryTextColor/50 uppercase tracking-tighter font-mono">{period.toUpperCase()} PERFORMANCE</span>
                <span className="text-[10px] font-bold text-secondaryTextColor/50 uppercase tracking-tighter">{data[data.length - 1].date}</span>
            </div>
        </div>
    );
};

const BASE = import.meta.env.VITE_BASE_URL;

const Admin = () => {
    const location = useLocation();
    const { settings, updateSettings } = useSettings();
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuth") === "true");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [activeTab, setActiveTab] = useState("settings");

    // --- Settings Local State (for form handling) ---
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLocalSettings(settings);
    }, [settings]);

    // --- CMS State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSource, setSearchSource] = useState("tmdb");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [existingContent, setExistingContent] = useState([]);
    const [existingMediaType, setExistingMediaType] = useState("movie");
    const [existingContentQuery, setExistingContentQuery] = useState("");
    const [debouncedContentQuery, setDebouncedContentQuery] = useState("");
    const [existingPage, setExistingPage] = useState(1);
    const [existingTotal, setExistingTotal] = useState(0);
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
    const [isBulkLinking, setIsBulkLinking] = useState(false);
    const [linkingFile, setLinkingFile] = useState(null);

    // --- Collections DB State ---
    const [collections, setCollections] = useState([]);
    const [collectionsSort, setCollectionsSort] = useState("updated_on:desc");
    const [newCollectionTitle, setNewCollectionTitle] = useState("");
    const [newCollectionThumbnail, setNewCollectionThumbnail] = useState("");
    const [editingCollection, setEditingCollection] = useState(null);
    const [editingCollectionTitle, setEditingCollectionTitle] = useState("");
    const [editingCollectionThumbnail, setEditingCollectionThumbnail] = useState("");
    const [collectionItemSearch, setCollectionItemSearch] = useState("");
    const [collectionItemResults, setCollectionItemResults] = useState([]);
    const [isSearchingColItems, setIsSearchingColItems] = useState(false);

    // --- Home Sections State ---
    const [homeSections, setHomeSections] = useState([]);
    const [isFetchingHomeSections, setIsFetchingHomeSections] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    // New Section Form
    const [newSecTitle, setNewSecTitle] = useState("");
    const [newSecType, setNewSecType] = useState("latest");
    const [newSecMediaType, setNewSecMediaType] = useState("both");
    const [newSecLayout, setNewSecLayout] = useState("slider");
    const [newSecLimit, setNewSecLimit] = useState(10);
    const [newSecEnabled, setNewSecEnabled] = useState(true);

    // Edit Section Form
    const [editSecTitle, setEditSecTitle] = useState("");
    const [editSecType, setEditSecType] = useState("latest");
    const [editSecMediaType, setEditSecMediaType] = useState("both");
    const [editSecLayout, setEditSecLayout] = useState("slider");
    const [editSecLimit, setEditSecLimit] = useState(10);
    const [editSecEnabled, setEditSecEnabled] = useState(true);

    // Items for top_release section
    const [selectedSecItems, setSelectedSecItems] = useState([]);
    const [secItemSearch, setSecItemSearch] = useState("");
    const [secItemResults, setSecItemResults] = useState([]);
    const [isSearchingSecItems, setIsSearchingSecItems] = useState(false);
    const [selectedColItems, setSelectedColItems] = useState([]);
    const [selectedCuratedDelete, setSelectedCuratedDelete] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedHomeIdx, setDraggedHomeIdx] = useState(null);
    const [dragOverHomeIdx, setDragOverHomeIdx] = useState(null);

    // --- Analytics State ---
    const [stats, setStats] = useState(null);
    const [isFetchingStats, setIsFetchingStats] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState("week");

    // --- Add/Edit Flow Flag ---
    const [isNewAddition, setIsNewAddition] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [originalTitle, setOriginalTitle] = useState(null);

    const fetchCollections = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE}/api/collections`, {
                params: { sort_by: collectionsSort }
            });
            setCollections(res.data.collections || []);
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        }
    }, [collectionsSort]);

    const fetchHomeSections = useCallback(async () => {
        setIsFetchingHomeSections(true);
        try {
            const res = await axios.get(`${BASE}/api/home-sections`);
            setHomeSections(res.data || []);
        } catch (error) {
            console.error("Failed to fetch home sections:", error);
        }
        setIsFetchingHomeSections(false);
    }, []);

    // Fetch Analytics
    const fetchAnalytics = useCallback(async () => {
        setIsFetchingStats(true);
        try {
            const res = await axios.get(`${BASE}/api/admin/analytics`, {
                params: { period: analyticsPeriod }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
        setIsFetchingStats(false);
    }, [analyticsPeriod]);

    const isAllOnPageSelected = manualFiles.length > 0 && manualFiles.every(f => selectedManualFiles.includes(f._id));

    const handleSelectAllOnPage = () => {
        const currentPageIds = manualFiles.map(f => f._id);
        if (isAllOnPageSelected) {
            setSelectedManualFiles(selectedManualFiles.filter(id => !currentPageIds.includes(id)));
        } else {
            setSelectedManualFiles([...new Set([...selectedManualFiles, ...currentPageIds])]);
        }
    };

    // Fetch existing content list
    const abortControllerRef = useRef(null);

    const fetchExistingContent = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsFetchingExisting(true);
        try {
            const path = existingMediaType === 'tv' ? 'tvshows' : 'movies';
            const res = await axios.get(`${BASE}/api/${path}`, {
                params: { 
                    page: existingPage, 
                    page_size: 10, 
                    sort_by: "updated_on:desc",
                    query: debouncedContentQuery 
                },
                signal
            });
            
            const data = res.data;
            if (!signal.aborted) {
                setExistingContent(existingMediaType === "movie" ? (data.movies || []) : (data.tv_shows || []));
                setExistingTotal(data.total_count || 0);
                setIsFetchingExisting(false);
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error("Failed to fetch existing content:", error);
            if (!signal.aborted) {
                setIsFetchingExisting(false);
            }
        }
    }, [existingMediaType, existingPage, debouncedContentQuery, BASE]);

    // Handle Debounce for Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedContentQuery(existingContentQuery);
            setExistingPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [existingContentQuery]);

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
        const token = sessionStorage.getItem("adminToken");
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchExistingContent();
    }, [isAuthenticated, fetchExistingContent]);

    useEffect(() => {
        if (isAuthenticated) fetchManualFiles();
    }, [isAuthenticated, fetchManualFiles]);

    useEffect(() => {
        if (isAuthenticated) fetchAnalytics();
    }, [isAuthenticated, fetchAnalytics]);

    useEffect(() => {
        if (isAuthenticated) fetchCollections();
    }, [isAuthenticated, fetchCollections]);

    useEffect(() => {
        if (isAuthenticated) fetchHomeSections();
    }, [isAuthenticated, fetchHomeSections]);

    // Handle deep-linking from pencil icons on other pages
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tmdbId = params.get("tmdb_id");
        const type = params.get("type");
        const title = params.get("title");

        if (tmdbId && type && isAuthenticated) {
            setActiveTab("content");
            handleEditExisting(tmdbId, type, title);
            
            // Optional: clear params after loading to avoid re-triggering
            // window.history.replaceState({}, '', window.location.pathname);
        }
    }, [isAuthenticated, location.search]);

    // --- Home Sections Handlers ---
    const handleCreateHomeSection = async (e) => {
        e.preventDefault();
        const formattedTitle = newSecTitle.trim();
        if (homeSections.some(sec => sec.title.trim().toLowerCase() === formattedTitle.toLowerCase())) {
            alert("A home section with this title already exists!");
            return;
        }
        try {
            await axios.post(`${BASE}/api/home-sections`, {
                title: formattedTitle,
                section_type: newSecType,
                media_type: newSecMediaType,
                layout: newSecLayout,
                limit: parseInt(newSecLimit),
                enabled: newSecEnabled,
                items: []
            });
            setNewSecTitle("");
            setNewSecType("latest");
            setNewSecMediaType("both");
            setNewSecLayout("slider");
            setNewSecLimit(10);
            setNewSecEnabled(true);
            fetchHomeSections();
            alert("Home section created successfully!");
        } catch (error) {
            alert("Error creating section: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleUpdateHomeSection = async (e) => {
        e.preventDefault();
        if (!editingSection) return;
        const formattedTitle = editSecTitle.trim();
        if (homeSections.some(sec => sec._id !== editingSection._id && sec.title.trim().toLowerCase() === formattedTitle.toLowerCase())) {
            alert("A home section with this title already exists!");
            return;
        }
        try {
            await axios.put(`${BASE}/api/home-sections/${editingSection._id}`, {
                title: formattedTitle,
                section_type: editSecType,
                media_type: editSecMediaType,
                layout: editSecLayout,
                limit: parseInt(editSecLimit),
                enabled: editSecEnabled,
                items: editingSection.items || []
            });
            fetchHomeSections();
            alert("Home section updated successfully!");
        } catch (error) {
            alert("Error updating section: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteHomeSection = async (id) => {
        if (!window.confirm("Delete this home section?")) return;
        try {
            await axios.delete(`${BASE}/api/home-sections/${id}`);
            fetchHomeSections();
            if (editingSection?._id === id) setEditingSection(null);
        } catch (error) {
            alert("Error deleting section: " + error.message);
        }
    };

    const handleReorderHomeSections = async (draggedIdx, targetIdx) => {
        const reordered = [...homeSections];
        const [draggedSec] = reordered.splice(draggedIdx, 1);
        reordered.splice(targetIdx, 0, draggedSec);

        const updatedSections = reordered.map((sec, index) => ({
            ...sec,
            position: index + 1
        }));
        setHomeSections(updatedSections);

        try {
            await axios.post(`${BASE}/api/home-sections/reorder`, {
                section_ids: updatedSections.map(sec => sec._id)
            });
        } catch (error) {
            alert("Failed to save new section order: " + (error.response?.data?.detail || error.message));
            fetchHomeSections();
        }
    };

    const handleReorderSectionItems = async (draggedIdx, targetIdx) => {
        if (!editingSection) return;
        const newItems = [...(editingSection.items || [])];
        const [draggedItem] = newItems.splice(draggedIdx, 1);
        newItems.splice(targetIdx, 0, draggedItem);

        try {
            await axios.put(`${BASE}/api/home-sections/${editingSection._id}`, {
                title: editSecTitle,
                section_type: editSecType,
                media_type: editSecMediaType,
                layout: editSecLayout,
                limit: parseInt(editSecLimit),
                enabled: editSecEnabled,
                items: newItems
            });
            
            setEditingSection(prev => ({
                ...prev,
                items: newItems
            }));
            fetchHomeSections();
        } catch (error) {
            alert("Failed to save new items order: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleSearchSecItems = async (e) => {
        e.preventDefault();
        if (!secItemSearch.trim()) return;
        setIsSearchingSecItems(true);
        try {
            const res = await axios.get(`${BASE}/api/search/`, { params: { query: secItemSearch, page: 1, page_size: 10 } });
            setSecItemResults(res.data.results);
        } catch (error) {
            console.error("Failed to search items:", error);
        }
        setIsSearchingSecItems(false);
    };

    const handleAddItemToSection = async (item) => {
        if (!editingSection) return;
        try {
            const updatedItems = [...(editingSection.items || [])];
            if (updatedItems.some(x => x.tmdb_id === item.tmdb_id && x.title === item.title)) {
                alert("Item already in section");
                return;
            }
            updatedItems.push({
                tmdb_id: item.tmdb_id,
                media_type: item.media_type,
                title: item.title
            });
            
            await axios.put(`${BASE}/api/home-sections/${editingSection._id}`, {
                title: editSecTitle,
                section_type: editSecType,
                media_type: editSecMediaType,
                layout: editSecLayout,
                limit: parseInt(editSecLimit),
                enabled: editSecEnabled,
                items: updatedItems
            });

            setEditingSection(prev => ({ ...prev, items: updatedItems }));
            setSecItemResults(prev => prev.filter(r => r.tmdb_id !== item.tmdb_id || r.title !== item.title));
            fetchHomeSections();
        } catch (error) {
            alert("Error adding item: " + error.message);
        }
    };

    const handleBulkAddItemsToSection = async () => {
        if (!editingSection || selectedSecItems.length === 0) return;
        try {
            const updatedItems = [...(editingSection.items || [])];
            for (const item of selectedSecItems) {
                if (!updatedItems.some(x => x.tmdb_id === item.tmdb_id && x.title === item.title)) {
                    updatedItems.push({
                        tmdb_id: item.tmdb_id,
                        media_type: item.media_type,
                        title: item.title
                    });
                }
            }

            await axios.put(`${BASE}/api/home-sections/${editingSection._id}`, {
                title: editSecTitle,
                section_type: editSecType,
                media_type: editSecMediaType,
                layout: editSecLayout,
                limit: parseInt(editSecLimit),
                enabled: editSecEnabled,
                items: updatedItems
            });

            setEditingSection(prev => ({ ...prev, items: updatedItems }));
            setSecItemResults(prev => prev.filter(r => !selectedSecItems.some(s => s.tmdb_id === r.tmdb_id && s.title === r.title)));
            setSelectedSecItems([]);
            fetchHomeSections();
            alert("Items added successfully!");
        } catch (error) {
            alert("Error adding items: " + error.message);
        }
    };

    const handleRemoveItemFromSection = async (tmdb_id, title) => {
        if (!editingSection) return;
        try {
            const updatedItems = (editingSection.items || []).filter(x => !(x.tmdb_id === tmdb_id && x.title === title));
            await axios.put(`${BASE}/api/home-sections/${editingSection._id}`, {
                title: editSecTitle,
                section_type: editSecType,
                media_type: editSecMediaType,
                layout: editSecLayout,
                limit: parseInt(editSecLimit),
                enabled: editSecEnabled,
                items: updatedItems
            });
            setEditingSection(prev => ({ ...prev, items: updatedItems }));
            fetchHomeSections();
        } catch (error) {
            alert("Error removing item: " + error.message);
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE}/api/collections`, { title: newCollectionTitle, thumbnail: newCollectionThumbnail });
            setNewCollectionTitle("");
            setNewCollectionThumbnail("");
            fetchCollections();
            alert("Collection created successfully!");
        } catch (error) {
            alert("Error creating collection: " + error.message);
        }
    };

    const handleUpdateCollection = async (e) => {
        e.preventDefault();
        if (!editingCollection) return;
        try {
            await axios.put(`${BASE}/api/collections/${editingCollection._id}`, { title: editingCollectionTitle, thumbnail: editingCollectionThumbnail });
            fetchCollections();
            alert("Collection updated successfully!");
        } catch (error) {
            alert("Error updating collection: " + error.message);
        }
    };

    const handleDeleteCollection = async (id) => {
        if (!window.confirm("Delete this collection?")) return;
        try {
            await axios.delete(`${BASE}/api/collections/${id}`);
            fetchCollections();
            if (editingCollection?._id === id) setEditingCollection(null);
        } catch (error) {
            alert("Error deleting collection: " + error.message);
        }
    };

    const handleSearchColItems = async (e) => {
        e.preventDefault();
        if (!collectionItemSearch.trim()) return;
        setIsSearchingColItems(true);
        try {
            const res = await axios.get(`${BASE}/api/search/`, { params: { query: collectionItemSearch, page: 1, page_size: 10 } });
            setCollectionItemResults(res.data.results);
        } catch (error) {
            console.error("Failed to search items:", error);
        }
        setIsSearchingColItems(false);
    };

    const handleAddItemToCollection = async (item) => {
        if (!editingCollection) return;
        try {
            await axios.post(`${BASE}/api/collections/${editingCollection._id}/items`, { 
                tmdb_id: item.tmdb_id, 
                media_type: item.media_type,
                title: item.title 
            });
            const res = await axios.get(`${BASE}/api/collections/${editingCollection._id}`);
            setEditingCollection(res.data);
            setCollectionItemResults(prev => prev.filter(r => r.tmdb_id !== item.tmdb_id || r.title !== item.title));
            fetchCollections();
        } catch (error) {
            alert("Error adding item: " + error.message);
        }
    };

    const handleBulkAddItemsToCollection = async () => {
        if (!editingCollection || selectedColItems.length === 0) return;
        try {
            await axios.post(`${BASE}/api/collections/${editingCollection._id}/bulk-items`, selectedColItems.map(item => ({
                tmdb_id: item.tmdb_id,
                media_type: item.media_type,
                title: item.title
            })));
            const res = await axios.get(`${BASE}/api/collections/${editingCollection._id}`);
            setEditingCollection(res.data);
            setCollectionItemResults(prev => prev.filter(r => !selectedColItems.some(s => s.tmdb_id === r.tmdb_id && s.title === r.title)));
            setSelectedColItems([]);
            fetchCollections();
            alert("Items added successfully!");
        } catch (error) {
            alert("Error adding items: " + error.message);
        }
    };

    const handleRemoveItemFromCollection = async (tmdb_id, media_type, title) => {
        if (!editingCollection) return;
        try {
            await axios.delete(`${BASE}/api/collections/${editingCollection._id}/items/${media_type}/${tmdb_id}`, {
                params: { title: title }
            });
            const res = await axios.get(`${BASE}/api/collections/${editingCollection._id}`);
            setEditingCollection(res.data);
            fetchCollections();
        } catch (error) {
            alert("Error removing item: " + error.message);
        }
    };

    const handleReorderCollectionItems = async (draggedIdx, targetIdx) => {
        if (!editingCollection) return;
        const newPopulated = [...editingCollection.populated_items];
        const [draggedItem] = newPopulated.splice(draggedIdx, 1);
        newPopulated.splice(targetIdx, 0, draggedItem);

        const newItems = newPopulated.map(item => ({
            tmdb_id: item.tmdb_id,
            media_type: item.media_type,
            title: item.title
        }));

        try {
            await axios.put(`${BASE}/api/collections/${editingCollection._id}`, {
                title: editingCollectionTitle,
                thumbnail: editingCollectionThumbnail,
                items: newItems
            });
            
            setEditingCollection(prev => ({
                ...prev,
                items: newItems,
                populated_items: newPopulated
            }));
            fetchCollections();
        } catch (error) {
            alert("Failed to save new items order: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleBulkDeleteCuratedItems = async () => {
        if (!editingCollection || selectedCuratedDelete.length === 0) return;
        if (!window.confirm(`Delete ${selectedCuratedDelete.length} selected items from this collection?`)) return;

        const remainingPopulated = editingCollection.populated_items.filter(item => {
            const id = `${item.media_type}_${item.tmdb_id}_${item.title || ""}`;
            return !selectedCuratedDelete.includes(id);
        });

        const newItems = remainingPopulated.map(item => ({
            tmdb_id: item.tmdb_id,
            media_type: item.media_type,
            title: item.title
        }));

        try {
            await axios.put(`${BASE}/api/collections/${editingCollection._id}`, {
                title: editingCollectionTitle,
                thumbnail: editingCollectionThumbnail,
                items: newItems
            });

            setEditingCollection(prev => ({
                ...prev,
                items: newItems,
                populated_items: remainingPopulated
            }));
            setSelectedCuratedDelete([]);
            fetchCollections();
            alert("Selected items deleted successfully!");
        } catch (error) {
            alert("Error deleting items: " + (error.response?.data?.detail || error.message));
        }
    };

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
            const res = await axios.get(`${BASE}/api/id/${tmdb_id}`, { params: { title, media_type: type } });
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
                params: { 
                    season, 
                    episode, 
                    title: editingMedia.title, 
                    doc_id: editingMedia._id || editingMedia.id 
                }
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
            await axios.put(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}/episode/${episode_number}`, updated_data, {
                params: {
                    title: editingMedia.title,
                    doc_id: editingMedia._id || editingMedia.id
                }
            });
            handleEditExisting(editingMedia.tmdb_id, "tv", editingMedia.title);
        } catch (error) {
            alert("Update episode failed");
        }
    };

    const handleDeleteSeason = async (season_number) => {
        if (!window.confirm(`Delete Season ${season_number}?`)) return;
        try {
            await axios.delete(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}`, {
                params: {
                    title: editingMedia.title,
                    doc_id: editingMedia._id || editingMedia.id
                }
            });
            handleEditExisting(editingMedia.tmdb_id, "tv", editingMedia.title);
        } catch (error) {
            alert("Delete season failed");
        }
    };

    const handleDeleteEpisode = async (season_number, episode_number) => {
        if (!window.confirm(`Delete Episode ${episode_number}?`)) return;
        try {
            await axios.delete(`${BASE}/api/admin/media/tv/${editingMedia.tmdb_id}/season/${season_number}/episode/${episode_number}`, {
                params: {
                    title: editingMedia.title,
                    doc_id: editingMedia._id || editingMedia.id
                }
            });
            handleEditExisting(editingMedia.tmdb_id, "tv", editingMedia.title);
        } catch (error) {
            alert("Delete episode failed");
        }
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

        setIsBulkLinking(true);
        try {
            const res = await axios.post(`${BASE}/api/admin/manual/bulk_link`, {
                file_ids: selectedManualFiles,
                tmdb_id: target.tmdb_id,
                media_type: existingMediaType,
                title: target.title,
                doc_id: target._id || target.id
            });
            alert(res.data.message + (res.data.errors?.length ? `\n\nErrors:\n${res.data.errors.join('\n')}` : ""));
            setSelectedManualFiles([]);
            setLinkingFile(null);
            fetchManualFiles();
            if (editingMedia) handleEditExisting(editingMedia.tmdb_id, editingMedia.media_type, editingMedia.title);
        } catch (error) {
            alert("Bulk link failed: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsBulkLinking(false);
        }
    };

    const handleDeleteManualFile = async (file_id) => {
        if (!window.confirm("Purge this file from manual database?")) return;
        try {
            try {
                await axios.delete(`${BASE}/api/admin/manual/files/${file_id}`);
            } catch (err) {
                // Fallback for DELETE blocked by hosting/proxy environment
                await axios.post(`${BASE}/api/admin/manual/files/${file_id}/delete`);
            }
            fetchManualFiles();
            fetchAnalytics();
        } catch (error) { 
            console.error(error); 
            alert("Delete failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedManualFiles.length || !window.confirm(`Delete ${selectedManualFiles.length} files permanently?`)) return;
        try {
            try {
                await axios.delete(`${BASE}/api/admin/manual/bulk_delete`, { data: { file_ids: selectedManualFiles } });
            } catch (err) {
                // Fallback for DELETE blocked by hosting/proxy environment
                await axios.post(`${BASE}/api/admin/manual/bulk_delete/delete`, { file_ids: selectedManualFiles });
            }
            setSelectedManualFiles([]);
            fetchManualFiles();
            fetchAnalytics();
        } catch (e) {
            alert("Bulk delete failed: " + (e.response?.data?.detail || e.message));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BASE}/api/admin/login`, { username, password });
            const token = res.data.token;
            setIsAuthenticated(true);
            sessionStorage.setItem("adminAuth", "true");
            sessionStorage.setItem("adminToken", token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setLoginError("");
        } catch (error) {
            setLoginError(error.response?.data?.detail || "Invalid credentials");
        }
    };

    const handleDownloadBackup = async () => {
        setIsBackingUp(true);
        try {
            const res = await axios.get(`${BASE}/api/admin/backup`);
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${settings.siteName}_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Failed to download backup.");
        } finally {
            setTimeout(() => setIsBackingUp(false), 1500);
        }
    };

    const handleUploadBackup = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.confirm("CRITICAL: This will PERMANENTLY overwrite your current database with the backup data. Are you absolutely sure?")) {
                    setIsRestoring(true);
                    const res = await axios.post(`${BASE}/api/admin/restore`, data);
                    alert(res.data.message);
                    window.location.reload(); // Reload to apply all restored settings
                }
            } catch (err) {
                console.error("Restore failed:", err);
                alert("Invalid backup file or server error.");
            } finally {
                setIsRestoring(false);
            }
        };
        reader.readAsText(file);
    };

    const handleSaveSettings = async () => {
        try {
            await updateSettings(localSettings, true);
            alert("Settings saved globally to database!");
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
        <div className="min-h-screen bg-bgColor text-primaryTextColor p-3 md:p-8 font-sans selection:bg-primaryBtn selection:text-white pb-32">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter">
                            <PiPencilSimpleFill className="text-primaryBtn animate-pulse" />
                            Admin Console
                        </h1>
                        <p className="text-secondaryTextColor text-xs md:text-sm font-medium mt-1">Refining {localSettings.siteName} Control Center</p>
                    </div>
                    <div className="flex bg-bgColorSecondary p-1.5 rounded-2xl border border-secondaryTextColor/10 shadow-lg overflow-x-auto no-scrollbar max-w-full">
                        {[
                            { id: "dashboard", icon: <PiGearFill />, label: "Dashboard" },
                            { id: "settings", icon: <PiPencilSimpleFill />, label: "Settings" },
                            { id: "ads", icon: <PiGearFill />, label: "Ads Management" },
                            { id: "content", icon: <PiTrashFill />, label: "Content CMS" },
                            { id: "manual", icon: <PiListFill />, label: "Manual Files" },
                            { id: "collections", icon: <PiListFill />, label: "Collections" },
                            { id: "home-sections", icon: <PiListFill />, label: "Home Layout" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-primaryBtn text-white shadow-lg shadow-primaryBtn/20" : "text-secondaryTextColor hover:bg-btnColor/20"}`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span className={activeTab === tab.id ? "block" : "hidden md:block"}>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {(isFetchingStats || !stats) ? (
                                Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10 shadow-xl animate-pulse">
                                        <div className="w-16 h-3 bg-secondaryTextColor/20 rounded mb-4"></div>
                                        <div className="w-24 h-10 bg-secondaryTextColor/10 rounded"></div>
                                    </div>
                                ))
                            ) : (
                                [
                                    { label: "Total Movies", value: stats?.stats?.movies || 0, color: "from-pink-500 to-rose-500" },
                                    { label: "TV Series", value: stats?.stats?.tv_shows || 0, color: "from-violet-500 to-indigo-500" },
                                    { label: "Unlinked Files", value: stats?.stats?.manual_files || 0, color: "from-amber-500 to-orange-500" },
                                    { label: "Total Library", value: stats?.stats?.total_content || 0, color: "from-emerald-500 to-teal-500" },
                                    { label: "Today Views", value: stats?.stats?.today_views || 0, color: "from-blue-500 to-cyan-500" },
                                    { label: "Yesterday", value: stats?.stats?.yesterday_views || 0, color: "from-slate-500 to-gray-500" },
                                    { label: "Monthly Views", value: stats?.stats?.monthly_views || 0, color: "from-purple-500 to-fuchsia-500" },
                                    { label: "Total Views", value: stats?.stats?.total_views || 0, color: "from-orange-500 to-red-500" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-bgColorSecondary p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-secondaryTextColor/10 shadow-xl relative overflow-hidden group animate-in zoom-in duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                        <p className="text-secondaryTextColor font-bold text-[10px] md:text-xs uppercase tracking-widest">{stat.label}</p>
                                        <h3 className="text-3xl md:text-5xl font-black mt-2 tracking-tighter">{stat.value.toLocaleString()}</h3>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Views Graph Section */}
                        <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10 shadow-xl overflow-hidden relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <PiGlobeBold className="text-primaryBtn" />
                                        Traffic & Engagement
                                    </h3>
                                    <p className="text-xs text-secondaryTextColor mt-1">Analyzing media consumption patterns over time</p>
                                </div>
                                <div className="flex bg-bgColor p-1 rounded-xl border border-secondaryTextColor/10">
                                    {["yesterday", "week", "month", "year", "max"].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setAnalyticsPeriod(p)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${analyticsPeriod === p ? "bg-primaryBtn text-white shadow-lg" : "text-secondaryTextColor hover:bg-btnColor/10"}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bgColor/30 p-6 rounded-2xl border border-secondaryTextColor/5">
                                <ViewsGraph data={stats?.graph_data} period={analyticsPeriod} />
                            </div>
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
                                        <div key={m._id || m.tmdb_id} className="flex items-center gap-4 p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(m.tmdb_id, "movie", m.title); }}>
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
                                        <div key={t._id || t.tmdb_id} className="flex items-center gap-4 p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(t.tmdb_id, "tv", t.title); }}>
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

                        {/* Top Viewed Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-secondaryTextColor/5">
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 blur-3xl" />
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <PiGlobeBold className="text-emerald-500" />
                                    Top Movies
                                </h3>
                                <div className="space-y-4">
                                    {stats?.top_viewed?.movies?.map(m => (
                                        <div key={m._id || m.tmdb_id} className="flex items-center justify-between p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(m.tmdb_id, "movie", m.title); }}>
                                            <div className="flex items-center gap-4">
                                                <img src={m.poster} className="w-12 h-16 object-cover rounded-lg shadow-md" alt="" />
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primaryBtn transition-colors">{m.title}</p>
                                                    <p className="text-[10px] text-secondaryTextColor uppercase font-mono">{m.release_year}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-primaryBtn">{m.views || 0}</p>
                                                <p className="text-[8px] font-bold text-secondaryTextColor uppercase tracking-widest">Views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 opacity-5 blur-3xl" />
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <PiGlobeBold className="text-cyan-500" />
                                    Top Series
                                </h3>
                                <div className="space-y-4">
                                    {stats?.top_viewed?.tv_shows?.map(t => (
                                        <div key={t._id || t.tmdb_id} className="flex items-center justify-between p-3 hover:bg-bgColor/50 rounded-2xl transition-all cursor-pointer group" onClick={() => { setActiveTab("content"); handleEditExisting(t.tmdb_id, "tv", t.title); }}>
                                            <div className="flex items-center gap-4">
                                                <img src={t.poster} className="w-12 h-16 object-cover rounded-lg shadow-md" alt="" />
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primaryBtn transition-colors">{t.title}</p>
                                                    <p className="text-[10px] text-secondaryTextColor uppercase font-mono">{t.release_year}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-primaryBtn">{t.views || 0}</p>
                                                <p className="text-[8px] font-bold text-secondaryTextColor uppercase tracking-widest">Views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "collections" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                            <h2 className="text-2xl font-bold mb-6">Create Collection</h2>
                            <form onSubmit={handleCreateCollection} className="flex flex-col md:flex-row gap-4">
                                <input type="text" placeholder="Collection Title" value={newCollectionTitle} onChange={e => setNewCollectionTitle(e.target.value)} required className="flex-1 bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                <input type="url" placeholder="Landscape Thumbnail URL" value={newCollectionThumbnail} onChange={e => setNewCollectionThumbnail(e.target.value)} required className="flex-1 bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                <button type="submit" className="bg-primaryBtn text-white px-8 py-4 rounded-xl font-bold">Create</button>
                            </form>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">All Collections</h2>
                                    <select 
                                        value={collectionsSort} 
                                        onChange={(e) => setCollectionsSort(e.target.value)}
                                        className="bg-bgColor text-[10px] font-bold p-2 px-3 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn"
                                    >
                                        <option value="updated_on:desc">Latest First</option>
                                        <option value="title:asc">A-Z</option>
                                        <option value="items:desc">Most Items</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    {collections.map(col => (
                                        <div key={col._id} className={`p-4 rounded-xl border cursor-pointer transition-all ${editingCollection?._id === col._id ? "border-primaryBtn bg-primaryBtn/10" : "border-secondaryTextColor/10 hover:bg-bgColor"}`} onClick={async () => {
                                            const res = await axios.get(`${BASE}/api/collections/${col._id}`);
                                            setEditingCollection(res.data);
                                            setEditingCollectionTitle(res.data.title);
                                            setEditingCollectionThumbnail(res.data.thumbnail);
                                            setSelectedColItems([]);
                                            setSelectedCuratedDelete([]);
                                            setCollectionItemResults([]);
                                        }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{col.title}</p>
                                                    <p className="text-xs text-secondaryTextColor">{col.items?.length || 0} items</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col._id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                                    <PiTrashFill />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {editingCollection && (
                                <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                    <h2 className="text-xl font-bold mb-4">Editing: {editingCollection.title}</h2>
                                    
                                    <form onSubmit={handleUpdateCollection} className="space-y-4 mb-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Title</label>
                                            <input type="text" value={editingCollectionTitle} onChange={e => setEditingCollectionTitle(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Thumbnail URL</label>
                                            <input type="url" value={editingCollectionThumbnail} onChange={e => setEditingCollectionThumbnail(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 bg-primaryBtn text-white py-3 rounded-lg font-bold text-sm">Update Collection</button>
                                        </div>
                                    </form>

                                    <img src={editingCollection.thumbnail} alt="" className="w-full h-40 object-cover rounded-xl mb-6" />
                                    
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold mb-2">Add Items</h3>
                                        <form onSubmit={handleSearchColItems} className="flex gap-2">
                                            <input type="text" placeholder="Search media..." value={collectionItemSearch} onChange={e => setCollectionItemSearch(e.target.value)} className="flex-1 bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none" />
                                            <button type="submit" className="bg-primaryBtn text-white px-4 rounded-lg"><PiMagnifyingGlassBold /></button>
                                        </form>
                                        {isSearchingColItems && <p className="text-xs mt-2">Searching...</p>}
                                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                            {collectionItemResults
                                                .filter(item => !editingCollection.items?.some(existing => existing.tmdb_id === item.tmdb_id && (existing.title === item.title || (!existing.title && !item.title))))
                                                .map(item => (
                                                <div key={item.tmdb_id} className="flex justify-between items-center p-2 bg-bgColor rounded-lg border border-secondaryTextColor/5">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            className="accent-primaryBtn" 
                                                            checked={selectedColItems.some(s => s.tmdb_id === item.tmdb_id && s.title === item.title)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedColItems([...selectedColItems, item]);
                                                                } else {
                                                                    setSelectedColItems(selectedColItems.filter(s => s.tmdb_id !== item.tmdb_id || s.title !== item.title));
                                                                }
                                                            }}
                                                        />
                                                        <img src={item.poster} className="w-8 h-10 object-cover rounded" />
                                                        <div>
                                                            <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                                                            <p className="text-[10px] text-secondaryTextColor">{item.media_type}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleAddItemToCollection(item)} className="text-primaryBtn text-xs font-bold p-2 bg-primaryBtn/10 rounded hover:bg-primaryBtn hover:text-white transition-all"><PiPlusBold /></button>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedColItems.length > 0 && (
                                            <button 
                                                onClick={handleBulkAddItemsToCollection}
                                                className="w-full mt-4 bg-primaryBtn text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2"
                                            >
                                                <PiPlusBold /> Add Selected ({selectedColItems.length})
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-sm font-bold">Current Items ({editingCollection.populated_items?.length || 0})</h3>
                                            {editingCollection.populated_items?.length > 0 && (
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1.5 text-xs text-secondaryTextColor cursor-pointer">
                                                        <input 
                                                            type="checkbox"
                                                            className="accent-primaryBtn"
                                                            checked={editingCollection.populated_items.length > 0 && selectedCuratedDelete.length === editingCollection.populated_items.length}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const allIds = editingCollection.populated_items.map(item => `${item.media_type}_${item.tmdb_id}_${item.title || ""}`);
                                                                    setSelectedCuratedDelete(allIds);
                                                                } else {
                                                                    setSelectedCuratedDelete([]);
                                                                }
                                                            }}
                                                        />
                                                        Select All
                                                    </label>
                                                    {selectedCuratedDelete.length > 0 && (
                                                        <button 
                                                            onClick={handleBulkDeleteCuratedItems}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors animate-pulse"
                                                        >
                                                            Delete Selected ({selectedCuratedDelete.length})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                            {editingCollection.populated_items?.map((item, idx) => {
                                                const itemId = `${item.media_type}_${item.tmdb_id}_${item.title || ""}`;
                                                const isSelected = selectedCuratedDelete.includes(itemId);
                                                const isDragOver = idx === dragOverIndex;
                                                const isDragged = idx === draggedIndex;

                                                return (
                                                    <div 
                                                        key={`${item.tmdb_id}_${item.title || idx}`} 
                                                        draggable
                                                        onDragStart={(e) => {
                                                            setDraggedIndex(idx);
                                                            e.dataTransfer.effectAllowed = "move";
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            if (dragOverIndex !== idx) {
                                                                setDragOverIndex(idx);
                                                            }
                                                        }}
                                                        onDragEnd={() => {
                                                            if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
                                                                handleReorderCollectionItems(draggedIndex, dragOverIndex);
                                                            }
                                                            setDraggedIndex(null);
                                                            setDragOverIndex(null);
                                                        }}
                                                        className={`flex justify-between items-center p-2 bg-bgColor rounded-lg border transition-all ${
                                                            isDragOver ? "border-primaryBtn bg-primaryBtn/15 scale-[1.01] shadow-md" : "border-secondaryTextColor/5 hover:border-secondaryTextColor/20"
                                                        } ${isDragged ? "opacity-30" : ""}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {/* Drag Handle */}
                                                            <div className="cursor-grab text-secondaryTextColor hover:text-primaryBtn transition-colors p-1" title="Drag to reorder">
                                                                <PiListFill className="text-sm" />
                                                            </div>
                                                            {/* Checkbox */}
                                                            <input 
                                                                type="checkbox" 
                                                                className="accent-primaryBtn cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedCuratedDelete([...selectedCuratedDelete, itemId]);
                                                                    } else {
                                                                        setSelectedCuratedDelete(selectedCuratedDelete.filter(x => x !== itemId));
                                                                    }
                                                                }}
                                                            />
                                                            <img src={item.poster} className="w-8 h-10 object-cover rounded" />
                                                            <div>
                                                                <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                                                                <p className="text-[10px] text-secondaryTextColor capitalize">{item.media_type}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveItemFromCollection(item.tmdb_id, item.media_type, item.title)} 
                                                            className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <PiTrashFill />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "home-sections" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                            <h2 className="text-2xl font-bold mb-6">Create Home Section</h2>
                            <form onSubmit={handleCreateHomeSection} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-secondaryTextColor uppercase">Title</label>
                                    <input type="text" placeholder="e.g. Action Hits" value={newSecTitle} onChange={e => setNewSecTitle(e.target.value)} required className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-secondaryTextColor uppercase">Section Type</label>
                                    <select value={newSecType} onChange={e => setNewSecType(e.target.value)} className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                        <option value="latest">Latest Media</option>
                                        <option value="trending">Trending (Views)</option>
                                        <option value="top_release">Top Release (Curated)</option>
                                        <option value="recently_watched">Recently Watched (History)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-secondaryTextColor uppercase">Media Type</label>
                                    <select value={newSecMediaType} onChange={e => setNewSecMediaType(e.target.value)} className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                        <option value="both">Both Movies & Series</option>
                                        <option value="movie">Movies Only</option>
                                        <option value="tv">Series Only</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-secondaryTextColor uppercase">Layout</label>
                                    <select value={newSecLayout} onChange={e => setNewSecLayout(e.target.value)} className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                        <option value="slider">Slider</option>
                                        <option value="grid">Grid</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-secondaryTextColor uppercase">Limit</label>
                                    <input type="number" min="1" max="100" value={newSecLimit} onChange={e => setNewSecLimit(e.target.value)} required className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                </div>

                                <div className="flex flex-col gap-2 justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer p-4 bg-bgColor rounded-xl border border-secondaryTextColor/20">
                                        <input type="checkbox" checked={newSecEnabled} onChange={e => setNewSecEnabled(e.target.checked)} className="accent-primaryBtn" />
                                        <span className="text-xs font-bold text-secondaryTextColor uppercase">Enabled</span>
                                    </label>
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="w-full bg-primaryBtn text-white py-4 rounded-xl font-bold">Create Section</button>
                                </div>
                            </form>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                <h2 className="text-xl font-bold mb-6">Home Layout Order & Config</h2>
                                <div className="space-y-4">
                                    {homeSections.map((sec, idx) => {
                                        const isDragOver = idx === dragOverHomeIdx;
                                        const isDragged = idx === draggedHomeIdx;
                                        
                                        return (
                                            <div 
                                                key={sec._id} 
                                                draggable
                                                onDragStart={(e) => {
                                                    setDraggedHomeIdx(idx);
                                                    e.dataTransfer.effectAllowed = "move";
                                                }}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    if (dragOverHomeIdx !== idx) {
                                                        setDragOverHomeIdx(idx);
                                                    }
                                                }}
                                                onDragEnd={() => {
                                                    if (draggedHomeIdx !== null && dragOverHomeIdx !== null && draggedHomeIdx !== dragOverHomeIdx) {
                                                        handleReorderHomeSections(draggedHomeIdx, dragOverHomeIdx);
                                                    }
                                                    setDraggedHomeIdx(null);
                                                    setDragOverHomeIdx(null);
                                                }}
                                                className={`p-4 rounded-xl border transition-all ${
                                                    isDragOver ? "border-primaryBtn bg-primaryBtn/15 scale-[1.01] shadow-md" : (editingSection?._id === sec._id ? "border-primaryBtn bg-primaryBtn/10" : "border-secondaryTextColor/10 hover:bg-bgColor")
                                                } ${isDragged ? "opacity-30" : "cursor-pointer"}`}
                                                onClick={() => {
                                                    setEditingSection(sec);
                                                    setEditSecTitle(sec.title);
                                                    setEditSecType(sec.section_type);
                                                    setEditSecMediaType(sec.media_type || "both");
                                                    setEditSecLayout(sec.layout || "slider");
                                                    setEditSecLimit(sec.limit || 10);
                                                    setEditSecEnabled(sec.enabled);
                                                    setEditSecPosition(sec.position || 1);
                                                    setSelectedSecItems([]);
                                                    setSecItemResults([]);
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="cursor-grab text-secondaryTextColor hover:text-primaryBtn transition-colors p-1" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>
                                                            <PiListFill className="text-sm" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-bgColor px-2 py-0.5 rounded text-[10px] font-mono font-bold text-primaryBtn">Pos {sec.position}</span>
                                                                <p className="font-bold">{sec.title}</p>
                                                            </div>
                                                            <p className="text-[10px] text-secondaryTextColor uppercase mt-1">
                                                                {sec.section_type} • {sec.media_type} • {sec.layout} • limit {sec.limit} • {sec.enabled ? "Active" : "Inactive"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHomeSection(sec._id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                                        <PiTrashFill />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {editingSection && (
                                <div className="bg-bgColorSecondary p-8 rounded-[2rem] border border-secondaryTextColor/10">
                                    <h2 className="text-xl font-bold mb-6">Editing: {editingSection.title}</h2>
                                    
                                    <form onSubmit={handleUpdateHomeSection} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Title</label>
                                            <input type="text" value={editSecTitle} onChange={e => setEditSecTitle(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Section Type</label>
                                            <select value={editSecType} onChange={e => setEditSecType(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                                <option value="latest">Latest Media</option>
                                                <option value="trending">Trending (Views)</option>
                                                <option value="top_release">Top Release (Curated)</option>
                                                <option value="recently_watched">Recently Watched (History)</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Media Type</label>
                                            <select value={editSecMediaType} onChange={e => setEditSecMediaType(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                                <option value="both">Both Movies & Series</option>
                                                <option value="movie">Movies Only</option>
                                                <option value="tv">Series Only</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Layout</label>
                                            <select value={editSecLayout} onChange={e => setEditSecLayout(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn">
                                                <option value="slider">Slider</option>
                                                <option value="grid">Grid</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondaryTextColor">Limit</label>
                                            <input type="number" min="1" max="100" value={editSecLimit} onChange={e => setEditSecLimit(e.target.value)} className="bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none focus:border-primaryBtn" />
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-bgColor rounded-lg border border-secondaryTextColor/20 md:col-span-2">
                                            <input type="checkbox" id="editSecEnabled" checked={editSecEnabled} onChange={e => setEditSecEnabled(e.target.checked)} className="accent-primaryBtn" />
                                            <label htmlFor="editSecEnabled" className="text-xs font-bold text-secondaryTextColor uppercase cursor-pointer">Enabled</label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <button type="submit" className="w-full bg-primaryBtn text-white py-3 rounded-lg font-bold text-sm">Update Section Config</button>
                                        </div>
                                    </form>

                                    {editSecType === "top_release" && (
                                        <div className="border-t border-secondaryTextColor/10 pt-6">
                                            <h3 className="text-sm font-bold mb-4">Curated Items List ({editingSection.items?.length || 0})</h3>
                                            <form onSubmit={handleSearchSecItems} className="flex gap-2 mb-4">
                                                <input type="text" placeholder="Search movies/series to add..." value={secItemSearch} onChange={e => setSecItemSearch(e.target.value)} className="flex-1 bg-bgColor p-3 rounded-lg border border-secondaryTextColor/20 outline-none" />
                                                <button type="submit" className="bg-primaryBtn text-white px-4 rounded-lg font-bold text-xs">Search</button>
                                            </form>

                                            {isSearchingSecItems && <p className="text-xs text-secondaryTextColor mb-4">Searching...</p>}

                                            {secItemResults.length > 0 && (
                                                <div className="bg-bgColor p-4 rounded-xl border border-secondaryTextColor/10 max-h-60 overflow-y-auto mb-4 space-y-2">
                                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-secondaryTextColor/10">
                                                        <span className="text-xs font-bold text-secondaryTextColor">Results</span>
                                                        {selectedSecItems.length > 0 && (
                                                            <button onClick={handleBulkAddItemsToSection} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-bold">
                                                                Add Selected ({selectedSecItems.length})
                                                            </button>
                                                        )}
                                                    </div>
                                                    {secItemResults.map(r => {
                                                        const isSelected = selectedSecItems.some(s => s.tmdb_id === r.tmdb_id && s.title === r.title);
                                                        const alreadyAdded = (editingSection.items || []).some(x => x.tmdb_id === r.tmdb_id && x.title === r.title);
                                                        return (
                                                            <div key={`${r.media_type}_${r.tmdb_id}_${r.title}`} className="flex items-center justify-between p-2 hover:bg-bgColorSecondary rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        disabled={alreadyAdded}
                                                                        checked={isSelected || alreadyAdded} 
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedSecItems(prev => [...prev, r]);
                                                                            } else {
                                                                                setSelectedSecItems(prev => prev.filter(s => !(s.tmdb_id === r.tmdb_id && s.title === r.title)));
                                                                            }
                                                                        }} 
                                                                        className="accent-primaryBtn" 
                                                                    />
                                                                    <img src={r.poster} className="w-8 h-10 object-cover rounded shadow" alt="" />
                                                                    <div>
                                                                        <p className="text-xs font-bold line-clamp-1">{r.title}</p>
                                                                        <p className="text-[9px] text-secondaryTextColor uppercase font-mono">{r.media_type} • {r.release_year}</p>
                                                                    </div>
                                                                </div>
                                                                {!alreadyAdded && (
                                                                    <button onClick={() => handleAddItemToSection(r)} className="text-xs text-primaryBtn hover:underline font-bold">Add</button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {(editingSection.items || []).map((item, idx) => {
                                                    const isDragOver = idx === dragOverIndex;
                                                    const isDragged = idx === draggedIndex;

                                                    return (
                                                        <div 
                                                            key={`${item.media_type}_${item.tmdb_id}_${item.title || idx}`}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                setDraggedIndex(idx);
                                                                e.dataTransfer.effectAllowed = "move";
                                                            }}
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                if (dragOverIndex !== idx) {
                                                                    setDragOverIndex(idx);
                                                                }
                                                            }}
                                                            onDragEnd={() => {
                                                                if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
                                                                    handleReorderSectionItems(draggedIndex, dragOverIndex);
                                                                }
                                                                setDraggedIndex(null);
                                                                setDragOverIndex(null);
                                                            }}
                                                            className={`flex justify-between items-center bg-bgColor p-3 rounded-xl border transition-all ${
                                                                isDragOver ? "border-primaryBtn bg-primaryBtn/15 scale-[1.01] shadow-md" : "border-secondaryTextColor/5 hover:border-secondaryTextColor/20"
                                                            } ${isDragged ? "opacity-30" : ""}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="cursor-grab text-secondaryTextColor hover:text-primaryBtn transition-colors p-1" title="Drag to reorder">
                                                                    <PiListFill className="text-sm" />
                                                                </div>
                                                                <div className="w-10 h-14 bg-bgColorSecondary rounded overflow-hidden flex items-center justify-center border border-secondaryTextColor/10">
                                                                    <span className="text-[8px] font-bold text-secondaryTextColor uppercase">{item.media_type}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                                                                    <p className="text-[10px] text-secondaryTextColor">TMDB: {item.tmdb_id}</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => handleRemoveItemFromSection(item.tmdb_id, item.title)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><PiTrashFill /></button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Global Identity & Theming */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm transition-all">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <PiGlobeBold className="text-primaryBtn" />
                                    Site Identity
                                </h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Site Name</label>
                                        <input
                                            type="text"
                                            value={localSettings.siteName}
                                            onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="e.g. MovieStream"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Custom Font URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={localSettings.logoCustomFontUrl || ""}
                                            onChange={(e) => setLocalSettings({ ...localSettings, logoCustomFontUrl: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="https://fonts.googleapis.com/css2?family=..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Logo Font Size (px)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="16"
                                                max="60"
                                                value={localSettings.logoFontSize || 24}
                                                onChange={(e) => setLocalSettings({ ...localSettings, logoFontSize: parseInt(e.target.value) })}
                                                className="flex-1 accent-primaryBtn"
                                            />
                                            <span className="text-sm font-bold w-12 text-center bg-bgColor p-2 rounded-lg border border-secondaryTextColor/20">
                                                {localSettings.logoFontSize || 24}px
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Logo Image URL</label>
                                        <input
                                            type="text"
                                            value={localSettings.logoImageUrl || ""}
                                            onChange={(e) => setLocalSettings({ ...localSettings, logoImageUrl: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                    {localSettings.logoImageUrl && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Logo Image Height (px)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="120"
                                                    value={localSettings.logoImageSize || 40}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, logoImageSize: parseInt(e.target.value) })}
                                                    className="flex-1 accent-primaryBtn"
                                                />
                                                <span className="text-sm font-bold w-12 text-center bg-bgColor p-2 rounded-lg border border-secondaryTextColor/20">
                                                    {localSettings.logoImageSize || 40}px
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Telegram Link</label>
                                        <input
                                            type="text"
                                            value={localSettings.telegramUrl}
                                            onChange={(e) => setLocalSettings({ ...localSettings, telegramUrl: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="https://t.me/yourchannel"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Telegram Bot Username (without @)</label>
                                        <input
                                            type="text"
                                            value={localSettings.tgUsername}
                                            onChange={(e) => setLocalSettings({ ...localSettings, tgUsername: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="SpartanAiBot"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Telegram Bot Custom Caption</label>
                                        <textarea
                                            value={localSettings.telegramCaption}
                                            onChange={(e) => setLocalSettings({ ...localSettings, telegramCaption: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all min-h-[100px]"
                                            placeholder="Enter custom caption for files... Use {caption} for original file caption."
                                        />
                                        <p className="text-[10px] text-secondaryTextColor/60 px-2 italic">Tip: You can use {"{caption}"}, {"{quality}"}, {"{size}"}, {"{filename}"} and HTML tags.</p>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-secondaryTextColor/10 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                            <div>
                                                <p className="text-sm font-black text-red-500 uppercase tracking-widest">Maintenance Mode</p>
                                                <p className="text-[10px] text-secondaryTextColor mt-1">Take the website offline for all public users.</p>
                                            </div>
                                            <button 
                                                onClick={() => setLocalSettings({ ...localSettings, maintenanceMode: !localSettings.maintenanceMode })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${localSettings.maintenanceMode ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-bgColor border border-secondaryTextColor/20"}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${localSettings.maintenanceMode ? "left-7" : "left-1"}`} />
                                            </button>
                                        </div>

                                        {localSettings.maintenanceMode && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                                <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Maintenance Message</label>
                                                <textarea
                                                    value={localSettings.maintenanceMessage}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMessage: e.target.value })}
                                                    className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all min-h-[100px]"
                                                    placeholder="Enter message for your users..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Language Priority Order</label>
                                            <button 
                                                onClick={() => setLocalSettings({ ...localSettings, language_priority: [] })}
                                                className="text-[10px] font-black text-red-500 uppercase hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        
                                        {/* Active Priority List */}
                                        <div className="flex flex-wrap gap-2 p-4 bg-bgColor rounded-xl border border-secondaryTextColor/20 min-h-[60px]">
                                            {localSettings.language_priority && localSettings.language_priority.length > 0 ? (
                                                localSettings.language_priority.map((lang, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 bg-primaryBtn text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md animate-in zoom-in-95 duration-200">
                                                        <span>{lang}</span>
                                                        <button 
                                                            onClick={() => {
                                                                const newList = localSettings.language_priority.filter(l => l !== lang);
                                                                setLocalSettings({ ...localSettings, language_priority: newList });
                                                            }}
                                                            className="hover:bg-white/20 p-0.5 rounded"
                                                        >
                                                            <PiXBold className="text-[10px]" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-secondaryTextColor text-xs italic">Select languages below to set priority...</p>
                                            )}
                                        </div>

                                        {/* Suggestions */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-secondaryTextColor/50 uppercase ml-1">Quick Add Suggestions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_LANGUAGES.filter(l => !localSettings.language_priority?.includes(l)).map(lang => (
                                                    <button
                                                        key={lang}
                                                        onClick={() => {
                                                            const current = localSettings.language_priority || [];
                                                            if (!current.includes(lang)) {
                                                                setLocalSettings({ ...localSettings, language_priority: [...current, lang] });
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-btnColor/20 border border-secondaryTextColor/10 text-xs font-bold hover:border-primaryBtn hover:text-primaryBtn transition-all"
                                                    >
                                                        + {lang}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <input
                                                type="text"
                                                placeholder="Or type custom (e.g. Arabic) and press enter"
                                                className="w-full bg-bgColor/50 p-3 rounded-lg border border-secondaryTextColor/10 text-xs outline-none focus:border-primaryBtn"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim();
                                                        if (val && !localSettings.language_priority?.includes(val)) {
                                                            setLocalSettings({ ...localSettings, language_priority: [...(localSettings.language_priority || []), val] });
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-bgColor rounded-xl border border-secondaryTextColor/10">
                                        <div>
                                            <p className="text-sm font-bold">Show View Count</p>
                                            <p className="text-[10px] text-secondaryTextColor">Display total views on media details pages</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalSettings({ ...localSettings, showViews: !localSettings.showViews })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${localSettings.showViews ? "bg-primaryBtn" : "bg-btnColor/20"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.showViews ? "left-7" : "left-1"}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm transition-all">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <PiPencilSimpleFill className="text-primaryBtn" />
                                    Visual Theme
                                </h2>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Primary Color</label>
                                        <div className="grid grid-cols-6 gap-3">
                                            {presetColors.map(c => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setLocalSettings({ ...localSettings, buttonColor: c.value, buttonHoverColor: c.hover })}
                                                    className={`aspect-square rounded-full border-4 transition-all scale-95 hover:scale-110 shadow-lg ${localSettings.buttonColor === c.value ? "border-white" : "border-transparent"}`}
                                                    style={{ backgroundColor: c.value }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-4 items-center pt-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={localSettings.buttonColor}
                                                    onChange={(e) => setLocalSettings({ ...localSettings, buttonColor: e.target.value })}
                                                    className="w-full bg-bgColor p-3 rounded-xl border border-secondaryTextColor/20 text-sm font-mono"
                                                />
                                            </div>
                                            <input
                                                type="color"
                                                value={localSettings.buttonColor}
                                                onChange={(e) => setLocalSettings({ ...localSettings, buttonColor: e.target.value })}
                                                className="w-10 h-10 rounded-md overflow-hidden border-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Structural Theme</label>
                                            <select
                                                value={localSettings.structuralTheme}
                                                onChange={(e) => setLocalSettings({ ...localSettings, structuralTheme: e.target.value })}
                                                className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium outline-none focus:border-primaryBtn"
                                            >
                                                {structuralThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">Default Mode</label>
                                            <div className="flex bg-bgColor p-1 rounded-xl border border-secondaryTextColor/20">
                                                <button onClick={() => setLocalSettings({ ...localSettings, defaultTheme: "dark" })} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${localSettings.defaultTheme === "dark" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Dark</button>
                                                <button onClick={() => setLocalSettings({ ...localSettings, defaultTheme: "light" })} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${localSettings.defaultTheme === "light" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Light</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visibility & Shorteners Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm transition-all">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <PiEyeBold className="text-primaryBtn" />
                                    Button Visibility
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'showPlayerButton', label: 'Player Button', desc: 'Main stream/play button' },
                                        { id: 'showTelegramButton', label: 'Telegram Button', desc: 'Direct bot link' },
                                        { id: 'showDownloadButton', label: 'Download Button', desc: 'Primary download link' },
                                        { id: 'showExternalLinks', label: 'External Links', desc: 'GDrive, Mega, etc. links' },
                                        { id: 'showQuality', label: 'Quality Tags', desc: 'Display quality (1080p, etc.)' },
                                        { id: 'showSize', label: 'File Size', desc: 'Display file sizes (1.2 GB, etc.)' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-bgColor rounded-xl border border-secondaryTextColor/10">
                                            <div>
                                                <p className="text-sm font-bold">{item.label}</p>
                                                <p className="text-[10px] text-secondaryTextColor">{item.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setLocalSettings({ ...localSettings, [item.id]: !localSettings[item.id] })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${localSettings[item.id] ? "bg-primaryBtn" : "bg-btnColor/20"}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings[item.id] ? "left-7" : "left-1"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm transition-all">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <PiLinkBold className="text-primaryBtn" />
                                    Link Shortener Toggles
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'useShortenerPlayer', label: 'Shorten Player Link', desc: 'Use shortener for Pop Player links' },
                                        { id: 'useShortenerTelegram', label: 'Shorten Telegram Link', desc: 'Use shortener for Bot start links' },
                                        { id: 'useShortenerDownload', label: 'Shorten Download Link', desc: 'Use shortener for direct downloads' },
                                        { id: 'useShortenerExternal', label: 'Shorten External Links', desc: 'Use shortener for cloud links' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-bgColor rounded-xl border border-secondaryTextColor/10">
                                            <div>
                                                <p className="text-sm font-bold">{item.label}</p>
                                                <p className="text-[10px] text-secondaryTextColor">{item.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setLocalSettings({ ...localSettings, [item.id]: !localSettings[item.id] })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${localSettings[item.id] ? "bg-primaryBtn" : "bg-btnColor/20"}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings[item.id] ? "left-7" : "left-1"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Shortener & Ad Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm transition-all">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                    <PiLinkBold className="text-primaryBtn" />
                                    Link Shortener API Config
                                </h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">API URL</label>
                                        <input
                                            type="text"
                                            value={localSettings.shortenerApiUrl}
                                            onChange={(e) => setLocalSettings({ ...localSettings, shortenerApiUrl: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="https://api.shortener.com/api"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-secondaryTextColor">API Key</label>
                                        <input
                                            type="text"
                                            value={localSettings.shortenerApiKey}
                                            onChange={(e) => setLocalSettings({ ...localSettings, shortenerApiKey: e.target.value })}
                                            className="w-full bg-bgColor p-4 rounded-xl border border-secondaryTextColor/20 font-medium focus:border-primaryBtn outline-none transition-all"
                                            placeholder="your_api_key_here"
                                        />
                                    </div>
                                    <div className="p-4 bg-primaryBtn/10 rounded-2xl border border-primaryBtn/20 mt-4">
                                        <p className="text-xs text-secondaryTextColor leading-relaxed">
                                            <strong className="text-primaryBtn">Note:</strong> These credentials will be used for all Download and Telegram links generated on the site.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Backup & Export */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-btnColor/10 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primaryBtn/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <PiCloudArrowDownBold className={`text-primaryBtn ${isBackingUp ? "animate-bounce" : ""}`} />
                                Backup & Export
                            </h2>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-bgColor/50 p-6 rounded-2xl border border-secondaryTextColor/10 relative z-10">
                                <div className="flex-1 text-left">
                                    <h3 className="text-lg font-bold">Site Data Backup</h3>
                                    <p className="text-sm text-secondaryTextColor">Download a snapshot of your entire database including settings, movies, series, and manual links.</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownloadBackup}
                                        disabled={isBackingUp}
                                        className={`w-full md:w-auto px-8 py-4 bg-primaryBtn text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primaryBtn/20 ${isBackingUp ? "opacity-70 cursor-not-allowed" : "hover:shadow-primaryBtn/40"}`}
                                    >
                                        {isBackingUp ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <PiCloudArrowDownBold className="text-xl" />
                                        )}
                                        {isBackingUp ? "PREPARING..." : "EXPORT JSON"}
                                    </motion.button>
                                    
                                    <motion.label
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full md:w-auto px-8 py-4 bg-bgColorSecondary text-primaryTextColor border border-secondaryTextColor/20 hover:border-primaryBtn/50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${isRestoring ? "opacity-70 pointer-events-none" : ""}`}
                                    >
                                        {isRestoring ? (
                                            <div className="w-5 h-5 border-2 border-primaryBtn/30 border-t-primaryBtn rounded-full animate-spin" />
                                        ) : (
                                            <PiCloudArrowUpBold className="text-xl text-primaryBtn" />
                                        )}
                                        {isRestoring ? "RESTORING..." : "IMPORT JSON"}
                                        <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
                                    </motion.label>
                                </div>
                            </div>

                            {/* Progress bar animation for backup/restore */}
                            <AnimatePresence>
                                {(isBackingUp || isRestoring) && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 overflow-hidden"
                                    >
                                        <div className="w-full bg-bgColor h-2 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: isBackingUp ? 1.5 : 5, ease: "easeInOut" }}
                                                className="h-full bg-primaryBtn"
                                            />
                                        </div>
                                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-primaryBtn mt-2 animate-pulse">
                                            {isBackingUp ? "Processing Database Snapshot..." : "Rebuilding System State..."}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Save Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={handleSaveSettings}
                                className="px-12 py-4 bg-primaryBtn text-white font-black text-lg rounded-2xl shadow-2xl shadow-primaryBtn/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <PiCheckBold className="text-2xl" />
                                UPDATE GLOBAL SETTINGS
                            </button>
                        </div>
                    </div>
                )}


                {activeTab === "ads" && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-btnColor/10 p-8 rounded-[2.5rem] border border-secondaryTextColor/10 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primaryBtn shadow-[0_0_20px_rgba(128,90,213,0.3)]"></div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                                        <PiGearFill className="text-primaryBtn" />
                                        Ads Management
                                    </h2>
                                    <p className="text-secondaryTextColor text-sm font-medium mt-1">Configure your ad network scripts and placements</p>
                                </div>
                                <div className="flex items-center gap-4 bg-bgColor/50 p-2 rounded-2xl border border-secondaryTextColor/10">
                                    <span className="text-xs font-black uppercase tracking-widest text-secondaryTextColor ml-2">Show Ads Everywhere</span>
                                    <button onClick={() => setLocalSettings({ ...localSettings, showAds: !localSettings.showAds })} className={`w-14 h-8 rounded-full relative transition-all ${localSettings.showAds ? "bg-primaryBtn" : "bg-btnColor/20"}`}>
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${localSettings.showAds ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Global & Overlay Ads */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primaryBtn bg-primaryBtn/10 w-fit px-4 py-1.5 rounded-full mb-6 italic">Global & Overlay Scripts</h3>
                                    {[
                                        { k: localSettings.adPopup, s: (v) => setLocalSettings({ ...localSettings, adPopup: v }), l: "Pop-Under / Interstitial", p: "Best for high revenue Pop-Under scripts" },
                                        { k: localSettings.adSocialBar, s: (v) => setLocalSettings({ ...localSettings, adSocialBar: v }), l: "Social Bar / In-Page Push", p: "Small floating notification ad" },
                                        { k: localSettings.adSmartlink, s: (v) => setLocalSettings({ ...localSettings, adSmartlink: v }), l: "Smartlink / Direct Link", p: "Direct ad URL for specialized redirects" },
                                        { k: localSettings.adFooter, s: (v) => setLocalSettings({ ...localSettings, adFooter: v }), l: "Footer Injection", p: "Scripts to run at the end of the <body>" }
                                    ].map((ad, idx) => (
                                        <div key={idx} className="bg-bgColor/30 p-5 rounded-2xl border border-secondaryTextColor/5 space-y-2 group hover:border-primaryBtn/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black uppercase text-secondaryTextColor group-hover:text-primaryBtn transition-colors">{ad.l}</label>
                                                <span className="text-[9px] text-secondaryTextColor/40 font-medium italic">{ad.p}</span>
                                            </div>
                                            <textarea value={ad.k} onChange={(e) => ad.s(e.target.value)} placeholder="Paste <script> here..." className="w-full h-28 p-4 rounded-xl bg-bgColor/50 border border-secondaryTextColor/10 text-[11px] font-mono resize-none focus:border-primaryBtn transition-all" />
                                        </div>
                                    ))}
                                </div>

                                {/* Layout & Contextual Ads */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/10 w-fit px-4 py-1.5 rounded-full mb-6 italic">Layout & Contextual Banners</h3>
                                    {[
                                        { k: localSettings.adHomeTrending, s: (v) => setLocalSettings({ ...localSettings, adHomeTrending: v }), l: "Below Trending Slider", p: "Injected on Home page below Trending" },
                                        { k: localSettings.adHomeLatest, s: (v) => setLocalSettings({ ...localSettings, adHomeLatest: v }), l: "Below Latest Movies", p: "Injected on Home page below Latest" },
                                        { k: localSettings.adBanner, s: (v) => setLocalSettings({ ...localSettings, adBanner: v }), l: "Main Content Banner (468x60)", p: "Standard banner between sections" },
                                        { k: localSettings.adInFeed, s: (v) => setLocalSettings({ ...localSettings, adInFeed: v }), l: "Native In-Feed Ad", p: "Injected directly into item grids" },
                                        { k: localSettings.adSidebar, s: (v) => setLocalSettings({ ...localSettings, adSidebar: v }), l: "Sidebar (468x60)", p: "Appears on details pages" },
                                        { k: localSettings.adPlayerBottom, s: (v) => setLocalSettings({ ...localSettings, adPlayerBottom: v }), l: "Player Bottom Content", p: "Shown below the video player" }
                                    ].map((ad, idx) => (
                                        <div key={idx} className="bg-bgColor/30 p-5 rounded-2xl border border-secondaryTextColor/5 space-y-2 group hover:border-cyan-400/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black uppercase text-secondaryTextColor group-hover:text-cyan-400 transition-colors">{ad.l}</label>
                                                <span className="text-[9px] text-secondaryTextColor/40 font-medium italic">{ad.p}</span>
                                            </div>
                                            <textarea value={ad.k} onChange={(e) => ad.s(e.target.value)} placeholder="Paste <script> here..." className="w-full h-28 p-4 rounded-xl bg-bgColor/50 border border-secondaryTextColor/10 text-[11px] font-mono resize-none focus:border-cyan-400 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleSaveSettings}
                                    className="px-16 py-4 bg-primaryBtn text-white font-black text-lg rounded-2xl shadow-2xl shadow-primaryBtn/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 animate-bounce"
                                >
                                    <PiCheckBold className="text-2xl" />
                                    SAVE & DEPLOY ADS
                                </button>
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
                                            <button onClick={() => { setExistingMediaType("movie"); setExistingPage(1); setExistingContent([]); }} className={`px-3 py-1 text-[10px] font-bold rounded ${existingMediaType === "movie" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>Movies</button>
                                            <button onClick={() => { setExistingMediaType("tv"); setExistingPage(1); setExistingContent([]); }} className={`px-3 py-1 text-[10px] font-bold rounded ${existingMediaType === "tv" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>TV</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder={`Filter ${existingMediaType}s...`}
                                            className="flex-1 p-2 bg-bgColor rounded-lg text-xs border border-secondaryTextColor/10 outline-none focus:border-primaryBtn"
                                            value={existingContentQuery}
                                            onChange={(e) => setExistingContentQuery(e.target.value)}
                                        />
                                        <select
                                            onChange={(e) => {
                                                const sorted = [...existingContent].sort((a, b) => {
                                                    if (e.target.value === "views") return (b.views || 0) - (a.views || 0);
                                                    if (e.target.value === "rating") return (b.rating || 0) - (a.rating || 0);
                                                    return new Date(b.updated_on) - new Date(a.updated_on);
                                                });
                                                setExistingContent(sorted);
                                            }}
                                            className="bg-bgColor text-[10px] font-bold rounded-lg border border-secondaryTextColor/10 px-2 outline-none"
                                        >
                                            <option value="recent">Latest</option>
                                            <option value="views">Top Views</option>
                                            <option value="rating">Top Rated</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 h-[300px] md:h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                        {isFetchingExisting ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-secondaryTextColor/40">
                                                <div className="w-8 h-8 border-2 border-primaryBtn/20 border-t-primaryBtn rounded-full animate-spin mb-3"></div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Fetching Library...</p>
                                            </div>
                                        ) : (
                                            <>
                                                {existingContent.map(item => (
                                                    <div key={item._id || item.id} onClick={() => handleEditExisting(item.tmdb_id, item.media_type || existingMediaType, item.title)} className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${(editingMedia?.tmdb_id === item.tmdb_id && editingMedia?.title === item.title) ? "bg-primaryBtn/10 border-primaryBtn shadow-inner" : "hover:bg-btnColor/20 border-transparent"}`}>
                                                        <img src={item.poster} className="w-10 h-14 object-cover rounded shadow-sm" alt="" />
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold truncate">{item.title}</p>
                                                            <p className="text-[9px] text-secondaryTextColor uppercase font-mono">{item.release_year}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {existingContent.length === 0 && <div className="text-center py-20 text-secondaryTextColor italic">No results found.</div>}
                                            </>
                                        )}
                                    </div>

                                    {/* Library Pagination */}
                                    {existingTotal > 10 && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondaryTextColor/5">
                                            <button 
                                                disabled={existingPage === 1 || isFetchingExisting}
                                                onClick={() => setExistingPage(p => p - 1)}
                                                className="flex items-center gap-2 px-3 py-2 bg-bgColor rounded-lg border border-secondaryTextColor/10 disabled:opacity-30 hover:bg-btnColor/10 transition-all text-[10px] font-bold"
                                            >
                                                <PiCaretRightBold className="rotate-180" /> PREV
                                            </button>
                                            <div className="text-[10px] font-black uppercase tracking-tighter text-secondaryTextColor/60">
                                                Page {existingPage} / {Math.ceil(existingTotal / 10)}
                                            </div>
                                            <button 
                                                disabled={existingPage >= Math.ceil(existingTotal / 10) || isFetchingExisting}
                                                onClick={() => setExistingPage(p => p + 1)}
                                                className="flex items-center gap-2 px-3 py-2 bg-bgColor rounded-lg border border-secondaryTextColor/10 disabled:opacity-30 hover:bg-btnColor/10 transition-all text-[10px] font-bold"
                                            >
                                                NEXT <PiCaretRightBold />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Editor Panel - REWRITTEN FOR STABILITY */}
                            <div className="lg:col-span-8">
                                {editingMedia ? (
                                    <div className="bg-bgColorSecondary p-4 md:p-8 rounded-2xl border border-secondaryTextColor/20 shadow-xl h-full flex flex-col min-h-0 md:min-h-[700px]">
                                        <div className="flex justify-between items-start border-b border-secondaryTextColor/10 pb-6 mb-6">
                                            <div className="flex flex-col md:flex-row gap-6 w-full">
                                                <div className="relative group shrink-0 flex justify-center">
                                                    <img src={editingMedia.poster} className="w-24 md:w-32 h-36 md:h-48 object-cover rounded-xl shadow-lg border border-secondaryTextColor/10" alt="" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                        <PiPencilSimpleFill className="text-white text-2xl" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
                                                        <div className="flex-1 w-full md:pr-4">
                                                            <input
                                                                type="text"
                                                                value={editingMedia.title}
                                                                onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                                                                className="text-2xl md:text-3xl font-black tracking-tight bg-transparent border-none p-0 w-full focus:ring-0"
                                                            />
                                                            <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-4 mt-3">
                                                                <div className="flex flex-col">
                                                                    <label className="text-[8px] font-black text-secondaryTextColor/40 uppercase mb-1">Year</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingMedia.release_year}
                                                                        onChange={(e) => setEditingMedia({ ...editingMedia, release_year: e.target.value })}
                                                                        className="text-secondaryTextColor font-mono text-xs uppercase tracking-widest bg-btnColor/20 px-3 py-2 rounded-lg w-full md:w-20 outline-none"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <label className="text-[8px] font-black text-secondaryTextColor/40 uppercase mb-1">Rating</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingMedia.rating}
                                                                        onChange={(e) => setEditingMedia({ ...editingMedia, rating: e.target.value })}
                                                                        className="text-amber-500 font-bold text-xs bg-amber-500/10 px-3 py-2 rounded-lg w-full md:w-16 outline-none"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <label className="text-[8px] font-black text-secondaryTextColor/40 uppercase mb-1">Rip</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingMedia.rip || "Unknown"}
                                                                        onChange={(e) => setEditingMedia({ ...editingMedia, rip: e.target.value })}
                                                                        className="text-primaryBtn font-bold text-xs bg-primaryBtn/10 px-3 py-2 rounded-lg w-full md:w-24 outline-none focus:ring-1 focus:ring-primaryBtn"
                                                                        placeholder="Rip"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3 w-full md:flex-1 md:mt-0">
                                                                    <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase mb-1 block">Audio Languages (en, hi, ta...)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={typeof editingMedia.languages === 'string' ? editingMedia.languages : (editingMedia.languages?.join(', ') || '')}
                                                                        placeholder="e.g. English, Hindi"
                                                                        onChange={(e) => setEditingMedia({ ...editingMedia, languages: e.target.value })}
                                                                        className="w-full bg-btnColor/20 px-3 py-2 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-primaryBtn"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row md:flex-col lg:flex-row xl:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                                                            <button onClick={handleSaveMedia} className="flex-1 md:flex-none p-3 bg-primaryBtn text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-bold whitespace-nowrap"><PiCheckBold /> {isNewAddition ? "ADD TO DB" : "SAVE"}</button>
                                                            <button onClick={() => setEditingMedia(null)} className="p-3 bg-secondaryTextColor/10 text-secondaryTextColor rounded-xl hover:text-primaryTextColor transition-all flex items-center justify-center"><PiXBold /></button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={editingMedia.description}
                                                        onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                                                        className="mt-3 text-xs text-secondaryTextColor bg-transparent border-none p-0 resize-none h-24 md:h-16 focus:ring-0 scrollbar-none"
                                                        placeholder="Description..."
                                                    />
                                                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Poster URL</label>
                                                            <input
                                                                type="text"
                                                                value={editingMedia.poster || ""}
                                                                placeholder="Poster URL..."
                                                                onChange={(e) => setEditingMedia({ ...editingMedia, poster: e.target.value })}
                                                                className="w-full bg-btnColor/20 px-3 py-1.5 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primaryBtn"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Backdrop URL</label>
                                                            <input
                                                                type="text"
                                                                value={editingMedia.backdrop || ""}
                                                                placeholder="Backdrop URL..."
                                                                onChange={(e) => setEditingMedia({ ...editingMedia, backdrop: e.target.value })}
                                                                className="w-full bg-btnColor/20 px-3 py-1.5 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primaryBtn"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Manual Stream */}
                                                    <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-secondaryTextColor/10">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Manual Stream URL (Pop Player)</label>
                                                            <input
                                                                type="text"
                                                                value={editingMedia.manual_stream_url || ""}
                                                                placeholder="Embed link or direct .mp4 link..."
                                                                onChange={(e) => setEditingMedia({ ...editingMedia, manual_stream_url: e.target.value })}
                                                                className="w-full bg-btnColor/20 px-3 py-1.5 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primaryBtn"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
                                            {editingMedia.media_type === "movie" ? (
                                                <>
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
                                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                                            <div className="flex-1 sm:w-24">
                                                                                <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1">Quality</label>
                                                                                <input type="text" value={link.quality} onChange={(e) => { const m = { ...editingMedia }; m.telegram[idx].quality = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1">Size</label>
                                                                                <input type="text" value={link.size} onChange={(e) => { const m = { ...editingMedia }; m.telegram[idx].size = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]" />
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

                                                    <div className="space-y-6 mt-8 pt-8 border-t border-secondaryTextColor/10">
                                                        <div className="flex justify-between items-center bg-cyan-400/5 p-3 rounded-lg border-l-4 border-cyan-400">
                                                            <div className="flex flex-col">
                                                                <p className="text-xs uppercase font-black tracking-widest text-cyan-400">External Links</p>
                                                                <p className="text-[9px] text-cyan-400/50 font-bold uppercase tracking-tighter">GDrive, Mega, Terabox, etc.</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const m = { ...editingMedia };
                                                                    if (!m.external_links) m.external_links = [];
                                                                    m.external_links.push({ name: "", url: "" });
                                                                    setEditingMedia(m);
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-1.5 bg-cyan-400 text-bgColor rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-400/20"
                                                            >
                                                                <PiPlusBold /> Add Link
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {editingMedia.external_links?.map((link, idx) => (
                                                                <div key={idx} className="flex gap-2 items-center bg-bgColor/30 p-3 rounded-xl border border-secondaryTextColor/10">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Name (e.g. GDrive)" 
                                                                        value={link.name} 
                                                                        onChange={(e) => {
                                                                            const m = { ...editingMedia };
                                                                            m.external_links[idx].name = e.target.value;
                                                                            setEditingMedia(m);
                                                                        }} 
                                                                        className="w-1/3 bg-bgColor p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]"
                                                                    />
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Direct URL" 
                                                                        value={link.url} 
                                                                        onChange={(e) => {
                                                                            const m = { ...editingMedia };
                                                                            m.external_links[idx].url = e.target.value;
                                                                            setEditingMedia(m);
                                                                        }} 
                                                                        className="flex-1 bg-bgColor p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]"
                                                                    />
                                                                    <button 
                                                                        onClick={() => {
                                                                            const m = { ...editingMedia };
                                                                            m.external_links.splice(idx, 1);
                                                                            setEditingMedia(m);
                                                                        }}
                                                                        className="text-red-500/50 hover:text-red-500"
                                                                    >
                                                                        <PiTrashFill />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {(!editingMedia.external_links || editingMedia.external_links.length === 0) && (
                                                                <p className="text-[10px] text-secondaryTextColor/50 italic text-center py-4">No external links added.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
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
                                                                                        <div className="md:col-span-2">
                                                                                            <label className="text-[9px] font-black uppercase text-secondaryTextColor">Manual Stream URL (Pop Player)</label>
                                                                                            <input 
                                                                                                type="text" 
                                                                                                value={episode.manual_stream_url || ""} 
                                                                                                onChange={(e) => {
                                                                                                    const m = { ...editingMedia };
                                                                                                    const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                    const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                    m.seasons[sIdx].episodes[eIdx].manual_stream_url = e.target.value;
                                                                                                    setEditingMedia(m);
                                                                                                }} 
                                                                                                className="w-full bg-bgColor p-2.5 rounded-lg border border-secondaryTextColor/20 text-xs shadow-inner" 
                                                                                                placeholder="Embed or direct link..."
                                                                                            />
                                                                                        </div>
                                                                                        <div className="md:col-span-2 flex justify-end">
                                                                                            <button onClick={() => handleUpdateEpisode(season.season_number, episode.episode_number, { title: episode.title, episode_backdrop: episode.episode_backdrop, manual_stream_url: episode.manual_stream_url, external_links: episode.external_links || [] })} className="px-4 py-2 bg-primaryBtn text-white text-[10px] font-black rounded-lg hover:shadow-lg transition-all">SAVE METADATA</button>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-4 mt-6 pt-6 border-t border-secondaryTextColor/10">
                                                                                        <div className="flex justify-between items-center bg-cyan-400/5 p-3 rounded-lg border-l-4 border-cyan-400">
                                                                                            <div className="flex flex-col">
                                                                                                <p className="text-[10px] uppercase font-black tracking-widest text-cyan-400">External Links</p>
                                                                                                <p className="text-[8px] text-cyan-400/50 font-bold uppercase tracking-tighter">GDrive, Mega, etc.</p>
                                                                                            </div>
                                                                                            <button 
                                                                                                onClick={() => {
                                                                                                    const m = { ...editingMedia };
                                                                                                    const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                    const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                    if (!m.seasons[sIdx].episodes[eIdx].external_links) m.seasons[sIdx].episodes[eIdx].external_links = [];
                                                                                                    m.seasons[sIdx].episodes[eIdx].external_links.push({ name: "", url: "" });
                                                                                                    setEditingMedia(m);
                                                                                                }}
                                                                                                className="flex items-center gap-2 px-3 py-1 bg-cyan-400 text-bgColor rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-400/20"
                                                                                                >
                                                                                                <PiPlusBold /> Add Link
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            {episode.external_links?.map((link, lIdx) => (
                                                                                                <div key={lIdx} className="flex gap-2 items-center bg-bgColor/30 p-2 rounded-xl border border-secondaryTextColor/10">
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        placeholder="Name" 
                                                                                                        value={link.name} 
                                                                                                        onChange={(e) => {
                                                                                                            const m = { ...editingMedia };
                                                                                                            const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                            const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                            m.seasons[sIdx].episodes[eIdx].external_links[lIdx].name = e.target.value;
                                                                                                            setEditingMedia(m);
                                                                                                        }} 
                                                                                                        className="w-1/3 bg-bgColor p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]"
                                                                                                    />
                                                                                                    <input 
                                                                                                        type="text" 
                                                                                                        placeholder="Direct URL" 
                                                                                                        value={link.url} 
                                                                                                        onChange={(e) => {
                                                                                                            const m = { ...editingMedia };
                                                                                                            const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                            const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                            m.seasons[sIdx].episodes[eIdx].external_links[lIdx].url = e.target.value;
                                                                                                            setEditingMedia(m);
                                                                                                        }} 
                                                                                                        className="flex-1 bg-bgColor p-2 rounded-lg border border-secondaryTextColor/10 text-[10px]"
                                                                                                    />
                                                                                                    <button 
                                                                                                        onClick={() => {
                                                                                                            const m = { ...editingMedia };
                                                                                                            const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number);
                                                                                                            const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number);
                                                                                                            m.seasons[sIdx].episodes[eIdx].external_links.splice(lIdx, 1);
                                                                                                            setEditingMedia(m);
                                                                                                        }}
                                                                                                        className="text-red-500/50 hover:text-red-500"
                                                                                                    >
                                                                                                        <PiTrashFill />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))}
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
                                                                                                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                                                                                        <div className="w-full sm:w-24">
                                                                                                            <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Quality</label>
                                                                                                            <input type="text" value={link.quality} onChange={(e) => { const m = { ...editingMedia }; const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number); const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number); m.seasons[sIdx].episodes[eIdx].telegram[lIdx].quality = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 rounded p-1.5 text-[9px] text-center border border-secondaryTextColor/5" />
                                                                                                        </div>
                                                                                                        <div className="flex-1">
                                                                                                            <label className="text-[8px] font-black text-secondaryTextColor/50 uppercase ml-1 block">Size</label>
                                                                                                            <input type="text" value={link.size} onChange={(e) => { const m = { ...editingMedia }; const sIdx = m.seasons.findIndex(s => s.season_number === season.season_number); const eIdx = m.seasons[sIdx].episodes.findIndex(ep => ep.episode_number === episode.episode_number); m.seasons[sIdx].episodes[eIdx].telegram[lIdx].size = e.target.value; setEditingMedia(m); }} className="w-full bg-btnColor/30 rounded p-1.5 text-[9px] text-center border border-secondaryTextColor/5" />
                                                                                                        </div>
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

                                <div className="flex items-center gap-4 mb-6 ml-2">
                                    <div
                                        onClick={handleSelectAllOnPage}
                                        className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${isAllOnPageSelected ? "bg-primaryBtn border-primaryBtn shadow-[0_0_15px_rgba(236,72,153,0.4)]" : "bg-bgColor border-secondaryTextColor/30 hover:border-primaryBtn/50"}`}
                                    >
                                        {isAllOnPageSelected && <PiCheckBold className="text-white text-xs" />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-secondaryTextColor cursor-pointer select-none" onClick={handleSelectAllOnPage}>
                                        Select All on Page
                                        <span className="ml-2 text-[10px] opacity-50 font-medium">({manualFiles.length} files)</span>
                                    </span>
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
                                    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-bgColorSecondary/95 backdrop-blur-2xl border border-primaryBtn/30 p-4 px-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[600] flex items-center gap-6 animate-in slide-in-from-bottom-10">
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
                                {manualFiles.length === 0 && !isFetchingManual && (
                                    <div className="col-span-full py-32 text-center text-secondaryTextColor bg-bgColor/30 border-2 border-dashed border-secondaryTextColor/10 rounded-3xl">
                                        Great job! All files have been linked.
                                    </div>
                                )}

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
                                                        <button onClick={() => { setExistingMediaType("movie"); setExistingPage(1); setExistingContent([]); }} className={`px-4 py-1 text-[10px] font-black rounded ${existingMediaType === "movie" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>MOVIES</button>
                                                        <button onClick={() => { setExistingMediaType("tv"); setExistingPage(1); setExistingContent([]); }} className={`px-4 py-1 text-[10px] font-black rounded ${existingMediaType === "tv" ? "bg-primaryBtn text-white" : "text-secondaryTextColor"}`}>SERIES</button>
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
                                                    {isFetchingExisting ? (
                                                        <div className="col-span-full py-10 text-center text-secondaryTextColor font-bold text-xs animate-pulse">
                                                            Searching Database...
                                                        </div>
                                                    ) : existingContent.length === 0 ? (
                                                        <div className="col-span-full py-10 text-center text-secondaryTextColor font-bold text-xs bg-bgColor/30 border border-white/5 rounded-2xl">
                                                            No matching media found in database.
                                                        </div>
                                                    ) : (
                                                        existingContent.map(target => (
                                                            <div key={target._id} className="p-3 bg-bgColor hover:bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 group cursor-pointer transition-all" onClick={() => {
                                                                if (selectedManualFiles.length > 0) {
                                                                    handleBulkLink(target);
                                                                    return;
                                                                }
                                                                const qual = prompt("Quality (e.g. 1080p, 720p, 4K)?", linkingFile.detected?.quality || "1080p");
                                                                if (!qual) return;
                                                                const p = { 
                                                                    file_id: linkingFile._id, 
                                                                    tmdb_id: target.tmdb_id, 
                                                                    media_type: existingMediaType, 
                                                                    quality: qual, 
                                                                    title: target.title,
                                                                    doc_id: target._id || target.id
                                                                };
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
                                                        ))
                                                    )}
                                                </div>
                                                {/* Pagination for target database search */}
                                                {existingTotal > 10 && (
                                                    <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/5">
                                                        <button 
                                                            type="button"
                                                            disabled={existingPage === 1 || isFetchingExisting} 
                                                            onClick={() => setExistingPage(p => p - 1)} 
                                                            className="p-3 bg-bgColor/50 rounded-xl disabled:opacity-30 border border-white/10 hover:border-primaryBtn/50 transition-all text-white"
                                                        >
                                                            <PiCaretRightBold className="rotate-180" />
                                                        </button>
                                                        <span className="flex items-center text-xs font-black w-24 justify-center bg-bgColor rounded-xl border border-white/10 uppercase tracking-widest text-secondaryTextColor">
                                                            {existingPage} / {Math.ceil(existingTotal / 10)}
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            disabled={existingPage >= Math.ceil(existingTotal / 10) || isFetchingExisting} 
                                                            onClick={() => setExistingPage(p => p + 1)} 
                                                            className="p-3 bg-bgColor/50 rounded-xl disabled:opacity-30 border border-white/10 hover:border-primaryBtn/50 transition-all text-white"
                                                        >
                                                            <PiCaretRightBold />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isBulkLinking && (
                                            <div className="absolute inset-0 bg-bgColorSecondary/60 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                                                <div className="w-12 h-12 border-4 border-primaryBtn border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(249,115,22,0.3)]"></div>
                                                <div className="flex flex-col items-center">
                                                    <p className="text-lg font-black tracking-tighter text-primaryTextColor animate-pulse">Linking Repository</p>
                                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondaryTextColor/60">Processing {selectedManualFiles.length} Files</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-bgColor via-bgColor/90 to-transparent flex justify-center z-[400]">
                <div className="bg-bgColorSecondary/80 backdrop-blur-xl px-2 py-2 rounded-2xl md:rounded-3xl border border-secondaryTextColor/20 shadow-2xl flex items-center gap-2 w-full max-w-sm md:w-auto">
                    <button onClick={handleSaveSettings} className="flex-1 md:flex-none px-4 md:px-8 py-3 bg-primaryBtn text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-primaryBtn/30 hover:scale-105 active:scale-95 transition-all text-[10px] md:text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                        <PiCheckBold /> <span className="whitespace-nowrap">Publish Changes</span>
                    </button>
                    <div className="w-[1px] h-8 bg-secondaryTextColor/20 mx-1 md:mx-2" />
                    <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="p-3 text-secondaryTextColor hover:text-red-500 transition-colors" title="Lock & Logout"><PiXBold className="text-xl" /></button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
