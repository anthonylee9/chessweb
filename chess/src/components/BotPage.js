import { useState, useMemo, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Box, Grid, Paper } from '@mui/material';

function BotPage({ orientation, cleanup }) {
  const [game, setGame] = useState(new Chess());
  const [moveList, setMoveList] = useState([]);
  const [history, setHistory] = useState([game.fen()]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [clickSquares, setClickSquares] = useState({ source: '', target: '' }); // Added to track clicks
  const addMoveToHistory = useCallback((move) => {
    setMoveList((prev) => [...prev, move]);
  }, []);
  
  const handlePlayerMove = useCallback(async (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Auto-promote to queen for simplicity
    });

    if (move) {
      addMoveToHistory("player: " + targetSquare);
      const newGame = new Chess(game.fen());
      setGame(newGame);
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      setHistory([...newHistory, newGame.fen()]);
      setCurrentHistoryIndex(newHistory.length);
      await makeBotMove(); // Make the bot move after the player's move
      setClickSquares({ source: '', target: '' }); // Reset clicks after a successful move
    }
  }, [game, addMoveToHistory, history, currentHistoryIndex]);

  const handleSquareClick = useCallback((square) => {
    const { source, target } = clickSquares;

    if (!source) {
      setClickSquares({ ...clickSquares, source: square });
    } else if (source && !target) {
      handlePlayerMove(source, square);
    }
  }, [clickSquares, handlePlayerMove]);

  // Function to make the bot's move
  const makeBotMove = useCallback(async () => {
    const fen = game.fen();
    const botMove = await fetchBotMove(fen); // Implement this function to get bot's move

    if (botMove && botMove.best_move) {
      const moveResult = game.move(botMove.best_move);
      if (moveResult) {
        addMoveToHistory("bot: " + moveResult.san);
        const newGame = new Chess(game.fen());
        setGame(newGame);
        const newHistory = [...history, newGame.fen()];
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
      } else {
        console.error("Bot move failed or was invalid:", botMove.best_move);
      }
    }
  }, [game, history]);

  // Example function to fetch the bot's move from an API
  async function fetchBotMove(fen) {
    try {
      // This is a placeholder for the actual fetch request
      // You'll need to replace 'http://localhost:5000/get_move' with your actual API endpoint
      const response = await fetch('http://localhost:5000/get_move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fen }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data; // Adjust this based on your API response
    } catch (error) {
      console.error("Failed to fetch the bot's move:", error);
      return null;
    }
  }

  const resetBoard = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setHistory([newGame.fen()]);
    setMoveList([]); // Reset move history
    setCurrentHistoryIndex(0);
  }, []);
  
  const goToPreviousMove = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setGame(new Chess(history[currentHistoryIndex - 1]));
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setMoveList(moveList.slice(0, -2)); // Remove the last move
    }
  }, [currentHistoryIndex, history, moveList]);
  
  const goToNextMove = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      setGame(new Chess(history[currentHistoryIndex + 1]));
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      // Here, you would ideally add back the move, but you need the move data which is not stored in the history.
    }
  }, [currentHistoryIndex, history]);

  useEffect(() => {
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [cleanup]);

  return (
    <Box className="move-history-box" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
         
            <Chessboard
              id="MyChessboard"
              position={game.fen()}
              onPieceDrop={handlePlayerMove}
              onSquareClick={handleSquareClick}
              boardOrientation={orientation}
              customBoardStyle={{
                borderRadius: '5px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
              }}
            />
            <Box sx={{ mt: 2 }}>
              <button onClick={resetBoard}>Reset Board</button>
              <button onClick={goToPreviousMove} disabled={currentHistoryIndex === 0}>Undo Move</button>
            </Box>
        
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
            <h3>Move History</h3>
            <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'center' }}>
  {moveList.map((move, index) => (
    <li key={index} style={{ textAlign: 'center' }}>{move}</li>
  ))}
</ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BotPage;


// import { useState, useMemo, useCallback, useEffect } from "react";
// import { Chessboard } from 'react-chessboard';
// import { Chess } from 'chess.js';

// import { Box } from '@mui/material';

// function BotPage({ players, room, orientation, cleanup }) {
//   const addMoveToHistory = (move) => {
//     setMoveList((prev) => [...prev, move]);
//   };
//   const handlePlayerMove = (sourceSquare, targetSquare) => {
//     const move = game.move({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: 'q', // Auto-promote to queen for simplicity
//     });

//     if (move) {
//       addMoveToHistory(move.san); // Add move to history using Standard Algebraic Notation (SAN)
//       setGame(new Chess(game.fen())); // Update game state
//       makeBotMove(); // Trigger the bot's move
//     }
//   };

