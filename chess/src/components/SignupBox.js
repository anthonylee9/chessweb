import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import supabase from "../config/supabaseClient"

const SignUp = () => {
  const navigate = useNavigate()
  const [formData,setFormData] = useState({
    username:'',email:'',password:''
  })

  console.log(formData)

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
      const { data, error } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            }
          }
        }
      )
      if (error) throw error
      alert('Check your email for verification link')
      navigate('/sign-in');
      
    } catch (error) {
      alert(error)
    }
  }




  return (

    <div className='auth-inner'>
<form onSubmit = {handleSubmit}>
        <h3>Sign up </h3>
    
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            onChange = {handleChange} 
            placeholder='Username'
            name='username'
            
          />
        </div>
    
        
  
      <div className="mb-3">
        <label>Email</label>
        <input
         
          className="form-control"
          placeholder='Email'
          name='email'
          onChange={handleChange}
        />
      </div>
  
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          name="password"
          onChange = {handleChange}
          
        />
      </div>
     
  
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
     
    </form>
    </div>
    
  )
}

export default SignUp


