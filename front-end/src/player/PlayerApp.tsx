import React from "react";
import PlayerJoin from "./PlayerJoin";
import PlayerQuestionnaire from "./PlayerQuestionnaire";
import PlayerQuizQuestion from "./PlayerQuizQuestion";
import PlayerWait from "./PlayerWait";
import { Chip, Menu, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import PlayerCorrect from "./PlayerCorrect";
import PlayerIncorrect from "./PlayerIncorrect";
import PlayerIsSubject from "./PlayerIsSubject";
import PlayerRanOutOfTime from "./PlayerRanOutOfTime";
import PlayerOver from "./PlayerOver";
import { Button } from "../extra/FrdvButton";
import PlayerNewRanking from "./PlayerNewRanking";
import PlayerKicked from "./PlayerKicked";
import IQuizOption from "back-end/interfaces/IQuizOption";
import { PlayerState } from "back-end/interfaces/IPlayerState";
import { valInArr } from "../util";
import IPlayerScore from "back-end/interfaces/IPlayerScore";
import IPlayerDB from "back-end/interfaces/IPlayerDB";
import { IPlayerLoadSuccess } from "back-end/interfaces/ISocketCallbacks";
import { SocketFrontend } from "../socket";

interface PlayerAppProps {
  socket: SocketFrontend;
}

export default function PlayerApp({ socket }: PlayerAppProps) {
  const playerIdFromStorage = localStorage.getItem("player-id") || "";
  const [playerState, setPlayerState] = React.useState<PlayerState | "">("");
  const [playerName, setPlayerName] = React.useState<string>("");
  const [playerScore, setPlayerScore] = React.useState<number>(0);
  const [scoreDiff, setScoreDiff] = React.useState<number>(0);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [allPlayerScores, setAllPlayerScores] = React.useState<IPlayerScore[]>([]); // NOTE: Created new IPlayerScore interface which is probably correct
  const [questionnaireQuestionsText, setQuestionnaireQuestionsText] = React.useState<string[]>([]);
  const [quizQuestionOptionsText, setQuizQuestionOptionsText] = React.useState<IQuizOption[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);

  // let bottomButtons: boolean;
  console.log(`player state: "${playerState}"`);

  if (!loaded) {
    socket.emit("player-load", playerIdFromStorage);
  }

  React.useEffect(() => {
    const onLoadSuccess = (player: IPlayerDB, extraData?: IPlayerLoadSuccess): void => {
      setLoaded(true);
      setPlayerState(player.playerState.state);
      setPlayerName(player.name);

      setScoreDiff(player.score - playerScore);
      setPlayerScore(player.score);

      if (extraData?.playerScores) {
        setAllPlayerScores(extraData.playerScores);
      }

      if (extraData?.questionnaireQuestionsText) {
        setQuestionnaireQuestionsText(extraData.questionnaireQuestionsText);
      }

      if (extraData?.quizQuestionOptionsText) {
        setQuizQuestionOptionsText(extraData.quizQuestionOptionsText);
      }
    };

    const onPlayerGameEnded = () => {
      localStorage.setItem("player-id", "");
      window.location.reload();
    };

    socket.on("player-game-ended", onPlayerGameEnded);
    socket.on("player-load-success", onLoadSuccess);
    socket.on("player-next", onLoadSuccess);

    return () => {
      socket.off("player-load-success", onLoadSuccess);
      socket.off("player-next", onLoadSuccess);
    };
  }, [playerState, setPlayerState]);

  const getElementForState = (): React.JSX.Element => {
    // bottomButtons = false;
    switch (playerState) {
      case "filling-questionnaire":
      case "submitted-questionnaire-waiting":
        return (
          <PlayerQuestionnaire
            socket={socket}
            playerState={playerState}
            questionnaireQuestionsText={questionnaireQuestionsText}
          />
        );
      case "seeing-question":
      case "answered-quiz-question-waiting":
      case "question-being-read":
        return <PlayerQuizQuestion socket={socket} optionsList={quizQuestionOptionsText} playerState={playerState} />;
      case "did-not-answer-question-waiting":
        return <PlayerRanOutOfTime />;
      case "question-about-me":
      case "seeing-answer":
        return <PlayerIsSubject />;
      case "seeing-answer-correct":
        return <PlayerCorrect pts={scoreDiff} />;
      case "seeing-answer-incorrect":
        return <PlayerIncorrect consolationPts={scoreDiff} />;
      case "seeing-rank":
        return <PlayerNewRanking playerScores={allPlayerScores} playerName={playerName} />;
      case "pre-leader-board":
        return <PlayerWait message={`Calculating final scores...`} />;
      case "leader-board":
        return <PlayerOver rank={0} />;
      case "rank-one":
        return <PlayerOver rank={1} />;
      case "rank-two":
        return <PlayerOver rank={2} />;
      case "rank-three":
        return <PlayerOver rank={3} />;
      case "kicked":
        // bottomButtons = true;
        return <PlayerKicked socket={socket} />;
      case "":
      case "init":
      case "joined-waiting":
        // bottomButtons = true;
        return <PlayerJoin socket={socket} playerState={playerState} />;
      default:
        console.log(`ERR: invalid playerState: ${playerState}`);
        return <></>;
    }
  };

  const getButtonsForState = () => {
    // originally checked if playerState was also null which appears to be an error
    return (
      <div className="bottomContainer" id="btmContainPlayerApp">
        {valInArr(playerState, ["init", "kicked", ""]) && (
          <p>
            <Button
              className="button"
              id="HostPlayerApp"
              variant="contained"
              sx={{
                m: 2,
                position: "absolute",
                bottom: "10px",
                left: "10px"
              }}
              href="/host"
            >
              host
            </Button>
            <Button
              className="button"
              id="AboutPlayerApp"
              variant="contained"
              sx={{
                m: 2,
                position: "absolute",
                bottom: "10px",
                right: "10px"
              }}
              href="/about"
            >
              about
            </Button>
          </p>
        )}
      </div>
    );
  };

  // originally checked if playerState was also null which appears to be an error
  const screenForState = valInArr(playerState, ["init", "kicked", ""]) ? "element" : "noBtnElement";

  const id = valInArr(playerState, [
    "question-about-me",
    "answered-quiz-question-waiting",
    "did-not-answer-question-waiting",
    "seeing-answer",
    "seeing-answer-correct",
    "seeing-answer-incorrect"
  ])
    ? "fixScreen"
    : "";

  const playerQuit = () => {
    if (confirm("Are you sure you want to quit?")) {
      localStorage.setItem("player-id", "");
      socket.emit("player-quit");
    }
  };

  //   const displayPlayerChip: boolean = !(<PlayerState[]>).includes(playerState);
  const displayPlayerChip: boolean = !valInArr(playerState, ["init", "kicked"]);
  const displayScoreChip: boolean = !valInArr(playerState, ["filling-questionnaire", "kicked", ""]);

  return (
    <div className={playerState !== "filling-questionnaire" ? "fillScreen" : "scroll"} id={id}>
      <div className="player_join">
        <div
          className="banner"
          style={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Menu
            id="player-menu"
            open={menuOpen}
            anchorEl={document.querySelector("#player-chip")}
            onClose={() => setMenuOpen(false)}
            MenuListProps={{
              "aria-labelledby": "player-chip"
            }}
          >
            <MenuItem onClick={playerQuit}>Quit</MenuItem>
          </Menu>

          <Grid container spacing={0}>
            <Grid item xs={3}>
              {/* {playerState != "init" && playerState != "kicked" ? ( */}
              {displayPlayerChip && (
                <div className="align_center">
                  {/*if player name has not been inputted do not display username chip*/}
                  {playerName !== "" && (
                    <Chip
                      style={{
                        backgroundColor: "white",
                        marginTop: "1.8em"
                      }}
                      onClick={() => setMenuOpen(!menuOpen)}
                      label={playerName}
                      id="player-chip"
                      aria-controls={menuOpen ? "player-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={menuOpen ? "true" : undefined}
                    />
                  )}
                </div>
              )}
            </Grid>
            <Grid item xs={6}>
              <div className="align_center banner-text player-banner-text">friendivia</div>
            </Grid>
            <Grid item xs={3}>
              {/*if player name has not been inputted do not display score chip*/}
              {playerState !== "init" && (
                <div className="align_center">
                  {displayScoreChip && (
                    <Chip
                      style={{
                        backgroundColor: "white",
                        marginTop: "1.8em"
                      }}
                      label={playerScore}
                    />
                  )}
                </div>
              )}
            </Grid>
          </Grid>
        </div>
        <div className={screenForState}>{getElementForState()}</div>
        {getButtonsForState()}
      </div>
    </div>
  );
}
