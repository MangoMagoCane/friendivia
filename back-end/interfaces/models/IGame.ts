import mongoose from "mongoose";
import { IGameState } from "../IGameState";
import IQuizQuestion from "../IQuizQuestion";
import ISettings from "../ISettings";
import { PlayerQuestionnaire } from "./IQuestionnaireQuestion";

export interface IGame {
  _id: mongoose.Types.ObjectId;
  id: number;
  gameState: IGameState;
  hostSocketId: string;
  playerQuestionnaires: PlayerQuestionnaire[];
  quizQuestions: IQuizQuestion[];
  previouslyUsedQuestionQuizText: string[];
  currentQuestionIndex: number;
  settings: ISettings;
  customMode: string;
}
