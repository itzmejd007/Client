// ─────────────────────────────────────────────────────────────────────────────
// Adsterra Intelligent Frequency Capping & Monetization Manager
// Limits intrusive redirect/popunder ads to 2-3 times per user per 24 hours
// Maximizes ad network CPM while preventing user irritation.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "adsterra_frequency_tracker";
const MAX_REDIRECTS_PER_DAY = 3; // 2-3 times per user per day

export const getAdsterraStats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastReset: Date.now() };
    const data = JSON.parse(raw);
    const now = Date.now();
    // 24 hours rollover (86,400,000 ms)
    if (now - (data.lastReset || 0) > 24 * 60 * 60 * 1000) {
      const fresh = { count: 0, lastReset: now };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return data;
  } catch (e) {
    return { count: 0, lastReset: Date.now() };
  }
};

export const canTriggerRedirectAd = () => {
  const { count } = getAdsterraStats();
  return count < MAX_REDIRECTS_PER_DAY;
};

export const recordRedirectAd = () => {
  try {
    const current = getAdsterraStats();
    const updated = {
      count: Math.min(MAX_REDIRECTS_PER_DAY, (current.count || 0) + 1),
      lastReset: current.lastReset || Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.count;
  } catch (e) {
    return 1;
  }
};

export const getRemainingRedirectAds = () => {
  const { count } = getAdsterraStats();
  return Math.max(0, MAX_REDIRECTS_PER_DAY - count);
};
