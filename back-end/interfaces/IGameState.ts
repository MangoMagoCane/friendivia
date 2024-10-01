export type GameState =
  | "init"
  | "lobby"
  | "pre-questionnaire"
  | "questionnaire"
  | "custom-player-questionnaire"
  | "pre-quiz"
  | "showing-question"
  | "pre-answer"
  | "showing-answer"
  // | "reload-players"
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
