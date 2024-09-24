import * as React from "react";
import Speak from "../Speak";

export default function HostPreQuiz() {
  return (
    <>
      <Speak text="Every questionnaire has been completed. It's time to start the quiz." />
      <p style={{ fontSize: "1.5em" }}>Every questionnaire has been completed! It's time to start the quiz.</p>
    </>
  );
}
