import React, { ReactNode } from "react";
import PlayerJoin from "./PlayerJoin";
import { Socket } from "socket.io-client";
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

interface PlayerAppProps {
  socket: Socket;
}

export default function PlayerApp({ socket }: PlayerAppProps) {
  const playerIdFromStorage = localStorage.getItem("player-id") || "";
  const [playerState, setPlayerState] = React.useState<PlayerState | "">("");
  const [playerName, setPlayerName] = React.useState<string>("");
  const [playerScore, setPlayerScore] = React.useState<number>(0);
  const [scoreDiff, setScoreDiff] = React.useState<number>(0);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [allPlayerScores, setAllPlayerScores] = React.useState<[]>([]); // should be given a proper type when I figure it out
  const [questionnaireQuestionsText, setQuestionnaireQuestionsText] = React.useState<string[]>([]);
  const [quizQuestionOptionsText, setQuizQuestionOptionsText] = React.useState<IQuizOption[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);

  let bottomButtons: boolean;

  if (!loaded) {
    socket.emit("player-load", playerIdFromStorage);
  }

  React.useEffect(() => {
    const onLoadSuccess = (data: any) => {
      setLoaded(true);
      setPlayerState(data.player.playerState.state);
      setPlayerName(data.player.name);

      setScoreDiff(data.player.score - playerScore);
      setPlayerScore(data.player.score);

      if (data?.extraData?.playerScores) {
        setAllPlayerScores(data.extraData.playerScores);
      }

      if (data?.extraData?.questionnaireQuestionsText) {
        setQuestionnaireQuestionsText(data.extraData.questionnaireQuestionsText);
      }

      if (data?.extraData?.quizQuestionOptionsText) {
        setQuizQuestionOptionsText(data.extraData.quizQuestionOptionsText);
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
    bottomButtons = false;
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
        bottomButtons = true;
        return <PlayerKicked socket={socket} />;
      case "":
      case "init":
      case "joined-waiting":
        bottomButtons = true;
        return <PlayerJoin socket={socket} playerState={playerState} />;
      default:
        console.log(`ERR: invalid playerState: ${playerState}`);
        return <></>;
    }
  };

  const getButtonsForState = () => {
    let node: ReactNode = undefined;
    if (["init", "kicked", "", null].includes(playerState)) {
      node = (
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
      );
    }
    return (
      <div className="bottomContainer" id="btmContainPlayerApp">
        {node}
      </div>
    );
  };

  const getScreenForState = (): string => {
    return ["init", "kicked", "", null].includes(playerState) ? "element" : "noBtnElement";
  };

  const getID = (): string => {
    return [
      "question-about-me",
      "answered-quiz-question-waiting",
      "did-not-answer-question-waiting",
      "seeing-answer",
      "seeing-answer-correct",
      "seeing-answer-incorrect"
    ].includes(playerState)
      ? "fixScreen"
      : "";
  };

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
    <div className={playerState !== "filling-questionnaire" ? "fillScreen" : "scroll"} id={getID()}>
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
        <div className={getScreenForState()}>{getElementForState()}</div>
        {getButtonsForState()}
      </div>
    </div>
  );
}
