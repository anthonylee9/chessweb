import { useEffect, useState, useCallback } from "react";
import io from 'socket.io-client';
import Game from '../Game'; // Import the Game component
import socket from "../socket";
import OpenChat from "./OpenChat";
const Find = ({token}) =>{
  const [lobbies, setLobbies] = useState([]);
  const [room, setRoom] = useState(""); // Added state for room
  const [orientation, setOrientation] = useState(""); // Added state for orientation
  const [players, setPlayers] = useState([]); // Added state for players
  console.log(token.user.user_metadata.username)
  socket.emit("username", token.user.user_metadata.username);
  useEffect(() => {
    // const username = prompt("Username");
    // setUsername(username);
    // socket.emit("username", username);

    socket.on("opponentJoined", (roomData) => {
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, []);
  useEffect(() => {
    
    socket.emit('fetchLobbies');
    socket.on('lobbiesUpdate', (data) => {
      setLobbies(data);
    });

  }, []);

  // Function to handle joining a lobby
  const handleJoinLobby = (lobby) => {
    // Emit join room event
    socket.emit("username", token.user.user_metadata.username);
    
    socket.emit("joinRoom", { roomId: lobby.roomId }, (r) => {
      console.log("hi");
      if (r.error) {
        console.error(r.message); // Handle error case
      } else {
        setRoom(r?.roomId);
        setPlayers(r?.players);
        setOrientation("black"); // Set orientation based on game logic
      }
    });
  };

  // Function to cleanup and exit game
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers("");
  }, []);

  // Conditional rendering
  if (room) {
    return (
      <Game
        room={room}
        orientation={orientation}
        players={players}
        cleanup={cleanup}// Pass the cleanup function
      />
    );
  } else {
    return (
      <div className="page home">
        <h1>Available Lobbies</h1>
        {lobbies.map(lobby => (
          <div key={lobby.roomId}>
            <p>Lobby ID: {lobby.roomId}</p>
            <p>Player: {lobby.players[0].username}</p>
            <button onClick={() => handleJoinLobby(lobby)}>Join</button>
            <OpenChat username={token.user.user_metadata.username} />
          </div>
          
        ))}
      </div>
    );
  }
};
export default Find