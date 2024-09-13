import * as React from "react";
import { Button } from "../extra/FrdvButton";
import TextField from "@mui/material/TextField";
import PlayerWait from "./PlayerJoinWait";
import { SocketFrontend } from "../socket";

interface PlayerQuestionnaireFormProps {
  socket: SocketFrontend;
  playerState: any;
  questions: string[];
}

export default function PlayerQuestionnaireForm({ socket, playerState, questions }: PlayerQuestionnaireFormProps) {
  const [answers, setAnswers] = React.useState<string[]>(Array(questions.length).fill(""));
  const inMessage = `Submission accepted! Please wait for the other players to finish.`;
  const maxAnswer = 50;
  console.log(questions);

  const onSubmitQuestionnaire = () => {
    for (let i = 0; i < answers.length; i++) {
      answers[i] = answers[i].trim();
      if (answers[i] === "") {
        alert("Please fill out all answers not just spaces.");
        return;
      }
    }
    socket.emit("player-submit-questionnaire", answers);
  };

  const onInputChange = (newValue: string, index: number) => {
    const newAnswers: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      newAnswers[i] = index === i ? newValue : answers[i];
    }

    setAnswers(newAnswers);
  };

  const questionnaireInputs = (
    <>
      <div style={{ height: "5vh" }}></div>
      <div
        style={{
          width: "90%",
          margin: "auto",
          borderRadius: "20px",
          background: "white",
          padding: "20px",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          position: "relative",
          height: "75vh",
          overflowY: "scroll"
        }}
      >
        {questions.map((q, i) => (
          <div key={i}>
            <p
              style={{
                textAlign: "left",
                marginBottom: "0",
                marginLeft: "1%",
                marginTop: "5px"
              }}
            >
              {q}
            </p>
            <TextField
              id={"question-" + i}
              label={"Answer " + (i + 1)}
              variant="outlined"
              size="small"
              className="questionnaireInput"
              margin="dense"
              value={answers[i]}
              inputProps={{ maxLength: maxAnswer }}
              onChange={(e) => onInputChange(e.target.value, i)}
              sx={{
                width: "100%",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "Inter",
                marginBottom: "10px"
              }}
            />
          </div>
        ))}
        <Button
          variant="contained"
          disabled={answers.some((a) => a.length === 0)}
          sx={{
            color: "white",
            width: "100%",
            fontWeight: "light",
            fontSize: "1.29em",
            marginBottom: "0px",
            marginTop: "10px"
          }}
          onClick={onSubmitQuestionnaire}
        >
          submit
        </Button>
        <p style={{ color: "red" }}>{playerState.message}</p>
      </div>
      <div style={{ height: "20vh" }}></div>
    </>
  );

  return playerState.state === "submitted-questionnaire-waiting" ? <PlayerWait /> : questionnaireInputs;
}
