import React from "react";
import HostLobby from "./HostLobby";
import HostOpen from "./HostOpen";
import HostQuestionnaire from "./HostQuestionnaire";
import HostPreQuiz from "./HostPreQuiz";
import HostShowQuestion from "./HostShowQuestion";
import { IQuizQuestion } from "back-end/interfaces/IQuizQuestion";
import { IQuizOption } from "back-end/interfaces/IQuizOption";
import HostShowAnswer from "./HostShowAnswer";
import HostLeaderBoard from "./HostLeaderBoard";
import { IconButton } from "@mui/material/";
import { Button } from "../extra/FrdvButton";
import HostSettings from "./HostSettings";
import HostTiebreaker from "./HostTiebreaker";
import HostIntLeaderBoard from "./HostIntermediaryLeaderBoard";
import Speak from "../Speak";
import lobbyMusic from "../assets/audio/theme.mp3";
import musicOn from "../assets/musicon.png";
import musicOff from "../assets/musicoff.png";
import { HostAnnouncementQueue, AddAnnouncementContext } from "./HostAnnouncementQueue";
import { GameState } from "back-end/interfaces/IGameState";
import { socket } from "../socket";
import { IPlayerScore } from "back-end/interfaces/IPlayerScore";
import { IGuess } from "back-end/interfaces/IGuess";
import { IGame } from "back-end/interfaces/models/IGame";
import { IPlayer } from "back-end/interfaces/models/IPlayer";
import { IPreGameSettings } from "back-end/interfaces/models/IPreGameSettings";
import { IQuestionnaireQuestion } from "back-end/interfaces/models/IQuestionnaireQuestion";
import HostCustomPlayerQuestionnaire from "./HostCustomPlayerQuestionnaire";
import HostCustomQuestionnaire from "./HostCustomPlayerQuestionnaire";

