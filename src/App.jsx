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
import InstallPrompt from "./components/InstallPrompt";
// import PrivateRoute from "./components/PrivateRoute";

// import { AuthProvider } from "./context/AuthContext";

import ReactGa from "react-ga";
import { useEffect, useState } from "react";
// import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router-dom";


import AdComponent from "./components/AdComponent";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="mov/:movieID/:slug?"
            element={<MovieDetails />}
          />
          <Route
            path="ser/:seriesID/:slug?"
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
      <AdComponent type="adFooter" />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
