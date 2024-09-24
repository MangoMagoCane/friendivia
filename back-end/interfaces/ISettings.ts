import { IQuestionnaireQuestion } from "./models/IQuestionnaireQuestion";

export interface ISettings {
  timePerQuestion: number;
  numQuestionnaireQuestions: number;
  numQuizQuestions: number;
  handsFreeMode: boolean;
  timePerAnswer: number;
  timePerLeaderboard: number;
  prioritizeCustomQs: boolean;
  customQuestions: IQuestionnaireQuestion[];
}
