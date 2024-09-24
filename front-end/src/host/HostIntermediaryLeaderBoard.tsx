import * as React from "react";
import { Paper } from "@mui/material";
import { Button } from "../extra/FrdvButton";
import Speak from "../Speak";
import { pickOne } from "../util";
import IPlayerScore from "back-end/interfaces/IPlayerScore";
import { socket } from "../socket";

interface IntLeaderboardProps {
  gameId: number;
  playerScores: IPlayerScore[];
  handsFreeMode: boolean;
}

export default function HostIntLeaderBoard({ gameId, playerScores, handsFreeMode }: IntLeaderboardProps) {
  playerScores.sort((p1, p2) => p2.score - p1.score);

  const randomMessageGenerator = (firstPlayer: IPlayerScore, secondPlayer: IPlayerScore, lastPlayer: IPlayerScore) => {
    let first = firstPlayer.name;
    let second = secondPlayer.name;
    let last = lastPlayer.name;

    const randomMessages = [
      `${first} is in the top spot - let's see how long it lasts.`,
      `Nice job at winning, ${first}.`,
      `Wow! ${first} is doing well.`,
      `Try to stop ${first} from winning.`,
      `${first} is the one to watch`,
      `Please do better ${last}`,
      `I'm very disappointed in you, ${last}`,
      `There's still hope, ${last}... but it's running out`,
      `I wouldn't bet on ${last} at this point`,
      `You're so close, ${second}!`,
      `My best friend ${first} is in the lead.`,
      `${first} and ${second} are at the top.`,
      `Good luck, ${last}... you're gonna need it.`,
      `${second} is in second place - keep grinding.`,
      `${last} - you might want to try cheating next time`,
      `Looks like ${last} is in last place sad face.`,
      `I know ${last} is trying their best, but they should try harder.`,
      `Keep up the good work, ${second}.`,
      `Look at this.`,
      `Here's the current scores.`,
      `You're all doing great.`,
      `Nice job everybody.`,
      `Here are the rankings.`,
      `Here are the top players right now.`,
      `It's a close game I think.`,
      `I honestly don't know what's going on here.`,
      `What a game!`,
      `We've got a good one going now!`,
      `${first} is on top, ${last} is on the bottom.`,
      `It's anybody's game - except for ${last}.`,
      `I'm not sure what ${last} is doing, but it's not working.`,
      `I think ${first} is going to win.`,
      `I think ${last} is going to lose.`,
      `I think ${second} is going to come in second.`,
      `I'm proud of all of you. But mostly ${first}`,
      `Your value is not determined by the outcome of this game. But ${first} is winning.`,
      `I love ${first} the most.`,
      `Can't wait to see who wins.`,
      `I'm so excited to see who wins.`,
      `I'm so excited to see who loses.`,
      `Everybody is doing their best, and that's all that matters.`,
      `${first} is in the top spot - nice job.`,
      `Way to go, ${first}.`,
      `Wow, ${first} is doing really well.`,
      `${first} is the one to watch`,
      `You're so close, ${second}.`,
      `${first} and ${second} are neck and neck.`,
      `Keep trying your best, ${last}.`,
      `Keep grinding, ${second}. you're almost in first.`,
      `If you're not ${first}, you're last.`,
      `I'm so proud of ${first}.`,
      `I'm so proud of ${second}. But more proud of ${first}`,
      `Come on ${last}, you can do it.`,
      `I have a lot of money on ${last} - it's not looking good.`,
      `I'm glad I bet on ${first} and not ${last}.`,
      `Yay! ${first} is winning!`,
      `I'm so happy for ${first}.`,
      `I'm so happy for ${second}. But more happy for ${first}`,
      `${last} is in last place, but they're still my friend.`,
      `You're all my best friends.`,
      `Please don't be mad at me for saying this, but ${last} is losing.`,
      `Please don't be mad at me for saying this, but ${first} is winning.`,
      `Please don't be mad at me for saying this, but ${second} is in second place.`,
      `It's anybody's game. But probably ${first}'s.`,
      `Life is a game, and ${first} is winning.`,
      `Life is good for ${first}.`,
      `I'm starting to think ${first} is cheating.`,
      `I'm starting to think ${last} doesn't actually know any of you.`,
      `The real winner is all of you for being friends with me.`,
      `I think ${first} and I are going to be best friends forever.`,
      `I think ${first} and ${second} are conspiring.`,
      `Oof. Let's hope ${last} can turn it around.`,
      `All my life I've been waiting for this. ${first} in first place.`,
      `I don't actually know what's going on here, but ${first} is winning.`,
      `I don't actually care who wins, but ${first} is winning.`,
      `These points don't really matter. But ${first} is winning.`,
      `This game is about friendship, not winning. But ${first} is winning.`,
      `I hope you're all having fun. I certainly am.`,
      `It's a party up in here.`,
      `I'm having a great time.`,
      `I'm having the best time.`,
      `I'm having the best time of my life.`,
      `Are we having fun yet?`
    ];

    // const randomMessagesFemale = [
    //   `${first} is in the top spot - nice job.`,
    //   `Way to go, ${first}.`,
    //   `Wow, ${first} is doing really well.`,
    //   `${first} is the one to watch`,
    //   `You're so close, ${second}.`,
    //   `${first} and ${second} are neck and neck.`,
    //   `Keep trying your best, ${last}.`,
    //   `keep grinding, ${second}. you're almost in first.`,
    // ];

    if (firstPlayer.score === secondPlayer.score) {
      randomMessages.push(`Looks like there's a tie at the top.`);
    }

    return pickOne(randomMessages);
  };

  let randomMessage: string;
  if (playerScores.length > 1) {
    randomMessage = randomMessageGenerator(playerScores[0], playerScores[1], playerScores[playerScores.length - 1]);
  } else if (playerScores.length === 1) {
    randomMessage = "Congrats on being the only player here, " + playerScores[0].name;
  } else {
    randomMessage = "Please end the game. No one is here.";
  }

  const onNext = () => {
    socket.emit("next-question", gameId);
  };

  return (
    <>
      <Speak text={randomMessage} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h1 style={{ fontFamily: "var(--action-font)" }}>leaderboard</h1>
        <div className="leaderboard">
          {playerScores.slice(0, 5).map((ps: IPlayerScore, i: number) => (
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
                elevation={3}
                className="score"
                style={{
                  marginLeft: "-4px",
                  minWidth: "50px",
                  fontSize: i === 0 ? "1.3em" : "1em",
                  padding: i === 0 ? "0.5em" : "3px",
                  fontWeight: i === 0 ? "bold" : "normal",
                  borderRadius: "15px",
                  color: i === 0 ? "white" : "black",
                  background: i === 0 ? "var(--main-gradient-rev)" : "white",
                  width: "40%"
                }}
              >
                {ps.score}
              </Paper>
            </div>
          ))}
        </div>
      </div>
      {!handsFreeMode && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button variant="contained" style={{ marginTop: "5vh" }} onClick={onNext}>
            next
          </Button>
        </div>
      )}
    </>
  );
}
