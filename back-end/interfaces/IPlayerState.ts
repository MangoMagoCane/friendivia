export enum PlayerStates {
  Init = "init",
  JoinedWaiting = "joined-waiting",
  PlayerKicked = "kicked",
  FillingQuestionnaire = "filling-questionnaire",
  DoneWithQuestionnaireWaiting = "submitted-questionnaire-waiting",
  QuestionBeingRead = "question-being-read",
  SeeingQuestion = "seeing-question",
  QuestionAboutMe = "question-about-me",
  AnsweredQuizQuestionWaiting = "answered-quiz-question-waiting",
  DidNotAnswerQuestionWaiting = "did-not-answer-question-waiting",
  SeeingAnswer = "seeing-answer",
  SeeingAnswerCorrect = "seeing-answer-correct",
  SeeingAnswerIncorrect = "seeing-answer-incorrect",
  PreLeaderBoard = "pre-leader-board",
  LeaderBoard = "leader-board",
  RankOne = "rank-one",
  RankTwo = "rank-two",
  RankThree = "rank-three",
  Tiebreaker = "tiebreaker",
  SeeingRank = "seeing-rank"
}

export interface IPlayerState {
  state: PlayerStates;
  message: string;
}
