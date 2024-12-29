import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import Chat from "./components/Chat";
import socket from "./socket";
import supabase from "./config/supabaseClient"
import {Card, Divider, CardContent, List, ListItem,ListItemText, ListSubheader, Stack, Typography, Box, Grid} from "@mui/material";

function Game({ players, room, orientation, cleanup }) {
  const gameId = useMemo(() => `${room}-${Date.now()}`, [room]);
  const chess = useMemo(() => new Chess(), []); // <- 1
  const [fen, setFen] = useState(chess.fen()); // <- 2
  const [over, setOver] = useState("");
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveList, setMoveList] = useState([])
  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };
  function generateGameId(string1, string2) {
    // Combine both strings
    const combinedString = string1 + string2;
    let hash = 0;

    // Iterate over each character in the combined string
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash); // Ensure the result is a positive number
}
  useCallback(  async (e) => {
    const { data, error } = await supabase
      .from('lobbies')
      .select('fen')
      .eq('gameid', 15)
      .maybeSingle()
      //console.log(data)
    if (data) {
      setFen(data.fen)
      
    }     
    if (error){
      console.log(error)
    }
  }, []
  )

  const makeAMove = useCallback(
    
     (move) => {
      try {
        const result = chess.move(move); // update Chess instance
        setFen(chess.fen()); // update fen state to trigger a re-render
         handleMove(result.after)
       handleHistory(result)
       console.log(players)
       console.log(players[0])
       console.log("hi")
        console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());
        
        if (chess.isGameOver()) { // check if move led to "game over"
          if (chess.isCheckmate()) { // if reason for game over is a checkmate
            // Set message to checkmate. 
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            ); 
            // The winner is determined by checking which side made the last move
          } else if (chess.isDraw()) { // if it is a draw
            setOver("Draw"); // set message to "Draw"
          } else {
            setOver("Game over");
          }
        }
        if (result) {
            if (result.captured) {
              //playSound('https://audio.jukehost.co.uk/o5NNboO2u8ChNQbY2cLvsyURsHpTOtXG')
              playSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');
            } else {
              //playSound('http://sndup.net/k5nm')
              playSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
            }
          }
  
        return result;
      } catch (e) {
        return null;
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess]
  );
  function boxColor(tag) {
    // console.log(moveList[tag])
    if (moveList[tag].color == "w"){
      return (
        <Box className="move-box-white">
          <p key={tag} className="move-history-item">
              
              {parseColor(moveList[tag].color)} {parsePiece(moveList[tag].piece)}  &nbsp;
              {moveList[tag].from} to {moveList[tag].to}
            
          </p>
        </Box>
      )
    }
    else {
      return (
        <Box className="move-box-black">
          <p key={tag} className="move-history-item">
            
              {parseColor(moveList[tag].color)} {parsePiece(moveList[tag].piece)}  &nbsp;
              {moveList[tag].from} to {moveList[tag].to}
            
          </p>
        </Box>
      )
    }
  }
  function parsePiece(p){
    switch(p){
      case "p":
      return (<>{'♙'}</>);

      case "r":
      return (<>{"♖"}</>);

      case "n":
      return (<>{"♘"}</>);

      case "q":
      return (<>{"♕"}</>);

      case "k":
      return (<>{"♔"}</>);

      case "b":
      return (<>{"♗"}</>);
    }
  }
  function parseColor(c) {
    switch (c) {
      case "w":
        return "white";
      case "b":
        return "black";
    }

  }


   // onDrop function
   function onDrop(sourceSquare, targetSquare) {
    // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
    if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player

    if (players.length < 2) return false; // <- 2 disallow a move if the opponent has not joined

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q", // promote to queen where possible
    };

    const move = makeAMove(moveData);

    // illegal move
    if (move === null) return false;

    setHoveredSquare(null);
    removeGreySquares();
    setSelectedSquare(null);
    
    socket.emit("move", { // <- 3 emit a move event.
      move,
      room,
    }); // this event will be transmitted to the opponent via the server

    return true;
  }

  function onMouseoverSquare(square, piece) {
    if (chess.turn() === orientation[0]) {
      // Check if it's the current player's turn
      if (chess.get(square) && chess.get(square).color === chess.turn()) {
        setSelectedSquare(square);
  
        const moves = chess.moves({
          square: square,
          verbose: true,
        });
  
        if (moves.length === 0) return;
  
        setHoveredSquare(square);
        setHighlightedSquares(moves.map((move) => move.to));
      }}}

  function onMouseoutSquare() {
    setHoveredSquare(null);
    removeGreySquares();
    setSelectedSquare(null); // Clear the selected square
  }
  

  function getCustomSquareStyles() {
    const customStyles = {};

    if (hoveredSquare) {
      const isBlackSquare =
        hoveredSquare.charCodeAt(0) % 2 !== parseInt(hoveredSquare[1]) % 2;
      const backgroundColor = isBlackSquare ? "#a9a9a9" : "#696969";
      customStyles[hoveredSquare] = { backgroundColor };
    }

    highlightedSquares.forEach((square) => {
      const isBlackSquare =
        square.charCodeAt(0) % 2 !== parseInt(square[1]) % 2;
      const backgroundColor = isBlackSquare ? "#a9a9a9" : "#696969";
      customStyles[square] = { backgroundColor };

      if (chess.get(square)) {
        customStyles[square] = {
          backgroundColor,
          border: "4px solid red",
        };
      }
    })

    if (selectedSquare) {
      customStyles[selectedSquare] = {
        ...(customStyles[selectedSquare] || {}), // Preserve existing styles
        border: "4px solid yellow", // Add the red border
      };
    }
    return customStyles;
  }
  function removeGreySquares() {
    setHighlightedSquares([]);
  }

  useEffect(() => {
    socket.on("move", (move) => {
      makeAMove(move); //
    });
  }, [makeAMove]);
  
  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`); // set game over
    });
  }, []);

  useEffect(() => {
    socket.on('closeRoom', ({ roomId }) => {
      if (roomId === room) {
        cleanup();
      }
    });
  }, [room, cleanup]);

  useEffect(() => {
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobbies',
        },
        async (payload) => {
          //console.log(payload)
          //await fetchFen();
          await setFen(payload.new.fen)
        }
      ).subscribe()
    return () => {
      channel.unsubscribe();
    }
  }, [])

  const handleMove = async (fenData) => {
    const move_history = chess.history({verbose : true})
    
    const { error } = await supabase
      .from('lobbies')
      .upsert({ gameid : 77, 'fen' : fenData, move_history, "users" : players})
    
    if (error){
      console.log(error)
    }


}
  const handleHistory = async (move) => {
      
    const { data, error } = await supabase
      .from('lobbies')
      .select('move_history')
      .eq('gameid', 77)
      .single()
      //.eq('gameid', 15)

      if (data){
        setMoveList(data.move_history)
      
      }
      else {
        setMoveList([move])
        console.log(moveList)
      }
      

      if (error) {
        console.log(error)
      }
  }


 
  return (
    <div className="game">
      <Grid container spacing={4} >
        {/* {console.log(players)} */}
      <Grid item xs={3}>
        <Box>
          {/* {console.log(players.length)} */}
          <Typography variant="h5">Room ID: {room}</Typography>
          <Typography variant="h5">Turn: {chess.turn() === 'w' ? 'White' : 'Black'}</Typography>
          {players.length > 0 && (
              <Box>
                <List>
                  <ListSubheader>Players</ListSubheader>
                  {players.map((p, index) => (
                    <ListItem key={p.id}>
                      <ListItemText primary={p.username} />
                      <div style={{ width: '10px', height: '10px', backgroundColor: index === 0 ? 'white' : 'black', borderRadius: '50%', display: 'inline-block' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box>
          <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation={orientation}
                  onMouseOverSquare={onMouseoverSquare}
                  onMouseOutSquare={onMouseoutSquare}
                  customSquareStyles={getCustomSquareStyles()} 
                />
        </Box>
      </Grid>
      <Grid item xs={3} >
        <Box className="move-history-box">
          <h3>Move History </h3>
          
          {Object.keys(moveList).reverse().map((tag) => (
          boxColor(tag)
      ))}
      
      
        </Box>
        <Divider variant="middle" sx={{background : "#ffffff"}}/>
        <CustomDialog // Game Over CustomDialog 
            open={Boolean(over)}
            title={over}
            contentText={over}
            handleContinue={() => {
              socket.emit("closeRoom", { roomId: room });
              cleanup();
            }}
          />
          <div className="chat-box">
            <Chat room={room} />
          </div>
          
        
      </Grid>

      {/* <Grid item xs={12}>
      
        
        
      </Grid> */}

      </Grid>
    </div>
   

  );
}


export default Game;