//   // Function to make the bot's move
//   const makeBotMove = async () => {
//   const fen = game.fen();
//   // Call your logic/API to get the next move based on the current FEN
//   const botMove = await fetchBotMove(fen); // Implement this function
  
//   if (botMove && botMove.best_move) {
//     // First, make the bot's move in the game
//     const moveResult = game.move(botMove.best_move);
//     if (moveResult) {
//       // If the move is successful, add the move's SAN to the move history
//       addMoveToHistory(moveResult.san);

//       // Update the game state with the new position after the bot's move
//       setGame(new Chess(game.fen()));
//     } else {
//       console.error("Bot move failed or was invalid:", botMove.best_move);
//     }
//   }
// };

//   // Example function to fetch the bot's move from an API
//   async function fetchBotMove(fen) {
//     try {
//       console.log(fen)
//       // Make a POST request to the server with the current FEN
//       const response = await fetch('http://localhost:5000/get_move', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ fen }),
//       });
//       // Check if the request was successful
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       // Parse the JSON response
//       const data = await response.json();
//       console.log(data)
//       // Assuming the response JSON structure is { from: 'e2', to: 'e4' }
//       // You might need to adjust this based on the actual API response
//       return data;
//     } catch (error) {
//       console.error("Failed to fetch the bot's move:", error);
//       return null; // Return null or handle the error as appropriate
//     }
//   }
//   const [game, setGame] = useState(new Chess());
//   const [boardOrientation, setBoardOrientation] = useState(orientation);
//   const chess = useMemo(() => new Chess(), []); // <- 1
//   const [fen, setFen] = useState(chess.fen()); // <- 2
//   const [over, setOver] = useState("");
//   const [hoveredSquare, setHoveredSquare] = useState(null);
//   const [highlightedSquares, setHighlightedSquares] = useState([]);
//   const [selectedSquare, setSelectedSquare] = useState(null);
//   const [moveList, setMoveList] = useState([])
//   const playSound = (soundUrl) => {
//     const audio = new Audio(soundUrl);
//     audio.play();
//   };
//   function removeGreySquares() {
//     setHighlightedSquares([]);
//   }
//   const makeAMove = useCallback(
    
//     (move) => {
//      try {
//        const result = chess.move(move); // update Chess instance
//        setFen(chess.fen()); // update fen state to trigger a re-render
      
      
       
//        if (chess.isGameOver()) { // check if move led to "game over"
//          if (chess.isCheckmate()) { // if reason for game over is a checkmate
//            // Set message to checkmate. 
//            setOver(
//              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
//            ); 
//            // The winner is determined by checking which side made the last move
//          } else if (chess.isDraw()) { // if it is a draw
//            setOver("Draw"); // set message to "Draw"
//          } else {
//            setOver("Game over");
//          }
//        }
//        if (result) {
//            if (result.captured) {
//              //playSound('https://audio.jukehost.co.uk/o5NNboO2u8ChNQbY2cLvsyURsHpTOtXG')
//              playSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');
//            } else {
//              //playSound('http://sndup.net/k5nm')
//              playSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
//            }
//          }
 
//        return result;
//      } catch (e) {
//        return null;
//      } // null if the move was illegal, the move object if the move was legal
//    },
//    [chess]
//  );
//   useEffect(() => {
//     // Cleanup function if needed when component unmounts
//     return () => {
//       if (cleanup) {
//         cleanup();
//       }
//     };
//   }, [cleanup]);

//   function onDrop(sourceSquare, targetSquare) {
//     const moveData = {
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: "q", // always promote to a queen for simplicity
//     };
  
//     const result = game.move(moveData);
//     if (result) {
//       setGame(new Chess(game.fen())); // Update game state with new game instance
//       setFen(game.fen()); // This is now redundant if you're only using the `game` state
//       // Handle sounds and game over logic here
//       return true;
//     } else {
//       // Handle illegal move
//       return false;
//     }
//   }

//   const resetBoard = () => {
//     const newGame = new Chess();
//     setGame(newGame);
//   };

//   return (
//     <Box
//     className="botchessboard">
      
//       <Chessboard
//         id="MyChessboard"
//         className="botchessboard"
//         position={game.fen()}
//         onPieceDrop={handlePlayerMove}
//         boardOrientation={boardOrientation}
//         customBoardStyle={{
//           borderRadius: '5px',
//           boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
//         }}
//       />
//       {/* Add any additional buttons or functionality you wish below */}
//       {/* This button will reset the board to the initial position */}
//       <button onClick={resetBoard}>Reset Board</button>\
//       <div className="move-history">
//         <h3>Move History</h3>
//         <ul>
//           {moveList.map((move, index) => (
//             <li key={index}>{`${move}`}</li>
//           ))}
//         </ul>
//       </div>
//     </Box>
//   );
// }

