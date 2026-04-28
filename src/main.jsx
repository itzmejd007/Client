import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/system";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker
registerSW({ immediate: true })

import { SettingsProvider } from "./context/SettingsContext.jsx";
import { WatchlistProvider } from "./context/WatchlistContext.jsx";

import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <HelmetProvider>
        <SettingsProvider>
          <WatchlistProvider>
            <App />
          </WatchlistProvider>
        </SettingsProvider>
      </HelmetProvider>
    </NextUIProvider>
  </StrictMode>
);
