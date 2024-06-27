import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';


function WelcomePage({ handleStartClick ,loggedIn}) { 
    console.log("WelcomePage - loggedIn:", loggedIn); // check if user is logged in
    

    return (
        <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ marginTop: '-10vh' }}>
        <h2>Welcome to the Meme Guessing Game!</h2>
        <p>Press the button to start guessing the meme.</p>
        <button className="btn btn-primary" onClick={handleStartClick}>
        {loggedIn ? "Start" : "Start as Guest"}
        </button>
        </Container>
        );
        }


export default WelcomePage;