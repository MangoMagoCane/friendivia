import { IGameState } from "./IGameState";
import { PlayerQuestionnaire } from "./IQuestionnaireQuestion";
import IQuizQuestion from "./IQuizQuestion";
import ISettings from "./ISettings";

export default interface IGame {
  id: number;
  gameState: IGameState;
  hostSocketId: string;
  playerQuestionnaires: PlayerQuestionnaire[];
  quizQuestions: IQuizQuestion[];
  currentQuestionIndex: number;
  customMode: string;
  settings: ISettings;
}
