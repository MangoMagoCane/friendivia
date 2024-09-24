import mongoose from "mongoose";
import { IGuess } from "../IGuess";
import { IPlayerState } from "../IPlayerState";

export interface IPlayer {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  questionnaireAnswers: string[];
  quizGuesses: IGuess[];
  score: number;
  gameId: number;
  playerState: IPlayerState;
  playerSocketId: string;
}
