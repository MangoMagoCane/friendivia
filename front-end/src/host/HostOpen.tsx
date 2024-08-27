import * as React from "react";
import { Button } from "../extra/FrdvButton";
import { Socket } from "socket.io-client";
import HostOpenButton from "../extra/HostOpenButton";

interface IOpenProps {
  socket: Socket;
}

export default function HostOpen({ socket }: IOpenProps) {
  const [showCustom, setShowCustom] = React.useState<boolean>(false);

  const onHost = (customGame: string) => {
    socket.emit("host-open", customGame);
  };

  const onPreSettings = () => {
    socket.emit("host-pre-settings");
  };

  const onCustomGames = () => {
    setShowCustom(true);
  };

  const backToMain = () => {
    setShowCustom(false);
  };

  const onCustomSet = () => {
    // no checking if a set is valid or not
    const mode = prompt("Enter the name of a question set to play:")?.trim();
    if (mode) {
      onHost(mode);
    } else {
      alert(":( invalid set");
    }
  };

  const openButtons = (
    <>
      <HostOpenButton
        symbol={"⚙️"}
        title={"custom"}
        description={"Unique question sets for every occasion. Find the perfect game for you!"}
        onClick={onCustomGames}
        bgImage={"radial-gradient(circle, var(--left-super-light), var(--left-light))"}
      />
      <HostOpenButton
        symbol={"⚡"}
        title={"classic"}
        description={"Classic fun Friendivia gameplay. Let's start the game!"}
        onClick={() => {
          onHost("classic");
        }}
        bgImage={"radial-gradient(circle, var(--main-super-light), var(--main-light))"}
      />
      <HostOpenButton
        symbol={"🤖"}
        title={"ai"}
        description={"Coming Soon. Pick a theme and get unique questions powered by OpenAI!"}
        disabled={true}
        bgImage={"radial-gradient(circle, var(--right-super-light), var(--right-light))"}
      />
    </>
  );

  const customButtons = (
    <>
      <HostOpenButton
        symbol={"🏫"}
        title={"classroom"}
        description={
          "School is in session! This is the perfect question set to engage a younger audience in a classroom setting."
        }
        onClick={() => onHost("classroom")}
        bgImage={"radial-gradient(circle, var(--left-super-light), var(--left-light))"}
      />
      <HostOpenButton
        symbol={"🏢"}
        title={"corporate"}
        description={
          "Ready for some team building? This question set is designed for optimal use in corporate environments."
        }
        onClick={() => onHost("corporate")}
        bgImage={"radial-gradient(circle, var(--main-super-light), var(--main-light))"}
      />
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "40px", width: "30vw" }}>
        <HostOpenButton
          size="sm"
          symbol={"🥳"}
          title={"party"}
          description={"Just wanna chill? This is the set for you."}
          onClick={() => onHost("fun")}
          bgImage={"radial-gradient(circle, var(--right-super-light), var(--right-light))"}
        />
        <HostOpenButton
          size="sm"
          symbol={"❓"}
          title={"other"}
          description={"Is there another question set you'd like to try? Enter it here."}
          onClick={onCustomSet}
          bgImage={"radial-gradient(circle, #FFF, #FFB)"}
        />
      </div>
    </>
  );

  const aboutButton = (
    <Button
      variant="contained"
      className="about-button"
      href="/about"
      sx={{
        marginTop: "3vh"
      }}
    >
      about
    </Button>
  );

  const backButton = (
    <Button
      variant="contained"
      className="about-button"
      onClick={backToMain}
      sx={{
        marginTop: "3vh"
      }}
    >
      back
    </Button>
  );

  return (
    <div
      style={{
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        margin: "0 10px",
        width: "100vw"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          verticalAlign: "middle",
          margin: "5vh auto 2vh auto",
          maxWidth: "1400px",
          gap: "40px",
          height: "65vh"
        }}
      >
        {showCustom ? customButtons : openButtons}
      </div>
      <div>{showCustom ? backButton : aboutButton}</div>
    </div>
  );
}
