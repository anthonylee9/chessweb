import supabase from '../config/supabaseClient'
import { useEffect, useState } from 'react'
import LoginCard from './LoginCard'
import GameForm from './GameForm'
import { Grid } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material'

const Home = () => {
  const [fetchError, setFetchError] = useState(null)
  const [lobbies, setLobbies] = useState(null)
  async function deleteGameId77Rows() {
    let { data, error } = await supabase
      .from('lobbies')  // Replace 'your_table_name' with the actual table name, which seems to be 'lobbies' here
      .delete()
      .eq('gameid', 77)  // This line specifies that only rows with gameid equal to 77 will be deleted
      
    if (error) {
      console.error('Error deleting rows:', error);
      return;
    }
  
    console.log('Deleted rows:', data);
  }
  useEffect(() => {
    
    const fetchLogin = async () => {
      await deleteGameId77Rows(); 
      const { data, error } = await supabase
        .from('lobbies')
        .select()
      
      if (error) {
        setFetchError('Could not fetch the data')
        setLobbies(null)
      }
      if (data) {
        setLobbies(data)
        setFetchError(null)
      }
    }

    fetchLogin()

  }, [])


  const columns = [
    { field: 'gameid', headerName: 'Game ID', width: 100,
    options: {
      customBodyRender: (id) => {
          return (
              <Button variant='contained'>
                  {id}
              </Button>
          )
      }
  } },
    { field: 'fen', headerName: 'First name', width: 130 },
    { field: 'move_history', headerName: 'Last name', width: 130 },
    
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      valueGetter: (params) =>
        `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },
  ];



  return (
    <div className='auth-inner'>
      <div className="">
      {fetchError && (<p>{fetchError}</p>)}
      {lobbies && (
        <div className="replay-inner">
          {/* order-by buttons */}
          <div className="replay-grid" >
            <h3>Game History</h3>
            <div className='replay-list'>
              <Grid container spacing={1} className=''>
                <Grid item xs={12}>
                {/* <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={lobbies}
        columns={columns}
        getRowId={(lobbies) => lobbies.gameid}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        
      />
                </div> */}
                </Grid>
              
              {lobbies.map(lobbies => (
                <Grid item xs={12}>
                  <LoginCard key={lobbies.gameid} lobbies={lobbies} />
                </Grid>
                
              ))}
              </Grid>
            </div>
          </div>
          <GameForm>Re </GameForm>
        </div>
        
      )}
      
    </div>
    </div>
    
    
  )
}

export default Home