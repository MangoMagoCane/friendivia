import * as React from "react";
import hourglass from "../assets/ufo.gif";

export default function PlayerJoinWait() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <img
        style={{ width: "100vw", height: "70vh", marginTop: "-10vh", imageRendering: "pixelated" }}
        src={hourglass}
        alt="Correct"
      />
      <p
        style={{
          fontFamily: "Concert One",
          fontSize: "1.5em",
          marginTop: "10vh"
        }}
      >
        transporting to friendivia...
      </p>
    </div>
  );
}
