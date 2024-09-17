import * as React from "react";
import { Button } from "../extra/FrdvButton";
import PlayerWait from "./PlayerWait";
import IQuizOption from "back-end/interfaces/IQuizOption";
import { SocketFrontend } from "../socket";
import { IPlayerState } from "back-end/interfaces/IPlayerState";

interface IQuizQuestionViewProps {
  optionsList: IQuizOption[];
  socket: SocketFrontend;
  playerState: IPlayerState;
}

export default function PlayerQuizQuestionView({ optionsList, socket, playerState }: IQuizQuestionViewProps) {
  const guessReceivedMessage = `Guess received! Hang tight...`;

  const goTo = (answerIndex: number): void => {
    answerQuestion(answerIndex);
    allPlayersAnswerQuestion(answerIndex);
  };

  const answerQuestion = async (answerIndex: number): Promise<void> => {
    socket.emit("player-answer-question", answerIndex);
  };

  const allPlayersAnswerQuestion = async (answerIndex: number): Promise<void> => {
    socket.emit("check-all-players-answered", answerIndex);
  };

  const optionsForm = (
    <div>
      <div className="answerOptions">
        {optionsList.map((o, i) => (
          <React.Fragment key={i}>
            <br />
            <Button
              className="answerButton"
              variant="contained"
              sx={{
                fontSize: "1.5em",
                width: "90%",
                height: "15vh",
                border: "2px solid black"
              }}
              key={i}
              onClick={() => goTo(i)}
            >
              {o.answerText}
            </Button>
          </React.Fragment>
        ))}
      </div>

      <p style={{ color: "red" }}>{playerState.message}</p>
    </div>
  );

  switch (playerState.state) {
    case "answered-quiz-question-waiting":
      return <PlayerWait message={guessReceivedMessage} />;
    case "question-being-read":
      return <PlayerWait message="Get ready to answer..." />;
    default:
      return optionsForm;
  }
}
