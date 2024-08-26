import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import registerPlayerHandlers from "./handlers/playerHandler.ts";
import registerHostHandlers from "./handlers/hostHandler.ts";
import hostDb from "./db/host.ts";

dotenv.config();
const frontEndUrl = process.env["FRONT_END_URL"] || "http://localhost:3001";

const app = express();

const corsOptions = {
  origin: frontEndUrl,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const http = createServer(app);
const io: Server = new Server(http, {
  cors: {
    origin: frontEndUrl
  }
});

const db = process.env["MONGO_URI"] || "";
const dbSettings = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env["DB_NAME"] || "friendivia-test-2"
};

mongoose
  .connect(db, dbSettings)
  .then(async () => {
    console.log("MongoDB successfully connected");
    try {
      await hostDb.startDbFresh();
      console.log("Successfully deleted games and players");
    } catch (e) {
      console.error(`Issue starting DB fresh: ${e}`);
    }
  })
  .catch((err) => console.error(err));

const onSocketConnect = (socket: Socket) => {
  registerPlayerHandlers(io, socket);
  registerHostHandlers(io, socket);
};

io.on("connection", onSocketConnect);

http.listen(4001, () => {
  console.log(`Server listening on 4001`);
});

app.get("/up-check", (_req, res: any) => {
  res.status(200).end();
});
