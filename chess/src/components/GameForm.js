import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from "../config/supabaseClient"
const GameForm = () => {
    const [formData,setFormData] = useState({
        gameid:''
  })
  let navigate = useNavigate()

  

  function handleChange(event){
    setFormData((prevFormData)=>{
      return{
        ...prevFormData,
        [event.target.name]:event.target.value
      }

    })

  }

  async function handleSubmit(e){
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


     return (
      <form onSubmit = {handleSubmit}>
       

        <div className="mb-3">
          <label>Replay Game</label>
          <input
            type="text"
            className="form-control"
            placeholder="GameID"
            onChange = {handleChange}
            name = "gameid"
            
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        
      </form>
  )
}
  
  export default GameForm;