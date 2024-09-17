import { playerDb } from "../db/player.ts";
import { hostDb } from "../db/host.ts";
import { Player } from "../models/Player.ts";
import { PlayerState } from "../interfaces/IPlayerState.ts";
import { Server } from "socket.io";
import { valInArr } from "../../front-end/src/util.ts";

export const playerHelpers = {
  allPlayersGoToNextQuestion: async (gameId: number, io: Server): Promise<void> => {
    const currentGameData = await hostDb.getGameData(gameId);
    if (currentGameData === null) {
      return;
    }

    const currentQuestionIndex = currentGameData.currentQuestionIndex;
    const quizQuestionOptionsText = currentGameData.quizQuestions[currentQuestionIndex].optionsList || [];
    const allPlayersInGame = await playerDb.getPlayers(gameId);
    for (let i = 0; i < allPlayersInGame.length; i++) {
      const player = allPlayersInGame[i];
      const state: PlayerState =
        allPlayersInGame[i].id === currentGameData.quizQuestions[currentQuestionIndex].playerId
          ? "question-about-me"
          : "question-being-read";

      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            "playerState.state": state
          }
        }
      );
      const updatedPlayer = await playerDb.getPlayer(player.id);
      if (updatedPlayer === null) {
        return;
      }

      io.to(updatedPlayer.playerSocketId).emit("player-next", updatedPlayer, {
        quizQuestionOptionsText: quizQuestionOptionsText
      });
    }
  },

  allPlayersTimesUp: async (gameId: number, io: Server): Promise<void> => {
    const currentGameData = await hostDb.getGameData(gameId);
    if (currentGameData === null) {
      return;
    }

    const allPlayersInGame = await playerDb.getPlayers(gameId);
    for (const player of allPlayersInGame) {
      if (valInArr(player.playerState.state, ["answered-quiz-question-waiting", "question-about-me"])) {
        continue;
      }
      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            "playerState.state": "did-not-answer-question-waiting"
          }
        }
      );

      const updatedPlayer = await playerDb.getPlayer(player.id);
      if (updatedPlayer === null) {
        return;
      }

      io.to(updatedPlayer.playerSocketId).emit("player-next", updatedPlayer);
    }
  },

  allPlayersQuizTimerStarted: async (gameId: number, io: Server): Promise<void> => {
    const allPlayersInGame = await playerDb.getPlayers(gameId);
    for (const player of allPlayersInGame) {
      if (player.playerState.state === "question-being-read") {
        await Player.updateOne(
          {
            id: player.id
          },
          {
            $set: {
              "playerState.state": "seeing-question"
            }
          }
        );
      }

      const updatedPlayer = await playerDb.getPlayer(player.id);
      if (updatedPlayer === null) {
        return;
      }

      io.to(player.playerSocketId).emit("player-next", updatedPlayer);
    }
  }
};
