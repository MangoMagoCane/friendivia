import * as React from 'react';
import '../style.css';
import { Button } from "@mui/material";
import Speak from '../Speak';
import { pickOne } from '../util';

interface IntLeaderboardProps {
    gameId: number;
    socket: any;
    playerScores: Array<any>;
    handsFreeMode: boolean;
}

export default function HostIntLeaderBoard(props: IntLeaderboardProps) {
  const playerScores = props.playerScores;
  const handsFreeMode = props.handsFreeMode;
  const ogPlayerScores = playerScores
  playerScores.sort((p1, p2) => p2.score - p1.score);

  const randomMessageGenerator = (firstPlayer, secondPlayer, lastPlayer) => {
    let first = `"${firstPlayer.name}"`;
    let second = `"${secondPlayer.name}"`;
    let last = `"${lastPlayer.name}"`;

    const randomMessages = [
      `${first} is in the top spot - let's see how long it lasts.`,
      `Nice job at winning, ${first}.`,
      `Wow! ${first} is heating up...`,
      `Someone please try and stop ${first} from winning.`,
      `${first} is the one to watch`,
      `Please do better ${last}`,
      `I'm very disappointed in you, ${last}`,
      `There's still hope, ${last}... but it's running out`,
      `I wouldn't bet on ${last} at this point`,
      `You're so close, ${second}!`,
      `This is cool. ${first} is my best friend, and they're doing better than everyone else.`,
      `${first} and ${second} are neck and neck! Meaning one of them is in first, and one of them is in second!`,
      `Good luck, ${last}... you're gonna need it.`,
      `${second} is in second place - keep grinding 😤`,
      `${last} - you might want to try cheating next time`
    ];

    if (firstPlayer.score === secondPlayer.score) {
      randomMessages.push(`Looks like there's a tie at the top... but ${first} is still winning.`);
    }

    return pickOne(randomMessages);
  }

  const randomMessage = randomMessageGenerator(playerScores[0], playerScores[1], playerScores[playerScores.length-1]);
  
  function onNext() {
    props.socket.emit("next-question", props.gameId);
  }

  return (
    <>
    <Speak text={randomMessage} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>Leaderboard</h1>
        <div className="leaderboard">
          {playerScores.map((ps, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: i < 9 ? "-15px" : "-20px",
                width: "100%",
              }}
            >
              <span
                className="participant"
                style={{
                  fontSize: i === 0 ? "26px" : "16px",
                  fontWeight: i === 0 ? "bold" : "normal",
                  background:
                    i === 0
                      ? "linear-gradient(315deg, #3bb78f 0%, #0bab64 74%)"
                      : "#757de8",
                  boxShadow: i === 0 ? "0 0 10px #FFD700" : "none",
                }}
              >
                {ps.name}
              </span>
              <span
                className="score"
                style={{
                  marginLeft: "-4px",
                  minWidth: "50px",
                  fontSize: i === 0 ? "26px" : "16px",
                  fontWeight: i === 0 ? "bold" : "normal",
                  background:
                    i === 0
                      ? "linear-gradient(315deg, #3bb78f 0%, #0bab64 74%)"
                      : "#757de8",
                  boxShadow: i === 0 ? "0 0 10px #FFD700" : "none",
                }}
              >
                {ps.score}
              </span>
            </div>
          ))}
        </div>
      </div>
      {!handsFreeMode ? 
        <Button
          variant="contained"
          style={{ marginTop: "5vh" }}
          sx={{
            bgcolor: getComputedStyle(document.body).getPropertyValue("--accent"),
          }}
          onClick={onNext}
        >
          Go To Next Question
        </Button> : ''
      }
    </>    
  )
}




