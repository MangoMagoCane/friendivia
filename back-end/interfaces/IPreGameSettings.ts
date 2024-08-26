import ISettings from "./ISettings";

export default interface IGame {
  id: string;
  hostSocketId: string;
  settingsState: boolean;
  settings: ISettings;
}
