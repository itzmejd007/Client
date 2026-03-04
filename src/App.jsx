import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TvDetails from "./pages/TvDetails";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import SimilarMov from "./pages/SimilarMov";
import SimilarSeries from "./pages/SimilarSeries";
import SearResults from "./pages/SearchResults";
import Admin from "./pages/Admin";
// import Token from "./pages/Token";
import NotFoundPage from "./pages/NotFound";
// import Login from "./pages/Login";

import Nav from "./components/Nav";
import Footer from "./components/Footer";
// import PrivateRoute from "./components/PrivateRoute";

// import { AuthProvider } from "./context/AuthContext";

import ReactGa from "react-ga";
import { useEffect, useState } from "react";
// import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router-dom";


function App() {
  ReactGa.initialize("G-JDFS7KRV40");
  useEffect(() => {
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);

  // Retrieve dynamic settings from localStorage initially (Cache)
  useEffect(() => {
    const applySettings = (color, hoverColor, structure) => {
      if (color) document.documentElement.style.setProperty('--color-primary', color);
      if (hoverColor) document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
      document.documentElement.classList.remove('theme-glassmorphism', 'theme-neubrutalism', 'theme-aurora', 'theme-neumorphism', 'theme-retro-web', 'theme-cyberpunk', 'theme-material', 'theme-ios-soft', 'theme-brutalist-flat');
      if (structure && structure !== "theme-default") {
        document.documentElement.classList.add(structure);
      }
    };

    // 1. Instantly apply locally cached settings (prevents waiting on API)
    const savedColor = localStorage.getItem("buttonColor");
    const savedHoverColor = localStorage.getItem("buttonHoverColor");
    const savedStructuralTheme = localStorage.getItem("structuralTheme");
    applySettings(savedColor, savedHoverColor, savedStructuralTheme);

    // 2. Fetch global settings from Backend to ensure this syncs across ALL devices
    const BASE = import.meta.env.VITE_BASE_URL;
    fetch(`${BASE}/api/settings`)
      .then(res => {
        if (!res.ok) throw new Error("Settings endpoint missing");
        return res.json();
      })
      .then(data => {
        // Apply global settings to Document
        applySettings(data.buttonColor, data.buttonHoverColor, data.structuralTheme);

        // Save the global settings strictly into localStorage so it caches for next load!
        if (data.buttonColor) localStorage.setItem("buttonColor", data.buttonColor);
        if (data.buttonHoverColor) localStorage.setItem("buttonHoverColor", data.buttonHoverColor);
        if (data.defaultTheme) localStorage.setItem("defaultTheme", data.defaultTheme);
        if (data.structuralTheme) localStorage.setItem("structuralTheme", data.structuralTheme);
        if (data.showThemeToggle !== undefined) localStorage.setItem("showThemeToggle", data.showThemeToggle);

        // Dispatch event just in case Nav is already mounted
        window.dispatchEvent(new Event("themeToggleVisibilityChanged"));

        // Also handle index.html's logic for light/dark default switch here if needed
        if (data.defaultTheme === 'dark' && !localStorage.getItem("theme")) {
          document.documentElement.classList.add('dark');
        } else if (data.defaultTheme === 'light' && !localStorage.getItem("theme")) {
          document.documentElement.classList.remove('dark');
        }
      })
      .catch(err => {
        console.log("No global settings found from backend API, relying on local settings cache.");
      });

  }, []);

  return (

    <BrowserRouter>
      <Nav />
      <div className="p-3 md:p-10">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="mov/:movieID"
            element={<MovieDetails />}
          />
          <Route
            path="ser/:seriesID"
            element={<TvDetails />}
          />
          <Route
            path="/Movies"
            element={<Movies />}
          />
          <Route
            path="/Series"
            element={<Series />}
          />
          <Route
            path="*"
            element={<NotFoundPage />}
          />
          <Route
            path="/similarMov/:movieID"
            element={<SimilarMov />}
          />
          <Route
            path="/similarSeries/:seriesID"
            element={<SimilarSeries />}
          />

          <Route
            path="/search/:searchResult"
            element={<SearResults />}
          />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
