import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
    const [watchlist, setWatchlist] = useState([]);

    useEffect(() => {
        const storedWatchlist = localStorage.getItem("movieStreamWatchlist");
        if (storedWatchlist) {
            try {
                setWatchlist(JSON.parse(storedWatchlist));
            } catch (e) {
                console.error("Failed to parse watchlist", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("movieStreamWatchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = (item) => {
        if (!watchlist.find((i) => i.tmdb_id === item.tmdb_id)) {
            setWatchlist([...watchlist, item]);
            toast.success(`"${item.title}" added to watchlist!`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        } else {
            toast.info(`"${item.title}" is already in your watchlist.`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
    };

    const removeFromWatchlist = (tmdb_id) => {
        const removedItem = watchlist.find(i => i.tmdb_id === tmdb_id);
        setWatchlist(watchlist.filter((item) => item.tmdb_id !== tmdb_id));
        if (removedItem) {
            toast.info(`"${removedItem.title}" removed from watchlist.`, {
                position: "bottom-right",
                autoClose: 2000,
            });
        }
    };

    const isInWatchlist = (tmdb_id) => {
        return watchlist.some((item) => item.tmdb_id === tmdb_id);
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};
