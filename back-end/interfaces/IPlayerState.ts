export type PlayerState =
  | "init"
  | "joined-waiting"
  | "kicked"
  | "filling-questionnaire"
  | "submitted-questionnaire-waiting"
  | "question-being-read"
  | "seeing-question"
  | "question-about-me"
  | "answered-quiz-question-waiting"
  | "did-not-answer-question-waiting"
  | "seeing-answer"
  | "seeing-answer-correct"
  | "seeing-answer-incorrect"
  | "pre-leader-board"
  | "leader-board"
  | "rank-one"
  | "rank-two"
  | "rank-three"
  | "tiebreaker"
  | "seeing-rank";

export interface IPlayerState {
  state: PlayerState;
  message: string;
}
