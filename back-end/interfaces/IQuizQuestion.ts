import IQuizOption from "./IQuizOption";

export default interface IQuizQuestion {
  text: string;
  playerId: string;
  playerName: string;
  optionsList: IQuizOption[];
  correctAnswerIndex: number;
}
