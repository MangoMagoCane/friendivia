import { Schema } from "mongoose";

export interface IQuestionnaireQuestionDB {
  _id?: Schema.Types.ObjectId;
  text: string;
  quizText: string;
  tags: string[];
  fakeAnswers: string[];
}

export type PlayerQuestionnaireQuestion = {
  questionId: Schema.Types.ObjectId;
  subjectQuestion: boolean;
  answer: string;
};

export type PlayerQuestionnaire = {
  playerId: string;
  questions: PlayerQuestionnaireQuestion[];
};
