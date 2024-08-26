import { IPlayerState } from "./IPlayerState";
import IGuess from "./IGuess";

export default interface IPlayer {
  name: string;
  id: string;
  questionnaireAnswers: string[];
  quizGuesses: IGuess[];
  score: number;
  gameId: number;
  playerState: IPlayerState;
  playerSocketId: string;
}
