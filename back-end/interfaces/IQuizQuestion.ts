import { IQuizOption } from "./IQuizOption";

export interface IQuizQuestion {
  text: string;
  playerId: string;
  playerName: string;
  optionsList: IQuizOption[];
  correctAnswerIndex: number;
}
