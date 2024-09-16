import { Schema, model } from "mongoose";
import IGameDB from "../interfaces/IGameDB";

const gameSchema = new Schema<IGameDB>({
  id: { type: Number, required: true },
  gameState: { type: Object, required: true },
  hostSocketId: { type: String, required: true },
  playerQuestionnaires: [{ type: Object }],
  quizQuestions: [{ type: Object }],
  previouslyUsedQuestionQuizText: [{ type: String }],
  currentQuestionIndex: { type: Number, required: true },
  settings: { type: Object, required: true },
  customMode: { type: String }
});

const Game = model<IGameDB>("Game", gameSchema);
export default Game;
