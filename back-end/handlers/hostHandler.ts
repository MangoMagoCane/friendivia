import { Server, Socket } from "socket.io";
import hostDb from "../db/host.ts";
import playerDb from "../db/player.ts";
import questionDb from "../db/question.ts";
import { PlayerState } from "../interfaces/IPlayerState.ts";
import IGame from "../interfaces/IGame.ts";
import IPreGameSettings from "../interfaces/IPreGameSettings.ts";
import Game from "../models/Game.ts";
import * as hostHelpers from "./hostHelpers.ts";
import Player from "../models/Player.ts";
import IPlayer from "../interfaces/IPlayer.ts";
import PreGameSettings from "../models/PreGameSettings.ts";
import { valInArr } from "../../front-end/src/util.ts";

let PreSettingsId;
export default (io: Server, socket: Socket) => {
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
      const dataForGame: any = await hostDb.getGameData(gameId);
      if (dataForGame) {
        const data = dataForGame;
        const quizQuestionGuesses = await playerDb.getPlayerGuessesForQuizQuestion(gameId, data.currentQuestionIndex);
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
        socket.emit("host-load-success", { ...data, quizQuestionGuesses, playerScores, playersInGame });
        socket.emit("players-updated", {
          gameId: gameId,
          players: playersInGame
        });
      }
    } catch (e) {
      socket.emit("host-load-error", e);
    }
  };

  const onSettingsLoad = async (preSettingsId: string) => {
    if (preSettingsId === "-1") {
      return;
    }

    try {
      const dataForSettings: any = await hostDb.getPreSettingsData(preSettingsId);
      if (dataForSettings) {
        const data = dataForSettings;
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
        socket.emit("settings-load-success", data);
      }
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

  const onHostStart = async (gameId) => {
    try {
      await hostHelpers.hostGoPreQuestionnaire(gameId, io);
    } catch (e) {
      console.error("failed to start");
    }
  };

  const onHostEndGame = async () => {
    try {
      const gameData: IGame | null = await hostDb.getGameDataFromSocketId(socket.id);
      if (!gameData) {
        return;
      }

      await hostDb.deleteGame(gameData.id);
      socket.emit("host-game-ended");

      const allPlayersInGame: IPlayer[] = await playerDb.getPlayers(gameData.id);
      for (const player of allPlayersInGame) {
        await playerDb.deletePlayer(player.id);
        io.to(player.playerSocketId).emit("player-game-ended");
      }
    } catch (e) {
      console.error(`Failed to end game: ${e}`);
    }
  };

  const onNextFromQuizAnswer = async () => {
    const gameData: IGame | null = await hostDb.getGameDataFromSocketId(socket.id);
    if (!gameData) {
      return;
    }

    const questionsRemaining = await hostDb.questionsRemaining(gameData);

    if (questionsRemaining) {
      await hostHelpers.hostShowIntLeaderboard(gameData.id, io);
    } else {
      await hostHelpers.hostPreLeaderBoard(gameData.id, io);
    }
  };

  const onNextQuestion = async (gameId) => {
    try {
      hostHelpers.hostNextQuestionOrLeaderboard(gameId, io);
    } catch (e) {
      console.error(`Failed to move to next question: ${e}`);
    }
  };

  const onHostStartQuizTimer = async (gameId) => {
    try {
      socket.emit("start-timer-success");
      hostHelpers.hostStartQuizTimer(gameId, io);
    } catch (e) {
      console.error(`Failed to start timer: ${e}`);
    }
  };

  const onTimerSkip = async (gameId) => {
    try {
      hostHelpers.hostSkipTimer(gameId, io);
    } catch (e) {
      console.error(`Failed to skip timer: ${e}`);
    }
  };

  const allPlayersAnsweredQuestion = async (guess: number) => {
    try {
      const player: IPlayer = await playerDb.getPlayerBySocketId(socket.id);
      const gameData: IGame | null = await hostDb.getGameData(player.gameId);
      if (gameData === null) {
        throw `Game not found: ${player.gameId}`;
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

  const onHostSettings = async (gameId = null) => {
    try {
      if (gameId != null) {
        await hostDb.setGameState(gameId, "settings");
        const currentGameData: IGame | null = await hostDb.getGameData(gameId);
        let playersInGame = await playerDb.getPlayers(gameId);
        io.to(currentGameData?.hostSocketId ?? "").emit("host-next", { ...currentGameData, playersInGame });
      } else {
        console.error(`Failed to find game for Host Settings`);
      }
    } catch (e) {
      console.error(`Failed to open host settings: ${e}`);
    }
  };

  const onHostBack = async (gameId, settingsData) => {
    try {
      await hostDb.setGameState(gameId, "lobby");
      await hostDb.updateSettings(gameId, settingsData);
      const currentGameData: IGame | null = await hostDb.getGameData(gameId);
      await io.to(currentGameData?.hostSocketId ?? "").emit("host-next", currentGameData);
      const allPlayersInGame = await playerDb.getPlayers(gameId);
      await io.to(currentGameData?.hostSocketId ?? "").emit("players-updated", {
        gameId: gameId,
        players: allPlayersInGame
      });
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

  const onHostPSBack = async (preSettingsId, preSettingsData) => {
    try {
      await hostDb.hostClosePreSettings(preSettingsId, preSettingsData);
      const currentSettingsData: IPreGameSettings | null = await hostDb.getPreSettingsData(preSettingsId);
      io.to(currentSettingsData?.hostSocketId ?? "").emit("presettings-close", currentSettingsData);
    } catch (e) {
      console.error(`Failed to go back: ${e}`);
    }
  };

  const onHostSkipQuestionnaire = async () => {
    try {
      const gameData: IGame | null = await hostDb.getGameDataFromSocketId(socket.id);
      if (gameData === null) {
        return;
      }

      const playersInGame: IPlayer[] = await playerDb.getPlayers(gameData.id);
      if (!playersInGame.some((p) => p.playerState.state === "submitted-questionnaire-waiting")) {
        return;
      }

      await hostHelpers.hostStartQuiz(gameData.id, io);
    } catch (e) {
      console.error(`Error skipping past questionnaire: ${e}`);
    }
  };

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
};
