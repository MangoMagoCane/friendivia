import * as React from "react";
import incorrect from "../assets/eyes.png";

export default function PlayerIsSubject() {
  return (
    <div className="subject">
      <img className="eyesImg" src={incorrect} alt="You Are The Subject" />
      <p className="subjectTxt" style={{ fontFamily: "Concert One" }}>
        Who knows you best?
      </p>
    </div>
  );
}
