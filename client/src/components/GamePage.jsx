import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';
import Summary from './Summary.jsx';


const TOTAL_ROUNDS_LOGGED_IN = 3; // Total rounds for logged-in users
const TOTAL_ROUNDS_ANONYMOUS = 1; // Total rounds for anonymous users
const ROUND_TIME = 30; 

function GamePage({ loggedIn, user }) {
  const [round, setRound] = useState(0);
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [correctCaptions, setCorrectCaptions] = useState([]);
  const [attempted, setAttempted] = useState(false); // for letting user to choose only one answer
  const [timer, setTimer] = useState(ROUND_TIME);
  const [gameData, setGameData] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]); 
  const [submitted, setSubmitted] = useState(false); // track if game has been submitted
  const [usedMeme, setUsedMeme] = useState([]); // track memes that are used in each round



   // --Shuffle captions to display captions randomly--
  const shuffleArray = (array) => {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };



  // --Fetch a random meme with captions--
  const fetchRandomMeme = async () => {
    setLoading(true);
    try {
      let memeData;
      do {
        memeData = await API.getMemeWithCaptions(user.id, usedMeme);
      } while (usedMeme.includes(memeData.meme.id));
      setCaptions(memeData.captions);
      setMeme(memeData.meme);
      setCorrectCaptions(memeData.captions.slice(0, 2)); // First two captions are correct
      setError('');

      const shuffledCaptions = shuffleArray(memeData.captions);
      setCaptions(shuffledCaptions);
      // Add the current meme's id to the usedMeme array 
      setUsedMeme((prevUsedMeme) => [...prevUsedMeme, memeData.meme.id]);
    } catch (err) {
      setError(err.message || 'Failed to fetch meme and captions');
    } finally {
      setLoading(false);
    }
  };

  

  //--start a new game--
  const startGame = () => {
    setRound(0);
    setGameOver(false);
    setAttempted(false);
    setSelectedCaption(null);
    setResult(null);
    setTimer(ROUND_TIME);
    fetchRandomMeme();
    setCorrectAnswers([]);
    setUsedMeme([]); 
  };



   // --Handle caption selection by the user--
  const handleCaptionClick = async (caption) => {
    if (attempted) return; // Prevent from further attempts if user already attempted
    setSelectedCaption(caption);
    setAttempted(true);


    //comparing id of selected caption with the ids of correct captions
    const isCorrect = correctCaptions.some(correctCaption => correctCaption.id === caption.id);
    // Filter the selected caption from the correct captions
    const matchingCorrectCaptions = correctCaptions.filter(correctCaption => correctCaption.id !== caption.id);
    const score = isCorrect ? 5 : 0;



    //display result state to user
    setResult({
      correct: isCorrect,
      message: isCorrect ? (loggedIn ? `Correct! You earned 5 points.` : 'Correct!') : (loggedIn ? 'Incorrect.' : 'Incorrect.'),
      correctCaptions: matchingCorrectCaptions,
    });


    if (isCorrect) {
      setCorrectAnswers(prevCorrectAnswers => [
        ...prevCorrectAnswers,
        {
          memeId: meme.id,
          memeUrl: meme.url, 
          captionId: caption.id,
          captionText: caption.caption, 
          score: 5,
        }
      ]);
    }


    // Save the score for the current round in the database if the user is logged in.
    if (loggedIn) {
      const roundId = round + 1;
      await API.saveScores(roundId, user.id, score);
    }

    
    const roundData = {
      user_id: user.id,
      round: round + 1,
      meme_id:  meme ? meme.id : null, 
      selected_caption_id: caption.id,
      score: isCorrect ? 5 : 0,
    };
    console.log('Round data:', roundData);
    setGameData((prevGameData) => [...prevGameData, roundData]);
  };

  const handleTimeout = () => {
    setResult({ correct: false, message: 'Time\'s up!', correctCaptions });
    setAttempted(true);
  };


  // --Proceed to the next round--
  const nextRound = () => {
    setRound((prevRound) => prevRound + 1);
    setAttempted(false);
    setSelectedCaption(null);
    setResult(null);
    setTimer(ROUND_TIME);
  };


 // --Submit game data to the server--
  const submitGame = async () => {
    try {
      await API.saveScores(gameData);
      console.log('Submitting game data:', gameData); 
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit game results:', err);
      alert('Failed to submit game results.');
    }
  };
  


  // --Fetch a new meme at the start of each round--
  useEffect(() => {
    if (loggedIn) {
      if (round < TOTAL_ROUNDS_LOGGED_IN) {
        fetchRandomMeme();
        setTimer(ROUND_TIME); // Reset timer for new round
      } else {
        setGameOver(true);
      }
    } else {
      // If not logged in, play only one round
      if (round === 0) {
        fetchRandomMeme();
        setTimer(ROUND_TIME);
      } else {
        setGameOver(true);
      }
    }
  }, [round, loggedIn]);



  //-- Manage the countdown timer--
  useEffect(() => {
    if (timer > 0 && !attempted) {
      const timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timer === 0) {
      handleTimeout();
    }
  }, [timer, attempted]);




  if (loading) {
    return (<Spinner animation="border" />);
  }

  if (gameOver) {
    return (
      <Container className="text-center">
        <h3>Game Over! Thanks for playing!</h3>
        <Button onClick={submitGame}>Submit</Button>
      </Container>
    );
  }


  // --Display summary after game submission--
  if (submitted) {
    return (
      <Summary
        summaryData={correctAnswers} // Pass correctAnswers to summaryData
        totalScore={correctAnswers.reduce((acc, curr) => acc + curr.score, 0)} 
        
      />
    );
  }


  return (
    <Container className="mt-5">
          <h3>Round {round + 1} of {loggedIn ? TOTAL_ROUNDS_LOGGED_IN : TOTAL_ROUNDS_ANONYMOUS}</h3>
          <div>Time Remaining: {timer} seconds</div>

          {/* Display meme and caption selection */}
          {meme && (
            <Card>
              <Card.Img
                variant="top"
                src={meme.url}
                alt="Meme"
                className="img-fluid mx-auto d-block"
                style={{ maxWidth: '30%', height: 'auto', maxHeight: '300px' }}
              />
              <Card.Body className="text-center">
                <Card.Title>Choose a Caption for the Meme</Card.Title>
                <div className="d-flex flex-column">
                  {captions.map((caption) => (
                    <Button
                      key={caption.id}
                      variant="outline-primary"
                      className="my-2"
                      onClick={() => handleCaptionClick(caption)}
                      disabled={attempted} 
                      style={{
                        backgroundColor:
                          selectedCaption && selectedCaption.id === caption.id
                            ? correctCaptions.some(correctCaption => correctCaption.id === caption.id)
                              ? 'green'
                              : 'red'
                            : '',
                      }}
                    >
                      {caption.caption}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

      {/* Display result alert */}
      {result && (
  <Alert variant={result.correct ? 'success' : 'danger'} className="mt-3">
    {result.message}
    {!result.correct && (
      <div>
        Correct captions:
        <ul>
          {result.correctCaptions.map(caption => (
            <li key={caption.id}>{caption.caption}</li>
          ))}
        </ul>
      </div>
    )}
     {/* Map through correct captions */}
    {result.correct && (
      <div>
        Correct captions:
        <ul>
          {[...correctCaptions].map(caption => (
            <li key={caption.id}>{caption.caption}</li>
          ))}
        </ul>
      </div>
    )}
  </Alert>
)}

{attempted && loggedIn && (
      <div className="text-center mt-3">
        {round === (loggedIn ? TOTAL_ROUNDS_LOGGED_IN - 1 : TOTAL_ROUNDS_ANONYMOUS - 1) ? (
          <Button onClick={submitGame}>Submit</Button>
        ) : (
          <Button onClick={nextRound}>Next Round</Button>
        )}
      </div>
    )}

    {attempted && !loggedIn && (
      <div className="text-center mt-3">
        <Button onClick={startGame}>Refresh</Button>
      </div>
    )}
  </Container>
);
}

export default GamePage;
