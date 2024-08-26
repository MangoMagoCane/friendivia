import * as React from "react";
import "../style.css";
import { Paper } from "@mui/material";
import { Button } from "../extra/FrdvButton";
import { Socket } from "socket.io-client";
import Speak from "../Speak";
import { pickOne } from "../util";
import IQuizOption from "back-end/interfaces/IQuizOption";

interface HostShowQuestionprops {
  playerName: string;
  questionText: string;
  options: IQuizOption[];
  socket: Socket;
  gameId: number;
  timePerQuestion: number;
  handsFreeMode: boolean;
}

function HostShowQuestion({
  playerName,
  questionText,
  options,
  socket,
  gameId,
  timePerQuestion,
  handsFreeMode
}: HostShowQuestionprops) {

  const [timerStarted, setTimerStarted] = React.useState<boolean>(false);


  const interpolatePlayerNameInQuestionText = () => {
    const [part1, part2] = questionText.split("<PLAYER>");
    return (
      <p className="question">
        {part1}
        <b>{playerName}</b>
        {part2}
      </p>
    );
  };

  const quizText = () => {
    const [part1, part2] = questionText.split("<PLAYER>");
    var res = "";
    res += part1 + `${playerName}` + part2 + "? is it ";
    for (var i = 0; i < options.length; i++) {
      if (i == options.length - 1) {
        res += `or "${options[i].answerText}"?`;
      } else {
        res += `"${options[i].answerText}", `;
      }
    }

    const instructions = [
      " Answer on your devices now.",
      " Give it your best guess.",
      " What do you think?",
      " Go ahead and answer now."
    ];

    res += pickOne(instructions);
    return res;
  };

  const startTimer = () => {
    setTimerStarted(true);
    socket.emit("host-start-quiz-timer", gameId);
  };

  socket.on("start-timer-success", () => setTimerStarted(true));

  const onTimerSkipBtn = () => {
    socket.emit("timer-skip", gameId);
  };

  return (
    <>
      <Speak text={quizText()} callback={startTimer} />
      <Timer started={timerStarted} />
      <p style={{ marginBottom: "30px", fontSize: "1.3em" }}>{interpolatePlayerNameInQuestionText()}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          width: "100%",
          alignContent: "center",
          justifyContent: "center",
          justifyItems: "center",
          alignItems: "center"
        }}
      >
        {options.map((o: IQuizOption, i: number) => (
          <Paper
            elevation={3}
            style={{
              width: "95%",
              height: "20vh",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid purple",
              borderRadius: "20px"
            }}
            key={i}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "Concert One",
                color: "black",
                fontSize: "2em",
                paddingLeft: "0.5em",
                paddingRight: "0.5em",
                textAlign: "center"
              }}
            >
              {o.answerText}
            </p>
          </Paper>
        ))}
      </div>

      <div>
        {!handsFreeMode ? (
          <Button
            className="button"
            variant="contained"
            disabled={timerStarted ? false : true}
            sx={{
              m: 2,
              margin: "auto",
              marginTop: "2rem"
            }}
            onClick={onTimerSkipBtn}
          >
            show answers
          </Button>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default React.memo(HostShowQuestion);

  interface TimerProps {
    started: boolean
  }
  const Timer = (started): => {
    const started = props.started;
    const [counter, setCounter] = React.useState(timePerQuestion);
    React.useEffect(() => {
      if (started && counter > 0) {
        setTimeout(() => setCounter(counter - 1), 1000);
      }
    }, [counter]);
    return (
      <div className="dot">
        <div className="timer">
          <div className="timeNumber">{started ? counter : "⌛"}</div>
        </div>
      </div>
    );
  };