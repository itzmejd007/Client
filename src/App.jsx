import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactGa from "react-ga";

// Components
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InstallPrompt from "./components/InstallPrompt";
import AdComponent from "./components/AdComponent";

// Lazy Load Pages for Performance
const Home = lazy(() => import("./pages/Home"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TvDetails = lazy(() => import("./pages/TvDetails"));
const Movies = lazy(() => import("./pages/Movies"));
const Series = lazy(() => import("./pages/Series"));
const SimilarMov = lazy(() => import("./pages/SimilarMov"));
const SimilarSeries = lazy(() => import("./pages/SimilarSeries"));
const SearResults = lazy(() => import("./pages/SearchResults"));
const Admin = lazy(() => import("./pages/Admin"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));
const Collections = lazy(() => import("./pages/Collections"));
const Collection = lazy(() => import("./pages/Collection"));
// Professional Loading Placeholder
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center animate-pulse">
    <div className="w-12 h-12 border-4 border-primaryBtn border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-secondaryTextColor text-xs font-black uppercase tracking-widest">Optimizing Experience...</p>
  </div>
);

function App() {
  ReactGa.initialize("G-JDFS7KRV40");
  
  useEffect(() => {
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <BrowserRouter>
      <InstallPrompt />
      <AdComponent type="adPopup" />
      <AdComponent type="adSocialBar" />
      <AdComponent type="adSmartlink" />
      <Nav />
      <div className="px-3 md:px-10 pt-16 md:pt-20 pb-10">
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
