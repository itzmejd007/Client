import React from "react";
import { Helmet } from "react-helmet-async";
import { useSettings } from "../context/SettingsContext";
export default function SEO({
  title,
  description,
  name,
  type,
  keywords,
  link,
  image,
}) {
  const { settings } = useSettings();
  const displayTitle = title || settings.siteName;
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={link} />
      {/* End standard metadata tags */}
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {/* End Facebook tags */}
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {/* End Twitter tags */}
    </Helmet>
  );
}

