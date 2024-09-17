import * as React from "react";
import HostLobbyView from "./HostLobbyView";
import Speak from "../Speak";
import { pickOneAndInterp } from "../util";
import IPlayerDB from "back-end/interfaces/IPlayerDB";
import { SocketFrontend } from "../socket";

interface HostLobbyProps {
  socket: SocketFrontend;
  gameId: number;
  classroomGame: boolean;
}

export default function HostLobby({ socket, gameId, classroomGame }: HostLobbyProps) {
  const [playerNames, setPlayerNames] = React.useState<string[]>([]);

  React.useEffect(() => {
    const onPlayersUpdated = (gameId: number, players: IPlayerDB[]): void => {
      if (gameId !== -1 && gameId === gameId) {
        setPlayerNames(players.map((p) => p.name));
      }
    };

    socket.on("players-updated", onPlayersUpdated);

    return () => {
      socket.off("players-updated", onPlayersUpdated);
    };
  }, [playerNames, setPlayerNames]);

  return (
    <>
      <div>
        {!classroomGame && playerNames.map((p, i) => <Speak key={i} text={pickOneAndInterp(welcomeMessages, p)} />)}
      </div>
      <HostLobbyView playerNames={playerNames} gameId={gameId} socket={socket} />
    </>
  );
}

const welcomeMessages = [
  "Welcome to the game, {{name}}",
  "Nice to see you, {{name}}",
  "Good to have you here, {{name}}",
  "Thanks for joining, {{name}}",
  "Watch out! It's {{name}}",
  "Welcome, {{name}}",
  "Hey! It's {{name}}",
  "Hey there {{name}}",
  "So happy to have you, {{name}}",
  "Hey {{name}}",
  "Yo {{name}}",
  "What up {{name}}",
  "Greetings, {{name}}",
  "Look who it is. {{name}}",
  "Hey hey hey, it's {{name}}",
  "It's my good friend {{name}}",
  "Well would you look at that, it's {{name}}",
  "We got {{name}}",
  "Wow, it's {{name}}",
  "Celebrity sighting! It's {{name}}",
  "Oooh la la, welcome {{name}}",
  "Oh my goodness, it's {{name}}",
  "My best friend joined. Welcome, {{name}}",
  "I've been waiting for you, {{name}}",
  "I love you, {{name}}",
  "Ayyyy omg it's {{name}}",
  "Good luck, {{name}}",
  "It's game time {{name}}",
  "It's showtime for {{name}}",
  "Let's get ready to rumble, it's {{name}}",
  "Time to shine, {{name}}",
  "The person, the myth, the legend. It's {{name}}",
  "The one and only, {{name}}",
  "Now entering the stage - it's {{name}}",
  "The moment you've all been waiting for - the arrival of {{name}}",
  "Look who decided to join us. It's {{name}}",
  "Look who showed up. It's {{name}}",
  "Oh no. No one else has a chance - it's {{name}}",
  "{{name}} is in the house!",
  "Now it's a party - {{name}} is here!",
  "omg omg omg it's {{name}}! omg omg omg",
  "I can't believe it - it's {{name}}",
  "My best pal {{name}} is here!"
];
