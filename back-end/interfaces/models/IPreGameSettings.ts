import mongoose from "mongoose";
import ISettings from "../ISettings";

export interface IPreGameSettings {
  _id: mongoose.Types.ObjectId;
  id: string;
  hostSocketId: string;
  settingsState: boolean;
  settings: ISettings;
}
