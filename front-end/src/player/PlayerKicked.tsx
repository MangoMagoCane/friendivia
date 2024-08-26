import * as React from "react";
import "../style.css";
import { Socket } from "socket.io-client";
import PlayerJoinForm from "./PlayerJoinForm";
import { PlayerStates } from "back-end/interfaces/IPlayerState";

interface PlayerKickedProps {
  socket: Socket;
}

export default function PlayerKicked({ socket }: PlayerKickedProps) {
  return <PlayerJoinForm socket={socket} playerState={{ state: PlayerStates.Init, message: "" }} />;
}
