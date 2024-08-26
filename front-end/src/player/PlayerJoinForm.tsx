import * as React from "react";
import "../style.css";
import { Button } from "../extra/FrdvButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Socket } from "socket.io-client";
import PlayerWait from "./PlayerJoinWait";
import { IPlayerState } from "back-end/interfaces/IPlayerState";

interface PlayerJoinFormProps {
  socket: Socket;
  playerState: IPlayerState;
}

export default function PlayerJoinForm({ socket, playerState }: PlayerJoinFormProps) {
  const [name, setName] = React.useState("");
  const [gameId, setGameId] = React.useState<number>(0);
  const inMessage = `You're in! Please wait for the game to begin.`;

  const onSubmitJoin = () => {
    if (name.trim() === "") {
      alert("Please enter a name.");
      return;
    }
    socket.emit("player-submit-join", { name, gameId });
  };

  const joinInputs = (
    <>
      <br></br>
      <br></br>
      <Stack
        className="joinForm"
        spacing={2}
        style={{
          borderRadius: "20px",
          background: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          minHeight: "250px",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          position: "relative"
        }}
      >
        <div style={{ marginBottom: "0px" }}>
          <TextField
            className="form"
            id="name"
            variant="outlined"
            size="medium"
            value={name}
            inputProps={{ maxLength: 15 }}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            sx={{
              width: "100%",
              fontWeight: "bold",
              fontSize: "18px",
              fontFamily: "Inter"
            }}
          />
        </div>
        <div>
          <TextField
            className="idInput form"
            id="game-id"
            variant="outlined"
            size="medium"
            type="number"
            placeholder="Game ID"
            value={gameId || ""}
            onChange={(e) => setGameId(Number(e.target.value))}
            sx={{
              width: "100%",
              fontWeight: "bold",
              fontSize: "18px",
              fontFamily: "Inter"
            }}
          />
        </div>
        <Button
          className="form"
          disabled={!name || !gameId}
          variant="contained"
          size="large"
          style={{
            color: "white",
            width: "100%",
            fontWeight: "light",
            fontSize: "1.29em"
          }}
          onClick={onSubmitJoin}
        >
          join game
        </Button>
        <div
          className="gradient-border"
          style={{
            position: "absolute",
            top: "-2.7vh",
            left: "-0.5vh",
            right: "-0.5vh",
            bottom: "-0.7vh",
            zIndex: -1,
            background: "var(--main-gradient-rev)",
            borderRadius: "25px"
          }}
        ></div>
      </Stack>
      <p style={{ color: "red", marginTop: "10px" }}>{playerState.message}</p>
    </>
  );

  return playerState.state === "joined-waiting" ? <PlayerWait></PlayerWait> : joinInputs;
}
