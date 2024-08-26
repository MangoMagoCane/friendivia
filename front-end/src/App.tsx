import React from "react";
import { backEndUrl } from "./environment";
import { socket } from "./socket";
import PlayerApp from "./player/PlayerApp";
import HostApp from "./host/HostApp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AboutPage from "./AboutPage";
import LoadingPage from "./LoadingPage";

export default function App() {
  const [serverConnection, setServerConnection] = React.useState(
    "Connecting to server (this could take a few minutes)..."
  );

  React.useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response: Response = await fetch(`${backEndUrl}/up-check`);
        if (response.ok) {
          setServerConnection("Connected!");
        } else {
          setServerConnection(`Server returned: ${response}`);
        }
      } catch (e) {
        setServerConnection(`Error connecting to server: ${e}`);
      }
    };

    checkServerConnection();
  }, []);

  const loadingElement = <LoadingPage msg={serverConnection} />;
  const isLoading = serverConnection !== "Connected!";

  return (
    <>
      <div className="fillScreen">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isLoading ? loadingElement : <PlayerApp socket={socket} />} />
            <Route path="/host" element={isLoading ? loadingElement : <HostApp socket={socket} />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
