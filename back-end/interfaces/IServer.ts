import { Server, Socket } from "socket.io";
import ISettings from "./ISettings";
import IGameDB from "./IGameDB";
import IPreGameSettings from "./IPreGameSettings";
import IPlayerDB from "./IPlayerDB";
import { IPlayerLoadSuccess } from "./ISocketCallbacks";
import IPlayerScore from "./IPlayerScore";
import IGuess from "./IGuess";

export interface ServerToClientEvents {
  "player-game-ended": () => void;
  "player-next": (player: IPlayerDB, extraData?: IPlayerLoadSuccess) => void;
  "player-load-success": (player: IPlayerDB, extraData?: IPlayerLoadSuccess) => void;
  "player-load-error": (errorMsg: string) => void; // not listened for
  "player-submit-questionnaire-success": () => void;
  "player-submit-questionnaire-error": (errorMsg: string) => void;
  "player-answer-question-success": () => void;
  "player-answer-question-error": (error: any) => void; // not listened for
  "host-open-success": (idFromServer: number) => void;
  "host-load-success": (
    data: IGameDB & { quizQuestionGuesses: IGuess[]; playerScores: IPlayerScore[]; playersInGame: IPlayerDB[] }
  ) => void;
  "host-next": (
    data:
      | (IGameDB & { quizQuestionGuesses: IGuess[]; playerScores: IPlayerScore[]; playersInGame: IPlayerDB[] })
      | IGameDB
  ) => void; // this union type may be an error, will require further investigation
  "presettings-close": (data: IPreGameSettings) => void;
  "host-presettings-success": (idFromServer: string) => void;
  "settings-load-success": (data: IPreGameSettings) => void;
  "host-view-update": (playerStatusList: string[][]) => void;
  "host-game-ended": () => void;
  "host-open-error": (error: any) => void; // not listened for
  "host-load-error": (error: any) => void; // not listened for
  "host-view-update-error": (error: any) => void; // not listened for
  "settings-load-error": (error: any) => void; // not listened for
  "host-presettings-error": (error: any) => void; // not listened for
  "players-updated": (gameId: number, players: IPlayerDB[]) => void;
  "start-timer-success": () => void;
  "join-success": (playerId: string) => void;
  "join-error": (errorMsg: string) => void;
}

export interface ClientToServerEvents {
  "host-open": (customMode: string) => Promise<void>;
  "host-load": (gameId: number) => Promise<void>;
  "settings-load": (preSettingsId: string) => Promise<void>;
  "delete-please": () => Promise<void>;
  "host-start": (gameId: number) => Promise<void>;
  "host-end-game": () => Promise<void>;
  "host-start-quiz-timer": (gameId: number) => Promise<void>;
  "next-question": (gameId: number) => Promise<void>;
  "host-skip-questionnaire": () => Promise<void>;
  "next-from-quiz-answer": () => Promise<void>;
  "timer-skip": (gameId: number) => Promise<void>;
  "check-all-players-answered": (guess: number) => Promise<void>;
  "host-settings": (gameId: number) => Promise<void>;
  "host-back": (gameId: number, settingsData: ISettings) => Promise<void>;
  "host-pre-settings": () => Promise<void>;
  "host-ps-back": (preSettingsId: string, preSettingsData: ISettings) => Promise<void>;
  "host-kick-player": (playerName: string) => Promise<void>;
  "player-submit-join": (name: string, gameId: number) => Promise<void>;
  "player-load": (playerId: string) => Promise<void>;
  "player-submit-questionnaire": (answers: string[]) => Promise<void>;
  "player-answer-question": (guess: number) => Promise<void>;
  "player-quit": () => Promise<void>;
  "play-again-with-same-players": (gameId: number) => Promise<void>;
  "play-again": () => void;
  "reload-players": () => void;
}

export type typedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type SocketBackend = Socket<ClientToServerEvents, ServerToClientEvents>; // SocketFrontend should be in front-end/src/socket.ts
