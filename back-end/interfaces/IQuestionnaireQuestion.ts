import { Schema } from "mongoose";

export interface IQuestionnaireQuestion {
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
