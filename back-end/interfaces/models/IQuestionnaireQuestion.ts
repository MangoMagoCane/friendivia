import mongoose from "mongoose";

export interface IQuestionnaireQuestion {
  _id: mongoose.Types.ObjectId;
  text: string;
  quizText: string;
  tags: string[];
  fakeAnswers: string[];
}

export interface PlayerQuestionnaire {
  playerId: string;
  questions: PlayerQuestionnaireQuestion[];
}

export interface PlayerQuestionnaireQuestion {
  questionId: mongoose.Types.ObjectId;
  subjectQuestion: boolean;
  answer: string;
}
