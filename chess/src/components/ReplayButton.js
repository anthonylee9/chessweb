import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from "../config/supabaseClient"
import { Typography } from "@mui/material"

const ReplayButton = (id, users) => {
    const [formData,setFormData] = useState({
        gameid:id
  })
  let navigate = useNavigate()

  


  async function handleSubmit(e){
    console.log(formData.gameid)
    e.preventDefault()

    try {
      const { data, error } = await supabase
      .from('lobbies')
      .select()
      .eq('gameid',formData.gameid) 
      if (error) throw error

    
      navigate('/replay', { state: { moveData: data } });


    //   alert('Check your email for verification link')

      
    } catch (error) {
      alert(error)
    }
  }

  function getFormData() {
    return formData.gameid.id
  }


     return (
      <form onSubmit = {handleSubmit}>
    
    
          <button type="submit" className="btn btn-primary" >
            <Typography>{getFormData()}</Typography>
          </button>
        
        
      </form>
  )
}
  
  export default ReplayButton;