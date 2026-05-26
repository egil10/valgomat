"use client";

import { PartyLogo } from "@/components/PartyLogo";
import type { PartySlug, Question, Quiz } from "@/lib/types";

/**
 * Seven-column grid aligned with the EmojiScale. Under each emoji column,
 * the parties holding that score are stacked vertically. The user's chosen
 * column gets a subtle highlight. Replaces the horizontal spectrum so the
 * answer scale itself becomes the reveal axis.
 *
 * Height is reserved (min-h) so that the box doesn't grow or shrink between
 * questions, keeping the layout stable.
 */
export function PartyStack({
  quiz,
  question,
  userScore,
}: {
  quiz: Quiz;
  question: Question;
  userScore: number | null;
}) {
  const slugs = Object.keys(quiz.parties) as PartySlug[];

  // Group party slugs by score.
  const byScore = new Map<number, PartySlug[]>();
  for (let s = 1; s <= 7; s++) byScore.set(s, []);
  for (const slug of slugs) {
    const score = question.positions[slug].score;
    byScore.get(score)!.push(slug);
  }
  for (const arr of byScore.values()) {
    arr.sort((a, b) => quiz.parties[a].abbr.localeCompare(quiz.parties[b].abbr));
  }

  const revealed = userScore !== null;

  return (
    <div
      className="grid grid-cols-7 gap-1.5 sm:gap-2"
      aria-label="Partiposisjoner per score"
    >
      {Array.from({ length: 7 }).map((_, i) => {
        const score = i + 1;
        const list = byScore.get(score) ?? [];
        const isUserCol = userScore === score;
        return (
          <div
            key={score}
            className={
              isUserCol
                ? "flex min-h-[148px] flex-col items-center gap-1 rounded-2xl border border-ink/60 bg-ink/[0.05] px-1 pb-2 pt-1.5"
                : "flex min-h-[148px] flex-col items-center gap-1 rounded-2xl border border-transparent px-1 pb-2 pt-1.5"
            }
          >
            {!revealed ? (
              <span className="mt-2 text-[10px] tabular-nums text-ink/25">
                {score}
              </span>
            ) : (
              <>
                <span className="text-[10px] tabular-nums text-ink/40">
                  {score}
                </span>
                {list.map((slug) => {
                  const party = quiz.parties[slug];
                  return (
                    <div
                      key={slug}
                      title={`${party.name} — ${score}/7`}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <PartyLogo party={party} size={26} ring={false} />
                      <span className="text-[10px] font-medium text-ink/65">
                        {party.abbr}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
