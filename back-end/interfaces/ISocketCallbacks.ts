import IPlayerScore from "./IPlayerScore";
import IQuizOption from "./IQuizOption";
import { IPlayer } from "./models/IPlayer";

export interface IPlayerLoadSuccess {
  questionnaireQuestionsText?: string[];
  quizQuestionOptionsText?: IQuizOption[];
  playerScores?: IPlayerScore[];
}

export interface IPlayersObject {
  gameId: number;
  players: IPlayer[];
}
