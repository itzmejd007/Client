// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD
// GitHub  : https://github.com/ThiruXD
// Portfolio: https://thiruxd.is-a.dev
// ─────────────────────────────────────────────────────────────────────────────
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactGa from "react-ga";
const RedirectSeries = lazyWithRetry(() =>
  import("./pages/RedirectSeries")
);

const RedirectMovie = lazyWithRetry(() =>
  import("./pages/RedirectMovie")
);

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Components
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AdBlockDetector from "./components/AdBlockDetector";
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
const ContentDelivery = lazyWithRetry(() => import("./pages/ContentDelivery"));
const DMCA = lazyWithRetry(() => import("./pages/DMCA"));

import FloatingTelegram from "./components/FloatingTelegram";

// Professional Loading Placeholder
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center animate-pulse">
    <div className="w-12 h-12 border-4 border-primaryBtn border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-secondaryTextColor text-xs font-black uppercase tracking-widest">Optimizing Experience...</p>
  </div>
);

import MaintenanceScreen from "./components/MaintenanceScreen";

function App() {
  const { settings, isBackendConnected, isCheckingBackend, retryConnection } = useSettings();
  const isAdmin = sessionStorage.getItem("adminAuth") === "true";
  
  // Show maintenance if backend is disconnected or if admin explicitly enabled maintenanceMode
  const isServerDown = isBackendConnected === false;
  const isMaintenance = (settings.maintenanceMode || isServerDown) && !isAdmin && window.location.pathname !== "/admin";

  ReactGa.initialize("G-JDFS7KRV40");

  useEffect(() => {
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);

  // Show page loader while actively performing initial connection check
  if (isCheckingBackend && isBackendConnected === null) {
    return <PageLoader />;
  }

  if (isMaintenance) {
    return (
      <MaintenanceScreen
        message={settings.maintenanceMessage}
        isServerDown={isServerDown}
        onRetry={retryConnection}
      />
    );
  }

  return (
    <BrowserRouter>
      <AdBlockDetector />
      <FloatingTelegram />
      <Nav />
      <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 md:px-10 pt-20 pb-20 md:pb-10 min-h-screen">
        <AdComponent type="adBanner" />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/content-delivery" element={<ContentDelivery />} />
            <Route path="/mov/:movieID" element={<RedirectMovie />} />
            <Route path="/mov/:movieID/:slug" element={<MovieDetails />} />
            <Route path="/ser/:seriesID" element={<RedirectSeries />} />
            <Route path="/ser/:seriesID/:slug" element={<TvDetails />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/Movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/Series" element={<Series />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:id" element={<Collection />} />
            <Route path="/dmca" element={<DMCA />} />
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
