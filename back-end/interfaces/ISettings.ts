import { IQuestionnaireQuestionDB } from "./IQuestionnaireQuestionDB";

export default interface ISettings {
  timePerQuestion: number;
  numQuestionnaireQuestions: number;
  numQuizQuestions: number;
  handsFreeMode: boolean;
  timePerAnswer: number;
  timePerLeaderboard: number;
  prioritizeCustomQs: boolean;
  customQuestions: IQuestionnaireQuestionDB[];
}
