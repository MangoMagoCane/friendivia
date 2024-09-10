import { Schema, model } from "mongoose";
import IPreGameSettings from "../interfaces/IPreGameSettings";

const preGameSettingsSchema = new Schema<IPreGameSettings>({
  id: { type: String, required: true },
  hostSocketId: { type: String, required: true },
  settingsState: { type: Boolean, required: true },
  settings: { type: Object, required: true }
});

const PreGameSettings = model<IPreGameSettings>("PreGameSettings", preGameSettingsSchema);
export default PreGameSettings;
