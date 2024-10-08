import * as React from "react";
import theme from "../assets/audio/theme.mp3";
import Speak from "../Speak";
import HostQuestionnaireView from "./HostQuestionnaireView";
import { getPlayerNamesForState, pickOneAndInterp } from "../util";
import { socket } from "../socket";
import { IPlayer } from "back-end/interfaces/models/IPlayer";

interface HostCustomQuestionnaireProps {
  playersInGame: IPlayer[];
}

export default function HostCustomQuestionnaire({ playersInGame }: HostCustomQuestionnaireProps) {
  const [donePlayers, setDonePlayers] = React.useState<string[]>([]);
  const [waitingPlayers, setWaitingPlayers] = React.useState<string[]>([]);
  const [latestDonePlayer, setLatestDonePlayer] = React.useState<string | undefined>("");

  // necessary because accessing donePlayers in onStatusReceived causes a closure error where it always evaluates to donePlayers initial state
  const donePlayersRef = React.useRef<string[]>();
  donePlayersRef.current = donePlayers;

  React.useEffect(() => {
    const onStatusReceived = (playerStatusList: string[][]) => {
      if (donePlayersRef?.current?.includes !== undefined) {
        setLatestDonePlayer(playerStatusList[0].filter((p) => !donePlayersRef?.current?.includes(p))[0]);
      }
      setDonePlayers(playerStatusList[0]);
      setWaitingPlayers(playerStatusList[1]);
    };

    const onPlayersUpdated = (_gameId: number, players: IPlayer[]) => {
      const updatedDonePlayers = getPlayerNamesForState(players, "submitted-custom-questionnaire-waiting");
      const updatedWaitingPlayers = getPlayerNamesForState(players, "filling-custom-questionnaire");
      onStatusReceived([updatedDonePlayers, updatedWaitingPlayers]);
    };

    onPlayersUpdated(-1, playersInGame);
    socket.on("host-view-update", onStatusReceived);
    socket.on("players-updated", onPlayersUpdated);

    return () => {
      socket.off("host-view-update", onStatusReceived);
      socket.off("players-updated", onPlayersUpdated); // ? This line wasn't here before me but I have a feeling it should be
    };
  }, [socket]);

  console.log("DONE PLAYERS: ");
  console.log(donePlayers);
  console.log("WAITING PLAYERS: ");
  console.log(waitingPlayers);
  return (
    <>
      <Speak text={"Fill out your custom question on your devices now."} />
      {latestDonePlayer && <Speak text={pickOneAndInterp(doneMessages, latestDonePlayer)} key={latestDonePlayer} />}

      <audio src={theme} loop={true} />
      <HostQuestionnaireView donePlayers={donePlayers} waitingPlayers={waitingPlayers} />
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
