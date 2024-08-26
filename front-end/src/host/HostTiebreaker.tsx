import * as React from "react";
import "../style.css";
import Speak from "../Speak";

export default function HostTiebreaker() {
  return (
    <div className="align_center">
      <Speak text={`There is a tie! It all comes down to this: "Friends" trivia. Good luck.`} />
      <p className="vs">Tiebreaker: Friends Trivia</p>
      <p className="tie">
        The fastest of the tied players to answer correctly wins the game. If no one answers correctly, the slowest to
        answer incorrectly wins. Good luck.
      </p>
    </div>
  );
}
