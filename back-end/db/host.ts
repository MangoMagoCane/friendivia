import { IGame } from "../interfaces/models/IGame.ts";
import { GameState } from "../interfaces/IGameState.ts";
import { Game } from "../models/Game.ts";
import { PreGameSettings } from "../models/PreGameSettings.ts";
import * as utilDb from "../db/utils.ts";
import IQuizQuestion from "../interfaces/IQuizQuestion.ts";
import { playerDb } from "../db/player.ts";
import * as uuid from "uuid";
import { Player } from "../models/Player.ts";
import friendsQuestions from "./friendsTriviaQuestions.ts";
import { PlayerQuestionnaire } from "../interfaces/models/IQuestionnaireQuestion.ts";
import ISettings from "../interfaces/ISettings.ts";
import { IPreGameSettings } from "../interfaces/models/IPreGameSettings.ts";

export const hostDb = {
  getAllGameIds: async (): Promise<number[]> => {
    try {
      const allGames = await Game.find({});
      return allGames.map((g) => g.id);
    } catch (e) {
      console.error(`Issue getting all game ids: ${e}`);
      return [];
    }
  },

  getPreSettingsData: async (preSettingsId: string): Promise<IPreGameSettings | null> => {
    try {
      return await PreGameSettings.findOne({ id: preSettingsId }).lean();
    } catch (e) {
      console.error(`Issue getting settings data: ${e}`);
      throw Error("Failed to get settings data", { cause: e });
    }
  },

  hostOpenGame: async (socketId: string, customMode: string): Promise<number> => {
    try {
      const timePerQuestion = 15;
      const numQuestionnaireQuestions = 5;
      const numQuizQuestions = 5;
      const handsFreeMode = false;
      const timePerAnswer = 10;
      const timePerLeaderboard = 5;
      const prioritizeCustomQs = false;
      const customQuestions = [];
      const gameIdTryCount = 10001;

      let newId = -1;
      let i = 0;
      for (; i < gameIdTryCount; i++) {
        const testId = Math.floor(Math.random() * 9000 + 1000);
        const gameExists = await Game.exists({ id: testId });
        if (gameExists === null) {
          newId = testId;
          break;
        }
      }

      if (i === gameIdTryCount) {
        throw Error("could not create a gameId");
      }

      const newGame = new Game({
        id: newId,
        gameState: {
          state: "lobby",
          message: ""
        },
        hostSocketId: socketId,
        playerQuestionnaires: [],
        quizQuestions: [],
        previouslyUsedQuestionQuizText: [],
        currentQuestionIndex: -1,
        settings: {
          timePerQuestion: timePerQuestion,
          numQuestionnaireQuestions: numQuestionnaireQuestions,
          numQuizQuestions: numQuizQuestions,
          handsFreeMode: handsFreeMode,
          timePerAnswer: timePerAnswer,
          timePerLeaderboard: timePerLeaderboard,
          prioritizeCustomQs: prioritizeCustomQs,
          customQuestions: customQuestions
        },
        customMode: customMode
      });
      await newGame.save();

      return newId;
    } catch (e) {
      console.error(`Issue creating new game: ${e}`);
      return -1;
    }
  },

  getGameData: async (gameId: number): Promise<IGame | null> => {
    try {
      const data = await Game.findOne({ id: gameId }).lean();
      console.log(data);
      return data;

      // const gameDataPOJO = gameData?.toObject();
      // if (gameDataPOJO === undefined) {
      //   throw Error("Couldn't convert game data into POJO");
      // }
      // return gameDataPOJO;
    } catch (e) {
      console.error(`Issue getting game data: ${e}`);
      throw Error("Failed to get game data", { cause: e });
    }
  },

  getGameDataFromSocketId: async (socketId: string): Promise<IGame | null> => {
    try {
      const gameData: any = await Game.findOne({ hostSocketId: socketId });
      return gameData?.toObject();
    } catch (e) {
      console.error(`Issue getting game data from Host SocketId ${socketId}: ${e}`);
      return null;
    }
  },

  setGameState: async (gameId: number, newState: GameState): Promise<void> => {
    try {
      await Game.updateOne(
        { id: gameId },
        {
          $set: { "gameState.state": newState }
        }
      );
    } catch (e) {
      console.error(`Issue setting game state: ${e}`);
    }
  },

  moveGameToQuestionnaire: async (gameId: number): Promise<PlayerQuestionnaire[]> => {
    try {
      const gameData = await hostDb.getGameData(gameId);
      if (gameData === null) {
        return [];
      }

      const players = await playerDb.getPlayers(gameId);
      const [questionnaires, newQuizText] = await utilDb.createQuestionnairesForPlayers(
        players,
        gameData.previouslyUsedQuestionQuizText,
        gameData.customMode
      );
      await hostDb.setGameState(gameId, "questionnaire");

      await Game.updateOne(
        { id: gameId },
        {
          $set: {
            playerQuestionnaires: questionnaires,
            previouslyUsedQuestionQuizText: [...gameData.previouslyUsedQuestionQuizText, ...newQuizText]
          }
        }
      );

      return questionnaires;
    } catch (e) {
      console.error(`Issue moving game to questionnaire: ${e}`);
      return [];
    }
  },

  getPlayerQuestionnaires: async (gameId: number): Promise<PlayerQuestionnaire[]> => {
    try {
      const game = await hostDb.getGameData(gameId);
      if (game === null) {
        return [];
      }

      return game.playerQuestionnaires;
    } catch (e) {
      console.error(`Issue retrieving player questionnaires: ${e}`);
      return [];
    }
  },

  buildQuiz: async (game: IGame): Promise<IQuizQuestion[]> => {
    const quizQuestions: IQuizQuestion[] = await utilDb.createQuiz(game.playerQuestionnaires, game.customMode);
    await Game.updateOne(
      { id: game.id },
      {
        $set: { quizQuestions: quizQuestions }
      }
    );

    return quizQuestions;
  },

  questionsRemaining: (game: IGame): boolean => {
    const currentQuestionIndex = game.currentQuestionIndex;
    const nextQuestionIndex = currentQuestionIndex + 1;

    return nextQuestionIndex < game.quizQuestions.length;
  },

  nextQuestion: async (gameId: number): Promise<boolean> => {
    const currentGame = await hostDb.getGameData(gameId);
    if (currentGame === null) {
      return false;
    }

    if (hostDb.questionsRemaining(currentGame)) {
      await Game.updateOne(
        { id: gameId },
        {
          $set: { currentQuestionIndex: currentGame.currentQuestionIndex + 1 }
        }
      );

      return true;
    }

    return false;
  },

  deleteAllGames: async (): Promise<void> => {
    try {
      await Game.deleteMany({});
      await PreGameSettings.deleteMany({});
    } catch (e) {
      console.error(`Issue deleting all games: ${e}`);
    }
  },

  startDbFresh: async () => {
    try {
      await Game.deleteMany({});
      await Player.deleteMany({});
    } catch (e) {
      console.error(`Issue deleting all game data: ${e}`);
    }
  },

  deleteOneSettings: async (preSettingsId): Promise<void> => {
    try {
      await PreGameSettings.deleteOne({ id: preSettingsId });
    } catch (e) {
      console.error(`Issue deleting all games: ${e}`);
    }
  },

  deleteGame: async (gameId: number): Promise<void> => {
    try {
      await Game.deleteOne({ id: gameId });
    } catch (e) {
      console.error(`Issue deleting game: ${e}`);
    }
  },

  updateSettings: async (gameId: number, settingsData: ISettings): Promise<void> => {
    try {
      const timePerQuestion = settingsData.timePerQuestion;
      const numQuestionnaireQuestions = settingsData.numQuestionnaireQuestions;
      const numQuizQuestions = settingsData.numQuizQuestions;
      const handsFreeMode = settingsData.handsFreeMode;
      const timePerAnswer = settingsData.timePerAnswer;
      const timePerLeaderboard = settingsData.timePerLeaderboard;
      const prioritizeCustomQs = settingsData.prioritizeCustomQs;
      const customQuestions = settingsData.customQuestions;
      customQuestions.forEach((question) => {
        const somethingEmpty =
          question.text === "" ||
          question.quizText === "" ||
          question.fakeAnswers[0] === "" ||
          question.fakeAnswers[1] === "" ||
          question.fakeAnswers[2] === "" ||
          question.fakeAnswers[3] === "";
        if (somethingEmpty) {
          customQuestions.splice(customQuestions.indexOf(question), 1);
        }
      });

      await Game.updateOne(
        { id: gameId },
        {
          $set: {
            "settings.timePerQuestion": timePerQuestion,
            "settings.numQuestionnaireQuestions": numQuestionnaireQuestions,
            "settings.numQuizQuestions": numQuizQuestions,
            "settings.handsFreeMode": handsFreeMode,
            "settings.timePerAnswer": timePerAnswer,
            "settings.timePerLeaderboard": timePerLeaderboard,
            "settings.prioritizeCustomQs": prioritizeCustomQs,
            "settings.customQuestions": customQuestions
          }
        }
      );
    } catch (e) {
      console.error(`Issue updating settings: ${e}`);
    }
  },

  hostOpenPreSettings: async (socketId: string): Promise<string> => {
    try {
      const newId = `preSettings_${uuid.v4()}`;
      const newPreSettings = new PreGameSettings({
        id: newId,
        hostSocketId: socketId,
        settingsState: true,
        settings: {
          timePerQuestion: 15,
          numQuestionnaireQuestions: 5,
          numQuizQuestions: 5,
          handsFreeMode: false,
          timePerAnswer: 10,
          timePerLeaderboard: 5,
          prioritizeCustomQs: true,
          customQuestions: []
        }
      });

      await newPreSettings.save();
      return newId;
    } catch (e) {
      console.error(`Issue creating new game: ${e}`);
      return "-1";
    }
  },

  hostClosePreSettings: async (preSettingsId: string, settingsData: ISettings): Promise<void> => {
    try {
      const timePerQuestion = settingsData.timePerQuestion;
      const numQuestionnaireQuestions = settingsData.numQuestionnaireQuestions;
      const numQuizQuestions = settingsData.numQuizQuestions;
      const handsFreeMode = settingsData.handsFreeMode;
      const timePerAnswer = settingsData.timePerAnswer;
      const timePerLeaderboard = settingsData.timePerLeaderboard;
      const prioritizeCustomQs = settingsData.prioritizeCustomQs;
      const customQuestions = settingsData.customQuestions;
      customQuestions.forEach((question) => {
        const somethingEmpty =
          question.text === "" ||
          question.quizText === "" ||
          question.fakeAnswers[0] === "" ||
          question.fakeAnswers[1] === "" ||
          question.fakeAnswers[2] === "" ||
          question.fakeAnswers[3] === "";
        if (somethingEmpty) {
          customQuestions.splice(customQuestions.indexOf(question), 1);
        }
      });

      await PreGameSettings.updateOne(
        { id: preSettingsId },
        {
          $set: {
            settingsState: false,
            "settings.timePerQuestion": timePerQuestion,
            "settings.numQuestionnaireQuestions": numQuestionnaireQuestions,
            "settings.numQuizQuestions": numQuizQuestions,
            "settings.handsFreeMode": handsFreeMode,
            "settings.timePerAnswer": timePerAnswer,
            "settings.timePerLeaderboard": timePerLeaderboard,
            "settings.prioritizeCustomQs": prioritizeCustomQs,
            "settings.customQuestions": customQuestions
          }
        }
      );
    } catch (e) {
      console.error(`Issue updating pre-settings: ${e}`);
    }
  },

  setSettingsState: async (preSettingsId: string, newState: boolean): Promise<void> => {
    try {
      await PreGameSettings.updateOne(
        { id: preSettingsId },
        {
          $set: { settingsState: newState }
        }
      );
    } catch (e) {
      console.error(`Issue setting settings state: ${e}`);
    }
  },

  addTiebreakerQuestion: async (gameId: number): Promise<void> => {
    const randomFriendsQuestion = friendsQuestions[Math.floor(Math.random() * friendsQuestions.length)];

    try {
      await Game.updateOne(
        { id: gameId },
        {
          $push: { quizQuestions: randomFriendsQuestion }
        }
      );
    } catch (e) {
      console.error(`Issue adding tiebreaker question: ${e}`);
    }
  },

  resetGameStateToPreQuestionnaireState: async (gameId: number): Promise<void> => {
    try {
      await Game.updateOne({ id: gameId }, { $set: { quizQuestions: [], currentQuestionIndex: -1 } });
    } catch (e) {
      console.error(`Issue setting game state to pre-questionnaire state: ${e}`);
    }
  }
};
