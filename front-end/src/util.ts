import { PlayerState } from "back-end/interfaces/IPlayerState";
import { IPlayer } from "back-end/interfaces/models/IPlayer";

export function pickOne<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickOneAndInterp(arr: string[], pName: string): string {
  return pickOne(arr).replace("{{name}}", `"${pName}"`);
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Typing seems a bit weird but it seems to be safe
export function valInArr<T extends string, K extends T>(val: T, arr: K[]): boolean {
  return arr.includes(val as K);
}

export function getPlayerNamesForState(players: IPlayer[], state: PlayerState) {
  return players.filter((p) => p.playerState.state === state).map((p) => p.name);
}
