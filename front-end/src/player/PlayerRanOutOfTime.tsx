import * as React from "react";
import clock from "../assets/Clock.png";

export default function PlayerRanOutOfTime() {
  return (
    <div className="subject">
      <img className="correctImg" src={clock} alt="Ran Out Of Time" />
      <p
        className="subjectTxt"
        style={{
          fontFamily: "Concert One",
          paddingLeft: "0.5em",
          paddingRight: "0.5em"
        }}
      >
        Time's up, better luck next time!
      </p>
    </div>
  );
}
