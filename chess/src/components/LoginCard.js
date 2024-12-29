import {Box, Button} from '@mui/material'
import {useNavigate} from 'react-router-dom';
import supabase from "../config/supabaseClient"


const LoginCard = ({ lobbies }) => {



  async function handleSubmit(e){
    console.log(lobbies.gameid)
    e.preventDefault()

    try {
      const { data, error } = await supabase
      .from('lobbies')
      .select()
      .eq('gameid',lobbies.gameid) 
      if (error) throw error

      navigate('/replay', { state: { moveData: data } });
      
    } catch (error) {
      alert(error)
    }
  }

  let navigate = useNavigate()


    return (
      <Box component="div" sx={{ overflow: 'auto' }} className='replay-box'>
        {/* <h6> Game ID</h6> */}
        
        {/* <h3>Game History</h3> */}
        {/* <ReplayButton id={ lobbies.gameid }></ReplayButton>
        <div className="lobbies"> </div> */}
        <Button onClick={handleSubmit} variant='text' sx={{color : "white"}}>{lobbies.gameid}: {lobbies.users[0].username} vs. {lobbies.users[1].username}</Button>
          
      </Box>
    )
  }
  
  export default LoginCard