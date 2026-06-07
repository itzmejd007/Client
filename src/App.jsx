// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactGa from "react-ga";

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Components
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InstallPrompt from "./components/InstallPrompt";
import AdComponent from "./components/AdComponent";

import { lazyWithRetry } from "./utils/lazyWithRetry";
import { useSettings } from "./context/SettingsContext";

// Lazy Load Pages with Auto-Retry on Chunk Failures
const Home = lazyWithRetry(() => import("./pages/Home"));
const MovieDetails = lazyWithRetry(() => import("./pages/MovieDetails"));
const TvDetails = lazyWithRetry(() => import("./pages/TvDetails"));
const Movies = lazyWithRetry(() => import("./pages/Movies"));
const Series = lazyWithRetry(() => import("./pages/Series"));
const SimilarMov = lazyWithRetry(() => import("./pages/SimilarMov"));
const SimilarSeries = lazyWithRetry(() => import("./pages/SimilarSeries"));
const SearResults = lazyWithRetry(() => import("./pages/SearchResults"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const Watchlist = lazyWithRetry(() => import("./pages/Watchlist"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFound"));
const Collections = lazyWithRetry(() => import("./pages/Collections"));
const Collection = lazyWithRetry(() => import("./pages/Collection"));

// Professional Loading Placeholder
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center animate-pulse">
    <div className="w-12 h-12 border-4 border-primaryBtn border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-secondaryTextColor text-xs font-black uppercase tracking-widest">Optimizing Experience...</p>
  </div>
);

const MaintenanceScreen = ({ message }) => (
  <div className="fixed inset-0 bg-bgColor z-[9999] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primaryBtn/10 rounded-full blur-[100px] animate-pulse"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primaryBtn/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

    <div className="relative z-10 max-w-2xl">
      <div className="w-24 h-24 bg-primaryBtn/10 rounded-3xl flex items-center justify-center text-primaryBtn text-5xl mb-8 mx-auto shadow-2xl shadow-primaryBtn/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v4M7 7h10" />
        </svg>
      </div>
      <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-primaryTextColor leading-none">Under <span className="text-primaryBtn">Maintenance</span></h1>
      <p className="text-lg md:text-xl text-secondaryTextColor font-medium leading-relaxed mb-10 px-4 md:px-0">
        {message || "We're currently performing some scheduled updates to improve your streaming experience. We'll be back online shortly!"}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="px-6 py-3 bg-bgColorSecondary rounded-2xl border border-secondaryTextColor/10 text-xs font-black uppercase tracking-widest text-secondaryTextColor">Status: Upgrading Core</div>
        <div className="px-6 py-3 bg-bgColorSecondary rounded-2xl border border-secondaryTextColor/10 text-xs font-black uppercase tracking-widest text-secondaryTextColor">ETA: Soon</div>
      </div>
    </div>
  </div>
);

function App() {
  const { settings } = useSettings();
  const isAdmin = sessionStorage.getItem("adminAuth") === "true";
  const isMaintenance = settings.maintenanceMode && !isAdmin && window.location.pathname !== "/admin";

  ReactGa.initialize("G-JDFS7KRV40");

  useEffect(() => {
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);

  if (isMaintenance) {
    return <MaintenanceScreen message={settings.maintenanceMessage} />;
  }

  return (
    <BrowserRouter>
      <InstallPrompt />
      <AdComponent type="adPopup" />
      <AdComponent type="adSocialBar" />
      <AdComponent type="adSmartlink" />
      <Nav />
      <div className="px-3 md:px-10 pt-20 md:pt-20 pb-10">
        <AdComponent type="adBanner" />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="mov/:movieID/:slug?" element={<MovieDetails />} />
            <Route path="ser/:seriesID/:slug?" element={<TvDetails />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:id" element={<Collection />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/similarMov/:movieID" element={<SimilarMov />} />
            <Route path="/similarSeries/:seriesID" element={<SimilarSeries />} />
            <Route path="/search/:searchResult" element={<SearResults />} />
          </Routes>
        </Suspense>
      </div>
      <AdComponent type="adFooter" />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