// export default BotPage;

// WORKING? PREV NEXT

// import { useState, useMemo, useEffect, useCallback } from 'react';
// import { Chessboard } from 'react-chessboard';
// import { Chess } from 'chess.js';
// import { Box } from '@mui/material';

// function BotPage({ orientation, cleanup }) {
//   const [game, setGame] = useState(new Chess());
//   const [moveList, setMoveList] = useState([]);
//   const [history, setHistory] = useState([game.fen()]);
//   const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

//   const addMoveToHistory = useCallback((move) => {
//     setMoveList((prev) => [...prev, move]);
//   }, []);

//   const handlePlayerMove = useCallback(async (sourceSquare, targetSquare) => {
//     const move = game.move({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: 'q', // Auto-promote to queen for simplicity
//     });

//     if (move) {
//       addMoveToHistory(move.san);
//       const newGame = new Chess(game.fen());
//       setGame(newGame);
//       const newHistory = history.slice(0, currentHistoryIndex + 1);
//       setHistory([...newHistory, newGame.fen()]);
//       setCurrentHistoryIndex(newHistory.length);
//       await makeBotMove(); // Make the bot move after the player's move
//     }
//   }, [game, addMoveToHistory, history, currentHistoryIndex]);

//   // Function to make the bot's move
//   const makeBotMove = useCallback(async () => {
//     const fen = game.fen();
//     const botMove = await fetchBotMove(fen); // Implement this function to get bot's move

//     if (botMove && botMove.best_move) {
//       const moveResult = game.move(botMove.best_move);
//       if (moveResult) {
//         addMoveToHistory(moveResult.san);
//         const newGame = new Chess(game.fen());
//         setGame(newGame);
//         const newHistory = [...history, newGame.fen()];
//         setHistory(newHistory);
//         setCurrentHistoryIndex(newHistory.length - 1);
//       } else {
//         console.error("Bot move failed or was invalid:", botMove.best_move);
//       }
//     }
//   }, [game, history]);

//   // Example function to fetch the bot's move from an API
//   async function fetchBotMove(fen) {
//     try {
//       // This is a placeholder for the actual fetch request
//       // You'll need to replace 'http://localhost:5000/get_move' with your actual API endpoint
//       const response = await fetch('http://localhost:5000/get_move', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ fen }),
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       return data; // Adjust this based on your API response
//     } catch (error) {
//       console.error("Failed to fetch the bot's move:", error);
//       return null;
//     }
//   }

//   const resetBoard = useCallback(() => {
//     const newGame = new Chess();
//     setGame(newGame);
//     setHistory([newGame.fen()]);
//     setMoveList([]); // Reset move history
//     setCurrentHistoryIndex(0);
//   }, []);
  
//   const goToPreviousMove = useCallback(() => {
//     if (currentHistoryIndex > 0) {
//       setGame(new Chess(history[currentHistoryIndex - 1]));
//       setCurrentHistoryIndex(currentHistoryIndex - 1);
//       setMoveList(moveList.slice(0, -2)); // Remove the last move
//     }
//   }, [currentHistoryIndex, history, moveList]);
  
//   const goToNextMove = useCallback(() => {
//     if (currentHistoryIndex < history.length - 1) {
//       setGame(new Chess(history[currentHistoryIndex + 1]));
//       setCurrentHistoryIndex(currentHistoryIndex + 1);
//       // Here, you would ideally add back the move, but you need the move data which is not stored in the history.
//     }
//   }, [currentHistoryIndex, history]);

//   useEffect(() => {
//     return () => {
//       if (cleanup) {
//         cleanup();
//       }
//     };
//   }, [cleanup]);

//   return (
//     <Box className="botchessboard">
//       <Chessboard
//         id="MyChessboard"
//         position={game.fen()}
//         onPieceDrop={handlePlayerMove}
//         boardOrientation={orientation}
//         customBoardStyle={{
//           borderRadius: '5px',
//           boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
//         }}
//       />
//       <button onClick={resetBoard}>Reset Board</button>
//       <button onClick={goToPreviousMove} disabled={currentHistoryIndex === 0}>Previous Move</button>
//       <button onClick={goToNextMove} disabled={currentHistoryIndex >= history.length - 1}>Next Move</button>
//       <div className="move-history">
//         <h3>Move History</h3>
//         <ul>
//           {moveList.map((move, index) => (
//             <li key={index}>{move}</li>
//           ))}
//         </ul>
//       </div>
//     </Box>
//   );
// }

// export default BotPage;