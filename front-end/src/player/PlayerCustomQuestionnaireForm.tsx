import * as React from "react";
import { Button } from "../extra/FrdvButton";
import TextField from "@mui/material/TextField";
import PlayerWait from "./PlayerJoinWait";
import { socket } from "../socket";
import { IPlayerState } from "back-end/interfaces/IPlayerState";

const MAX_ANSWER = 50;

interface PlayerCustomQuestionnaireFormProps {
  playerState: IPlayerState;
}

export default function PlayerCustomQuestionnaireForm({ playerState }: PlayerCustomQuestionnaireFormProps) {
  const [customQuestion, setCustomQuestion] = React.useState<string>("");

  const onSubmitCustomQuestion = () => {
    let question = customQuestion.trim();
    if (question === "") {
      // this shouldn't ever run but still good to have just in case
      alert("Please fill out your question not just spaces.");
      return;
    }
    // ! wrong socket find the right one
    socket.emit("player-submit-custom-questionnaire", question);
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
              textAlign: "center",
              marginBottom: "0",
              marginLeft: "1%",
              marginTop: "5px"
            }}
          >
            input a direct question for other players to guess
            <br />
            example: What is your favorite food?
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
