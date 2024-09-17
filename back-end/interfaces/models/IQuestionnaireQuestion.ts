import mongoose from "mongoose";

export interface IQuestionnaireQuestion {
  _id: mongoose.Types.ObjectId;
  text: string;
  quizText: string;
  tags: string[];
  fakeAnswers: string[];
}

export type PlayerQuestionnaireQuestion = {
  questionId: mongoose.Types.ObjectId;
  subjectQuestion: boolean;
  answer: string;
};

export type PlayerQuestionnaire = {
  playerId: string;
  questions: PlayerQuestionnaireQuestion[];
};
