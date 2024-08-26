import * as React from "react";
import "../style.css";
import correct from "../assets/correct.png";

interface PlayerCorrectProps {
  pts: number;
}

export default function PlayerCorrect({ pts }: PlayerCorrectProps) {
  const ptsMsg = pts > 0 ? `+${pts} pts` : "";

  return (
    <div className="correct">
      <img className="correctImg" src={correct} alt="Correct" />
      <p className="correctTxt" style={{ fontFamily: "Concert One" }}>
        {ptsMsg}
      </p>
    </div>
  );
}
