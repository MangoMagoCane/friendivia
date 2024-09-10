import IPlayer from "./IPlayerDB";
import IPlayerScore from "./IPlayerScore";
import IQuizOption from "./IQuizOption";

export interface IPlayerLoadSuccess {
  questionnaireQuestionsText?: string[];
  quizQuestionOptionsText?: IQuizOption[];
  playerScores?: IPlayerScore[];
}

export interface IPlayersObject {
  gameId: number;
  players: IPlayer[];
}
