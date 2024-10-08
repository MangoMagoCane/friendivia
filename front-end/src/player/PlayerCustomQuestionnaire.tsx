import * as React from "react";
import PlayerCustomQuestionnaireForm from "./PlayerCustomQuestionnaireForm";
import { socket } from "../socket";
import { IPlayerState, PlayerState } from "back-end/interfaces/IPlayerState";

interface PlayerCustomQuestionnaireProps {
  playerState: PlayerState;
  questionnaireQuestionsText: string[];
}

export default function PlayerCustomQuestionnaire({
  playerState,
  questionnaireQuestionsText
}: PlayerCustomQuestionnaireProps) {
  const [questionnairePlayerState, setQuestionnairePlayerState] = React.useState<IPlayerState>({
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

  return <PlayerCustomQuestionnaireForm playerState={questionnairePlayerState} />;
}
