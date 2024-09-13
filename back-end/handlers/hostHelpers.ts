import playerDb from "../db/player.ts";
import questionDb from "../db/question.ts";
import hostDb from "../db/host.ts";
import IGameDB from "../interfaces/IGameDB.ts";
import playerHelpers from "./playerHelpers.ts";
import Player from "../models/Player.ts";
import { PlayerState } from "../interfaces/IPlayerState.ts";
import IPlayerDB from "../interfaces/IPlayerDB.ts";
import IGuess from "../interfaces/IGuess.ts";
import { typedServer } from "../interfaces/IServer.ts";

const PRE_QUIZ_MS = 5000;
const PRE_ANSWER_MS = 3000;
const PRE_LEADER_BOARD_MS = 5000;
// const PRE_QUESTIONNAIRE_MS = 3000;
const PRE_QUESTIONNAIRE_MS = 500;
let nextQuestionTimer: NodeJS.Timeout;

export const hostGoNext = async (gameId: number, io: typedServer): Promise<void> => {
  const currentGameData = await hostDb.getGameData(gameId);
  if (currentGameData === null) {
    return;
  }

  io.to(currentGameData.hostSocketId).emit("host-next", currentGameData);
};

export const hostGoToQuestionnaire = async (gameId: number, io: typedServer): Promise<void> => {
  try {
    const players = await playerDb.getPlayers(gameId);

    if (players.length >= 2) {
      const playerQuestionnaires = await hostDb.moveGameToQuestionnaire(gameId);
      await Player.updateMany({ gameId: gameId }, { $set: { "playerState.state": "filling-questionnaire" } });
      // await Player.updateMany({ gameId: gameId }, { $set: { playeState: { state: "filling-questionnaire" } } });
      const currentGameData = await hostDb.getGameData(gameId);
      if (currentGameData === null) {
        return;
      }

      const playersInGame = await playerDb.getPlayers(gameId);
      io.to(currentGameData.hostSocketId).emit("host-next", { ...currentGameData, playersInGame }); // playersInGame makes no sense

      for (let i = 0; i < playerQuestionnaires.length; i++) {
        const playerQuestionnaire = playerQuestionnaires[i];
        const player = await playerDb.getPlayer(playerQuestionnaire.playerId);
        if (player === null) {
          continue;
        }

        const questionnaireQuestionsText = await questionDb.getQuestionnaireQuestionsText(playerQuestionnaire);
        // io.to(player.playerSocketId).emit("player-next", player, questionnaireQuestionsText as IPlayerLoadSuccess); // original line, questionnaireQuestionsText has no effect as extra data
        io.to(player.playerSocketId).emit("player-next", player, {
          questionnaireQuestionsText: questionnaireQuestionsText
        });
      }
    } else {
      console.error("tried to start a game with too few players");
    }
  } catch (e) {
    console.error(`Failed to go to questionnaire: ${e}`);
  }
};

export const hostGoPreQuestionnaire = async (gameId: number, io: typedServer): Promise<void> => {
  await hostDb.setGameState(gameId, "pre-questionnaire");
  await hostGoNext(gameId, io);

  setTimeout(hostGoToQuestionnaire, PRE_QUESTIONNAIRE_MS, gameId, io);
};

export const hostShowLeaderBoard = async (gameId: number, io: typedServer): Promise<void> => {
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
};

export const hostPreLeaderBoard = async (gameId: number, io: typedServer): Promise<void> => {
  try {
    const playerScores = await playerDb.getPlayerScores(gameId);
    playerScores.sort((a, b) => b.score - a.score);

    if (playerScores[0].score === playerScores[1].score) {
      await hostDb.setGameState(gameId, "tiebreaker");
      await hostGoNext(gameId, io);
      await new Promise((r) => setTimeout(r, 5900));
      await hostDb.addTiebreakerQuestion(gameId);
      await hostNextQuestionOrLeaderboard(gameId, io);
    } else {
      await hostDb.setGameState(gameId, "pre-leader-board");
      await hostGoNext(gameId, io);
      await playerDb.updateAllPlayerStates(gameId, "pre-leader-board", io, {});
      setTimeout(hostShowLeaderBoard, PRE_LEADER_BOARD_MS, gameId, io);
    }
  } catch (e) {
    console.error(`Failed to go to questionnaire: ${e}`);
  }
};

export const hostStartQuizTimer = async (gameId: number, io: typedServer): Promise<void> => {
  const currentGameData = await hostDb.getGameData(gameId);
  let timePerQuestionMS: number;
  if (currentGameData?.settings.timePerQuestion === undefined) {
    console.error("Error: time per question undefined. Defaulted to 15 seconds.");
    timePerQuestionMS = 15000;
  } else {
    timePerQuestionMS = currentGameData?.settings.timePerQuestion * 1000;
  }

  playerHelpers.allPlayersQuizTimerStarted(gameId, io);
  nextQuestionTimer = setTimeout(hostPreAnswer, timePerQuestionMS, gameId, io);
};

