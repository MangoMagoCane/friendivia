enum GameStates {
  Init = "init",
  Lobby = "lobby",
  PreQuestionnaire = "pre-questionnaire",
  Questionnaire = "questionnaire",
  PreQuiz = "pre-quiz",
  ShowingQuestion = "showing-question",
  PreAnswer = "pre-answer",
  ShowingAnswer = "showing-answer",
  PreLeaderBoard = "pre-leader-board",
  LeaderBoard = "leader-board",
  Inactive = "inactive",
  Settings = "settings",
  Tiebreaker = "tiebreaker",
  InterLeaderboard = "intermediary-leaderboard"
}

interface IGameState {
  state: GameStates;
  message: string;
}

export { GameStates, IGameState };
