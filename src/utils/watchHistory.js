export const addToRecentlyWatched = (item) => {
  if (!item || !item.tmdb_id) return;
  try {
    const list = JSON.parse(localStorage.getItem("recently_watched") || "[]");
    // Ensure media_type matches correctly
    const mediaType = item.media_type || (item.seasons ? "tv" : "movie");
    const filtered = list.filter(x => !(x.tmdb_id === item.tmdb_id && x.media_type === mediaType));
    filtered.unshift({
      tmdb_id: item.tmdb_id,
      media_type: mediaType,
      title: item.title,
      poster: item.poster,
      backdrop: item.backdrop,
      rating: item.rating,
      release_year: item.release_year,
      genres: item.genres,
      updated_on: item.updated_on
    });
    localStorage.setItem("recently_watched", JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.error("Error saving to recently watched:", e);
  }
};
