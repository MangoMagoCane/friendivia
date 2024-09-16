import { Schema, model } from "mongoose";
import { IQuestionnaireQuestionDB } from "../interfaces/IQuestionnaireQuestionDB";

const questionSchema = new Schema<IQuestionnaireQuestionDB>({
  text: { type: String, required: true },
  quizText: { type: String, required: true },
  tags: [{ type: String }],
  fakeAnswers: [{ type: String }]
});

const Question = model<IQuestionnaireQuestionDB>("Question", questionSchema);
export default Question;
