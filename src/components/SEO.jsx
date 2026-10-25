import React from "react";
import { Helmet } from "react-helmet-async";
import { useSettings } from "../context/SettingsContext";

export default function SEO({
  title,
  description,
  name,
  type = "website",
  keywords,
  link,
  image,
  rating,
  genres = [],
  mediaType
}) {
  const { settings } = useSettings();
  const siteName = settings?.siteName || name || "AnimeToon";
  const displayTitle = title ? `${title}` : `${siteName} - Best Tamil Dubbed Anime Streaming Website`;
  const canonicalUrl = link || (typeof window !== "undefined" ? window.location.href : "https://animetoon.in/");

  // Core High-Traffic Tamil Dubbed & Anime Streaming Keywords
  const defaultKeywords = "Tamil Dubbed Anime, Watch Tamil Dubbed Anime Online, Tamil Anime Stream, Tamil Cartoons Series, Regional Anime Dubs, Best Anime Streaming Website, Free Anime HD 1080p, AnimeToon Tamil";
  const enrichedKeywords = keywords 
    ? `${keywords}, ${defaultKeywords}` 
    : defaultKeywords;

  // Generate Schema.org JSON-LD structured data
  const isVideo = type?.includes("video") || mediaType === "movie" || mediaType === "tv";
  const schemaType = mediaType === "tv" || type?.includes("tv_show") ? "TVSeries" : "Movie";

  const jsonLdData = isVideo ? {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": title || siteName,
    "description": description || `Watch and download ${title || "anime"} Tamil dubbed online in HD on ${siteName}.`,
    "image": image || "https://animetoon.in/apple-touch-icon.png",
    "url": canonicalUrl,
    "genre": genres.length > 0 ? genres : ["Anime", "Animation", "Action"],
    "inLanguage": ["ta", "en", "te", "hi"],
    ...(rating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(rating),
        "bestRating": "10",
        "worstRating": "1",
        "ratingCount": "100"
      }
    } : {})
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={enrichedKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Facebook & Open Graph tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data (JSON-LD) */}
      {jsonLdData && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLdData)}
        </script>
      )}
    </Helmet>
  );
}
