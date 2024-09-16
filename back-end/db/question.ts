import Question from "../models/Question.ts";
import { IQuestionnaireQuestionDB, PlayerQuestionnaire } from "../interfaces/IQuestionnaireQuestionDB.ts";
import questionDb from "../db/question.ts";
import { shuffle } from "./utils.ts";
import { ObjectId } from "mongoose";

export default {
  getQuestions: async (): Promise<any> => {
    try {
      const questions = await Question.find();
      return questions;
    } catch (e) {
      console.error(`Issue getting questions: ${e}`);
      return [];
    }
  },

  getQuestionById: async (questionId: ObjectId): Promise<IQuestionnaireQuestionDB | null> => {
    try {
      const question: IQuestionnaireQuestionDB | null = await Question.findById(questionId);
      return question;
    } catch (e) {
      console.error(`Issue getting question: ${e}`);
      return null;
    }
  },

  addQuestion: async (question: IQuestionnaireQuestionDB): Promise<any> => {
    try {
      const newQuestion = new Question(question);
      const questionExists =
        (await Question.exists({ text: question.text })) || (await Question.exists({ quizText: question.quizText }));
      const nothingEmpty =
        question.text != "" &&
        question.quizText != "" &&
        question.fakeAnswers[0] != "" &&
        question.fakeAnswers[1] != "" &&
        question.fakeAnswers[2] != "" &&
        question.fakeAnswers[3] != "";
      if (!questionExists && nothingEmpty) {
        await newQuestion.save();
        return newQuestion;
      }
      return null;
    } catch (e) {
      console.error(`Issue adding question: ${e}`);
      return null;
    }
  },

  getRandomCustomQuestions: async (numQuestions: number, customQuestions: IQuestionnaireQuestionDB[]): Promise<any> => {
    try {
      let questions: IQuestionnaireQuestionDB[] = [];
      while (questions.length < numQuestions) {
        const index = Math.floor(Math.random() * customQuestions.length);
        questions.push(customQuestions[index]);
        customQuestions.splice(index, 1);
      }
      return questions;
    } catch (e) {
      console.error(`Issue getting random questions: ${e}`);
      return [];
    }
  },

  getQuestionsForQuiz: async (
    numQuestions: number,
    previouslyUsedQuestionQuizText: string[],
    customMode: string
  ): Promise<Array<IQuestionnaireQuestionDB>> => {
    let questions: Array<IQuestionnaireQuestionDB> = [];

    if (customMode !== "") {
      questions = await Question.find({ tags: customMode });
      if (questions.length < numQuestions) {
        questions = await Question.find();
      }
    } else {
      questions = await Question.find();
    }

    if (numQuestions + previouslyUsedQuestionQuizText.length < questions.length) {
      questions = questions.filter((q) => !previouslyUsedQuestionQuizText.includes(q.quizText));
    }

    shuffle(questions);
    return questions.slice(0, numQuestions);
  },

  getRandomQuestions: async (
    numQuestions: number,
    customQuestions: IQuestionnaireQuestionDB[],
    prioritizeCustomQs: boolean
  ): Promise<any> => {
    try {
      let questions;

      if (prioritizeCustomQs === true) {
        const length = numQuestions - customQuestions.length;
        if (customQuestions.length >= numQuestions) {
          questions = await questionDb.getRandomCustomQuestions(numQuestions, customQuestions);
        } else if (customQuestions.length != 0) {
          questions = await questionDb.getRandomCustomQuestions(customQuestions.length, customQuestions);
          const additionalQuestions = await Question.aggregate([{ $sample: { size: length } }]);
          additionalQuestions.forEach((question) => {
            questions.push(question);
          });
        } else {
          questions = await Question.aggregate([{ $sample: { size: numQuestions } }]);
        }
      } else {
        const allSize = await Question.count().count();
        const allQuestions = await Question.aggregate([{ $sample: { size: allSize } }]);
        customQuestions.forEach((question) => {
          allQuestions.push(question);
        });
        questions = await questionDb.getRandomCustomQuestions(numQuestions, allQuestions);
      }

      for (let i = 0; i < questions.length; i++) {
        for (let j = i + 1; j < questions.length; j++) {
          while (questions[i].text == questions[j].text) {
            questions[i] = await Question.aggregate([{ $sample: { size: 1 } }]);
          }
        }
      }
      return questions;
    } catch (e) {
      console.error(`Issue getting random questions: ${e}`);
      return [];
    }
  },

  deleteAllQuestions: async (): Promise<void> => {
    try {
      await Question.deleteMany({});
    } catch (e) {
      console.error(`Issue deleting all games: ${e}`);
    }
  },

  getQuestionnaireQuestionsText: async (questionnaire: PlayerQuestionnaire): Promise<string[]> => {
    const questionnaireQuestionsText: string[] = [];
    for (const pqq of questionnaire.questions) {
      const question = await questionDb.getQuestionById(pqq.questionId);
      if (question === null) {
        continue;
      }
      questionnaireQuestionsText.push(question.text);
    }
    return questionnaireQuestionsText;
  }
};
