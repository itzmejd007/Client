import React, { useEffect, useState } from "react";
import { BiSun, BiMoon, BiDesktop } from "react-icons/bi";

const ThemeToggle = () => {
    // states: "dark", "light", "system"
    const [theme, setTheme] = useState("system");

    useEffect(() => {
        // Retrieve explicit user preference or default mode set by admin
        const savedTheme = localStorage.getItem("theme");
        const defaultTheme = localStorage.getItem("defaultTheme") || "system";

        let currentTheme;
        if (defaultTheme === "dark" || defaultTheme === "light") {
            currentTheme = defaultTheme;
        } else {
            currentTheme = savedTheme || "system";
        }

        setTheme(currentTheme);
        applyTheme(currentTheme);
    }, []);

    const applyTheme = (targetTheme) => {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (targetTheme === "dark" || (targetTheme === "system" && isSystemDark)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        let nextTheme = "system";
        // Cycle: system -> light -> dark -> system
        if (theme === "system") nextTheme = "light";
        else if (theme === "light") nextTheme = "dark";
        else if (theme === "dark") nextTheme = "system";

        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme);
    };

    const renderIcon = () => {
        if (theme === "dark") return <BiMoon size={22} className="text-secondaryTextColor hover:text-primaryTextColor transition-colors" />;
        if (theme === "light") return <BiSun size={22} className="text-yellow-500 hover:text-yellow-600 transition-colors" />;
        return <BiDesktop size={22} className="text-secondaryTextColor hover:text-primaryTextColor transition-colors" />;
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-300 hover:bg-bgColorSecondary flex items-center justify-center border border-secondaryTextColor/20 shadow-sm hover:shadow-md backdrop-blur-sm"
            aria-label={`Current theme is ${theme}. Click to toggle.`}
            title={`Toggle Theme (Current: ${theme})`}
        >
            {renderIcon()}
        </button>
    );
};

export default ThemeToggle;
