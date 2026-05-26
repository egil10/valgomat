import quizData from "@/public/data/questions.json";
import type { Quiz } from "./types";

export const quiz: Quiz = quizData as unknown as Quiz;

export function getQuestionById(id: string) {
  return quiz.questions.find((q) => q.id === id);
}
