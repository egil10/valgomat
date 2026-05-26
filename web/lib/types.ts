export type PartySlug =
  | "ap" | "frp" | "hoyre" | "sv" | "sp" | "rodt" | "mdg" | "krf" | "venstre";

export type Party = {
  name: string;
  abbr: string;
  color: string;
  logo: string;
  program_url: string;
};

export type Position = {
  score: number;
  quote: string;
  source_url?: string;
  page?: number | null;
};

export type Question = {
  id: string;
  topic: string;
  statement: string;
  axis: string;
  positions: Record<PartySlug, Position>;
};

export type Quiz = {
  version: string;
  scale: {
    min: number;
    max: number;
    labels: Record<string, string>;
  };
  parties: Record<PartySlug, Party>;
  questions: Question[];
};

export type UserAnswer = {
  questionId: string;
  /** 1–7 on the agree-disagree scale */
  score: number;
  /** 1=lite viktig, 2=viktig, 3=svært viktig */
  importance: number;
};

export type PartyMatch = {
  slug: PartySlug;
  party: Party;
  /** 0–100 percentage match */
  percent: number;
  /** Raw weighted distance (lower = better). Kept for debugging. */
  rawDistance: number;
};
