import * as React from "react";

export default function PlayAudio(props) {
  const audioUrl = props.src;
  React.useEffect(() => {
    let audio = document.querySelector("audio");
    if (audio == null) {
      return;
    }

    audio.volume = 0.25;
    let playing: boolean = localStorage.getItem("Music-Playing") !== "false" ? true : false;
    if (audio && playing) {
      audio.play();
    }
  }, []);

  return <audio src={audioUrl} loop />;
}
