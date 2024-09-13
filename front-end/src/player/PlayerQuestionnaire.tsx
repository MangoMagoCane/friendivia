import * as React from "react";
import PlayerQuestionnaireForm from "./PlayerQuestionnaireForm";
import { SocketFrontend } from "../socket";

interface PlayerQuestionnaireProps {
  socket: SocketFrontend;
  playerState: string;
  questionnaireQuestionsText: string[];
}

export default function PlayerQuestionnaire({
  socket,
  playerState,
  questionnaireQuestionsText
}: PlayerQuestionnaireProps) {
  const [questionnairePlayerState, setQuestionnairePlayerState] = React.useState({
    state: playerState,
    message: ""
  });

  React.useEffect(() => {
    const onSubmitQuestionnaireSuccess = () => {
      setQuestionnairePlayerState({
        state: "submitted-questionnaire-waiting",
        message: ""
      });
    };

    const onSubmitQuestionnaireError = (errorMsg: string) => {
      setQuestionnairePlayerState({
        state: "filling-questionnaire",
        message: errorMsg.toString()
      });
    };

    socket.on("player-submit-questionnaire-success", onSubmitQuestionnaireSuccess);
    socket.on("player-submit-questionnaire-error", onSubmitQuestionnaireError);

    return () => {
      socket.off("player-submit-questionnaire-success", onSubmitQuestionnaireSuccess);
      socket.off("player-submit-questionnaire-error", onSubmitQuestionnaireError);
    };
  }, [questionnairePlayerState, setQuestionnairePlayerState]);

  return (
    <PlayerQuestionnaireForm
      socket={socket}
      playerState={questionnairePlayerState}
      questions={questionnaireQuestionsText}
    />
  );
}
