import React from "react";
import { useWatchlist } from "../context/WatchlistContext";
import MovieCard from "../components/MovieCard";
import { PiHeartFill, PiTrashFill, PiFilmSlateBold } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";

export default function Watchlist() {
    const { watchlist, removeFromWatchlist } = useWatchlist();

    return (
        <div className="min-h-screen">
            <SEO title="My Watchlist" description="Keep track of movies and shows you want to watch." />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4 text-primaryTextColor">
                        <PiHeartFill className="text-primaryBtn animate-pulse" />
                        My Watchlist
                    </h1>
                    <p className="text-secondaryTextColor font-medium mt-2">
                        You have {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved for later.
                    </p>
                </div>
            </div>

            {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-btnColor/10 rounded-3xl border-2 border-dashed border-secondaryTextColor/10">
                    <div className="w-24 h-24 bg-primaryBtn/10 rounded-3xl flex items-center justify-center text-primaryBtn text-5xl mb-6">
                        <PiFilmSlateBold />
                    </div>
                    <h2 className="text-2xl font-bold text-primaryTextColor">Your watchlist is empty</h2>
                    <p className="text-secondaryTextColor mt-2 max-w-xs">
                        Start adding movies and shows to keep track of what you want to watch next!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    <AnimatePresence mode="popLayout">
                        {watchlist.map((item) => (
                            <motion.div 
                                key={item.tmdb_id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                                className="relative group"
                            >
                                <MovieCard movie={item} />
                                <button 
                                    onClick={() => removeFromWatchlist(item.tmdb_id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95 z-20"
                                    title="Remove from watchlist"
                                >
                                    <PiTrashFill />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
