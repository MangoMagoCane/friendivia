import * as React from "react";
import "../style.css";
import theme from "../assets/audio/theme.mp3";
import Speak from "../Speak";
import { Socket } from "socket.io-client";
import IPlayer from "back-end/interfaces/IPlayer";
import HostQuestionnaireView from "./HostQuestionnaireView";
import { getPlayerNamesForState } from "../util";
import { IPlayersObject } from "back-end/interfaces/ISocketCallbacks";

interface HostQuestionnaireProps {
  socket: Socket;
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

    const onPlayersUpdated = (playersObject: IPlayersObject) => {
      const updatedDonePlayers = getPlayerNamesForState(playersObject.players, "submitted-questionnaire-waiting");
      const updatedWaitingPlayers = getPlayerNamesForState(playersObject.players, "filling-questionnaire");
      onStatusReceived([updatedDonePlayers, updatedWaitingPlayers]);
    };

    socket.on("update-host-view", onStatusReceived);
    socket.on("players-updated", onPlayersUpdated);

    return () => {
      socket.off("update-host-view", onStatusReceived);
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