export const hostNextQuestionOrLeaderboard = async (gameId: number, io: typedServer): Promise<void> => {
  const shouldContinue = await hostDb.nextQuestion(gameId);

  if (shouldContinue) {
    await hostDb.setGameState(gameId, "showing-question");
    await hostGoNext(gameId, io);
    await playerHelpers.allPlayersGoToNextQuestion(gameId, io);
  } else {
    await hostPreLeaderBoard(gameId, io);
  }
};

export const hostSkipTimer = async (gameId: number, io: typedServer): Promise<void> => {
  clearTimeout(nextQuestionTimer);
  hostPreAnswer(gameId, io);
};

export const hostStartQuiz = async (gameId: number, io: typedServer): Promise<void> => {
  await hostDb.setGameState(gameId, "pre-quiz");
  const game = await hostDb.getGameData(gameId);
  if (game === null) {
    return;
  }

  await hostDb.buildQuiz(game);
  await hostGoNext(gameId, io);
  setTimeout(hostNextQuestionOrLeaderboard, PRE_QUIZ_MS, gameId, io);
};

export const hostShowIntLeaderboard = async (gameId: number, io: typedServer): Promise<void> => {
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
    setTimeout(hostNextQuestionOrLeaderboard, timePerLeaderboard, gameId, io);
  }
};

export const hostPreAnswer = async (gameId: number, io: typedServer): Promise<void> => {
  await hostDb.setGameState(gameId, "pre-answer");
  await hostGoNext(gameId, io);
  await playerHelpers.allPlayersTimesUp(gameId, io);

  setTimeout(hostShowAnswer, PRE_ANSWER_MS, gameId, io);
};

export const handleTiebreakerAnswers = async (allPlayers: IPlayerDB[], quizQIndex, correctQIndex): Promise<void> => {
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
  let bonusPlayer: IPlayerDB = bottomPlayersBySpeed[0];
  for (let i = 1; i < bottomPlayersBySpeed.length; i++) {
    const currentPlayer = bottomPlayersBySpeed[i];
    const currentGuess = currentPlayer.quizGuesses[quizQIndex];
    if (currentGuess && currentGuess.guess === correctQIndex) {
      bonusPlayer = currentPlayer;
    }
  }

  await playerDb.awardPlayerPoints(bonusPlayer.id, 100);
};

export const hostShowAnswer = async (gameId: number, io: typedServer): Promise<void> => {
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
    await handleTiebreakerAnswers(players, currentQuestionIndex, correctGuess);
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
    const currentPlayer: IPlayerDB = nonSubjectPlayers[i];
    const currentPlayerCurrentGuess: IGuess = currentPlayer.quizGuesses[currentQuestionIndex];
    const playerCorrect: boolean = currentPlayerCurrentGuess && currentPlayerCurrentGuess.guess === correctGuess;
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
        hostShowIntLeaderboard(gameId, io);
      } else {
        hostNextQuestionOrLeaderboard(gameId, io);
      }
    }, timePerAnswer);
  }
};

export const getQuestionnaireStatus = async (gameId: number): Promise<string[][]> => {
  const allPlayersInGame = await playerDb.getPlayers(gameId);
  let donePlayerNames: string[] = [];
  let waitingPlayerNames: string[] = [];

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
};

export const onHostViewUpdate = async (gameId: number, io: typedServer) => {
  const gameData = await hostDb.getGameData(gameId);
  if (gameData === null) {
    throw Error("Error finding game data");
  }

  try {
    const allPlayersDone = await playerDb.checkAllPlayersDoneWithQuestionnaire(gameId);
    if (!allPlayersDone) {
      const playerStatusLists = await getQuestionnaireStatus(gameId);
      io.to(gameData.hostSocketId).emit("host-view-update", playerStatusLists);
    } else if (gameData.gameState.state === "questionnaire") {
      await hostStartQuiz(gameId, io);
    }
  } catch (e) {
    io.to(gameData.hostSocketId).emit("host-view-update-error", e);
  }
};

export const handlePlayerQuit = async (player: IPlayerDB, game: IGameDB, io: typedServer) => {
  await playerDb.kickPlayer(player.name, game.id);
  const allPlayersInGame = await playerDb.getPlayers(game.id);

  io.to(game.hostSocketId).emit("players-updated", game.id, allPlayersInGame);

  await onHostViewUpdate(game.id, io);
};
