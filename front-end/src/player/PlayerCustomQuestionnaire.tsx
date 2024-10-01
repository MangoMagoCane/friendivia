import * as React from "react";
import PlayerCustomQuestionnaireForm from "./PlayerQuestionnaireForm";
import { socket } from "../socket";

interface PlayerCustomQuestionnaireProps {
  playerState: string;
  questionnaireQuestionsText: string[];
}

export default function PlayerCustomQuestionnaire({
  playerState,
  questionnaireQuestionsText
}: PlayerCustomQuestionnaireProps) {
  const [questionnairePlayerState, setQuestionnairePlayerState] = React.useState({
    state: playerState,
    message: ""
  });

  React.useEffect(() => {
    const onSubmitCustomQuestionnaireSuccess = () => {
      setQuestionnairePlayerState({
        state: "submitted-custom-questionnaire-waiting",
        message: ""
      });
    };

    const onSubmitQuestionnaireError = (errorMsg: string) => {
      setQuestionnairePlayerState({
        state: "filling-custom-questionnaire",
        message: errorMsg.toString()
      });
    };

    socket.on("player-submit-custom-questionnaire-success", onSubmitCustomQuestionnaireSuccess);
    socket.on("player-submit-custom-questionnaire-error", onSubmitQuestionnaireError);

    return () => {
      socket.off("player-submit-questionnaire-success", onSubmitCustomQuestionnaireSuccess);
      socket.off("player-submit-questionnaire-error", onSubmitQuestionnaireError);
    };
  }, [questionnairePlayerState, setQuestionnairePlayerState]);

  //   return <div>We are in the player custom questionnaire</div>;

  return (
    <PlayerCustomQuestionnaireForm playerState={questionnairePlayerState} questions={questionnaireQuestionsText} />
  );
}
