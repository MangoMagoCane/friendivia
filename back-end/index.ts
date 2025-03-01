import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { hostDb } from "./db/host.ts";
import { typedServer } from "./interfaces/IServer.ts";
import { Server } from "socket.io";
import basequestions from "./db/basequestions.ts";
import { questionDb } from "./db/question.ts";
import { IQuestionnaireQuestion } from "./interfaces/models/IQuestionnaireQuestion.ts";
import { playerHandler } from "./handlers/playerHandler.ts";
import { hostHandler } from "./handlers/hostHandler.ts";

dotenv.config();
const frontEndUrl = process.env["FRONT_END_URL"] || "http://localhost:3001";
console.log(`frontEndUrl: ${frontEndUrl}`);

const app = express();

app.use(
  cors({
    // origin: frontEndUrl,
    origin: "*",
    optionsSuccessStatus: 200
  })
);

const httpServer = createServer(app);
const io: typedServer = new Server(httpServer, {
  cors: {
    // origin: frontEndUrl
    origin: "*"
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

io.on("connection", (socket) => {
  playerHandler(io, socket);
  hostHandler(io, socket);
});

// hack to add all questions into mongo questions collection
for (const question of basequestions as IQuestionnaireQuestion[]) {
  questionDb.addQuestion(question);
}

httpServer.listen(4001, () => {
  console.log(`Server listening on 4001`);
});

app.get("/up-check", (_req, res: any) => {
  res.status(200).end();
});
