import * as React from "react";
import PlayerJoinForm from "./PlayerJoinForm";
import { socket } from "../socket";

export default function PlayerKicked() {
  return <PlayerJoinForm playerState={{ state: "init", message: "" }} />;
}
