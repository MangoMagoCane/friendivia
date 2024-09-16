import React from "react";
import crown from "../assets/crown.png";
import { Paper } from "@mui/material";
import { Button } from "../extra/FrdvButton";
import Speak from "../Speak";
import { SocketFrontend } from "../socket";
import IPlayerScore from "back-end/interfaces/IPlayerScore";

interface ILeaderBoardProps {
  gameId: number;
  playerScores: IPlayerScore[];
  socket: SocketFrontend;
}

export default function HostLeaderBoard({ gameId, playerScores, socket }: ILeaderBoardProps) {
  const [numPlayersToShow, setNumPlayersToShow] = React.useState<number>(5);

  playerScores.sort((p1, p2) => p2.score - p1.score);

  const onPlayAgainWithSamePlayers = (): void => {
    socket.emit("play-again-with-same-players", gameId);
  };

  const winnerText = (): string => {
    const winnerScore = playerScores[0].score;
    const winnerName = playerScores[0].name;
    return `The winner is "${winnerName}" with a score of "${winnerScore}"! Great job!`;
  };

  const showAllPlayers = (): void => {
    setNumPlayersToShow(playerScores.length);
  };

  return (
    <>
      <Speak text={winnerText()} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: "3rem" // Add space for the buttons at the bottom
        }}
      >
        <h1 style={{ fontFamily: "var(--action-font)" }}>leaderboard</h1>
        <img src={crown} alt="Crown" style={{ width: "8vw", paddingBottom: "1vh", paddingTop: "1vh" }} />
        <div className="leaderboard">
          {playerScores.slice(0, numPlayersToShow).map((ps, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: i < 9 ? "-15px" : "-20px",
                width: "100%",
                paddingBottom: "20px"
              }}
            >
              <Paper
                elevation={3}
                className="lobby_player"
                sx={{
                  background: i === 0 ? "var(--main-gradient-rev)" : "white",
                  borderRadius: "20px",
                  marginRight: "10px"
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--action-font)",
                    color: i === 0 ? "white" : "black",
                    paddingTop: i === 0 ? "8px" : "3px",
                    paddingBottom: i === 0 ? "8px" : "3px",
                    fontSize: i === 0 ? "1.3em" : "1em"
                  }}
                >
                  {ps.name}
                </p>
              </Paper>
              <Paper
                className="score"
                style={{
                  marginLeft: "-4px",
                  minWidth: "50px",
                  fontSize: i === 0 ? "1.3em" : "1em",
                  padding: i === 0 ? "0.5em" : "3px",
                  fontWeight: i === 0 ? "bold" : "normal",
                  borderRadius: "15px",
                  background: i === 0 ? "var(--main-gradient-rev)" : "white",
                  width: "40%",
                  color: i === 0 ? "white" : "black"
                }}
              >
                {ps.score}
              </Paper>
            </div>
          ))}
        </div>
        <Button
          onClick={showAllPlayers}
          variant="contained"
          sx={{ display: numPlayersToShow < playerScores.length ? "block" : "none" }}
          style={{ margin: "2px" }}
        >
          show all players
        </Button>
        <Button onClick={onPlayAgainWithSamePlayers} variant="contained" style={{ margin: "2px" }}>
          play again with the same players
        </Button>
      </div>
    </>
  );
}
