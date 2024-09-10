import { Schema, model } from "mongoose";
import IGame from "../interfaces/IGameDB";

const gameSchema = new Schema<IGame>({
  id: { type: Number, required: true },
  gameState: { type: Object, required: true },
  hostSocketId: { type: String, required: true },
  playerQuestionnaires: [{ type: Object }],
  quizQuestions: [{ type: Object }],
  currentQuestionIndex: { type: Number, required: true },
  settings: { type: Object, required: true },
  customMode: { type: String }
});

const Game = model<IGame>("Game", gameSchema);
export default Game;
