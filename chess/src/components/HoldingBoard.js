import { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Game from "../Game";
import InitGame from "../InitGame";
import CustomDialog from "../components/CustomDialog";
import socket from "../socket";
import { TextField } from "@mui/material";
import { useLocation } from 'react-router-dom';

const HoldingBoard = ({token}) => {
  const location = useLocation();

  console.log(token.user.user_metadata.username)
  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState([]);

  socket.emit("username",token.user.user_metadata.username);
  // resets the states responsible for initializing a game
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);

  useEffect(() => {
    // const username = prompt("Username");
    // setUsername(username);
    // socket.emit("username", username);

    socket.on("opponentJoined", (roomData) => {
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, []);

  return (
   
    <Container className="game-container">
      
     {room ? (
        <Game
          room={room}
          orientation={orientation}
          username={token.user.user_metadata.username}
          players={players}
          // the cleanup function will be used by Game to reset the state when a game is over
          cleanup={cleanup}
        />
      ) : (
        <InitGame
          setRoom={setRoom}
          setOrientation={setOrientation}
          setPlayers={setPlayers}
        />
      )}
    </Container>
  );
}
export default HoldingBoard