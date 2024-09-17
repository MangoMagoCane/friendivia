import { playerDb } from "../db/player.ts";
import { hostDb } from "../db/host.ts";
import questionDb from "../db/question.ts";
import { Game } from "../models/Game.ts";
import * as hostHelpers from "./hostHelpers.ts";
import { Player } from "../models/Player.ts";
import { SocketBackend, typedServer } from "../interfaces/IServer.ts";
import { IGame } from "../interfaces/models/IGame.ts";
import { IPlayer } from "../interfaces/models/IPlayer.ts";

export default (io: typedServer, socket: SocketBackend) => {
  const onPlayerSubmitJoin = async (name: string, gameId: number) => {
    try {
      const game: IGame | null = await Game.findOne({ id: gameId }).exec();
      if (game?.gameState.state !== "lobby") {
        throw Error("Invalid Game ID");
      }

      const allPlayersInGame = await playerDb.getPlayers(gameId);
      const playerWithNameAlready = allPlayersInGame.find((p) => p.name === name);
      if (playerWithNameAlready !== undefined) {
        throw Error("A player with that name has already joined.");
      }

      const newPlayerId = await playerDb.addPlayer(name, gameId, socket.id);
      const currentGameData = await hostDb.getGameData(gameId);
      if (currentGameData === null) {
        throw Error("", { cause: "Could not find current game data" });
      }

      const updatedPlayer = await playerDb.getPlayer(newPlayerId);
      if (updatedPlayer === null) {
        throw Error("", { cause: "Could not find updated player" });
      }

      io.to(updatedPlayer.playerSocketId).emit("player-next", updatedPlayer);
      allPlayersInGame.push(updatedPlayer); // necessary otherwise allPlayersInGame only contains the players before the new one is added
      io.to(currentGameData.hostSocketId).emit("players-updated", gameId, allPlayersInGame);

      socket.emit("join-success", newPlayerId);
    } catch (e) {
      if (e.cause) {
        console.error(`Failed to add player: ${e}`);
      }
      socket.emit("join-error", e.message || "An error occured");
    }
  };

  const onPlayerLoad = async (playerId: string) => {
    try {
      const player = await playerDb.getPlayer(playerId);
      if (player === null) {
        throw Error("Could not find player");
      }

      const gameData = await hostDb.getGameData(player.gameId);
      if (gameData === null) {
        throw Error("", { cause: "Could not find game data" });
      }

      const playerQuestionnaire = gameData.playerQuestionnaires.find((pq) => pq.playerId === playerId);
      let questionnaireText: string[] = ["Something went wrong..."];
      if (playerQuestionnaire !== undefined) {
        questionnaireText = await questionDb.getQuestionnaireQuestionsText(playerQuestionnaire);
      }

      const currentQuizQuestionIndex = gameData.currentQuestionIndex;
      const extraData = {
        questionnaireQuestionsText: questionnaireText,
        quizQuestionOptionsText:
          currentQuizQuestionIndex >= 0 ? gameData.quizQuestions[currentQuizQuestionIndex].optionsList : [],
        playerScores: await playerDb.getPlayerScores(gameData.id)
      };

      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            playerSocketId: socket.id
          }
        }
      );
      socket.emit("player-load-success", player, extraData);
    } catch (e) {
      if (e.cause) {
        console.error(`Failed to add player: ${e}`);
      }
      socket.emit("player-load-error", e.message || "An error occured");
    }
  };

  const onPlayerSubmitQuestionnaire = async (answers: string[]) => {
    try {
      const player = await playerDb.getPlayerBySocketId(socket.id);
      if (player === null) {
        throw Error("Player could not be found");
      }
      const gameId = player.gameId;
      await playerDb.playerCompleteQuestionnaire(player, answers);
      socket.emit("player-submit-questionnaire-success");

      const allPlayersDone = await playerDb.checkAllPlayersDoneWithQuestionnaire(gameId);
      if (allPlayersDone) {
        await hostHelpers.hostStartQuiz(gameId, io);
      } else {
        hostHelpers.onHostViewUpdate(gameId, io);
      }
    } catch (e) {
      console.log(e);
      socket.emit("player-submit-questionnaire-error", e);
    }
  };

  const onPlayerAnswerQuestion = async (guess: number) => {
    try {
      const player = await playerDb.getPlayerBySocketId(socket.id);
      if (player === null) {
        throw Error("Player could not be found");
      }

      const gameData = await hostDb.getGameData(player.gameId);
      if (gameData === null) {
        throw `Game not found: ${player.gameId}`;
      }

      await playerDb.playerAnswerQuestion(player.id, guess, gameData);
      socket.emit("player-answer-question-success");
    } catch (e) {
      socket.emit("player-answer-question-error", e);
    }
  };

  const onHostKickPlayer = async (playerName: string) => {
    try {
      const currentGameData: IGame | null = await hostDb.getGameDataFromSocketId(socket.id);
      if (currentGameData === null) {
        return;
      }
      const gameId = currentGameData.id;
      const player: IPlayer | null = await playerDb.getPlayerByName(playerName, gameId);
      if (player === null) {
        // ! TEMPORARYCHAGNE
        return;
      }
      await playerDb.updatePlayerState(player.id, "kicked", io);
      await playerDb.kickPlayer(playerName, gameId);
      const allPlayersInGame = await playerDb.getPlayers(gameId);

      io.to(currentGameData.hostSocketId).emit("players-updated", gameId, allPlayersInGame);

      await hostHelpers.onHostViewUpdate(gameId, io);
    } catch (e) {
      console.error("Failed to kick player: " + e);
    }
  };

  const onPlayerQuit = async () => {
    const player = await playerDb.getPlayerBySocketId(socket.id);
    if (player === null) {
      socket.emit("player-game-ended");
      return;
    }

    const game = await hostDb.getGameData(player.gameId);
    if (game === null) {
      return;
    }

    await hostHelpers.handlePlayerQuit(player, game, io);
    socket.emit("player-game-ended");
  };

  socket.on("player-submit-join", onPlayerSubmitJoin);
  socket.on("player-load", onPlayerLoad);
  socket.on("player-submit-questionnaire", onPlayerSubmitQuestionnaire);
  socket.on("player-answer-question", onPlayerAnswerQuestion);
  socket.on("host-kick-player", onHostKickPlayer);
  socket.on("player-quit", onPlayerQuit);
};
