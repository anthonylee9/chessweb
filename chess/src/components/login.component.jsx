import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from "../config/supabaseClient"

const Login = ({setToken}) => {
  let navigate = useNavigate()

  const [formData,setFormData] = useState({
        email:'',password:''
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
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          })

      if (error) throw error
      console.log(data)
      setToken(data)
      navigate('/play', { state: { userData: data } });


    //   alert('Check your email for verification link')

      
    } catch (error) {
      alert(error)
    }
  }




     return (
      <div className='auth-inner'>
        <form onSubmit = {handleSubmit}>
          <h3>Log In</h3>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Email"
              onChange = {handleChange}
              name = "email"
              
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

export default Login
