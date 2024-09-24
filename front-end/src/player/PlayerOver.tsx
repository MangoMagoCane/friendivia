import React from "react";
import rankone from "../assets/rankone.png";
import ranktwo from "../assets/ranktwo.png";
import rankthree from "../assets/rankthree.png";

interface PlayerOverProps {
  rank: number;
}

export default function PlayerOver({ rank }: PlayerOverProps) {
  let isCorrectClass = true;
  let imgSrc: string = "";
  let innerText: string;
  switch (rank) {
    case 1:
      imgSrc = rankone;
      innerText = "You won!";
      break;
    case 2:
      imgSrc = ranktwo;
      innerText = "Second!";
      break;
    case 3:
      imgSrc = rankthree;
      innerText = "Third!";
      break;
    default:
      innerText = "You lost!";
      isCorrectClass = false;
      break;
  }

  return (
    <div className={isCorrectClass ? "correct" : "incorrect"}>
      <img className="correctImg" src={imgSrc} />
      <p className="correctTxt">{innerText}</p>
    </div>
  );
}
