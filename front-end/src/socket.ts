import { ClientToServerEvents, ServerToClientEvents } from "back-end/interfaces/IServer";
import { backEndUrl } from "./environment";
import { io, Socket } from "socket.io-client";

export type SocketFrontend = Socket<ServerToClientEvents, ClientToServerEvents>;
export const socket: SocketFrontend = io(backEndUrl);
