// enum GameStates {
//   Init = "init",
//   Lobby = "lobby",
//   PreQuestionnaire = "pre-questionnaire",
//   Questionnaire = "questionnaire",
//   PreQuiz = "pre-quiz",
//   ShowingQuestion = "showing-question",
//   PreAnswer = "pre-answer",
//   ShowingAnswer = "showing-answer",
//   PreLeaderBoard = "pre-leader-board",
//   LeaderBoard = "leader-board",
//   Inactive = "inactive",
//   Settings = "settings",
//   Tiebreaker = "tiebreaker",
//   InterLeaderboard = "intermediary-leaderboard"
// }

export type GameState =
  | "init"
  | "lobby"
  | "pre-questionnaire"
  | "questionnaire"
  | "pre-quiz"
  | "showing-question"
  | "pre-answer"
  | "showing-answer"
  //   | "reload-players"
  | "pre-leader-board"
  | "leader-board"
  | "inactive"
  | "settings"
  | "tiebreaker"
  | "intermediary-leaderboard";

export interface IGameState {
  state: GameState;
  message: string;
}
