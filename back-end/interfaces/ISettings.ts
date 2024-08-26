import { IQuestionnaireQuestion } from "./IQuestionnaireQuestion";

export default interface ISettings {
  timePerQuestion: number;
  numQuestionnaireQuestions: number;
  numQuizQuestions: number;
  handsFreeMode: boolean;
  timePerAnswer: number;
  timePerLeaderboard: number;
  prioritizeCustomQs: boolean;
  customQuestions: IQuestionnaireQuestion[];
}
