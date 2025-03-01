import * as uuid from "uuid";
import { Player } from "../models/Player.ts";
import { IGuess } from "../interfaces/IGuess.ts";
import { Game } from "../models/Game.ts";
import { hostDb } from "./host.ts";
import { PlayerState } from "../interfaces/IPlayerState.ts";
import { IPlayerScore } from "../interfaces/IPlayerScore.ts";
import { Server } from "socket.io";
import { IPlayerLoadSuccess } from "../interfaces/ISocketCallbacks.ts";
import { typedServer } from "../interfaces/IServer.ts";
import { IGame } from "../interfaces/models/IGame.ts";
import { IPlayer } from "../interfaces/models/IPlayer.ts";

export const playerDb = {
  getPlayers: async (gameId: number): Promise<IPlayer[]> => {
    try {
      const players = await Player.find({ gameId: gameId });
      return players;
    } catch (e) {
      console.error(`Issue getting player names: ${e}`);
      throw Error("Failed to get players", { cause: e });
    }
  },

  getPlayer: async (playerId: string): Promise<IPlayer | null> => {
    try {
      const player = await Player.findOne({ id: playerId });
      return player;
    } catch (e) {
      console.error(`Issue getting player state: ${e}`);
      throw Error("Failed to get player", { cause: e });
    }
  },

  getPlayersWithQuestionnairesCompleted: async (gameId: number, qLength: number): Promise<IPlayer[]> => {
    try {
      const players = await Player.find({ gameId: gameId });
      return players.filter((p) => p.questionnaireAnswers.length === qLength);
    } catch (e) {
      console.error(`Issue getting players with completed questionnaires: ${e}`);
      throw Error("Failed to get players with completed questionnaires", { cause: e });
    }
  },

  addPlayer: async (playerName: string, gameId: number, socketId: string): Promise<string> => {
    try {
      const playerId = `player_${uuid.v4()}`;

      const newPlayer = new Player({
        name: playerName,
        id: playerId,
        questionnaireAnswers: [],
        quizGuesses: [],
        score: 0,
        gameId: gameId,
        playerState: {
          state: "joined-waiting",
          message: ""
        },
        playerSocketId: socketId
      });

      await newPlayer.save();
      return playerId;
    } catch (e) {
      console.error(`Issue adding player: ${e}`);
      throw Error("Failed to add new player", { cause: e });
    }
  },

  getPlayerByName: async (playerName: string, gameId: number): Promise<IPlayer | null> => {
    try {
      const player = await Player.findOne({ name: playerName, gameId: gameId });
      return player;
    } catch (e) {
      console.error(`Issue getting player state: ${e}`);
      throw Error("Failed to get player by name", { cause: e });
    }
  },

  kickPlayer: async (playerName: string, gameId: number): Promise<void> => {
    try {
      await Player.deleteOne({ name: playerName, gameId: gameId });
    } catch (e) {
      console.error(`Issue kicking player: ${e}`);
      throw Error("Failed to kick player", { cause: e });
    }
  },

  getPlayerBySocketId: async (socketId: string): Promise<IPlayer | null> => {
    try {
      const player = await Player.findOne({ playerSocketId: socketId });
      return player;
    } catch (e) {
      console.error(`Issue getting player state: ${e}`);
      throw Error("Failed to get player by socked id", { cause: e });
    }
  },

  updateAllPlayerStates: async (
    gameId: number,
    newState: PlayerState,
    io: Server,
    extraData: IPlayerLoadSuccess
  ): Promise<void> => {
    try {
      await Player.updateMany({ gameId: gameId }, { $set: { "playerState.state": newState } });
      const allPlayers = await Player.find({ gameId: gameId });
      for (const player of allPlayers) {
        io.to(player.playerSocketId).emit("player-next", player, extraData);
      }
    } catch (e) {
      console.error(`Issue updating all player states: ${e}`);
      throw Error("Failed to update all player states", { cause: e });
    }
  },

  updatePlayerState: async (playerId: string, newState: PlayerState, io: typedServer): Promise<void> => {
    try {
      await Player.updateOne({ id: playerId }, { $set: { "playerState.state": newState } });
      const players = await Player.find({ id: playerId });
      for (const player of players) {
        io.to(player.playerSocketId).emit("player-next", player);
      }
    } catch (e) {
      console.error(`Issue updating player state: ${e}`);
      throw Error("Failed to update player state", { cause: e });
    }
  },

  playerCompleteQuestionnaire: async (player: IPlayer, questionnaireAnswers: string[]): Promise<undefined> => {
    try {
      const game = await hostDb.getGameData(player.gameId);
      if (game === null) {
        return;
      }

      const questionnaireForPlayer = game.playerQuestionnaires.find((pq) => pq.playerId === player.id);
      if (questionnaireForPlayer === undefined) {
        return;
      }

      for (let i = 0; i < questionnaireForPlayer.questions.length; i++) {
        const pqq = questionnaireForPlayer.questions[i];
        pqq.answer = questionnaireAnswers[i];
      }

      await Game.updateOne(
        {
          id: player.gameId,
          "playerQuestionnaires.playerId": player.id
        },
        {
          $set: { "playerQuestionnaires.$": questionnaireForPlayer }
        }
      );

      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            "playerState.state": "submitted-questionnaire-waiting"
          }
        }
      );
    } catch (e) {
      console.error(`Issue adding player questionnaire answers: ${e}`);
    }
  },

  playerCompleteCustomQuestion: async (player: IPlayer, question: string): Promise<undefined> => {
    try {
      const game = await hostDb.getGameData(player.gameId);
      if (game === null) {
        return;
      }

      await Game.updateOne(
        {
          id: player.gameId
        },
        {
          $set: { customPlayerQuestions: [...game.customPlayerQuestions, question] }
        }
      );

      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            "playerState.state": "submitted-custom-questionnaire-waiting"
          }
        }
      );
    } catch (e) {
      console.error(`Issue adding player questionnaire answers: ${e}`);
    }
  },

  checkAllPlayersDoneWithQuestionnaire: async (gameId: number, customQuestion: boolean = false): Promise<boolean> => {
    try {
      const playerState: PlayerState = customQuestion
        ? "submitted-custom-questionnaire-waiting"
        : "submitted-questionnaire-waiting";
      const allPlayersInGame = await Player.find({ gameId: gameId });
      return allPlayersInGame.every((p) => p.playerState.state === playerState);
    } catch (e) {
      console.error(`Issue checking if all players are done with questionnaire: ${e}`);
      return false;
    }
  },

  getPlayersSortedByGuessSpeed: (guessingPlayers: IPlayer[], quizQIndex: number): IPlayer[] => {
    const guessTime = (p: IPlayer) => (p.quizGuesses[quizQIndex] ? p.quizGuesses[quizQIndex].timestamp : 0);
    const timeBetweenPlayerGuesses = (a: IPlayer, b: IPlayer) => guessTime(b) - guessTime(a);
    guessingPlayers.sort(timeBetweenPlayerGuesses);

    return guessingPlayers;
  },

  awardAllPlayersConsolationPoints: async (guessingPlayers: IPlayer[], quizQIndex: number): Promise<void> => {
    const sortedPlayers = playerDb.getPlayersSortedByGuessSpeed(guessingPlayers, quizQIndex);

    for (let i = 0; i < sortedPlayers.length; i++) {
      const currentPlayer = sortedPlayers[i];
      await playerDb.awardPlayerPoints(currentPlayer.id, 25 * (i + 1));
    }
  },

  awardPlayerPoints: async (playerId: string, points: number): Promise<void> => {
    try {
      const player = await Player.findOne({ id: playerId });

      if (player === null) {
        throw `Player not found: ${playerId}`;
      } else {
        await Player.updateOne(
          {
            id: playerId
          },
          {
            $set: {
              score: player.score + points
            }
          }
        );
      }
    } catch (e) {
      console.error(`Issue awarding points: ${e}`);
    }
  },

  playerAnswerQuestion: async (playerId: string, guess: number, gameData: IGame): Promise<void> => {
    try {
      const player = await Player.findOne({ id: playerId });
      if (player === null) {
        throw Error(`Player not found: ${playerId}`);
      }

      const newQuizGuesses = player.quizGuesses;
      const correctGuess = guess === gameData.quizQuestions[gameData.currentQuestionIndex].correctAnswerIndex;
      let scoreAdd = 0;

      if (correctGuess) {
        scoreAdd += 200;
        const currentGuesses = await playerDb.getPlayerGuessesForQuizQuestion(
          gameData.id,
          gameData.currentQuestionIndex
        );
        const numGuesses = currentGuesses.filter((g) => g).length;
        if (numGuesses < 3) {
          scoreAdd += 75 - numGuesses * 25;
        }
      }

      newQuizGuesses[gameData.currentQuestionIndex] = {
        name: player.name,
        guess: guess,
        timestamp: Date.now()
      };

      await Player.updateOne(
        {
          id: playerId
        },
        {
          $set: {
            "playerState.state": "answered-quiz-question-waiting",
            quizGuesses: newQuizGuesses,
            score: player.score + scoreAdd
          }
        }
      );
    } catch (e) {
      console.error(`Issue answering question: ${e}`);
    }
  },

  checkAllPlayersAnsweredQuizQuestion: async (gameId: number): Promise<boolean> => {
    try {
      const allPlayersInGame = await Player.find({ gameId: gameId });
      return allPlayersInGame.every(
        (p) => p.playerState.state === "answered-quiz-question-waiting" || p.playerState.state === "question-about-me"
      );
    } catch (e) {
      console.error(`Issue checking if all players have answered question: ${e}`);
      return false;
    }
  },

  getPlayerGuessesForQuizQuestion: async (gameId: number, questionIndex: number): Promise<IGuess[]> => {
    const playersInGame = await playerDb.getPlayers(gameId);
    return playersInGame.map((p) => p.quizGuesses[questionIndex]);
  },

  getPlayerScores: async (gameId: number): Promise<IPlayerScore[]> => {
    const playersInGame = await playerDb.getPlayers(gameId);
    const playerScores: IPlayerScore[] = playersInGame.map((p) => ({
      name: p.name,
      score: p.score
    }));
    return playerScores;
  },

  resetPlayerScores: async (gameId: number) => {
    const playersInGame = await playerDb.getPlayers(gameId);
    for (const player of playersInGame) {
      await Player.updateOne(
        {
          id: player.id
        },
        {
          $set: {
            score: 0
          }
        }
      );
    }
  },

  deletePlayer: async (playerId: string): Promise<void> => {
    try {
      await Player.deleteOne({ id: playerId });
    } catch (e) {
      console.error(`Issue deleting player ${playerId}: ${e}`);
    }
  },

  deleteAllPlayers: async (): Promise<void> => {
    try {
      await Player.deleteMany({});
    } catch (e) {
      console.error(`Issue deleting all players: ${e}`);
    }
  }
};
