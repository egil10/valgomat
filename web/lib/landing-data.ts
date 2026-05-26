/**
 * Small pre-baked data slice for the landing page so it doesn't have to
 * bundle the full questions.json. Regenerate with:
 *   python scripts/build_landing_samples.py
 */
import partiesJson from "@/public/data/parties.json";
import samplesJson from "@/public/data/landing-samples.json";

import type { Party, PartySlug } from "./types";

export const parties: Record<PartySlug, Party> = partiesJson as unknown as Record<PartySlug, Party>;

export type FeaturedSample = {
  id: string;
  topic: string;
  statement: string;
  scores: Record<PartySlug, number>;
};

export type CitationSample = {
  slug: PartySlug;
  partyAbbr: string;
  color: string;
  logo: string;
  topic: string;
  axis: string;
  quote: string;
  href: string;
};

type Samples = {
  totalQuestions: number;
  version: string;
  featured: FeaturedSample[];
  citations: CitationSample[];
};

const samples = samplesJson as unknown as Samples;
export const featuredSamples = samples.featured;
export const citationSamples = samples.citations;
export const totalQuestions = samples.totalQuestions;
export const dataVersion = samples.version;
