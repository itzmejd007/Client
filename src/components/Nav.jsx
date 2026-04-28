// import Cookies from "universal-cookie";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { useSettings } from "../context/SettingsContext";

import { FiSearch } from "react-icons/fi";
import { VscClose } from "react-icons/vsc";
import { BiHomeAlt2, BiSolidMovie, BiStar, BiLibrary } from "react-icons/bi";

import { BsTv } from "react-icons/bs";
import { PiHeartFill } from "react-icons/pi";
import posterPlaceholder from "../assets/images/poster-placeholder.png";
import ThemeToggle from "./ThemeToggle";
import GlobalAd from "./GlobalAd";
// import UserInfoBtn from "./Logout";

export default function Nav() {
  const { settings } = useSettings();
  const SITENAME = settings.siteName;
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend

  // Query State
  const [query, setQuery] = React.useState("");
  const [debouncedVal, setDebouncedVal] = React.useState("");
  const [searcResult, setSearchResult] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [navStatus, setNavStatus] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showThemeToggle, setShowThemeToggle] = useState(() => {
    return localStorage.getItem("showThemeToggle") !== "false";
  });
  const location = useLocation();

  // Listen for admin toggle visibility changes (both same-tab and cross-tab/mobile wrapper)
  useEffect(() => {
    const handleStorageChange = () => {
      setShowThemeToggle(localStorage.getItem("showThemeToggle") !== "false");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeToggleVisibilityChanged", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeToggleVisibilityChanged", handleStorageChange);
    };
  }, []);

  // Update navStatus based on the current path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setNavStatus("Home");
    } else if (path.startsWith("/mov") || path.startsWith("/movies")) {
      setNavStatus("Movies");
    } else if (path.startsWith("/ser") || path.startsWith("/series")) {
      setNavStatus("Series");
    } else if (path.startsWith("/watchlist")) {
      setNavStatus("Watchlist");
    }
  }, [location.pathname]);

  // const isLoginPage = location.pathname === "/login"; 

  // Query Data Fetcher
  try {
    useEffect(() => {
      setIsLoading(true);
      fetch(`${BASE}/api/search/?query=${debouncedVal}&page=1`)
        .then((search_res) => search_res.json())
        .then((search_data) => {
          setSearchResult(search_data.results);

          setIsLoading(false);
        });
    }, [debouncedVal]);
  } catch (error) {
    <p className="main-search-result-container">{error}</p>;
  }

  // Debouncing Function
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(query);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query, 1000]);

  let closeSearchResultsDropDown = useRef();
  useEffect(() => {
    let closeSearchResultsDropdownHandler = (event) => {
      if (
        closeSearchResultsDropDown.current &&
        !closeSearchResultsDropDown.current.contains(event.target)
      ) {
        setDebouncedVal("");
      }
    };
    document.addEventListener("mousedown", closeSearchResultsDropdownHandler);
    return () => {
      document.removeEventListener(
        "mousedown",
        closeSearchResultsDropdownHandler
      );
    };
  }, []);

  // for Mobile Menu popup Closing
  const closeMobileMenu = useRef();
  useEffect(() => {
    let closeMobileMenuHandler = (event) => {
      if (
        closeMobileMenu.current &&
        !closeMobileMenu.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMobileMenuHandler);
    document.addEventListener("scroll", closeMobileMenuHandler);
    return () => {
      document.removeEventListener("mousedown", closeMobileMenuHandler);
      document.removeEventListener("scroll", closeMobileMenuHandler);

    };
  }, []);

  return (
    <>
      {/* Header Ad Placement */}
      <GlobalAd placement="header" />

      <div className="fixed flex items-center justify-between gap-3 z-20 bg-bgColor/60 backdrop-blur-md top-0 left-0 right-0 py-4 px-5 md:px-10 text-primaryTextColor">

        {/* LOGO / TITLE (Visible on all screens) */}
        <Link
          to="/"
          className="flex items-center gap-2 uppercase text-otherColor font-extrabold text-xl sm:text-2xl shrink-0 lg:w-1/4"
        >
          <p>{SITENAME}</p>
        </Link>

        {/* Navigations Large Screen*/}
        <nav className="hidden md:flex justify-center flex-1">
          <ul className="flex items-center gap-4 lg:gap-6">
            {[
              { icon: BiHomeAlt2, name: "Home" },
              { icon: BiSolidMovie, name: "Movies" },
              { icon: BsTv, name: "Series" },
              { icon: BiLibrary, name: "Collections" },
              { icon: PiHeartFill, name: "Watchlist" },
            ].map((navItem, index) => {
              return (
                <Link
                  key={index}
                  to={navItem.name === "Home" ? "/" : navItem.name.toLowerCase()}
                  className={
                    navStatus === navItem.name
                      ? "flex flex-col items-center justify-center w-14 lg:w-16 transition-all duration-300 ease-in-out text-otherColor scale-105"
                      : "flex flex-col items-center justify-center w-14 lg:w-16 transition-all duration-300 ease-in-out hover:text-otherColor hover:scale-105"
                  }
                  onClick={() => setNavStatus(navItem.name)}
                >
                  <li className="text-lg lg:text-xl list-none">
                    <navItem.icon />
                  </li>
                  <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] text-secondaryTextColor/80">
                    {navItem.name}
                  </p>
                </Link>
              );
            })}
          </ul>
        </nav>

        {/* Right Section: Search, Theme Toggle, Mobile Menu */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0 lg:w-1/4">

          {/* Mobile Search Icon */}
          <button
            className="md:hidden p-2 text-primaryTextColor hover:text-otherColor transition-colors"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <FiSearch size={22} />
          </button>

          {/* Search Form (Absolute dropdown on mobile, static flex on desktop) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className={`${mobileSearchOpen ? 'absolute top-full mt-2 left-4 right-4 z-50 flex shadow-xl border border-secondaryTextColor/20 rounded-xl bg-btnColor p-2' : 'hidden'} md:relative md:flex items-center w-full max-w-[250px] lg:max-w-full`}
            ref={closeSearchResultsDropDown}
          >
            <input
              type="text"
              name="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search ... "
              className={`py-3 px-4 md:px-10 outline-0 text-sm bg-btnColor/70 md:bg-btnColor/70 text-primaryTextColor placeholder-secondaryTextColor rounded-md w-full sm:text-base ${mobileSearchOpen && 'bg-transparent'}`}
            />
            <FiSearch className="hidden md:block absolute right-5 text-secondaryTextColor" />

            {/* SEARCH RESULTS CONTAINER */}
            {debouncedVal && (
              <div className="absolute flex flex-col items-center py-8 z-20 bg-btnColor w-full md:w-[120%] left-0 md:-left-10 max-h-[70dvh] justify-start overflow-y-scroll top-16 md:top-14 rounded-xl border border-secondaryTextColor/10 shadow-2xl">
                {/* Results Found Element */}
                {searcResult.length > 0 && !isLoading
                  ? searcResult.map((result) => {
                    return (
                      <Link
                        className="flex items-center w-full gap-4 transition-all duration-300 ease-in-out hover:bg-bgColor hover:text-primaryTextColor py-1 px-2 md:py-2 md:px-5 border-b border-secondaryTextColor/10 last:border-none"
                        onClick={() => {
                          setQuery("");
                          setMobileSearchOpen(false);
                        }}
                        to={
                          result.media_type === "movie"
                            ? `/mov/${result.tmdb_id}`
                            : `/ser/${result.tmdb_id}`
                        }
                        style={{ textDecoration: "none" }}
                        key={result.tmdb_id}
                      >
                        <div className="flex items-center w-[3.5rem] sm:w-[4rem] aspect-[9/13.5] object-cover bg-bgColor shrink-0 rounded-lg">
                          {result.poster ? (
                            <LazyLoadImage
                              alt={result.title}
                              src={result.poster}
                              effect="black-and-white"
                              className="object-cover shrink-0 bg-bgColor rounded-lg"
                            />
                          ) : (
                            <LazyLoadImage
                              alt={result.title}
                              src={posterPlaceholder}
                              className="object-cover shrink-0 bg-bgColor rounded-lg"
                            />
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <p className="line-clamp-1 text-sm lg:text-base">
                            {result.title}
                          </p>
                          <p className="line-clamp-1 w-full text-secondaryTextColor text-xs lg:text-sm">
                            {result.description}
                          </p>
                          {/* Year/Rating/Type */}
                          <div className="flex items-center gap-2 mt-2 text-secondaryTextColor text-[0.7rem]">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full dark:bg-bgColor bg-gray-900 text-otherColor ">
                              <BiStar className="mb-0.25 " />
                              {result.rating && (
                                <p className="">{(parseFloat(result.rating) || 0).toFixed(1)}</p>
                              )}
                            </div>
                            {result.release_year && (
                              <p className="">{result.release_year}</p>
                            )}
                            {result.media_type == "tv" ? (
                              <p className="uppercase ">tv</p>
                            ) : (
                              <p className="uppercase ">mov</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                  : // No results found
                  !isLoading && (
                    <p className="p-5 text-sm sm:text-base">
                      No results found for "{debouncedVal}".
                    </p>
                  )}

                {/* Loading Indicator Element */}
                {isLoading && (
                  <div className="p-5 flex justify-center content-center items-center ">
                    <div className="loader-search"></div>
                  </div>
                )}

                {/* View more results button */}
                {searcResult.length > 5 && !isLoading && (
                  <Link
                    className="bg-otherColor py-2 px-6 rounded-md min-w-[70%] text-sm mt-4  text-center"
                    to={`/search/${debouncedVal}`}
                    style={{ textDecoration: "none", color: "black" }}
                    onClick={() => { setQuery(""); setMobileSearchOpen(false); }}
                  >
                    <p>See More Results</p>
                  </Link>
                )}
              </div>
            )}
          </form>

          {/* Theme Toggle - Desktop Only */}
          {showThemeToggle && (
            <div className="hidden md:block shrink-0">
              <ThemeToggle />
            </div>
          )}

          {/* navigation Small Screen (Sandwich) */}
          <div className="relative block md:hidden shrink-0 ml-1">
            <div
              onClick={() => { setMobileMenuOpen(true); setMobileSearchOpen(false); }}
              className="flex flex-col gap-1.5 p-2 cursor-pointer"
            >
              <div className="h-[2px] w-6 bg-primaryTextColor transition-all rounded-full"></div>
              <div className="h-[2px] w-4 bg-primaryTextColor transition-all rounded-full"></div>
              <div className="h-[2px] w-6 bg-primaryTextColor transition-all rounded-full"></div>
            </div>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    type: "tween",
                    duration: 0.2,
                  }}
                  className="absolute w-56 sm:w-64 top-14 right-0 bg-btnColor p-6 rounded-3xl shadow-2xl border border-secondaryTextColor/20 z-50 origin-top-right"
                  ref={closeMobileMenu}
                >
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: BiHomeAlt2, name: "Home" },
                      { icon: BiSolidMovie, name: "Movies" },
                      { icon: BsTv, name: "Series" },
                      { icon: BiLibrary, name: "Collections" },
                      { icon: PiHeartFill, name: "Watchlist" },
                    ].map((navItem, index) => {
                      return (
                        <Link
                          key={index}
                          to={navItem.name === "Home" ? "/" : navItem.name.toLowerCase()}
                          className={
                            navStatus === navItem.name
                              ? "flex items-center gap-4 p-3 rounded-xl bg-otherColor/10 text-otherColor transition-all"
                              : "flex items-center gap-4 p-3 rounded-xl text-primaryTextColor hover:bg-bgColorSecondary transition-all"
                          }
                          onClick={() => {
                            setNavStatus(navItem.name);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <navItem.icon className="text-xl" />
                          <span className="text-sm font-medium">{navItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Theme Toggle inside Sandwich Menu */}
                  {showThemeToggle && (
                    <div className="mt-4 pt-4 border-t border-secondaryTextColor/20 flex flex-row items-center justify-between px-2">
                      <span className="text-sm font-medium text-secondaryTextColor">Theme</span>
                      <ThemeToggle />
                    </div>
                  )}

                  <VscClose
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute text-3xl p-1 text-secondaryTextColor hover:text-primaryTextColor hover:bg-bgColorSecondary rounded-lg top-4 right-4 cursor-pointer transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </>
  );
}
