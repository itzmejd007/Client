import React, { useState } from "react";

const presetColors = [
    // --- Modern Glassmorphism & Neon ---
    { name: "Cyberpunk Pink", value: "#ec4899", hover: "#db2777" },
    { name: "Neon Violet", value: "#8b5cf6", hover: "#7c3aed" },
    { name: "Electric Cyan", value: "#06b6d4", hover: "#0891b2" },
    { name: "Laser Lemon", value: "#facc15", hover: "#eab308" },
    { name: "Matrix Green", value: "#22c55e", hover: "#16a34a" },

    // --- Neubrutalism High Contrast ---
    { name: "Hyper Red", value: "#ef4444", hover: "#dc2828" },
    { name: "Abyss Black", value: "#1e293b", hover: "#0f172a" },
    { name: "Warning Yellow", value: "#eab308", hover: "#ca8a04" },
    { name: "Electric Indigo", value: "#4f46e5", hover: "#4338ca" },
    { name: "Safety Orange", value: "#f97316", hover: "#ea580c" },

    // --- Aurora Gradients & Pastels ---
    { name: "Aurora Mint", value: "#34d399", hover: "#10b981" },
    { name: "Dawn Pink", value: "#f472b6", hover: "#db2777" },
    { name: "Twilight Purple", value: "#a78bfa", hover: "#8b5cf6" },
    { name: "Dusk Blue", value: "#60a5fa", hover: "#3b82f6" },
    { name: "Morning Peach", value: "#fb923c", hover: "#f97316" },

    // --- Earth & Nature ---
    { name: "Forest Canopy", value: "#15803d", hover: "#166534" },
    { name: "Ocean Deep", value: "#0369a1", hover: "#075985" },
    { name: "Desert Sand", value: "#d97706", hover: "#b45309" },
    { name: "Volcanic Ash", value: "#4b5563", hover: "#374151" },
    { name: "Autumn Maple", value: "#b91c1c", hover: "#991b1b" },

    // --- Royal & Luxury ---
    { name: "Imperial Gold", value: "#ca8a04", hover: "#a16207" },
    { name: "Royal Sapphire", value: "#1d4ed8", hover: "#1e40af" },
    { name: "Velvet Plum", value: "#7e22ce", hover: "#6b21a8" },
    { name: "Emerald Crown", value: "#047857", hover: "#065f46" },
    { name: "Silver Silk", value: "#9ca3af", hover: "#6b7280" },

    // --- Cinematic & Theatrical ---
    { name: "Netflix Red", value: "#e50914", hover: "#b20710" },
    { name: "Hulu Green", value: "#1ce783", hover: "#14b365" },
    { name: "Prime Blue", value: "#00a8e1", hover: "#007dab" },
    { name: "HBO Purple", value: "#5c068c", hover: "#3f0460" },
    { name: "Disney Navy", value: "#113ccf", hover: "#0c288a" },

    // --- Monochromatic & Minimal ---
    { name: "Slate Minimal", value: "#64748b", hover: "#475569" },
    { name: "Zinc Muted", value: "#71717a", hover: "#52525b" },
    { name: "Stone Warm", value: "#78716c", hover: "#57534e" },
    { name: "Neutral Core", value: "#737373", hover: "#525252" },
    { name: "Pure Midnight", value: "#000000", hover: "#111111" },

    // --- Vibrant Pop ---
    { name: "Bubblegum", value: "#db2777", hover: "#be185d" },
    { name: "Mango Tango", value: "#ea580c", hover: "#c2410c" },
    { name: "Grape Soda", value: "#9333ea", hover: "#7e22ce" },
    { name: "Blue Raspberry", value: "#2563eb", hover: "#1d4ed8" },
    { name: "Lime Splash", value: "#9a3412", hover: "#7c2d12" },

    // --- Anime & Gaming ---
    { name: "Arcade Retro", value: "#fbbf24", hover: "#f59e0b" },
    { name: "Mecha White", value: "#f8fafc", hover: "#f1f5f9" },
    { name: "Shonen Orange", value: "#ffedd5", hover: "#fed7aa" },
    { name: "Sakura Blossom", value: "#fbcfe8", hover: "#f472b6" },
    { name: "Ninja Shadow", value: "#172554", hover: "#1e3a8a" },

    // --- Cyber & Outrun ---
    { name: "Outrun Sunset", value: "#f43f5e", hover: "#e11d48" },
    { name: "Synthwave Purple", value: "#c026d3", hover: "#a21caf" },
    { name: "Neon Cyan", value: "#2dd4bf", hover: "#14b8a6" },
    { name: "Plasma Blue", value: "#38bdf8", hover: "#0ea5e9" },
    { name: "Retro Grid", value: "#4ade80", hover: "#22c55e" },

    // --- Ethereal & Spectral ---
    { name: "Ghostly White", value: "#f0fdfa", hover: "#ccfbf1" },
    { name: "Spectral Blue", value: "#e0f2fe", hover: "#bae6fd" },
    { name: "Phantom Purple", value: "#f3e8ff", hover: "#e9d5ff" },
    { name: "Wispy Gray", value: "#f1f5f9", hover: "#e2e8f0" },
    { name: "Ethereal Green", value: "#dcfce7", hover: "#bbf7d0" },

    // --- Pastel Dreams ---
    { name: "Mint Cream", value: "#a7f3d0", hover: "#6ee7b7" },
    { name: "Lavender Blush", value: "#e879f9", hover: "#d946ef" },
    { name: "Peach Puff", value: "#fdba74", hover: "#fb923c" },
    { name: "Lemon Chiffon", value: "#fde047", hover: "#facc15" },
    { name: "Baby Blue", value: "#93c5fd", hover: "#60a5fa" },

    // --- Jewel Tones ---
    { name: "Ruby Red", value: "#9f1239", hover: "#881337" },
    { name: "Amethyst", value: "#6b21a8", hover: "#581c87" },
    { name: "Turquoise", value: "#0d9488", hover: "#0f766e" },
    { name: "Topaz", value: "#b45309", hover: "#92400e" },
    { name: "Onyx", value: "#18181b", hover: "#09090b" },

    // --- Base Default ---
    { name: "AnimeToon Default (Teal)", value: "#50B498", hover: "#2ca0a0" },
];

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem("adminAuth") === "true";
    });
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [buttonColor, setButtonColor] = useState(() => {
        return localStorage.getItem("buttonColor") || "#50B498";
    });
    const [hoverColor, setHoverColor] = useState(() => {
        return localStorage.getItem("buttonHoverColor") || "#2ca0a0";
    });
    const [defaultTheme, setDefaultTheme] = useState(() => {
        return localStorage.getItem("defaultTheme") || "system";
    });
    const [structuralTheme, setStructuralTheme] = useState(() => {
        return localStorage.getItem("structuralTheme") || "theme-default";
    });
    const [showThemeToggle, setShowThemeToggle] = useState(() => {
        return localStorage.getItem("showThemeToggle") !== "false"; // Default to true
    });

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

    const handleSave = async () => {
        localStorage.setItem("buttonColor", buttonColor);
        localStorage.setItem("buttonHoverColor", hoverColor);
        localStorage.setItem("defaultTheme", defaultTheme);
        localStorage.setItem("structuralTheme", structuralTheme);
        localStorage.setItem("showThemeToggle", showThemeToggle);

        document.documentElement.style.setProperty('--color-primary', buttonColor);
        document.documentElement.style.setProperty('--color-primary-hover', hoverColor);

        document.documentElement.classList.remove(
            'theme-glassmorphism',
            'theme-neubrutalism',
            'theme-aurora',
            'theme-neumorphism',
            'theme-retro-web',
            'theme-cyberpunk',
            'theme-material',
            'theme-ios-soft',
            'theme-brutalist-flat'
        );
        if (structuralTheme !== "theme-default") {
            document.documentElement.classList.add(structuralTheme);
        }

        // Dispatch custom event so Nav can update immediately
        window.dispatchEvent(new Event("themeToggleVisibilityChanged"));

        try {
            const BASE = import.meta.env.VITE_BASE_URL;
            const res = await fetch(`${BASE}/api/settings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    buttonColor,
                    buttonHoverColor: hoverColor,
                    defaultTheme,
                    structuralTheme,
                    showThemeToggle
                })
            });

            if (res.ok) {
                alert("Settings saved globally to the database!");
            } else {
                alert("Settings saved locally! (Backend API returned an error)");
            }
        } catch (error) {
            console.error("Failed to save to backend:", error);
            alert("Settings applied locally! (Make sure your backend has the /api/settings POST endpoint to save for all users).");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-primaryTextColor">
                <div className="bg-bgColorSecondary p-8 rounded-xl shadow-lg w-full max-w-sm backdrop-blur-md bg-opacity-80 border border-secondaryTextColor/20">
                    <h2 className="text-2xl mb-6 font-bold text-center">Admin Login</h2>
                    {loginError && <p className="text-red-500 text-sm mb-4 text-center">{loginError}</p>}
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-3 rounded bg-btnColor text-primaryTextColor border border-secondaryTextColor outline-none"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-3 rounded bg-btnColor text-primaryTextColor border border-secondaryTextColor outline-none"
                            required
                        />
                        <button type="submit" className="w-full bg-primaryBtn hover:bg-primaryBtnHower text-primaryTextColor py-3 rounded-lg font-bold transition-colors mt-2">
                            Secure Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-primaryTextColor py-12">
            <h1 className="text-4xl mb-8 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primaryBtn to-blue-500">
                Admin Control Center
            </h1>
            <div className="bg-bgColorSecondary p-8 rounded-2xl shadow-2xl w-full max-w-4xl backdrop-blur-xl bg-opacity-70 border border-otherColor/10">

                <div className="mb-8 border-b border-secondaryTextColor/20 pb-8">
                    <h2 className="text-2xl mb-2 text-primaryTextColor font-semibold">Brand Identity (50+ Palettes)</h2>
                    <p className="text-sm text-secondaryTextColor mb-6">Select from our premium curated palettes to instantly theme the platform.</p>

                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto p-2">
                        {presetColors.map((preset) => (
                            <div key={preset.name} className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => {
                                        setButtonColor(preset.value);
                                        setHoverColor(preset.hover);
                                    }}
                                    className="w-10 h-10 rounded-full border-[3px] shadow-md hover:scale-110 transition-transform hover:shadow-lg"
                                    style={{
                                        backgroundColor: preset.value,
                                        borderColor: buttonColor === preset.value ? '#ffffff' : 'transparent',
                                        boxShadow: buttonColor === preset.value ? `0 0 15px ${preset.value}` : 'none'
                                    }}
                                    title={preset.name}
                                />
                                <span className="text-[0.6rem] text-secondaryTextColor text-center leading-tight">{preset.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-secondaryTextColor font-medium">Custom Primary Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={buttonColor}
                                onChange={(e) => setButtonColor(e.target.value)}
                                className="h-12 w-16 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                            />
                            <input
                                type="text"
                                value={buttonColor}
                                onChange={(e) => setButtonColor(e.target.value)}
                                className="p-3 rounded-lg bg-btnColor text-primaryTextColor flex-1 border border-secondaryTextColor/30 outline-none focus:border-primaryBtn transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-secondaryTextColor font-medium">Custom Hover Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={hoverColor}
                                onChange={(e) => setHoverColor(e.target.value)}
                                className="h-12 w-16 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                            />
                            <input
                                type="text"
                                value={hoverColor}
                                onChange={(e) => setHoverColor(e.target.value)}
                                className="p-3 rounded-lg bg-btnColor text-primaryTextColor flex-1 border border-secondaryTextColor/30 outline-none focus:border-primaryBtn transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-10 flex flex-col gap-2 bg-btnColor/30 p-6 rounded-xl border border-secondaryTextColor/10">
                    <label className="text-primaryTextColor font-semibold text-lg">Default Site Experience</label>
                    <p className="text-sm text-secondaryTextColor mb-2">What happens when a new user visits the site?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-secondaryTextColor text-sm">Theme Mode</label>
                            <select
                                value={defaultTheme}
                                onChange={(e) => setDefaultTheme(e.target.value)}
                                className="p-3 rounded-lg bg-btnColor text-primaryTextColor border border-secondaryTextColor/30 outline-none focus:border-primaryBtn transition-colors"
                            >
                                <option value="system">Auto Match User's Device (System)</option>
                                <option value="dark">Force Dark Mode</option>
                                <option value="light">Force Light Mode</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-secondaryTextColor text-sm">Global Architecture</label>
                            <select
                                value={structuralTheme}
                                onChange={(e) => setStructuralTheme(e.target.value)}
                                className="p-3 rounded-lg bg-btnColor text-primaryTextColor border border-secondaryTextColor/30 outline-none focus:border-primaryBtn transition-colors"
                            >
                                <option value="theme-default">Default (Classic UI)</option>
                                <option value="theme-glassmorphism">Glassmorphism (Frosted, Soft)</option>
                                <option value="theme-neubrutalism">Neubrutalism (Sharp, High Contrast)</option>
                                <option value="theme-aurora">Aurora Gradients (Pill Radius, Glowing)</option>
                                <option value="theme-neumorphism">Neumorphism (Soft UI, Inset Feel)</option>
                                <option value="theme-cyberpunk">Cyberpunk (Glowing Borders, Sharp)</option>
                                <option value="theme-ios-soft">Apple iOS (Gentle Curves, Soft Shadows)</option>
                                <option value="theme-material">Material Design (Paper Elevation, Clean)</option>
                                <option value="theme-retro-web">Retro 90s (Outset Borders, Nostalgic)</option>
                                <option value="theme-brutalist-flat">Brutalist Flat (Zero Shadows, Bold Borders)</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-secondaryTextColor text-sm">Theme Toggle in Navigation</label>
                            <div className="flex items-center gap-3 mt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={showThemeToggle}
                                        onChange={(e) => setShowThemeToggle(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-secondaryTextColor/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryBtn"></div>
                                    <span className="ml-3 text-sm font-medium text-primaryTextColor">Show Toggle Button</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-secondaryTextColor/20">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-primaryBtn hover:bg-primaryBtnHower text-primaryTextColor sm:text-lg py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Publish Changes
                    </button>
                    <button
                        onClick={() => {
                            setIsAuthenticated(false);
                            sessionStorage.removeItem("adminAuth");
                        }}
                        className="px-8 bg-red-500/80 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                    >
                        Lock & Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
