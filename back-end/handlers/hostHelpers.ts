import { playerDb } from "../db/player.ts";
import { questionDb } from "../db/question.ts";
import { hostDb } from "../db/host.ts";
import { playerHelpers } from "./playerHelpers.ts";
import { Player } from "../models/Player.ts";
import { PlayerState } from "../interfaces/IPlayerState.ts";
import { typedServer } from "../interfaces/IServer.ts";
import { IGame } from "../interfaces/models/IGame.ts";
import { IPlayer } from "../interfaces/models/IPlayer.ts";

const PRE_QUIZ_MS = 5000;
const PRE_ANSWER_MS = 3000;
const PRE_LEADER_BOARD_MS = 5000;
const PRE_QUESTIONNAIRE_MS = 3000;
let nextQuestionTimer: NodeJS.Timeout;

export const hostHelpers = {
  hostGoNext: async (gameId: number, io: typedServer): Promise<void> => {
    const gameData = await hostDb.getGameData(gameId);
    if (gameData === null) {
      return;
    }

    io.to(gameData.hostSocketId).emit("host-next", gameData);
  },

  hostGoToQuestionnaire: async (gameId: number, io: typedServer): Promise<void> => {
    try {
      const gameData = await hostDb.getGameData(gameId);
      if (gameData === null) {
        return;
      }

      const players = await playerDb.getPlayers(gameId);
      if (players.length < 2) {
        console.error("tried to start a game with too few players");
        return;
      }

      const playerQuestionnaires = await hostDb.moveGameToQuestionnaire(gameId);
      await Player.updateMany({ gameId: gameId }, { $set: { "playerState.state": "filling-questionnaire" } });

      const playersInGame = await playerDb.getPlayers(gameId);
      io.to(gameData.hostSocketId).emit("host-next", { ...gameData, playersInGame }); // playersInGame might make sense?

      for (let i = 0; i < playerQuestionnaires.length; i++) {
        const playerQuestionnaire = playerQuestionnaires[i];
        const player = await playerDb.getPlayer(playerQuestionnaire.playerId);
        if (player === null) {
          continue;
        }

        const questionnaireQuestionsText = await questionDb.getQuestionnaireQuestionsText(playerQuestionnaire);
        io.to(player.playerSocketId).emit("player-next", player, {
          questionnaireQuestionsText: questionnaireQuestionsText
        });
      }
    } catch (e) {
      console.error(`Failed to go to questionnaire: ${e}`);
    }
  },

  hostGoPreQuestionnaire: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "pre-questionnaire");
    await hostHelpers.hostGoNext(gameId, io);

    setTimeout(hostHelpers.hostGoToQuestionnaire, PRE_QUESTIONNAIRE_MS, gameId, io);
  },

  hostShowLeaderBoard: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "leader-board");

    const playerScores = await playerDb.getPlayerScores(gameId);
    playerScores.sort((a, b) => b.score - a.score);
    const players = await playerDb.getPlayers(gameId);
    for (let i = 0; i < players.length; i++) {
      if (players[i].score === playerScores[0].score) {
        await playerDb.updatePlayerState(players[i].id, "rank-one", io);
      } else if (players[i].score === playerScores[1].score) {
        await playerDb.updatePlayerState(players[i].id, "rank-two", io);
      } else if (players[i].score === playerScores[2].score) {
        await playerDb.updatePlayerState(players[i].id, "rank-three", io);
      } else {
        await playerDb.updatePlayerState(players[i].id, "leader-board", io);
      }
    }

    const gameData = await hostDb.getGameData(gameId);
    if (gameData === null) {
      return;
    }

    io.to(gameData.hostSocketId).emit("host-next", { ...gameData, playerScores });
  },

  hostPreLeaderBoard: async (gameId: number, io: typedServer): Promise<void> => {
    try {
      const playerScores = await playerDb.getPlayerScores(gameId);
      playerScores.sort((a, b) => b.score - a.score);

      if (playerScores[0].score === playerScores[1].score) {
        await hostDb.setGameState(gameId, "tiebreaker");
        await hostHelpers.hostGoNext(gameId, io);
        await new Promise((r) => setTimeout(r, 5900));
        await hostDb.addTiebreakerQuestion(gameId);
        await hostHelpers.hostNextQuestionOrLeaderboard(gameId, io);
      } else {
        await hostDb.setGameState(gameId, "pre-leader-board");
        await hostHelpers.hostGoNext(gameId, io);
        await playerDb.updateAllPlayerStates(gameId, "pre-leader-board", io, {});
        setTimeout(hostHelpers.hostShowLeaderBoard, PRE_LEADER_BOARD_MS, gameId, io);
      }
    } catch (e) {
      console.error(`Failed to go to questionnaire: ${e}`);
    }
  },

  hostStartQuizTimer: async (gameId: number, io: typedServer): Promise<void> => {
    const currentGameData = await hostDb.getGameData(gameId);
    let timePerQuestionMS: number;
    if (currentGameData?.settings.timePerQuestion === undefined) {
      console.error("Error: time per question undefined. Defaulted to 15 seconds.");
      timePerQuestionMS = 15000;
    } else {
      timePerQuestionMS = currentGameData?.settings.timePerQuestion * 1000;
    }

    playerHelpers.allPlayersQuizTimerStarted(gameId, io);
    nextQuestionTimer = setTimeout(hostHelpers.hostPreAnswer, timePerQuestionMS, gameId, io);
  },

  hostNextQuestionOrLeaderboard: async (gameId: number, io: typedServer): Promise<void> => {
    const shouldContinue = await hostDb.nextQuestion(gameId);

    if (shouldContinue) {
      await hostDb.setGameState(gameId, "showing-question");
      await hostHelpers.hostGoNext(gameId, io);
      await playerHelpers.allPlayersGoToNextQuestion(gameId, io);
    } else {
      await hostHelpers.hostPreLeaderBoard(gameId, io);
    }
  },

  hostSkipTimer: async (gameId: number, io: typedServer): Promise<void> => {
    clearTimeout(nextQuestionTimer);
    hostHelpers.hostPreAnswer(gameId, io);
  },

  hostStartQuiz: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "pre-quiz");
    const game = await hostDb.getGameData(gameId);
    if (game === null) {
      return;
    }

    await hostDb.buildQuiz(game);
    await hostHelpers.hostGoNext(gameId, io);
    setTimeout(hostHelpers.hostNextQuestionOrLeaderboard, PRE_QUIZ_MS, gameId, io);
  },

  hostShowIntLeaderboard: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "intermediary-leaderboard");

    const allPlayerScores = await playerDb.getPlayerScores(gameId);
    await playerDb.updateAllPlayerStates(gameId, "seeing-rank", io, { playerScores: allPlayerScores });

    const gameData = await hostDb.getGameData(gameId);
    if (gameData === null) {
      return;
    }

    const timePerLeaderboard = gameData.settings.timePerLeaderboard * 1000;
    io.to(gameData.hostSocketId).emit("host-next", { ...gameData, playerScores: allPlayerScores });

    if (gameData.settings.handsFreeMode) {
      setTimeout(hostHelpers.hostNextQuestionOrLeaderboard, timePerLeaderboard, gameId, io);
    }
  },

  hostPreAnswer: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "pre-answer");
    await hostHelpers.hostGoNext(gameId, io);
    await playerHelpers.allPlayersTimesUp(gameId, io);

    setTimeout(hostHelpers.hostShowAnswer, PRE_ANSWER_MS, gameId, io);
  },

  handleTiebreakerAnswers: async (allPlayers: IPlayer[], quizQIndex, correctQIndex): Promise<void> => {
    if (allPlayers.length < 1) {
      return;
    }

    const playerLeaderboard = [...allPlayers];
    playerLeaderboard.sort((a, b) => b.score - a.score);

    const topPlayers = playerLeaderboard.filter((p) => p.score === playerLeaderboard[0].score);
    if (topPlayers.length === 1) {
      return;
    }

    const bottomPlayersBySpeed = playerDb.getPlayersSortedByGuessSpeed(topPlayers, quizQIndex);
    let bonusPlayer = bottomPlayersBySpeed[0];
    for (let i = 1; i < bottomPlayersBySpeed.length; i++) {
      const currentPlayer = bottomPlayersBySpeed[i];
      const currentGuess = currentPlayer.quizGuesses[quizQIndex];
      if (currentGuess && currentGuess.guess === correctQIndex) {
        bonusPlayer = currentPlayer;
      }
    }

    await playerDb.awardPlayerPoints(bonusPlayer.id, 100);
  },

  hostShowAnswer: async (gameId: number, io: typedServer): Promise<void> => {
    await hostDb.setGameState(gameId, "showing-answer");
    const gameData = await hostDb.getGameData(gameId);
    if (gameData === null) {
      return;
    }

    const handsFreeMode = gameData.settings.handsFreeMode;
    const timePerAnswer = (gameData.settings.timePerAnswer || 10) * 1000;
    const currentQuestionIndex = gameData.currentQuestionIndex;
    const quizLength = gameData.quizQuestions.length || 5;

    const players = await playerDb.getPlayers(gameId);
    const subjectPlayerId = gameData.quizQuestions[currentQuestionIndex].playerId;

    const nonSubjectPlayers = players.filter((p) => p.id !== subjectPlayerId);
    const guessingPlayers = players.filter((p) => p.quizGuesses[currentQuestionIndex]);
    const guesses = await playerDb.getPlayerGuessesForQuizQuestion(gameId, currentQuestionIndex);

    const correctGuess = gameData.quizQuestions[currentQuestionIndex].correctAnswerIndex;
    const totalGuesses = guesses.length - 1;
    const numCorrect = guesses.filter((g) => g && g.guess === correctGuess).length;

    if (subjectPlayerId === "friends") {
      await hostHelpers.handleTiebreakerAnswers(players, currentQuestionIndex, correctGuess);
    } else if (totalGuesses === 0 || numCorrect === 0) {
      playerDb.awardAllPlayersConsolationPoints(guessingPlayers, currentQuestionIndex);
    }

    const subjectPlayer = await playerDb.getPlayer(subjectPlayerId);
    let subjectBonus = Math.floor(300 * (numCorrect / totalGuesses));

    if (subjectPlayer) {
      subjectBonus = isNaN(subjectBonus) ? 0 : subjectBonus;
      await Player.updateOne(
        {
          id: subjectPlayer.id
        },
        {
          $set: {
            score: subjectPlayer.score + subjectBonus
          }
        }
      );

      const newSubjectPlayerState: PlayerState = numCorrect === 0 ? "seeing-answer-incorrect" : "seeing-answer-correct";
      playerDb.updatePlayerState(subjectPlayer.id, newSubjectPlayerState, io);
    }

    for (let i = 0; i < nonSubjectPlayers.length; i++) {
      const currentPlayer = nonSubjectPlayers[i];
      const currentPlayerGuess = currentPlayer.quizGuesses[currentQuestionIndex];
      const playerCorrect = currentPlayerGuess && currentPlayerGuess.guess === correctGuess;
      const currentPlayerNewState: PlayerState = playerCorrect ? "seeing-answer-correct" : "seeing-answer-incorrect";
      await playerDb.updatePlayerState(currentPlayer.id, currentPlayerNewState, io);
    }

    const playerScores = await playerDb.getPlayerScores(gameId);
    io.to(gameData.hostSocketId).emit("host-next", {
      ...gameData,
      quizQuestionGuesses: guesses,
      playerScores: playerScores
    });

    if (handsFreeMode) {
      setTimeout(() => {
        if (currentQuestionIndex + 1 < quizLength) {
          hostHelpers.hostShowIntLeaderboard(gameId, io);
        } else {
          hostHelpers.hostNextQuestionOrLeaderboard(gameId, io);
        }
      }, timePerAnswer);
    }
  },

  getQuestionnaireStatus: async (gameId: number): Promise<string[][]> => {
    const allPlayersInGame = await playerDb.getPlayers(gameId);
    const donePlayerNames: string[] = [];
    const waitingPlayerNames: string[] = [];

    for (let i = 0; i < allPlayersInGame.length; i++) {
      const player = allPlayersInGame[i];
      if (player.playerState.state === "submitted-questionnaire-waiting") {
        donePlayerNames.push(player.name);
      } else if (player.playerState.state === "filling-questionnaire") {
        waitingPlayerNames.push(player.name);
      } else {
        console.error(`Player: ${player.name} has state: ${player.playerState.state}`);
      }
    }

    return [donePlayerNames, waitingPlayerNames];
  },

  onHostViewUpdate: async (gameId: number, io: typedServer): Promise<void> => {
    const gameData = await hostDb.getGameData(gameId);
    if (gameData === null) {
      throw Error("Error finding game data");
    }

    try {
      const allPlayersDone = await playerDb.checkAllPlayersDoneWithQuestionnaire(gameId);
      if (!allPlayersDone) {
        const playerStatusLists = await hostHelpers.getQuestionnaireStatus(gameId);
        io.to(gameData.hostSocketId).emit("host-view-update", playerStatusLists);
      } else if (gameData.gameState.state === "questionnaire") {
        await hostHelpers.hostStartQuiz(gameId, io);
      }
    } catch (e) {
      io.to(gameData.hostSocketId).emit("host-view-update-error", e);
    }
  },

  handlePlayerQuit: async (player: IPlayer, game: IGame, io: typedServer): Promise<void> => {
    await playerDb.kickPlayer(player.name, game.id);
    const allPlayersInGame = await playerDb.getPlayers(game.id);

    io.to(game.hostSocketId).emit("players-updated", game.id, allPlayersInGame);

    await hostHelpers.onHostViewUpdate(game.id, io);
  }
};
