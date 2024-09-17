import { Schema, model } from "mongoose";
import { IPreGameSettings } from "../interfaces/models/IPreGameSettings";

const preGameSettingsSchema = new Schema<IPreGameSettings>({
  id: { type: String, required: true },
  hostSocketId: { type: String, required: true },
  settingsState: { type: Boolean, required: true },
  settings: { type: Object, required: true }
});

export const PreGameSettings = model<IPreGameSettings>("PreGameSettings", preGameSettingsSchema);
