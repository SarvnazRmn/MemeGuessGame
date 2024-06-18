import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, Navigate, useNavigate  } from 'react-router-dom';
import NavHeader from "./components/NavHeader";
import NotFound from './components/NotFoundComponent';
import { LoginForm } from './components/AuthComponents';
import GamePage from './components/GamePage';
import API from './assets/API.mjs';

//defining WelcomePage component
function WelcomePage({ handleStartClick }) {    //using Eventhandler for start button
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ marginTop: '-10vh' }}>
      <h2>Welcome to the Meme Guessing Game!</h2>
      <p>Press the button to start guessing the meme.</p>
      <button className="btn btn-primary" onClick={handleStartClick}>Start</button>
    </Container>
  );
}


function App() {
  const [count, setCount] = useState(0)
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo(); // we have the user info here
      setLoggedIn(true);
      setUser(user);
    };
    checkAuth();
  }, []);

  const navigate = useNavigate();
  //Eventhandler for start button
  const handleStartClick = () => {
    console.log("Start button clicked!");
    // Navigate to the game page
    navigate('/game'); 
  };

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.username}!`, type: 'success'});
      setUser(user);
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMessage('');
    navigate('/');
  };

  return (
    <Routes>
      <Route element={
        <>
          {/* NavHeader and container for all routes */}
          <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} />
          <Container fluid className='mt-3'>
            {message && (
              <Row>
                <Alert variant={message.type} onClose={() => setMessage('')} dismissible>
                  {message.msg}
                </Alert>
              </Row>
            )}
            {/* Outlet for rendering nested routes */}
            <Outlet />
          </Container>
        </>
      }>
        {/* Nested routes */}
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<WelcomePage handleStartClick={handleStartClick} />} />
        <Route path="/game" element={<GamePage />} />
        <Route
          path="/login"
          element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />}
        />
      </Route>
    </Routes>
  );
}

export default App;


