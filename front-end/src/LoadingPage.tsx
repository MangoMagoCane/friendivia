import * as React from "react";

interface LoadingPageProps {
  msg: string;
}

export default function LoadingPage({ msg }: LoadingPageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h1>Friendivia</h1>
      <p style={{ margin: "auto", textAlign: "center" }}>{msg}</p>
    </div>
  );
}
