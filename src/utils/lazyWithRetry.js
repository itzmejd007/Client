import { lazy } from 'react';

/**
 * A wrapper for React.lazy that automatically retries once if a chunk fails to load.
 * This is useful for handling "Error loading dynamically imported module" errors
 * which typically happen after a new deployment when the browser has cached
 * an old version of the app referencing stale chunks.
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Log the error and reload the page
        console.warn('Chunk load failed. Force refreshing the page to fetch new assets...', error);
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }

      // If we already tried refreshing once and it still fails, throw the error
      throw error;
    }
  });
