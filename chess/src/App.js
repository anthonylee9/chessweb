import React, {useEffect, useState} from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Container } from "@mui/material";
import HoldingBoard from './components/HoldingBoard'
import Home from './components/Home'
import SignupBox from './components/SignupBox'
import Login from './components/login.component'
import Replay from './components/Replay'
import Find from './components/Find'
import BotPage from './components/BotPage'
const App = () => {
  const [token, setToken] = useState(false)
  if (token){
    sessionStorage.setItem('token', JSON.stringify(token))
  }

  useEffect(() => {
    if(sessionStorage.getItem('token')){
      let data = JSON.parse(sessionStorage.getItem('token'))
      setToken(data)
    }
  }, [])
  return (
    
    <Router>
      
      <div className="App">
       
        <nav className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container">
            <Link className="navbar-brand" to={'/sign-in'}>
              Chess
            </Link>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link className="nav-link" to={'/sign-in'}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/sign-up'}>
                    Sign up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/play'}>
                  Create/Join
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/home'}>
                    History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/find'}>
                    Lobbies
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/bot'}>
                   Bot
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route exact path="/" element={<Login setToken={setToken}/>} />
              <Route path="/sign-in" element={<Login setToken={setToken}/>} />
              <Route path="/sign-up" element={<SignupBox />} />
              {token ? <Route path="/play" element={<HoldingBoard token = {token}/>} /> : <Route path="*" element={<Navigate to="/sign-in" replace />} />}
              <Route path="/home" element={<Home />} />
              <Route path="/replay" element={<Replay />} />
              {token ? <Route path="/find" element={<Find token = {token}/>} /> : <Route path="*" element={<Navigate to="/sign-in" replace />} />}
              <Route path="/bot" element={<BotPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <Container>
      {/* <Game /> */}
    </Container>
    </Router>
  )
}

export default App
