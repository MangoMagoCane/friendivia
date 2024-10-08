import { Schema, model } from "mongoose";
import { IGame } from "../interfaces/models/IGame";

const gameSchema = new Schema<IGame>({
  id: { type: Number, required: true },
  gameState: { type: Object, required: true },
  hostSocketId: { type: String, required: true },
  playerQuestionnaires: [{ type: Object }],
  customPlayerQuestions: [{ type: String }],
  quizQuestions: [{ type: Object }],
  previouslyUsedQuestionQuizText: [{ type: String }],
  currentQuestionIndex: { type: Number, required: true },
  settings: { type: Object, required: true },
  customMode: { type: String }
});

export const Game = model<IGame>("Game", gameSchema);
