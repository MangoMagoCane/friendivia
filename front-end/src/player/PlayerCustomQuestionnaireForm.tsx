import * as React from "react";
import { Button } from "../extra/FrdvButton";
import TextField from "@mui/material/TextField";
import PlayerWait from "./PlayerJoinWait";

const MAX_ANSWER = 50;

interface PlayerCustomQuestionnaireFormProps {
  playerState: any;
}

export default function PlayerCustomQuestionnaireForm({ playerState }: PlayerCustomQuestionnaireFormProps) {
  const [customQuestion, setCustomQuestion] = React.useState<string>("");

  const onSubmitCustomQuestion = () => {
    let question = customQuestion.trim();
    if (question === "") {
      alert("Please fill out your question not just spaces.");
      return;
    }
    // ! wrong socket find the right one
    // socket.emit("player-submit-questionnaire", question);
  };

  const onInputChange = (newValue: string) => {
    // const newAnswers: string[] = [];
    // for (let i = 0; i < questions.length; i++) {
    //   newAnswers[i] = index === i ? newValue : customQuestion[i];
    // }
    // setAnswers(newAnswers);
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
        <div>
          <p
            style={{
              textAlign: "left",
              marginBottom: "0",
              marginLeft: "1%",
              marginTop: "5px"
            }}
          >
            {customQuestion}
          </p>
          <TextField
            id={"custom-question"}
            label={"Answer"}
            variant="outlined"
            size="small"
            className="questionnaireInput"
            margin="dense"
            value={customQuestion}
            inputProps={{ maxLength: MAX_ANSWER }}
            // onChange={(e) => onInputChange(e.target.value)}
            onChange={(e) => setCustomQuestion(e.target.value)}
            sx={{
              width: "100%",
              fontWeight: "bold",
              fontSize: "18px",
              fontFamily: "Inter",
              marginBottom: "10px"
            }}
          />
        </div>
        <Button
          variant="contained"
          disabled={customQuestion.trim() === ""}
          sx={{
            color: "white",
            width: "100%",
            fontWeight: "light",
            fontSize: "1.29em",
            marginBottom: "0px",
            marginTop: "10px"
          }}
          onClick={onSubmitCustomQuestion}
        >
          submit
        </Button>
        <p style={{ color: "red" }}>{playerState.message}</p>
      </div>
      <div style={{ height: "20vh" }}></div>
    </>
  );

  return playerState.state === "submitted-custom-questionnaire-waiting" ? <PlayerWait /> : questionnaireInputs;
}
