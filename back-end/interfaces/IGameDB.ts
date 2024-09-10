import mongoose from "mongoose";
import { IGameState } from "./IGameState";
import { PlayerQuestionnaire } from "./IQuestionnaireQuestion";
import IQuizQuestion from "./IQuizQuestion";
import ISettings from "./ISettings";

export default interface IGameDB {
  _id?: mongoose.Types.ObjectId;
  id: number;
  gameState: IGameState;
  hostSocketId: string;
  playerQuestionnaires: PlayerQuestionnaire[];
  quizQuestions: IQuizQuestion[];
  currentQuestionIndex: number;
  settings: ISettings;
  customMode: string;
}
