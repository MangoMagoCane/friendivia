import * as React from "react";
import "../style.css";
import { Socket } from "socket.io-client";
import PlayerJoinForm from "./PlayerJoinForm";
import { IPlayerState, PlayerStates } from "back-end/interfaces/IPlayerState";

interface PlayerJoinProps {
  socket: Socket;
  playerState: string;
}

export default function PlayerJoin({ socket, playerState }: PlayerJoinProps) {
  const [joiningPlayerState, setJoiningPlayerState] = React.useState<IPlayerState>({} as IPlayerState);

  React.useEffect(() => {
    if (playerState === "joined-waiting") {
      setJoiningPlayerState({
        state: PlayerStates.JoinedWaiting,
        message: ""
      });
    }
  }, [playerState, setJoiningPlayerState]);

  React.useEffect(() => {
    const onJoinSuccess = (playerId: string) => {
      localStorage.setItem("player-id", playerId);
      setJoiningPlayerState({
        state: PlayerStates.JoinedWaiting,
        message: ""
      });
    };

    const onJoinError = (errorMsg: string) => {
      setJoiningPlayerState({
        state: PlayerStates.Init,
        message: errorMsg
      });
    };

    socket.on("join-success", onJoinSuccess);
    socket.on("join-error", onJoinError);

    return () => {
      socket.off("join-success", onJoinSuccess);
      socket.off("join-error", onJoinError);
    };
  }, [joiningPlayerState, setJoiningPlayerState]);

  return <PlayerJoinForm socket={socket} playerState={joiningPlayerState} />;
}
