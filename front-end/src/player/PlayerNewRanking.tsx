import IPlayerScore from "back-end/interfaces/IPlayerScore";
import * as React from "react";

interface RankingProps {
  playerScores: IPlayerScore[];
  playerName: string;
}

export default function PlayerNewRanking({ playerScores, playerName }: RankingProps) {
  playerScores.sort((p1, p2) => p2.score - p1.score);

  const getPlayerRankDisplay = () => {
    let message = "";
    if (playerScores[0].name === playerName) {
      const pointDifference = playerScores[0].score - playerScores[1].score;
      message = pointDifference === 0 ? `You are tied with ${playerScores[1].name}!` : "You are in first place!";
    } else {
      for (let i = 1; i < playerScores.length; i++) {
        if (playerScores[i].name === playerName) {
          const playerToBeat = playerScores[i - 1].name;
          const pointDifference = playerScores[i - 1].score - playerScores[i].score;
          message =
            pointDifference === 0
              ? `You are tied with ${playerToBeat}`
              : `You are ${pointDifference} points behind ${playerToBeat}`;
          break;
        }
      }
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "90vh",
          verticalAlign: "center"
        }}
      >
        <p
          style={{
            fontFamily: "Concert One",
            fontSize: "2.4em",
            margin: "auto",
            background: "var(--main-gradient-rev)",
            borderRadius: "20px",
            padding: "1em",
            marginLeft: "1em",
            marginRight: "1em",
            border: "2px solid black",
            color: "white"
          }}
        >
          {message}
        </p>
      </div>
    );
  };

  return <div>{playerScores.length > 1 ? getPlayerRankDisplay() : "What are you doing here?"}</div>;
}
