// ─────────────────────────────────────────────────────────────────────────────
// Author  : ThiruXD / AnimeToon
// Utility : Franchise Auto-Detection & Collection Generator
// ─────────────────────────────────────────────────────────────────────────────

// Known major franchise definitions with matching keywords and fallback covers
export const KNOWN_FRANCHISES = [
  {
    key: "naruto",
    title: "Naruto Universe",
    description: "Complete Naruto, Naruto Shippuden, Boruto series & movies collection",
    pattern: /\b(naruto|boruto)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/kV27j3Nz4d5z8u6mN3EJw9RiLg2.jpg",
  },
  {
    key: "ben10",
    title: "Ben 10 Universe",
    description: "Classic Ben 10, Alien Force, Ultimate Alien, Omniverse & movies",
    pattern: /\b(ben\s*10|ben10)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/gL8m6z4685kE8mXW3rLp8vQf2qD.jpg",
  },
  {
    key: "shinchan",
    title: "Shinchan Collection",
    description: "Crayon Shin-chan seasons, specials and blockbuster movies",
    pattern: /\b(shin\s*chan|shinchan|crayon\s*shin)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/8Z8G8aT1u7g2E8L0m1xZ2v3m4pQ.jpg",
  },
  {
    key: "dragonball",
    title: "Dragon Ball Collection",
    description: "Dragon Ball, DBZ, GT, Super, Super Hero and cinematic movies",
    pattern: /\b(dragon\s*ball|dbz|dragonball)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/dG6Zc6qJp3L0n8x9Z4w1x2v3m4p.jpg",
  },
  {
    key: "onepiece",
    title: "One Piece Universe",
    description: "One Piece anime series, OVAs, and theatrical film releases",
    pattern: /\b(one\s*piece|onepiece)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg",
  },
  {
    key: "demonslayer",
    title: "Demon Slayer (Kimetsu no Yaiba)",
    description: "Demon Slayer TV series, Mugen Train, Swordsmith & Hashira arcs",
    pattern: /\b(demon\s*slayer|kimetsu\s*no\s*yaiba)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/nTvM4mhqZlHIqvflzqQ998hoWd.jpg",
  },
  {
    key: "attackontitan",
    title: "Attack on Titan (Shingeki no Kyojin)",
    description: "All Attack on Titan seasons, final chapters, and movie recaps",
    pattern: /\b(attack\s*on\s*titan|shingeki\s*no\s*kyojin)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/tLkdCvfmTOvxirrpSaaOBJD7qsU.jpg",
  },
  {
    key: "jujutsukaisen",
    title: "Jujutsu Kaisen Collection",
    description: "Jujutsu Kaisen Season 1, Shibuya Incident, and Jujutsu Kaisen 0 movie",
    pattern: /\b(jujutsu\s*kaisen|jjk)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/gmECX1DvFnahQIhzptJ62OBDXTo.jpg",
  },
  {
    key: "bleach",
    title: "Bleach Universe",
    description: "Classic Bleach anime series, Thousand-Year Blood War & movies",
    pattern: /\b(bleach)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/2rmK7mnchsl9Yr37CEpmv72phO5.jpg",
  },
  {
    key: "sololeveling",
    title: "Solo Leveling Universe",
    description: "Solo Leveling episodes, Arise, and special editions",
    pattern: /\b(solo\s*leveling)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/geCRueV3ElhRTr03qJuFmI34Bs0.jpg",
  },
  {
    key: "pokemon",
    title: "Pokémon Universe",
    description: "Pokémon series, Indigo League, Horizons, and theatrical movies",
    pattern: /\b(pok[eé]mon)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/2Wvhj9e8JpX3Q1m8xZ2v3m4pQ0.jpg",
  },
  {
    key: "doraemon",
    title: "Doraemon Collection",
    description: "Doraemon classic series, Stand by Me, and adventure movies",
    pattern: /\b(doraemon)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/4k0Yq7Q0Z9m2xZ3v4m1pQ0Z9m2x.jpg",
  },
  {
    key: "myheroacademia",
    title: "My Hero Academia",
    description: "All My Hero Academia anime seasons, OVAs, and cinematic films",
    pattern: /\b(my\s*hero\s*academia|boku\s*no\s*hero)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/ivOLNsCw7JJepG92Op4F2qE2W45.jpg",
  },
  {
    key: "blackclover",
    title: "Black Clover Collection",
    description: "Black Clover TV series and Sword of the Wizard King movie",
    pattern: /\b(black\s*clover)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/uZUtoVChBGhNj9OfrM2LYpwBm8E.jpg",
  },
  {
    key: "deathnote",
    title: "Death Note Universe",
    description: "Death Note anime series and relight specials",
    pattern: /\b(death\s*note)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/iigTJJskR1PcjjGtdi9Lp9VzL9Y.jpg",
  },
  {
    key: "hunterxhunter",
    title: "Hunter x Hunter",
    description: "Complete Hunter x Hunter adventures, phantom rogue and final mission",
    pattern: /\b(hunter\s*x\s*hunter|hunterxhunter)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/5s15xG32XhRz1x0P4G32XhRz1x0.jpg",
  },
  {
    key: "jojo",
    title: "JoJo's Bizarre Adventure",
    description: "The generational epic of the Joestar bloodline across all parts",
    pattern: /\b(jojo|stardust\s*crusaders|golden\s*wind|stone\s*ocean)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/2fR4xL8u5Q1v3m4pQ0Z9m2xZ3v4.jpg",
  },
  {
    key: "conan",
    title: "Detective Conan",
    description: "Detective Conan / Case Closed anime series and theatrical films",
    pattern: /\b(detective\s*conan|case\s*closed)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/9l9y9xZ2v3m4pQ0Z9m2xZ3v4m1p.jpg",
  },
  {
    key: "sao",
    title: "Sword Art Online Saga",
    description: "Aincrad, Gun Gale, Alicization, and Progressive feature films",
    pattern: /\b(sword\s*art\s*online|sao|alicization|progressive)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/6x8u5Q1v3m4pQ0Z9m2xZ3v4m1pQ.jpg",
  },
  {
    key: "fma",
    title: "Fullmetal Alchemist",
    description: "Fullmetal Alchemist, Brotherhood, and Conqueror of Shamballa",
    pattern: /\b(fullmetal\s*alchemist|fma|brotherhood)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/2xZ3v4m1pQ0Z9m2xZ3v4m1pQ0Z9.jpg",
  },
  {
    key: "haikyuu",
    title: "Haikyu!! Universe",
    description: "Haikyu!! all seasons, OVAs, and The Dumpster Battle movie",
    pattern: /\b(haikyuu|haikyu)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/4m1pQ0Z9m2xZ3v4m1pQ0Z9m2xZ3.jpg",
  },
  {
    key: "chainsawman",
    title: "Chainsaw Man Universe",
    description: "Chainsaw Man series and Reze Arc movies",
    pattern: /\b(chainsaw\s*man)\b/i,
    cover: "https://image.tmdb.org/t/p/w1280/y29fR4xL8u5Q1v3m4pQ0Z9m2xZ3.jpg",
  },
];

