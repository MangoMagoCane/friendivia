import * as React from "react";
import { Socket } from "socket.io-client";
import PlayerJoinForm from "./PlayerJoinForm";

interface PlayerKickedProps {
  socket: Socket;
}

export default function PlayerKicked({ socket }: PlayerKickedProps) {
  return <PlayerJoinForm socket={socket} playerState={{ state: "init", message: "" }} />;
}
