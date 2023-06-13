import * as React from 'react';
import '../style.css';
import { Socket } from 'socket.io-client';
import QuestionnaireForm from './QuestionnaireForm';

interface IQuestionnaireProps {
  socket: Socket,
  playerState: string,
  questionnaireQuestionsText: string[]
}

export default function Questionnaire(props: IQuestionnaireProps) {
  const { socket, playerState, questionnaireQuestionsText } = props;
  const [questionnairePlayerState, setQuestionnairePlayerState] = React.useState({
    state: playerState,
    message: ''
  });
  
  React.useEffect(() => {
    function onSubmitQuestionnaireSuccess() {
      setQuestionnairePlayerState({
        state: 'submitted-questionnaire-waiting',
        message: ''
      });
    }

    function onSubmitQuestionnaireError(errorMsg: string) {
      setQuestionnairePlayerState({
        state: 'filling-questionnaire',
        message: errorMsg
      });
    }
  
    socket.on('player-submit-questionnaire-success', onSubmitQuestionnaireSuccess);
    socket.on('player-submit-questionnaire-error', onSubmitQuestionnaireError);

    return () => {
      socket.off('player-submit-questionnaire-success', onSubmitQuestionnaireSuccess);
      socket.off('player-submit-questionnaire-error', onSubmitQuestionnaireError);
    }
  }, [questionnairePlayerState, setQuestionnairePlayerState]);

  return (
    <QuestionnaireForm socket={socket} playerState={questionnairePlayerState} questions={questionnaireQuestionsText} />
  )
}