/**
 * Detects franchise collections from a list of combined series and movies
 */
export function detectFranchiseCollections(allItems = []) {
  if (!Array.isArray(allItems) || allItems.length === 0) return [];

  const detectedCollections = [];

  // 1. Check known major franchises
  KNOWN_FRANCHISES.forEach((franchise) => {
    const matchingItems = allItems.filter((item) => {
      const title = (item.title || item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      return franchise.pattern.test(title) || franchise.pattern.test(desc);
    });

    if (matchingItems.length > 0) {
      // Pick best backdrop / thumbnail (prefer 1920x1080 high-res backdrop)
      const itemWithBackdrop = matchingItems.find(
        (m) => m.backdrop && typeof m.backdrop === "string" && m.backdrop.startsWith("http")
      );
      const itemWithPoster = matchingItems.find(
        (m) => m.poster && typeof m.poster === "string" && m.poster.startsWith("http")
      );

      const bestThumbnail =
        itemWithBackdrop?.backdrop ||
        matchingItems[0]?.backdrop ||
        itemWithPoster?.poster ||
        matchingItems[0]?.poster ||
        franchise.cover;

      detectedCollections.push({
        _id: `auto-${franchise.key}`,
        id: `auto-${franchise.key}`,
        slug: `auto-${franchise.key}`,
        title: franchise.title,
        description: franchise.description,
        thumbnail: bestThumbnail,
        isAuto: true,
        franchiseKey: franchise.key,
        items: matchingItems,
        populated_items: matchingItems,
        itemsCount: matchingItems.length,
      });
    }
  });

  return detectedCollections;
}
