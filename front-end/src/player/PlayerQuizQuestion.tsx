import * as React from "react";
import PlayerQuizQuestionView from "./PlayerQuizQuestionView";
import IQuizOption from "back-end/interfaces/IQuizOption";
import { socket } from "../socket";
import { PlayerState } from "back-end/interfaces/IPlayerState";

interface PlayerQuizQuestionProps {
  optionsList: IQuizOption[];
  playerState: PlayerState;
}

export default function PlayerQuizQuestion({ optionsList, playerState }: PlayerQuizQuestionProps) {
  const [quizQuestionPlayerState, setQuizQuestionPlayerState] = React.useState({
    state: playerState,
    message: ""
  });

  React.useEffect(() => {
    setQuizQuestionPlayerState({
      state: playerState,
      message: ""
    });
  }, [playerState]);

  React.useEffect(() => {
    function onAnswerQuestionSuccess() {
      setQuizQuestionPlayerState({
        state: "answered-quiz-question-waiting",
        message: ""
      });
    }

    socket.on("player-answer-question-success", onAnswerQuestionSuccess);

    return () => {
      socket.off("player-answer-question-success", onAnswerQuestionSuccess);
    };
  }, []);

  return <PlayerQuizQuestionView optionsList={optionsList} playerState={quizQuestionPlayerState} />;
}
