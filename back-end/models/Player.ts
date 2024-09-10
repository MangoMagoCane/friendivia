import { model, Schema } from "mongoose";
import IPlayerDB from "../interfaces/IPlayerDB";

const playerSchema = new Schema<IPlayerDB>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  questionnaireAnswers: [{ type: String }],
  quizGuesses: [{ type: Object }],
  score: { type: Number, required: true },
  gameId: { type: Number, required: true },
  playerState: { type: Object, required: true },
  playerSocketId: { type: String, required: true }
});

const Player = model<IPlayerDB>("Player", playerSchema);
export default Player;
