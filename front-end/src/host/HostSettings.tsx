import * as React from "react";
import "../style.css";
import { Button } from "@mui/material";
import { Socket } from "socket.io-client";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IQuestionnaireQuestion from "back-end/interfaces/IQuestionnaireQuestion";
import IPlayer from "back-end/interfaces/IPlayer";

interface ISettingsProps {
  socket: Socket;
  gameId: number;
  playersInGame: IPlayer[];
  timePerQuestionSetting: number;
  numQuestionnaireQuestionsSetting: number;
  numQuizQuestionsSetting: number;
}

export default function HostSettings(props: ISettingsProps) {
  const { socket, gameId, playersInGame, timePerQuestionSetting, numQuestionnaireQuestionsSetting, numQuizQuestionsSetting } = props;
  const [timePerQuestion, setTimePerQuestion] = React.useState<number>(timePerQuestionSetting || 15);
  const [timePerQuestionInput, setTimePerQuestionInput] = React.useState<number>(timePerQuestion);
  const [numQuestionnaireQuestions, setNumQuestionnaireQuestions] = React.useState<number>(numQuestionnaireQuestionsSetting || 5);
  const [numQuestionnaireQuestionsInput, setNumQuestionnaireQuestionsInput] = React.useState<number>(numQuestionnaireQuestions);
  const [numQuizQuestions, setNumQuizQuestions] = React.useState<number>(numQuizQuestionsSetting || 5);
  const [numQuizQuestionsInput, setNumQuizQuestionsInput] = React.useState<number>(numQuizQuestions);
  const [addedQuestions, setAddedQuestions] = React.useState<IQuestionnaireQuestion[]>([{ text: "", quizText: "", fakeAnswers: ["", "", "", ""] }]);
  const [maxNumQuizQuestions, setMaxNumQuizQuestions] = React.useState<number>(5);

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

  const addCustomQuestion = () => {
    setAddedQuestions((prevQuestions) => [
      ...prevQuestions,
      { text: "", quizText: "", fakeAnswers: ["", "", "", ""] },
    ]);
  };

  const removeCustomQuestion = (index: number) => {
    setAddedQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index)
    );
  };

  async function onBack() {
    socket.emit("host-back", gameId, { timePerQuestion, numQuestionnaireQuestions, numQuizQuestions, addedQuestions });
  }

  return (
    <div className="scroll">
      <Stack className="joinForm" spacing={2}>
        <p>Time Per Question:</p>
        <TextField
          className="idInput form"
          id="questionTime"
          label="Time (In Seconds)"
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 1, max: 90 }}
          defaultValue={timePerQuestion}
          error={(timePerQuestionInput < 1) || (timePerQuestionInput > 90)}
          helperText={(timePerQuestionInput < 1) || (timePerQuestionInput > 90) ? 'Warning: you must choose a time between 1 and 90 seconds' : ''}
          onChange={(e) => {
            setTimePerQuestion(Number(e.target.value));
            setTimePerQuestionInput(Number(e.target.value));}}
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
          error={(numQuestionnaireQuestionsInput < 2) || (numQuestionnaireQuestionsInput > 32)}
          helperText={(numQuestionnaireQuestionsInput < 2) || (numQuestionnaireQuestionsInput > 32) ? 'Warning: you must choose a number of questionnaire questions between 1 and 32' : ''}
          onChange={ (e) => {
            setNumQuestionnaireQuestions(Number(e.target.value));
            setNumQuestionnaireQuestionsInput(Number(e.target.value));}}
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
          error={(numQuizQuestionsInput < 2) }
          helperText={(numQuizQuestionsInput < 2) ? 'Warning: you must choose a number of questionnaire questions between 1 and 32' : 
          ((numQuizQuestionsInput > maxNumQuizQuestions) ?  'Warning: if you choose a number of Quiz Questions that is greater than the number of Questionaire Questions multiplied by the number of Players, the game will default to the maximum number of Quiz Questions possible.' : '')}
          onChange={(e) => {
            setMaxNumQuizQuestions(numQuestionnaireQuestions * playersInGame.length);
            setNumQuizQuestions(Number(e.target.value));
            setNumQuizQuestionsInput(Number(e.target.value));
          }}
        />
        <p>Custom Questions:</p>
        <p>
          text: "What is your favorite movie?", quizText: "What is
          &lt;PLAYER&gt;'s favorite movie?", fakeAnswers: ["The Godfather",
          "Despicable Me", "Into the Spiderverse", "Star Wars: A New Hope"]
        </p>
        {addedQuestions.map((question, index) => (
          <div key={index} className="customQuestion">
            <TextField
              className="idInput form"
              id="questionText"
              label="Question Text"
              variant="outlined"
              size="small"
              type="text"
              onChange={(e) => {
                const newQuestions = [...addedQuestions];
                newQuestions[index].text = e.target.value;
                setAddedQuestions(newQuestions);
              }}
            />
            <TextField
              className="idInput form"
              id="quizText"
              label="Quiz Text"
              variant="outlined"
              size="small"
              type="text"
              onChange={(e) => {
                const newQuestions = [...addedQuestions];
                newQuestions[index].quizText = e.target.value;
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
                bgcolor: "gray",
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          onClick={() => addCustomQuestion()}
          variant="contained"
          sx={{
            bgcolor: "black",
          }}
        >
          Add Custom Question
        </Button>
        <p>Click below to go back:</p>
        <Button
          variant="contained"
          sx={{
            bgcolor:
              getComputedStyle(document.body).getPropertyValue("--accent") +
              ";",
          }}
          onClick={onBack}
        >
          Save
        </Button>
      </Stack>
    </div>
  );
}
