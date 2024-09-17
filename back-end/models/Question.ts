import { Schema, model } from "mongoose";
import { IQuestionnaireQuestion } from "../interfaces/models/IQuestionnaireQuestion";

const questionSchema = new Schema<IQuestionnaireQuestion>({
  text: { type: String, required: true },
  quizText: { type: String, required: true },
  tags: [{ type: String }],
  fakeAnswers: [{ type: String }]
});

export const Question = model<IQuestionnaireQuestion>("Question", questionSchema);
