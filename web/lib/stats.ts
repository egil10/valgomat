import { totalQuestions } from "./landing-data";

/**
 * Lightweight, build-time stats about the corpus we drive the matching from.
 * The page counts come from the meta.json files written by the partiprogram
 * scraper (sum of n_pages, n_chars). Politician/speech counts come from the
 * Stortinget + Regjeringen scrapers. We hard-bake them here rather than
 * shipping the meta files to the client.
 *
 * Re-run scrapers + bump these numbers as the corpus grows.
 */
export const dataStats = {
  parties: 9,
  programPages: 1002,
  programChars: 2_583_227,
  programSections: 2_250,
  representatives: 169,
  governmentSpeeches: 15,
  questions: totalQuestions,
  citations: totalQuestions * 9,
} as const;

export type StatsKey = keyof typeof dataStats;
