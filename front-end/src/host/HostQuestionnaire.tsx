import * as React from "react";
import theme from "../assets/audio/theme.mp3";
import Speak from "../Speak";
import HostQuestionnaireView from "./HostQuestionnaireView";
import { getPlayerNamesForState, pickOneAndInterp } from "../util";
import { SocketFrontend } from "../socket";
import { IPlayer } from "back-end/interfaces/models/IPlayer";

interface HostQuestionnaireProps {
  socket: SocketFrontend;
  playersInGame: IPlayer[];
}

export default function HostQuestionnaire({ socket, playersInGame }: HostQuestionnaireProps) {
  const [donePlayers, setDonePlayers] = React.useState<string[]>([]);
  const [waitingPlayers, setWaitingPlayers] = React.useState<string[]>([]);
  const [latestDonePlayer, setLatestDonePlayer] = React.useState<string>("");

  // necessary because accessing donePlayers in onStatusReceived causes a closure error where it always evaluates to donePlayers initial state
  const donePlayersRef = React.useRef<string[]>();
  donePlayersRef.current = donePlayers;

  React.useEffect(() => {
    const onStatusReceived = (playerStatusList: string[][]) => {
      // console.log(playerStatusList[0]);
      // console.log(donePlayersRef.current);
      let latest: string[] = [];
      if (donePlayersRef?.current !== undefined) {
        latest = playerStatusList[0].filter((p) => !donePlayersRef?.current?.includes(p));
      }
      setLatestDonePlayer(latest[0]);
      setDonePlayers(playerStatusList[0]);
      setWaitingPlayers(playerStatusList[1]);
    };

    const onPlayersUpdated = (_gameId: number, players: IPlayer[]) => {
      const updatedDonePlayers = getPlayerNamesForState(players, "submitted-questionnaire-waiting");
      const updatedWaitingPlayers = getPlayerNamesForState(players, "filling-questionnaire");
      onStatusReceived([updatedDonePlayers, updatedWaitingPlayers]);
    };

    onPlayersUpdated(0, playersInGame);
    socket.on("host-view-update", onStatusReceived);
    socket.on("players-updated", onPlayersUpdated);

    return () => {
      socket.off("host-view-update", onStatusReceived);
    };
  }, [socket]);

  return (
    <>
      <Speak text={"Fill out your questionnaires on your devices now."} />
      {latestDonePlayer !== undefined && (
        <Speak text={pickOneAndInterp(doneMessages, latestDonePlayer)} key={latestDonePlayer} />
      )}

      <audio src={theme} loop={true} />
      <HostQuestionnaireView donePlayers={donePlayers} waitingPlayers={waitingPlayers} socket={socket} />
    </>
  );
}

const doneMessages = [
  "Thank you, {{name}}.",
  "You did it, {{name}}!",
  "Good, {{name}}!",
  "Yay, {{name}} is done!",
  "{{name}} is finished!",
  "{{name}} is ready to go!",
  "Great job, {{name}}!",
  "You're all set, {{name}}!",
  "You're done, {{name}}!",
  "You're all finished, {{name}}!",
  "{{name}} is all set.",
  "{{name}} has completed their questionnaire.",
  "I knew you could do it, {{name}}."
];
