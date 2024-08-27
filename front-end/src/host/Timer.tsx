import React from "react";

interface TimerProps {
  started: boolean;
  timePerQuestion: number;
}

export default function Timer({ started, timePerQuestion }: TimerProps) {
  const [counter, setCounter] = React.useState(timePerQuestion);

  React.useEffect(() => {
    if (started && counter > 0) {
      setTimeout(() => setCounter(counter - 1), 1000);
    }
  }, [counter]);

  return (
    <div className="dot">
      <div className="timer">
        <div className="timeNumber">{started ? counter : "⌛"}</div>
      </div>
    </div>
  );
}