export default function HostApp() {
  const gameIdFromStorage = Number(localStorage.getItem("game-id")) || -1;
  const settingsIdFromStorage = String(localStorage.getItem("settings-id")) || "-1";
  const mutedFromStorage = localStorage.getItem("music-muted");

  const [gameId, setGameId] = React.useState<number>(gameIdFromStorage);
  const [preSettingsId, setPreSettingsId] = React.useState<string>(settingsIdFromStorage);
  const [gameState, setGameState] = React.useState<GameState>("init");
  const [customMode, setCustomMode] = React.useState<string>("classic");
  const [settingsState, setSettingsState] = React.useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = React.useState<IQuizQuestion[]>([]);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = React.useState<number>(-1);
  const [quizQuestionGuesses, setQuizQuestionGuesses] = React.useState<IGuess[]>([]); // type may be wrong, haven't done the most checking
  const [playerScores, setPlayerScores] = React.useState<IPlayerScore[]>([]);
  const [playersInGame, setPlayersInGame] = React.useState<IPlayer[]>([]);
  const [timePerQuestion, setTimePerQuestion] = React.useState<number>(15);
  const [numQuestionnaireQuestions, setNumQuestionnaireQuestions] = React.useState<number>(5);
  const [numQuizQuestions, setNumQuizQuestions] = React.useState<number>(5);
  const [handsFreeMode, setHandsFreeMode] = React.useState<boolean>(false);
  const [timePerAnswer, setTimePerAnswer] = React.useState<number>(10);
  const [timePerLeaderboard, setTimePerLeaderboard] = React.useState<number>(5);
  const [prioritizeCustomQs, setPrioritizeCustomQs] = React.useState<boolean>(true);
  const [customQuestions, setCustomQuestions] = React.useState<IQuestionnaireQuestion[]>([]);
  const [customPlayerQuestions, setCustomPlayerQuestions] = React.useState<string[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [announcementAudioObjects, setAnnouncementAudioObjects] = React.useState<any>([]);

  const [muted, setMuted] = React.useState<boolean>(!!mutedFromStorage);
  const musicRef = React.useRef<HTMLAudioElement>(new Audio(lobbyMusic));
  const setMusic = (muted: boolean) => {
    localStorage.setItem("music-muted", String(muted));
    setMuted(muted);
  };

  const addAnnouncement = (newAnnouncementAudio: any[]) => {
    setAnnouncementAudioObjects((arr) => [...arr, newAnnouncementAudio]);
  };

  if (!loaded) {
    socket.emit("host-load", gameIdFromStorage);
    socket.emit("settings-load", settingsIdFromStorage);
  }

  const onEndGameClicked = () => {
    if (confirm("Are you sure you want to end this game?")) {
      socket.emit("host-end-game");
    }
  };

  console.log(`GameState: "${gameState}"`);

  React.useEffect(() => {
    const onLoadSuccess = (
      data: IGame & { quizQuestionGuesses: IGuess[]; playerScores: IPlayerScore[]; playersInGame: IPlayer[] }
    ) => {
      console.log(`onLoadSuccess gameState: "${data.gameState.state}"`);
      setLoaded(true);
      setGameId(data.id);
      setGameState(data.gameState.state);
      setCustomMode(data.customMode);
      setQuizQuestions(data.quizQuestions);
      setCurrentQuizQuestionIndex(data.currentQuestionIndex);
      setQuizQuestionGuesses(data.quizQuestionGuesses);
      setPlayerScores(data.playerScores);
      setPlayersInGame(data.playersInGame);
      setTimePerQuestion(data.settings.timePerQuestion);
      setNumQuestionnaireQuestions(data.settings.numQuestionnaireQuestions);
      setNumQuizQuestions(data.settings.numQuizQuestions);
      setHandsFreeMode(data.settings.handsFreeMode);
      setTimePerAnswer(data.settings.timePerAnswer);
      setTimePerLeaderboard(data.settings.timePerLeaderboard);
      setPrioritizeCustomQs(data.settings.prioritizeCustomQs);
      setCustomQuestions(data.settings.customQuestions);
    };

    const onSettingsLoadSuccess = (data: IPreGameSettings) => {
      setPreSettingsId(data.id);
      setSettingsState(data.settingsState);
      setTimePerQuestion(data.settings.timePerQuestion);
      setNumQuestionnaireQuestions(data.settings.numQuestionnaireQuestions);
      setNumQuizQuestions(data.settings.numQuizQuestions);
      setHandsFreeMode(data.settings.handsFreeMode);
      setTimePerAnswer(data.settings.timePerAnswer);
      setTimePerLeaderboard(data.settings.timePerLeaderboard);
      setPrioritizeCustomQs(data.settings.prioritizeCustomQs);
      setCustomQuestions(data.settings.customQuestions);
    };

    const onOpenSuccess = (idFromServer: number): void => {
      setGameId(idFromServer);
      localStorage.setItem("game-id", `${idFromServer}`);
      setGameState("lobby");
    };

    const onPresettingsSuccess = (idFromServer: string) => {
      setPreSettingsId(idFromServer);
      localStorage.setItem("settings-id", `${idFromServer}`);
      setSettingsState(true);
    };

    const onHostGameEnded = () => {
      localStorage.setItem("game-id", "");
      window.location.reload();
    };

    socket.on("host-open-success", onOpenSuccess);
    socket.on("host-load-success", onLoadSuccess);
    socket.on("host-next", onLoadSuccess);
    socket.on("presettings-close", onSettingsLoadSuccess);
    socket.on("host-presettings-success", onPresettingsSuccess);
    socket.on("settings-load-success", onSettingsLoadSuccess);
    socket.on("host-game-ended", onHostGameEnded);

    return () => {
      socket.off("host-open-success", onOpenSuccess);
      socket.off("host-load-success", onLoadSuccess);
      socket.off("host-next", onLoadSuccess);
      socket.off("presettings-close", onSettingsLoadSuccess);
      socket.off("host-presettings-success", onPresettingsSuccess);
      socket.off("settings-load-success", onSettingsLoadSuccess);
      socket.off("host-game-ended", onHostGameEnded);
    };
  }, [gameId, setGameId, gameState, setGameState]);

  const getElementForState = (state: GameState, settingsState: boolean) => {
    let currentQuizQuestion: IQuizQuestion;
    let quizQuestionOptions: IQuizOption[];
    let quizQuestionText: string;
    let quizQuestionPlayerName: string;

    switch (state) {
      case "pre-questionnaire":
        return (
          <>
            <Speak text="Get ready..." />
            <p style={{ fontSize: "1.5em" }}>Get ready...</p>
          </>
        );
      case "lobby":
        socket.emit("reload-players");
        return <HostLobby gameId={gameId} classroomGame={customMode === "classroom"} />;
      case "custom-player-questionnaire":
        socket.emit("reload-players");
        return <HostCustomQuestionnaire playersInGame={playersInGame} />;
      case "questionnaire":
        return <HostQuestionnaire playersInGame={playersInGame} />;
      case "pre-quiz":
        return <HostPreQuiz />;
      case "showing-question":
        currentQuizQuestion = quizQuestions[currentQuizQuestionIndex];
        quizQuestionOptions = currentQuizQuestion.optionsList;
        quizQuestionText = currentQuizQuestion.text;
        quizQuestionPlayerName = currentQuizQuestion.playerName;
        return (
          <HostShowQuestion
            gameId={gameId}
            options={quizQuestionOptions}
            questionText={quizQuestionText}
            playerName={quizQuestionPlayerName}
            timePerQuestion={timePerQuestion}
            handsFreeMode={handsFreeMode}
          />
        );
      case "pre-answer":
        return (
          <>
            <Speak text="The guesses are in!" />
            <p style={{ fontSize: "1.5em" }}>The guesses are in...</p>
          </>
        );
      case "showing-answer":
        currentQuizQuestion = quizQuestions[currentQuizQuestionIndex];
        quizQuestionOptions = currentQuizQuestion.optionsList;
        quizQuestionText = currentQuizQuestion.text;
        quizQuestionPlayerName = currentQuizQuestion.playerName;
        const correctAnswerIndex = currentQuizQuestion.correctAnswerIndex;
        const quizQuestionsLength = quizQuestions.length;
        return (
          <HostShowAnswer
            gameId={gameId}
            options={quizQuestionOptions}
            questionText={quizQuestionText}
            playerName={quizQuestionPlayerName}
            correctAnswerIndex={correctAnswerIndex}
            playerGuesses={quizQuestionGuesses}
            quizLength={quizQuestionsLength}
            handsFreeMode={handsFreeMode}
          />
        );
      case "intermediary-leaderboard":
        return <HostIntLeaderBoard gameId={gameId} playerScores={playerScores} handsFreeMode={handsFreeMode} />;
      case "pre-leader-board":
        return (
          <>
            <Speak text="Let's see who won" />
            <p style={{ fontSize: "1.5em" }}>Let's see who won...</p>
          </>
        );
      case "leader-board":
        return <HostLeaderBoard gameId={gameId} playerScores={playerScores} />;
    }
    if (state === "settings" || settingsState === true) {
      return (
        <HostSettings
          gameId={gameId}
          preSettingsId={preSettingsId}
          settingsState={settingsState}
          playersInGame={playersInGame}
          timePerQuestionSetting={timePerQuestion}
          numQuestionnaireQuestionsSetting={numQuestionnaireQuestions}
          numQuizQuestionsSetting={numQuizQuestions}
          handsFreeModeSetting={handsFreeMode}
          timePerAnswerSetting={timePerAnswer}
          timePerLeaderboardSetting={timePerLeaderboard}
          prioritizeCustomQsSetting={prioritizeCustomQs}
          customQuestionsSetting={customQuestions}
        />
      );
    } else if (state === "tiebreaker") {
      return <HostTiebreaker />;
    } else {
      // state === "init" and potentially some other state
      return <HostOpen />;
    }
  };

  return (
    <div className="scroll host-screen">
      <AddAnnouncementContext.Provider value={addAnnouncement}>
        <HostAnnouncementQueue
          announcementAudioObjects={announcementAudioObjects}
          gameId={gameId}
          gameState={gameState}
        />
        <audio
          autoPlay={mutedFromStorage === null}
          loop={!muted}
          ref={musicRef}
          src={lobbyMusic}
          muted={muted}
          onPlaying={() => {
            setMusic(false);
          }}
        />
        <div id="host-banner">
          <div className="musicButton bannerEdge">
            <IconButton
              onClick={() => {
                musicRef.current.play();
                setMusic(!muted);
              }}
            >
              <img className="musicIcon" src={muted ? musicOff : musicOn} />
            </IconButton>
          </div>
          <div className="banner-text">friendivia</div>
          <div className="bannerEdge">{/* Empty to take up space on the right side of the header*/}</div>
        </div>
        <div className="host-content">{getElementForState(gameState, settingsState)}</div>
        <div className="host-footer">
          {gameState !== "init" && (
            <Button variant="contained" onClick={onEndGameClicked}>
              end game
            </Button>
          )}
        </div>
      </AddAnnouncementContext.Provider>
    </div>
  );
}
