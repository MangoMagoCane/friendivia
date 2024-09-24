import * as React from "react";
import incorrect from "../assets/incorrect.png";

interface PlayerIncorrectProps {
  consolationPts: number;
}

export default function PlayerIncorrect({ consolationPts }: PlayerIncorrectProps) {
  const ptsMsg = consolationPts ? `+${consolationPts}pts because no one got it` : "";

  return (
    <div className="incorrect">
      <img className="niceTryImg" src={incorrect} alt="Incorrect" />
      <p className="correctTxt" style={{ fontFamily: "Concert One" }}>
        {`Nice try! ${ptsMsg}`}
      </p>
    </div>
  );
}
