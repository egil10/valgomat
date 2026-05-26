import type { PartyMatch, PartySlug, Quiz, UserAnswer } from "./types";

/**
 * Match the user's answers against each party.
 *
 * Algorithm
 * ---------
 * For each question the user has actually answered, we compute
 *   |userScore − partyScore|   on the 1–7 scale.
 *
 * That gap is multiplied by the user's importance weight (1, 2, or 3), then
 * normalized by (max possible distance × max importance), so the result is
 * always 0–100. 100 means a perfect alignment across every weighted answer,
 * 0 means the worst possible disagreement on every one of them.
 *
 * We deliberately use plain L1 distance rather than dot product because the
 * 1–7 Likert is ordinal: a "Helt enig" vs. "Helt uenig" mismatch should
 * count for more than a "Helt enig" vs. "Enig" mismatch, but linearly.
 */
export function matchParties(quiz: Quiz, answers: UserAnswer[]): PartyMatch[] {
  const partySlugs = Object.keys(quiz.parties) as PartySlug[];

  const out: PartyMatch[] = partySlugs.map((slug) => {
    let weighted = 0;
    let maxWeighted = 0;
    for (const a of answers) {
      const q = quiz.questions.find((x) => x.id === a.questionId);
      if (!q) continue;
      const pos = q.positions[slug];
      if (!pos) continue;
      const w = a.importance;
      weighted += w * Math.abs(a.score - pos.score);
      maxWeighted += w * (quiz.scale.max - quiz.scale.min); // 6
    }
    const percent = maxWeighted === 0 ? 0 : 100 * (1 - weighted / maxWeighted);
    return {
      slug,
      party: quiz.parties[slug],
      percent,
      rawDistance: weighted,
    };
  });

  return out.sort((a, b) => b.percent - a.percent);
}

/** Per-question score for the breakdown — how close is each party to the user on this one Q. */
export function questionAlignment(quiz: Quiz, answer: UserAnswer): Array<{
  slug: PartySlug;
  diff: number;
  partyScore: number;
  quote: string;
}> {
  const q = quiz.questions.find((x) => x.id === answer.questionId);
  if (!q) return [];
  return (Object.keys(quiz.parties) as PartySlug[]).map((slug) => {
    const pos = q.positions[slug];
    return {
      slug,
      diff: Math.abs(answer.score - pos.score),
      partyScore: pos.score,
      quote: pos.quote,
    };
  });
}
