import * as React from "react";
import { Button } from "./extra/FrdvButton";

export default function AboutPage() {
  return (
    <div className="about">
      <div className="banner">
        <p className="banner-text">friendivia</p>
      </div>
      <div className="about-body">
        <div className="about-text">
          <h1>How well do you know your friends?</h1>
          <p>
            Find out by playing <span className="friendivia">friendivia</span>, the trivia game where every question is
            about you and your friends! You'll start by answering a few questions about yourself. Then, you'll try to
            answer some questions about your friends, while they try to answer questions about you! You will be rewarded
            if you know your friends well. You will also be rewarded if your friends know <b>you</b> well.
          </p>
        </div>
        <div className="bottom-bar">
          <Button
            className="button"
            variant="contained"
            href="/"
            sx={{
              fontSize: "1.29em"
            }}
          >
            Join a game
          </Button>
          <Button
            className="button"
            variant="contained"
            href="/host"
            sx={{
              fontSize: "1.29em"
            }}
          >
            Host a game
          </Button>
        </div>
      </div>
      <div
        style={{
          marginBottom: "2vh",
          maxWidth: "100%",
          width: "100%",
          position: "absolute",
          bottom: "0px",
          textAlign: "center"
        }}
      >
        <Button
          className="button"
          variant="contained"
          href="https://forms.gle/6UjvVEJ1JHqf9tmx9"
          sx={{
            opacity: "80%",
            fontSize: "1.1em"
          }}
        >
          submit feedback
        </Button>
      </div>
    </div>
  );
}
