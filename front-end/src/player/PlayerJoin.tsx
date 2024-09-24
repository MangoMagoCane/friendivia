import * as React from "react";
import PlayerJoinForm from "./PlayerJoinForm";
import { IPlayerState, PlayerState } from "back-end/interfaces/IPlayerState";
import { socket } from "../socket";

interface PlayerJoinProps {
  playerState: PlayerState | "";
}

export default function PlayerJoin({ playerState }: PlayerJoinProps) {
  const [joiningPlayerState, setJoiningPlayerState] = React.useState<IPlayerState>({} as IPlayerState);

  React.useEffect(() => {
    if (playerState === "joined-waiting") {
      setJoiningPlayerState({
        state: "joined-waiting",
        message: ""
      });
    }
  }, [playerState, setJoiningPlayerState]);

  React.useEffect(() => {
    const onJoinSuccess = (playerId: string): void => {
      localStorage.setItem("player-id", playerId);
      setJoiningPlayerState({
        state: "joined-waiting",
        message: ""
      });
    };

    const onJoinError = (errorMsg: string): void => {
      setJoiningPlayerState({
        state: "init",
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

  return <PlayerJoinForm playerState={joiningPlayerState} />;
}
