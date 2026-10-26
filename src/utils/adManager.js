// ─────────────────────────────────────────────────────────────────────────────
// Adsterra Intelligent Frequency Capping & Monetization Manager
// Limits intrusive redirect/popunder ads to 2-3 times per user per 24 hours
// Maximizes ad network CPM while preventing user irritation.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "adsterra_frequency_tracker";
const SESSION_KEY = "adsterra_session_redirect_fired";
const MAX_REDIRECTS_PER_DAY = 2; // Maximum 2 times per day
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown between redirects

export const getAdsterraStats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastReset: Date.now(), lastTriggered: 0 };
    const data = JSON.parse(raw);
    const now = Date.now();
    // 24 hours rollover (86,400,000 ms)
    if (now - (data.lastReset || 0) > 24 * 60 * 60 * 1000) {
      const fresh = { count: 0, lastReset: now, lastTriggered: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch (e) {
    return { count: 0, lastReset: Date.now(), lastTriggered: 0 };
  }
};

export const canTriggerRedirectAd = () => {
  // Disallow more than 1 per user session
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    return false;
  }

  const { count, lastTriggered } = getAdsterraStats();
  if (count >= MAX_REDIRECTS_PER_DAY) {
    return false;
  }

  // Ensure minimum cooldown between ads
  if (lastTriggered && Date.now() - lastTriggered < COOLDOWN_MS) {
    return false;
  }

  return true;
};

export const recordRedirectAd = () => {
  try {
    const current = getAdsterraStats();
    const updated = {
      count: Math.min(MAX_REDIRECTS_PER_DAY, (current.count || 0) + 1),
      lastReset: current.lastReset || Date.now(),
      lastTriggered: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    sessionStorage.setItem(SESSION_KEY, "true");
    return updated.count;
  } catch (e) {
    return 1;
  }
};

export const getRemainingRedirectAds = () => {
  const { count } = getAdsterraStats();
  return Math.max(0, MAX_REDIRECTS_PER_DAY - count);
};
