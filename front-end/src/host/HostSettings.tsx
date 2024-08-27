import * as React from "react";
import "../style.css";
import { Button } from "@mui/material";
import { Socket } from "socket.io-client";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import { IQuestionnaireQuestion } from "back-end/interfaces/IQuestionnaireQuestion";
import IPlayer from "back-end/interfaces/IPlayer";

interface ISettingsProps {
  socket: Socket;
  gameId: number;
  preSettingsId: string;
  settingsState: boolean;
  playersInGame: IPlayer[];
  timePerQuestionSetting: number;
  numQuestionnaireQuestionsSetting: number;
  numQuizQuestionsSetting: number;
  handsFreeModeSetting: boolean;
  timePerAnswerSetting: number;
  timePerLeaderboardSetting: number;
  prioritizeCustomQsSetting: boolean;
  customQuestionsSetting: IQuestionnaireQuestion[];
}

export default function HostSettings({
  socket,
  gameId,
  preSettingsId,
  settingsState,
  playersInGame,
  timePerQuestionSetting,
  numQuestionnaireQuestionsSetting,
  numQuizQuestionsSetting,
  handsFreeModeSetting,
  timePerAnswerSetting,
  timePerLeaderboardSetting,
  prioritizeCustomQsSetting,
  customQuestionsSetting
}: ISettingsProps) {
  const [timePerQuestion, setTimePerQuestion] = React.useState<number>(timePerQuestionSetting || 15);
  const [timePerQuestionInput, setTimePerQuestionInput] = React.useState<number>(timePerQuestion);
  const [numQuestionnaireQuestions, setNumQuestionnaireQuestions] = React.useState<number>(
    numQuestionnaireQuestionsSetting || 5
  );
  const [numQuestionnaireQuestionsInput, setNumQuestionnaireQuestionsInput] =
    React.useState<number>(numQuestionnaireQuestions);
  const [numQuizQuestions, setNumQuizQuestions] = React.useState<number>(numQuizQuestionsSetting || 5);
  const [numQuizQuestionsInput, setNumQuizQuestionsInput] = React.useState<number>(numQuizQuestions);
  const [handsFreeMode, setHandsFreeMode] = React.useState<boolean>(handsFreeModeSetting);
  const [timePerAnswer, setTimePerAnswer] = React.useState<number>(timePerAnswerSetting || 10);
  const [timePerAnswerInput, setTimePerAnswerInput] = React.useState<number>(timePerAnswer);
  const [timePerLeaderboard, setTimePerLeaderboard] = React.useState<number>(timePerLeaderboardSetting || 5);
  const [timePerLeaderboardInput, setTimePerLeaderboardInput] = React.useState<number>(timePerLeaderboard);
  const [prioritizeCustomQs, setPrioritizeCustomQs] = React.useState<boolean>(prioritizeCustomQsSetting);
  const [addedQuestions, setAddedQuestions] = React.useState<IQuestionnaireQuestion[]>(customQuestionsSetting || []);
  const [mappedQuestions, setMappedQuestions] = React.useState<IQuestionnaireQuestion[]>(addedQuestions || []);
  const [maxNumQuizQuestions, setMaxNumQuizQuestions] = React.useState<number>(
    numQuestionnaireQuestions * playersInGame.length || 5
  );

  React.useEffect(() => {
    if (timePerQuestion < 1) {
      setTimePerQuestion(1);
    } else if (timePerQuestion > 90) {
      setTimePerQuestion(90);
    }
  }, [timePerQuestion, setTimePerQuestion]);

  React.useEffect(() => {
    if (numQuestionnaireQuestions < 2) {
      setNumQuestionnaireQuestions(2);
    } else if (numQuestionnaireQuestions > 32) {
      setNumQuestionnaireQuestions(32);
    }
  }, [numQuestionnaireQuestions, setNumQuestionnaireQuestions]);

  React.useEffect(() => {
    if (numQuizQuestions < 2) {
      setNumQuizQuestions(2);
    }
  }, [numQuizQuestions, setNumQuizQuestions]);

  React.useEffect(() => {
    setMappedQuestions(addedQuestions);
  }, [addedQuestions, setAddedQuestions]);

  React.useEffect(() => {
    if (timePerAnswer < 1) {
      setTimePerAnswer(1);
    } else if (timePerAnswer > 90) {
      setTimePerAnswer(90);
    }
  }, [timePerAnswer, setTimePerAnswer]);

  React.useEffect(() => {
    if (timePerLeaderboard < 1) {
      setTimePerLeaderboard(1);
    } else if (timePerLeaderboard > 90) {
      setTimePerLeaderboard(90);
    }
  }, [timePerLeaderboard, setTimePerLeaderboard]);

  const addCustomQuestion = () => {
    setAddedQuestions((prevQuestions: IQuestionnaireQuestion[]) => [
      { id: "", text: "", quizText: "", fakeAnswers: [], tags: [] },
      ...prevQuestions
    ]);
  };

  const removeCustomQuestion = (index: number) => {
    setAddedQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  };

  const onBack = async () => {
    socket.emit("host-back", gameId, {
      timePerQuestion,
      numQuestionnaireQuestions,
      numQuizQuestions,
      handsFreeMode,
      timePerAnswer,
      timePerLeaderboard,
      prioritizeCustomQs,
      addedQuestions
    });
  };

  const onPSBack = async () => {
    socket.emit("host-ps-back", preSettingsId, {
      timePerQuestion,
      numQuestionnaireQuestions,
      numQuizQuestions,
      handsFreeMode,
      timePerAnswer,
      timePerLeaderboard,
      prioritizeCustomQs,
      addedQuestions
    });
  };

  return (
    <div className="scrollEnabled">
      <Stack className="joinForm" spacing={2}>
        <p style={{ margin: "0", marginTop: "16px" }}>Time Per Question:</p>
        <TextField
          className="idInput form"
          id="questionTime"
          label="Time (In Seconds)"
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 1, max: 90 }}
          defaultValue={timePerQuestion}
          error={timePerQuestionInput < 1 || timePerQuestionInput > 90}
          helperText={
            timePerQuestionInput < 1 || timePerQuestionInput > 90
              ? "Warning: you must choose a time between 1 and 90 seconds"
              : ""
          }
          onChange={(e) => {
            setTimePerQuestion(Number(e.target.value));
            setTimePerQuestionInput(Number(e.target.value));
          }}
        />
        <p>Number of Questionnaire Questions:</p>
        <TextField
          className="idInput form"
          id="question#QuestionnaireQ"
          label="Number of Questionnaire Questions"
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 2, max: 32 }}
          defaultValue={numQuestionnaireQuestions}
          error={numQuestionnaireQuestionsInput < 2 || numQuestionnaireQuestionsInput > 32}
          helperText={
            numQuestionnaireQuestionsInput < 2 || numQuestionnaireQuestionsInput > 32
              ? "Warning: you must choose a number of questionnaire questions between 1 and 32"
              : ""
          }
          onChange={(e) => {
            setNumQuestionnaireQuestions(Number(e.target.value));
            setNumQuestionnaireQuestionsInput(Number(e.target.value));
          }}
        />
        <p>Number of Quiz Questions:</p>
        <TextField
          className="idInput form"
          id="question#QuizQ"
          label="Number of Quiz Questions"
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 2 }}
          defaultValue={numQuizQuestions}
          error={numQuizQuestionsInput < 2}
          helperText={
            numQuizQuestionsInput < 2
              ? "Warning: you must choose a number of questionnaire questions between 1 and 32"
              : !settingsState
              ? numQuizQuestionsInput > maxNumQuizQuestions
                ? "Warning: if you choose a number of Quiz Questions that is greater than the number of Questionaire Questions multiplied by the number of Players, the game will default to the maximum number of Quiz Questions possible."
                : ""
              : ""
          }
          onChange={(e) => {
            !settingsState ? setMaxNumQuizQuestions(numQuestionnaireQuestions * playersInGame.length) : "";
            setNumQuizQuestions(Number(e.target.value));
            setNumQuizQuestionsInput(Number(e.target.value));
          }}
        />
        <p>
          Hands-Free Mode:
          <Switch
            className="idInput form"
            id="handsFreeMode"
            size="medium"
            color="secondary"
            defaultChecked={handsFreeMode}
            onChange={(e, c) => {
              setHandsFreeMode(Boolean(c));
            }}
          />
        </p>
        {handsFreeMode ? (
          <>
            <p>Time To View Correct Answers:</p>
            <TextField
              className="idInput form"
              id="answerTime"
              label="Time (In Seconds)"
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 1, max: 90 }}
              defaultValue={timePerAnswer}
              error={timePerAnswerInput < 1 || timePerAnswerInput > 90}
              helperText={
                timePerAnswerInput < 1 || timePerAnswerInput > 90
                  ? "Warning: you must choose a time between 1 and 90 seconds"
                  : ""
              }
              onChange={(e) => {
                setTimePerAnswer(Number(e.target.value));
                setTimePerAnswerInput(Number(e.target.value));
              }}
            />
            <p>Time To View Leaderboard:</p>
            <TextField
              className="idInput form"
              id="leaderboardTime"
              label="Time (In Seconds)"
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 1, max: 90 }}
              defaultValue={timePerLeaderboard}
              error={timePerLeaderboardInput < 1 || timePerLeaderboardInput > 90}
              helperText={
                timePerLeaderboardInput < 1 || timePerLeaderboardInput > 90
                  ? "Warning: you must choose a time between 1 and 90 seconds"
                  : ""
              }
              onChange={(e) => {
                setTimePerLeaderboard(Number(e.target.value));
                setTimePerLeaderboardInput(Number(e.target.value));
              }}
            />
          </>
        ) : (
          ""
        )}
        <p>
          Prioritize Custom Questions:
          <Switch
            className="idInput form"
            id="prioritizeCustomQ"
            size="medium"
            color="secondary"
            defaultChecked={prioritizeCustomQs}
            onChange={(e, c) => {
              setPrioritizeCustomQs(Boolean(c));
            }}
          />
        </p>
        <p>Custom Questions:</p>
        <p className="exampleText">
          Example: <br></br>
          <u>Question Text:</u> "What is your favorite movie?"<br></br>
          <u>Fake Answers:</u> "The Godfather","Despicable Me", "Into the Spiderverse", "Star Wars: A New Hope"
        </p>
        <Button
          onClick={() => addCustomQuestion()}
          variant="contained"
          sx={{
            bgcolor: "black"
          }}
        >
          Add Custom Question
        </Button>
        {mappedQuestions.map((question, index) => {
          if (addedQuestions[index] === question) {
            return (
              <div key={index} className="customQuestion">
                <TextField
                  className="idInput form"
                  id="questionText"
                  label="Question Text"
                  variant="outlined"
                  size="small"
                  type="text"
                  defaultValue={question.text}
                  onChange={(e) => {
                    const newQuestions = [...addedQuestions];
                    newQuestions[index].text = e.target.value;
                    let newQuizText = e.target.value;
                    if (newQuizText.includes("you") || newQuizText.includes("your")) {
                      newQuizText = newQuizText
                        .replace("do you", "does <PLAYER>")
                        .replace("are you", "is <PLAYER>")
                        .replace("your", "<PLAYER>'s")
                        .replace("you", "<PLAYER>");
                    } else {
                      newQuizText = "According to <PLAYER>, " + newQuizText;
                    }
                    newQuestions[index].quizText = newQuizText;
                    setAddedQuestions(newQuestions);
                  }}
                />
                <TextField
                  className="idInput form"
                  id="fakeAnswer1"
                  label="Fake Answer 1"
                  variant="outlined"
                  size="small"
                  type="text"
                  defaultValue={question.fakeAnswers[0]}
                  onChange={(e) => {
                    const newQuestions = [...addedQuestions];
                    newQuestions[index].fakeAnswers[0] = e.target.value;
                    setAddedQuestions(newQuestions);
                  }}
                />
                <TextField
                  className="idInput form"
                  id="fakeAnswer2"
                  label="Fake Answer 2"
                  variant="outlined"
                  size="small"
                  type="text"
                  defaultValue={question.fakeAnswers[1]}
                  onChange={(e) => {
                    const newQuestions = [...addedQuestions];
                    newQuestions[index].fakeAnswers[1] = e.target.value;
                    setAddedQuestions(newQuestions);
                  }}
                />
                <TextField
                  className="idInput form"
                  id="fakeAnswer3"
                  label="Fake Answer 3"
                  variant="outlined"
                  size="small"
                  type="text"
                  defaultValue={question.fakeAnswers[2]}
                  onChange={(e) => {
                    const newQuestions = [...addedQuestions];
                    newQuestions[index].fakeAnswers[2] = e.target.value;
                    setAddedQuestions(newQuestions);
                  }}
                />
                <TextField
                  className="idInput form"
                  id="fakeAnswer4"
                  label="Fake Answer 4"
                  variant="outlined"
                  size="small"
                  type="text"
                  defaultValue={question.fakeAnswers[3]}
                  onChange={(e) => {
                    const newQuestions = [...addedQuestions];
                    newQuestions[index].fakeAnswers[3] = e.target.value;
                    setAddedQuestions(newQuestions);
                  }}
                />
                <Button
                  onClick={() => removeCustomQuestion(index)}
                  variant="contained"
                  sx={{
                    bgcolor: "gray"
                  }}
                >
                  Remove
                </Button>
              </div>
            );
          } else {
            return "";
          }
        })}
        <p>Click below to go back:</p>
        <Button
          variant="contained"
          sx={{
            bgcolor: getComputedStyle(document.body).getPropertyValue("--accent") + ";"
          }}
          onClick={settingsState ? onPSBack : onBack}
        >
          Save
        </Button>
      </Stack>
    </div>
  );
}
