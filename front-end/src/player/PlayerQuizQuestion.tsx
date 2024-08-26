import * as React from "react";
import "../style.css";
import { Button } from "@mui/material";
import { Socket } from "socket.io-client";
import PlayerQuizQuestionView from "./PlayerQuizQuestionView";
import IQuizOption from "back-end/interfaces/IQuizOption";

interface PlayerQuizQuestionProps {
  optionsList: IQuizOption[];
  socket: Socket;
  playerState: string;
}

export default function PlayerQuizQuestion({ optionsList, socket, playerState }: PlayerQuizQuestionProps) {
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

  return <PlayerQuizQuestionView optionsList={optionsList} socket={socket} playerState={quizQuestionPlayerState} />;
}
