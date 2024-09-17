import * as React from "react";
import theme from "../assets/audio/theme.mp3";
import Speak from "../Speak";
import HostQuestionnaireView from "./HostQuestionnaireView";
import { getPlayerNamesForState } from "../util";
import { SocketFrontend } from "../socket";
import { IPlayer } from "back-end/interfaces/models/IPlayer";

interface HostQuestionnaireProps {
  socket: SocketFrontend;
  playersInGame: IPlayer[];
}

export default function HostQuestionnaire({ socket, playersInGame }: HostQuestionnaireProps) {
  const donePlayersStart = getPlayerNamesForState(playersInGame, "submitted-questionnaire-waiting");
  const waitingPlayersStart = getPlayerNamesForState(playersInGame, "filling-questionnaire");

  const [donePlayers, setDonePlayers] = React.useState<string[]>(donePlayersStart);
  const [waitingPlayers, setWaitingPlayers] = React.useState<string[]>(waitingPlayersStart);

  React.useEffect(() => {
    const onStatusReceived = (playerStatusList: string[][]) => {
      setDonePlayers(playerStatusList[0]);
      setWaitingPlayers(playerStatusList[1]);
    };

    const onPlayersUpdated = (gameId: number, players: IPlayer[]) => {
      const updatedDonePlayers = getPlayerNamesForState(players, "submitted-questionnaire-waiting");
      const updatedWaitingPlayers = getPlayerNamesForState(players, "filling-questionnaire");
      onStatusReceived([updatedDonePlayers, updatedWaitingPlayers]);
    };

    socket.on("host-view-update", onStatusReceived);
    socket.on("players-updated", onPlayersUpdated);

    return () => {
      socket.off("host-view-update", onStatusReceived);
    };
  }, [socket]);

  return (
    <>
      <Speak text={"Fill out your questionnaires on your devices now."} />
      <audio src={theme} loop={true} />
      <HostQuestionnaireView donePlayers={donePlayers} waitingPlayers={waitingPlayers} socket={socket} />
    </>
  );
}
