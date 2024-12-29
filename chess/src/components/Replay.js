import React, { useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Game from "../Game"
import { DataGrid } from '@mui/x-data-grid';
import uuid from 'react-uuid';

import { Grid } from "@mui/material"


const Replay = () => {
  const location = useLocation();
  const movedata = location.state ? location.state.moveData : null;
  const moves = movedata[0].move_history;
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const handleNextMove = useCallback(() => {
    console.log(moves[currentMoveIndex])
    if (currentMoveIndex < moves.length) {
      const nextMove = moves[currentMoveIndex];
      const updatedGame = new Chess(game.fen());
      updatedGame.move(nextMove);
      setGame(updatedGame);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
    
  }, [currentMoveIndex, game, moves]);

  const handlePreviousMove = useCallback(() => {
    if (currentMoveIndex > 0) {
      const updatedGame = new Chess();
      for (let i = 0; i < currentMoveIndex - 1; i++) {
        updatedGame.move(moves[i]);
      }
      setGame(updatedGame);
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
    if (currentMoveIndex == 0){
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, moves]);


  const columns = [
    { field: 'id', headerName: 'Move', width: 30},
    { field: 'color', headerName: 'Color', width: 50 },
    { field: 'piece', headerName: 'Piece', width: 50 },
    { field: 'from', headerName: 'From', width: 50 },
    { field: 'to', headerName: 'To', width: 50 },
    {
      field: 'flags',
      headerName: 'Flags',
      sortable: true,
      width: 130,
      // valueGetter: (params) =>
      //   `${moves[id].flags == "c"}`,
    },
    { field: 'after', headerName: '', width: 0 },
    { field: 'before', headerName: '', width: 0 }
  ];

  const generateUniqueIds = (data) => {
   
    data = data.map((item, index) => ({
      id: index,
      ...item,
     
    }));
    // console.log(data)
    return data;
  };

  const handleRowClick = (params) => {
    // setMessage(${params.row.title}");
    let newIndex = params.row.id;
    if (currentMoveIndex < newIndex){
      for (let i = currentMoveIndex; i < newIndex; i++){
        
        const updatedGame = new Chess(params.row.before);
        setGame(updatedGame)
        console.log("newIndex: " + newIndex)
        console.log("current: " + currentMoveIndex)
        console.log(params.row)
        setCurrentMoveIndex(newIndex)
      }
    }
    if (currentMoveIndex > newIndex){
      for (let i = currentMoveIndex; i > newIndex; i--){
        handlePreviousMove()
        const updatedGame = new Chess(params.row.before);
        setGame(updatedGame)
        console.log("newIndex: " + newIndex)
        console.log("current: " + currentMoveIndex)
        console.log(params.row)
        setCurrentMoveIndex(newIndex)
      }
    }
    // game.load(params.row.after)
    // console.log(params.row.after)
  };
  

  return (
    <div style={{marginTop : "100px"}}>
      
      <Grid container spacing={2} className="replay-container">
      <Grid item xs={4}></Grid>
      <Grid item xs={4} className="replay-board">
        <Chessboard
          position={game.fen()}
          draggable={false}
          width={400}
          boardStyle={{
            borderRadius: "5px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          }}
        />
        <div className="replay-button-container">
          <Button className="replay-button" variant="contained" onClick={handlePreviousMove} disabled={currentMoveIndex === 0}>
            Previous Move
          </Button>
          <Button  className="replay-button" variant="contained" onClick={handleNextMove} disabled={currentMoveIndex === moves.length}>
            Next Move
          </Button>
        </div>
      </Grid>
      <Grid item xs={4}>
          <div className="data-grid" style={{ height: 400, width: '100%',  paddingLeft : "30px", paddingRight : "30px"}}>
            <DataGrid
            className="data-grid-inner"
              rows={generateUniqueIds(moves)}
              columns={columns}
              // getRowId={(moves) =>  {uuid()} }
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              onRowClick={handleRowClick}
              pageSizeOptions={[5]}
              getRowClassName={(params) => {
                return params.row.id === currentMoveIndex ? "highlight" : "";
              }}
              columnVisibilityModel={{
                // Hide columns status and traderName, the other columns will remain visible
                before: false,
                after: false,
              }}
              sx={{
                ".highlight": {
                  bgcolor: "darkgrey",
                  "&:hover": {
                    bgcolor: "darkgrey",
                  },
                },
              }}
        
            />
          </div>

      </Grid>
      {/* <div>
      {Object.keys(moves).reverse().map((tag) => (
      Game.boxColor(tag)
      ))}
      </div> */}
      
      </Grid>

    </div>
    
    
  );
};

export default Replay;

// import { useState, useMemo, useCallback, useEffect } from "react";
// import { Chessboard } from "react-chessboard";
// import { Chess } from "chess.js";

// import { useLocation } from 'react-router-dom';
// const Replay = () => {
//   const location = useLocation();
//   const movedata = location.state ? location.state.moveData : null;
//   const moves = movedata[0].move_history
//   const [game, setGame] = useState(new Chess());

//   useEffect(() => {
//     if (moves) {
//       // Function to animate moves
      
//       const animateMoves = () => {
//         moves.forEach((move, index) => {
//           setTimeout(() => {
//             game.move(move);
//             setGame(new Chess(game.fen())); // Update the game state to trigger re-render
//           }, index * 1500); // Delay moves by 1 second (1000 milliseconds)
//         });
//       };

//       // Call the function to animate moves when component mounts
//       animateMoves();
//     }
//   }, [moves]);

//   return (
//     <div>
//       <Chessboard
//         position={game.fen()}
//         draggable={false}
//         width={400}
//         boardStyle={{
//           borderRadius: "5px",
//           boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
//         }}
//       />
//     </div>
//   );
// };

// export default Replay