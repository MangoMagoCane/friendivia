import * as React from "react";
import Paper from "@mui/material/Paper";
import Speak from "../Speak";
import { Button } from "../extra/FrdvButton";
import PlayerBadge from "./PlayerBadge";
import { pickOneAndInterp, pickOne } from "../util";
import { SocketFrontend } from "../socket";

interface HostQuestionnaireViewProps {
  socket: SocketFrontend;
  donePlayers: string[];
  waitingPlayers: string[];
}

export default function HostQuestionnaireView({ socket, donePlayers, waitingPlayers }: HostQuestionnaireViewProps) {
  const [spokenWarnings, setSpokenWarnings] = React.useState<string[]>([]);

  const onPlayerKick = async (name: string) => {
    if (waitingPlayers.length + donePlayers.length > 2) {
      socket.emit("host-kick-player", name);
    } else {
      alert("You need at least 2 players to play!");
    }
  };

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (waitingPlayers.length > 0) {
        setSpokenWarnings([...spokenWarnings, pickOneAndInterp(warningMessages, pickOne(waitingPlayers))]);
      }
    }, 20000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [spokenWarnings, waitingPlayers]);

  return (
    <>
      {spokenWarnings.map((text: string, i: number) => (
        <Speak key={i} text={text} />
      ))}
      {waitingPlayers.length === 1 && <Speak text={`It all comes down to you, ${waitingPlayers[0]}.`} />}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            marginTop: "4vh"
          }}
        >
          <Paper
            elevation={3}
            sx={{
              background: "linear-gradient(127deg, var(--main), var(--main-light))",
              borderRadius: "12px",
              padding: "1vw",
              margin: "auto",
              mx: "auto",
              width: "46vw",
              height: "68vh"
            }}
          >
            <h1
              style={{
                color: "white",
                fontFamily: "Concert One",
                fontSize: "2.5em"
              }}
            >
              waiting on
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0rem"
              }}
            >
              {waitingPlayers.map((name: string, i: number) => (
                <li className="li" key={i}>
                  <PlayerBadge name={name} onClick={() => onPlayerKick(name)} />
                </li>
              ))}
            </div>
          </Paper>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            marginTop: "4vh"
          }}
        >
          <Paper
            elevation={3}
            sx={{
              background: "linear-gradient(127deg, var(--main-light), var(--main))",
              borderRadius: "12px",
              padding: "1vw",
              margin: "auto",
              mx: "auto",
              width: "46vw",
              height: "68vh"
            }}
          >
            <h1
              style={{
                color: "white",
                fontFamily: "Concert One",
                fontSize: "2.5em"
              }}
            >
              done
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0rem"
              }}
            >
              {donePlayers.map((name: string, i: number) => (
                <li className="li" key={i}>
                  <PlayerBadge name={name} onClick={() => onPlayerKick(name)} />
                </li>
              ))}
            </div>
          </Paper>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          marginTop: "20px",
          marginRight: "5px",
          fontSize: "1.2em"
        }}
      >
        <Button
          variant="contained"
          sx={{ fontSize: "1.1em" }}
          disabled={donePlayers.length < 1}
          onClick={() => socket.emit("host-skip-questionnaire")}
        >
          next
        </Button>
      </div>
    </>
  );
}

const warningMessages = [
  "Let's go, {{name}}.",
  "Hurry it up, {{name}}",
  "What's taking {{name}} so long?",
  "Don't worry, {{name}}. You still have time.",
  "Ok seriously, let's go {{name}}.",
  "Come on, {{name}}. We don't have all day.",
  "Seriously, {{name}}. Let's get moving.",
  "{{name}} has gotta pick up the pace.",
  "I'm waiting, {{name}}."
];
