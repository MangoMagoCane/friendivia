import { model, Schema } from "mongoose";
import { IPlayer } from "../interfaces/models/IPlayer";

const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  questionnaireAnswers: [{ type: String }],
  quizGuesses: [{ type: Object }],
  score: { type: Number, required: true },
  gameId: { type: Number, required: true },
  playerState: { type: Object, required: true },
  playerSocketId: { type: String, required: true }
});

export const Player = model<IPlayer>("Player", playerSchema);
