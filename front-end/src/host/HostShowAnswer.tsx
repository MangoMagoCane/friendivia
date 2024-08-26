import * as React from "react";
import "../style.css";
import { Paper, Stack } from "@mui/material";
import { Button } from "../extra/FrdvButton";
import { Socket } from "socket.io-client";
import Speak from "../Speak";
import { pickOne } from "../util";
import PlayerBadge from "./PlayerBadge";
import IQuizOption from "back-end/interfaces/IQuizOption";

interface IShowAnswerProps {
  playerName: string;
  questionText: string;
  options: IQuizOption[];
  correctAnswerIndex: number;
  playerGuesses: Array<any>;
  socket: Socket;
  gameId: number;
  quizLength: number;
  handsFreeMode: boolean;
}

export default function HostShowAnswer(props: IShowAnswerProps) {
  const {
    options,
    questionText,
    playerName,
    correctAnswerIndex,
    playerGuesses,
    socket,
    gameId,
    quizLength,
    handsFreeMode
  } = props;

  const totalGuesses = playerGuesses.length - 1;
  const correctPlayers = playerGuesses.filter((g) => g && g.guess === correctAnswerIndex);
  const numCorrect = correctPlayers.length;
  const pctCorrect = Math.floor(100 * (numCorrect / totalGuesses));
  const subjectBonus = Math.floor(300 * (numCorrect / totalGuesses));

  function interpolatePlayerNameInQuestionText() {
    const [part1, part2] = questionText.split("<PLAYER>");
    return (
      <p className="showAnswer">
        {part1}
        <b>{playerName}</b>
        {part2}
      </p>
    );
  }

  function onNext() {
    socket.emit("next-from-quiz-answer");
  }

  function correctText() {
    var res = `The correct answer was "${options[correctAnswerIndex].answerText}".`;
    if (correctPlayers.length != 0) {
      const encourage = pickOne(["Nice guessing", "Good job", "Way to go", "Congrats"]);
      res += `! ${encourage} `;
    } else {
      const sad = pickOne([
        "Unfortunately, no one got it. Luckily, you still get points for failing.",
        "I'm sorry, this is sad. No one won, but guessers get consolation points for fast answers.",
        `No points for ${playerName}. Please try to do better next time.`,
        `Looks like no one knows ${playerName} at all. But if you were wrong faster, you get more points.`
      ]);
      res += `! ${sad}`;
    }

    if (correctPlayers.length < 4) {
      correctPlayers.forEach((e) => {
        if (e.name === correctPlayers[correctPlayers.length - 1].name && e.name !== correctPlayers[0].name) {
          res += "and " + e.name + ".";
        } else {
          res += e.name + ", ";
        }
      });
    } else {
      res += "- lots of people got this one.";
    }

    return res;
  }

  return (
    <>
      <Speak text={correctText()} />
      <div className="hostAnswerScroll">
        {interpolatePlayerNameInQuestionText()}

        <Paper
          sx={{
            width: "50%",
            alignSelf: "center",
            justifyContent: "center",
            margin: "auto",
            marginBottom: "2vh",
            fontSize: "1.6em",
            paddingTop: "1vh",
            paddingBottom: "1vh",
            maxWidth: "600px"
          }}
        >
          {numCorrect > 0 ? (
            <p style={{ margin: 0, fontFamily: `"Concert One", sans-serif` }}>
              {pctCorrect}% correct ={" "}
              <span style={{ fontWeight: "bold", color: "var(--main)" }}>{subjectBonus} points</span> for {playerName}!
            </p>
          ) : (
            <p style={{ margin: 0, fontFamily: `"Concert One", sans-serif` }}>
              0% correct ☹ = consolation points based on speed
            </p>
          )}
        </Paper>
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
          {options.map((op: IQuizOption, i: number) => (
            <div
              className="guesses"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  width: "95%",
                  height: "20vh",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: i === correctAnswerIndex ? "var(--main-gradient-rev)" : "white",
                  border: "2px solid purple",
                  borderRadius: "20px"
                }}
                key={i}
              >
                <p
                  style={{
                    color: i === correctAnswerIndex ? "white" : "black",
                    fontFamily: "Concert One",
                    fontSize: "2em",
                    paddingLeft: "0.5em",
                    paddingRight: "0.5em",
                    textAlign: "center"
                  }}
                >
                  {op.answerText}
                </p>
                {i !== correctAnswerIndex && (
                  <p>
                    (from <b>{op.answerer}</b>)
                  </p>
                )}
              </Paper>
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: "5px"
                }}
              >
                {playerGuesses
                  .filter((g) => g && g.guess === i)
                  .map((g, j) => (
                    <>
                      <PlayerBadge name={g.name} />
                      <div style={{ height: "0.4vh" }} />
                    </>
                  ))}
              </Stack>
            </div>
          ))}
        </div>
        <div>
          {!handsFreeMode && (
            <Button
              className="button"
              variant="contained"
              sx={{
                m: 2,
                margin: "auto",
                marginTop: "2rem"
              }}
              onClick={onNext}
            >
              next
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
