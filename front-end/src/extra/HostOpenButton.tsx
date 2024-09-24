import * as React from "react";

interface HostOpenButtonProps {
  symbol: string;
  title: string;
  description: string;
  onClick?: () => void;
  bgImage?: string;
  disabled?: boolean;
  size?: string;
}

export default function HostOpenButton({
  symbol,
  title,
  description,
  onClick,
  bgImage,
  disabled,
  size
}: HostOpenButtonProps): React.ReactElement {
  const disabledBg = "radial-gradient(circle, var(--main-light), var(--main))";
  const topDisplayBig = (
    <>
      <p style={{ fontSize: "12em", margin: "0px", padding: "0px" }}>{symbol}</p>
      <h1
        style={{
          color: "rgba(0,0,0,0.8)",
          fontSize: "3em",
          fontWeight: "bold",
          fontFamily: "var(--action-font)"
        }}
      >
        {title}
      </h1>
    </>
  );

  const topDisplaySmall = (
    <>
      <h1
        style={{
          color: "rgba(0,0,0,0.8)",
          fontSize: "3em",
          fontWeight: "bold",
          fontFamily: "var(--action-font)"
        }}
      >
        <span style={{ fontSize: "1.2em" }}>{symbol}</span> {title}
      </h1>
    </>
  );

  return (
    <div
      style={{
        backgroundImage: disabled ? disabledBg : bgImage,
        borderRadius: "10px",
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        alignContent: "center",
        verticalAlign: "middle",
        justifyContent: "center",
        alignItems: "center",
        width: size === "sm" ? "auto" : "30vw",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        cursor: disabled ? "not-allowed" : "pointer",
        filter: disabled ? "grayscale(100%)" : "none",
        pointerEvents: disabled ? "none" : "auto"
      }}
      onClick={onClick}
    >
      {size === "sm" ? topDisplaySmall : topDisplayBig}
      <h1
        style={{
          color: "rgba(0,0,0,0.9)",
          fontSize: "1.5em",
          fontWeight: "normal",
          paddingLeft: "2vw",
          paddingRight: "2vw",
          textAlign: "left"
        }}
      >
        {description}
      </h1>
    </div>
  );
}
