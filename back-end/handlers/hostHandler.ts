import hostDb from "../db/host.ts";
import playerDb from "../db/player.ts";
import questionDb from "../db/question.ts";
import Game from "../models/Game.ts";
import * as hostHelpers from "./hostHelpers.ts";
import Player from "../models/Player.ts";
import IPlayerDB from "../interfaces/IPlayerDB.ts";
import PreGameSettings from "../models/PreGameSettings.ts";
import { valInArr } from "../../front-end/src/util.ts";
import ISettings from "../interfaces/ISettings.ts";
import { typedServer, SocketBackend } from "../interfaces/IServer.ts";

let PreSettingsId: string | null;
export default (io: typedServer, socket: SocketBackend) => {
  const onHostOpen = async (customMode: string) => {
    try {
      const newGameId = await hostDb.hostOpenGame(socket.id, customMode);
      socket.emit("host-open-success", newGameId);
    } catch (e) {
      socket.emit("host-open-error", e);
    }
  };

  const onHostLoad = async (gameId: number) => {
    if (gameId === -1) {
      return;
    }

    try {
      const gameData = await hostDb.getGameData(gameId);
      if (gameData === null) {
        return;
      }

      const quizQuestionGuesses = await playerDb.getPlayerGuessesForQuizQuestion(gameId, gameData.currentQuestionIndex);
      const playerScores = await playerDb.getPlayerScores(gameId);

      const playersInGame = await playerDb.getPlayers(gameId);
      await Game.updateOne(
        {
          id: gameId
        },
        {
          $set: {
            hostSocketId: socket.id
          }
        }
      );
      socket.emit("host-load-success", { ...gameData, quizQuestionGuesses, playerScores, playersInGame });
      socket.emit("players-updated", gameId, playersInGame);
    } catch (e) {
      socket.emit("host-load-error", e);
    }
  };

  const onSettingsLoad = async (preSettingsId: string) => {
    if (preSettingsId === "-1") {
      return;
    }

    try {
      const dataForSettings = await hostDb.getPreSettingsData(preSettingsId);
      if (dataForSettings === null) {
        return;
      }

      await PreGameSettings.updateOne(
        {
          id: preSettingsId
        },
        {
          $set: {
            hostSocketId: socket.id
          }
        }
      );
      socket.emit("settings-load-success", dataForSettings);
    } catch (e) {
      socket.emit("settings-load-error", e);
    }
  };

  const onDeletePlease = async () => {
    try {
      await playerDb.deleteAllPlayers();
      await hostDb.deleteAllGames();
      await questionDb.deleteAllQuestions();
      PreSettingsId = null;
    } catch (e) {
      console.error("failed to delete all");
    }
  };

  const onHostStart = async (gameId: number) => {
    try {
      await hostHelpers.hostGoPreQuestionnaire(gameId, io);
    } catch (e) {
      console.error("failed to start");
    }
  };

  const onHostEndGame = async (): Promise<void> => {
    try {
      const gameData = await hostDb.getGameDataFromSocketId(socket.id);
      if (gameData === null) {
        return;
      }

      await hostDb.deleteGame(gameData.id);
      socket.emit("host-game-ended");

      const allPlayersInGame: IPlayerDB[] = await playerDb.getPlayers(gameData.id);
      for (const player of allPlayersInGame) {
        await playerDb.deletePlayer(player.id);
        io.to(player.playerSocketId).emit("player-game-ended");
      }
    } catch (e) {
      console.error(`Failed to end game: ${e}`);
    }
  };

  const onNextFromQuizAnswer = async () => {
    const gameData = await hostDb.getGameDataFromSocketId(socket.id);
    if (gameData === null) {
      return;
    }

    const questionsRemaining = hostDb.questionsRemaining(gameData);

    if (questionsRemaining) {
      await hostHelpers.hostShowIntLeaderboard(gameData.id, io);
    } else {
      await hostHelpers.hostPreLeaderBoard(gameData.id, io);
    }
  };

  const onNextQuestion = async (gameId: number) => {
    try {
      hostHelpers.hostNextQuestionOrLeaderboard(gameId, io);
    } catch (e) {
      console.error(`Failed to move to next question: ${e}`);
    }
  };

  const onHostStartQuizTimer = async (gameId: number) => {
    try {
      socket.emit("start-timer-success");
      hostHelpers.hostStartQuizTimer(gameId, io);
    } catch (e) {
      console.error(`Failed to start timer: ${e}`);
    }
  };

  const onTimerSkip = async (gameId: number) => {
    try {
      hostHelpers.hostSkipTimer(gameId, io);
    } catch (e) {
      console.error(`Failed to skip timer: ${e}`);
    }
  };

  const allPlayersAnsweredQuestion = async (guess: number) => {
    try {
      const player = await playerDb.getPlayerBySocketId(socket.id);
      if (player === null) {
        throw Error(`Could not find player`);
      }

      const gameData = await hostDb.getGameData(player.gameId);
      if (gameData === null) {
        throw Error(`Game not found: ${player.gameId}`);
      }

      await playerDb.playerAnswerQuestion(player.id, guess, gameData);
      const allPlayersInGame = await Player.find({ gameId: gameData.id });
      let ContinueGame = true;

      for (const player of allPlayersInGame) {
        if (!valInArr(player.playerState.state, ["answered-quiz-question-waiting", "question-about-me"])) {
          ContinueGame = false;
          break;
        }
      }

      if (ContinueGame) {
        await hostHelpers.hostSkipTimer(gameData.id, io);
      }
    } catch (e) {
      console.error(`Failed to check if all players answered quiz question: ${e}`);
    }
  };

  const onHostSettings = async (gameId: number) => {
    try {
      await hostDb.setGameState(gameId, "settings");
      const currentGameData = await hostDb.getGameData(gameId);
      if (currentGameData === null) {
        return; // WILLNEEDTO IMRPOVe ERROR HANDLING!!!
      }
      const playersInGame = await playerDb.getPlayers(gameId);
      io.to(currentGameData?.hostSocketId ?? "").emit("host-next", { ...currentGameData, playersInGame });
    } catch (e) {
      console.error(`Failed to open host settings: ${e}`);
    }
  };

  const onHostBack = async (gameId: number, settingsData: ISettings) => {
    try {
      await hostDb.setGameState(gameId, "lobby");
      await hostDb.updateSettings(gameId, settingsData);
      const currentGameData = await hostDb.getGameData(gameId);
      if (currentGameData === null) {
        return; // WILLNEEDTO IMRPOVe ERROR HANDLING!!!
      }
      io.to(currentGameData?.hostSocketId ?? "").emit("host-next", currentGameData);
      const allPlayersInGame = await playerDb.getPlayers(gameId);
      io.to(currentGameData?.hostSocketId ?? "").emit("players-updated", gameId, allPlayersInGame);
    } catch (e) {
      console.error(`Failed to go back: ${e}`);
    }
  };

  const onHostPreSettings = async () => {
    try {
      if (!PreSettingsId) {
        const newSettingsId = await hostDb.hostOpenPreSettings(socket.id);
        PreSettingsId = newSettingsId;
      }
      await hostDb.setSettingsState(PreSettingsId, true);
      socket.emit("host-presettings-success", PreSettingsId);
    } catch (e) {
      socket.emit("host-presettings-error", e);
    }
  };

  const onHostPSBack = async (preSettingsId: string, preSettingsData: ISettings) => {
    try {
      await hostDb.hostClosePreSettings(preSettingsId, preSettingsData);
      const currentSettingsData = await hostDb.getPreSettingsData(preSettingsId);
      if (currentSettingsData === null) {
        return; // needs better handling
      }
      io.to(currentSettingsData?.hostSocketId ?? "").emit("presettings-close", currentSettingsData);
    } catch (e) {
      console.error(`Failed to go back: ${e}`);
    }
  };

  const onHostSkipQuestionnaire = async () => {
    try {
      const gameData = await hostDb.getGameDataFromSocketId(socket.id);
      if (gameData === null) {
        return;
      }

      const playersInGame = await playerDb.getPlayers(gameData.id);
      if (playersInGame.some((p) => p.playerState.state === "submitted-questionnaire-waiting")) {
        await hostHelpers.hostStartQuiz(gameData.id, io);
      }
    } catch (e) {
      console.error(`Error skipping past questionnaire: ${e}`);
    }
  };

  // const onPlayAgainWithSamePlayers = async (gameId: number) => {
  // try {
  //   await playerDb.resetPlayerScores(gameId);
  //   // socket.emit("reset-quiz-length");
  //   await Game.updateOne(
  //     { id: gameId },
  //     {
  //       $set: { currentQuestionIndex: -1 }
  //     }
  //   );
  //   const questionnaireQuestionsText = await hostDb.moveGameToQuestionnaire(gameId);
  //   await playerDb.updateAllPlayerStates(gameId, "filling-questionnaire", io, {
  //     playerScores: [],
  //     quizQuestionOptionsText: questionnaireQuestionsText
  //   });
  //   const playersInGame = await playerDb.getPlayers(gameId);
  //   playersInGame.map((p) => (p.quizGuesses = []));
  //   const gameData = await hostDb.getGameData(gameId);
  //   if (gameData === null) {
  //     throw Error("Bad game data");
  //   }
  //   io.to(gameData?.hostSocketId || "").emit("host-next", { ...gameData, playersInGame });
  // } catch (e) {
  //   console.error(`Failed to go to questionnaire: ${e}`);
  // }
  // };

  socket.on("host-open", onHostOpen);
  socket.on("host-load", onHostLoad);
  socket.on("settings-load", onSettingsLoad);
  socket.on("delete-please", onDeletePlease);
  socket.on("host-start", onHostStart);
  socket.on("host-end-game", onHostEndGame);
  socket.on("host-start-quiz-timer", onHostStartQuizTimer);
  socket.on("next-question", onNextQuestion);
  socket.on("host-skip-questionnaire", onHostSkipQuestionnaire);
  socket.on("next-from-quiz-answer", onNextFromQuizAnswer);
  socket.on("timer-skip", onTimerSkip);
  socket.on("check-all-players-answered", allPlayersAnsweredQuestion);
  socket.on("host-settings", onHostSettings);
  socket.on("host-back", onHostBack);
  socket.on("host-pre-settings", onHostPreSettings);
  socket.on("host-ps-back", onHostPSBack);
  // socket.on("play-again-with-same-players", onPlayAgainWithSamePlayers);
};
