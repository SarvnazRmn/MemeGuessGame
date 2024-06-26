import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, Navigate, useNavigate  } from 'react-router-dom';
import NavHeader from "./components/NavHeader";
import NotFound from './components/NotFoundComponent';
import { LoginForm } from './components/AuthComponents';
import GamePage from './components/GamePage';
import ProfilePage from './components/ProfilePage';
import WelcomePage from './components/WelcomePage';
import API from './assets/API.mjs';




function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        setLoggedIn(false);
      }
    };
    if (loggedIn) {
      checkAuth();
    }
  }, [loggedIn]);

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
          <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} username={user ? user.username : ''} />
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
        <Route path="/" element={<WelcomePage handleStartClick={handleStartClick} loggedIn={loggedIn} />} /> 
        <Route path="/game" element={<GamePage loggedIn={loggedIn} user={user} />} />
        <Route path="/profile" element={<ProfilePage loggedIn={loggedIn} user={user} />} />
        <Route
          path="/login"
          element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />}
        />
      </Route>
    </Routes>
  );
}

export default App;


