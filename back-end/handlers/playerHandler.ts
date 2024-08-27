import { Server, Socket } from "socket.io";
import playerDb from "../db/player.ts";
import hostDb from "../db/host.ts";
import questionDb from "../db/question.ts";
import IPlayer from "../interfaces/IPlayer.ts";
import IGame from "../interfaces/IGame.ts";
import Game from "../models/Game.ts";
import * as hostHelpers from "./hostHelpers.ts";
import Player from "../models/Player.ts";
import { PlayerQuestionnaire } from "../interfaces/IQuestionnaireQuestion.ts";

export default (io: Server, socket: Socket) => {
  const onPlayerSubmitJoin = async (data) => {
    try {
      const name = data.name.trim();
      const gameId: number = data.gameId;
      const allPlayersInGame = await playerDb.getPlayers(gameId);
      const foundPlayer = allPlayersInGame.find((p) => p.name === name);
      const playerWithNameAlreadyExists = !!foundPlayer;
      const allGames: IGame[] = await Game.find({});
      const foundGame = allGames.find((g) => g.id === gameId);
      const joinableGame = foundGame?.gameState.state === "lobby";

      if (!joinableGame) {
        socket.emit("join-error", "Invalid Game ID");
      } else {
        if (playerWithNameAlreadyExists) {
          socket.emit("join-error", "A player with that name has already joined.");
        } else {
          const newPlayerId = await playerDb.addPlayer(name, gameId, socket.id);
          const allPlayersInGame = await playerDb.getPlayers(gameId);
          const currentGameData = await hostDb.getGameData(gameId);
          if (currentGameData === null) {
            return;
          }

          const updatedPlayer = await playerDb.getPlayer(newPlayerId);
          if (!updatedPlayer) {
            return;
          }

          io.to(updatedPlayer.playerSocketId).emit("player-next", { player: updatedPlayer });

          io.to(currentGameData.hostSocketId).emit("players-updated", {
            gameId: gameId,
            players: allPlayersInGame
          });

          socket.emit("join-success", newPlayerId);
        }
      }
    } catch (e) {
      console.error("Failed to add player: " + e);
    }
  };

  const onPlayerLoad = async (playerId: string | undefined) => {
    if (!playerId) {
      return;
    }

    try {
      const player: IPlayer | null = await playerDb.getPlayer(playerId);
      if (!player) {
        return;
      }

      const gameData: IGame | null = await hostDb.getGameData(player.gameId);
      if (gameData === null) {
        return;
      }

      const playerQuestionnaire: PlayerQuestionnaire | undefined = gameData.playerQuestionnaires.find(
        (pq) => pq.playerId === playerId
      );
      let questionnaireText: Array<string> = ["Something went wrong..."];
      if (playerQuestionnaire) {
        questionnaireText = await questionDb.getQuestionnaireQuestionsText(playerQuestionnaire);
      }

      const currentQuizQuestionIndex = gameData.currentQuestionIndex;
      const extraData = {
        questionnaireQuestionsText: questionnaireText,
        quizQuestionOptionsText:
          currentQuizQuestionIndex >= 0 ? gameData.quizQuestions[currentQuizQuestionIndex].optionsList : [],
        playerScores: await playerDb.getPlayerScores(gameData.id)
      };

      if (player) {
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
        socket.emit("player-load-success", { player, extraData });
      } else {
        socket.emit("player-load-error", "player not found");
      }
    } catch (e) {
      socket.emit("player-load-error", e);
    }
  };

  const onPlayerSubmitQuestionnaire = async (answers: string[]) => {
    try {
      const player: IPlayer = await playerDb.getPlayerBySocketId(socket.id);
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
      const player: IPlayer = await playerDb.getPlayerBySocketId(socket.id);
      const gameData: IGame | null = await hostDb.getGameData(player.gameId);
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
      const player: IPlayer = await playerDb.getPlayerByName(playerName, gameId);
      await playerDb.updatePlayerState(player.id, "kicked", io, {});
      await playerDb.kickPlayer(playerName, gameId);
      const allPlayersInGame = await playerDb.getPlayers(gameId);

      await io.to(currentGameData.hostSocketId).emit("players-updated", {
        gameId: gameId,
        players: allPlayersInGame
      });

      await hostHelpers.onHostViewUpdate(gameId, io);
    } catch (e) {
      console.error("Failed to kick player: " + e);
    }
  };

  const onPlayerQuit = async () => {
    const player: IPlayer | null = await playerDb.getPlayerBySocketId(socket.id);
    if (!player) {
      socket.emit("player-game-ended");
      return;
    }

    const game: IGame | null = await hostDb.getGameData(player.gameId);
    if (!game) {
      return;
    }

    await hostHelpers.handlePlayerQuit(player, game, io);
    socket.emit("player-game-ended");
  };

  socket.on("host-kick-player", onHostKickPlayer);
  socket.on("player-submit-join", onPlayerSubmitJoin);
  socket.on("player-load", onPlayerLoad);
  socket.on("player-submit-questionnaire", onPlayerSubmitQuestionnaire);
  socket.on("player-answer-question", onPlayerAnswerQuestion);
  socket.on("player-quit", onPlayerQuit);
};
