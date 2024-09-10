import { IPlayerState } from "./IPlayerState";
import IGuess from "./IGuess";
import mongoose from "mongoose";

export default interface IPlayerDB {
  _id?: mongoose.Types.ObjectId;
  id: string;
  name: string;
  questionnaireAnswers: string[];
  quizGuesses: IGuess[];
  score: number;
  gameId: number;
  playerState: IPlayerState;
  playerSocketId: string;
}
