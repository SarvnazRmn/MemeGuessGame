import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../assets/API.mjs';


const TOTAL_ROUNDS_LOGGED_IN = 3; // Total rounds for logged-in users
const TOTAL_ROUNDS_ANONYMOUS = 1; // Total rounds for anonymous users
const ROUND_TIME = 30; // 30 seconds for each round

function GamePage({ loggedIn, user }) {
  const [round, setRound] = useState(0);
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [correctCaptions, setCorrectCaptions] = useState([]);
  const [attempted, setAttempted] = useState(false); // for letting user to choose only one answer(button)
  const [timer, setTimer] = useState(ROUND_TIME);
  const [gameData, setGameData] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
 

  const shuffleArray = (array) => {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchRandomMeme = async () => {
    setLoading(true);
    try {
      const memeData = await API.getMemeWithCaptions(user.id);
      setCaptions(memeData.captions);
      setMeme(memeData.meme);
      setCorrectCaptions(memeData.captions.slice(0, 2)); // First two are correct
      setError('');

      // Shuffle the captions for display
      const shuffledCaptions = shuffleArray(memeData.captions);
      setCaptions(shuffledCaptions);
    } catch (err) {
      setError(err.message || 'Failed to fetch meme and captions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      // If logged in, play according to TOTAL_ROUNDS_LOGGED_IN
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
        setTimer(ROUND_TIME); // Reset timer for the round
      } else {
        setGameOver(true);
      }
    }
  }, [round, loggedIn]);

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

  const handleCaptionClick = async (caption) => {
    if (attempted) return; // Prevent further attempts if already attempted
    setSelectedCaption(caption);
    setAttempted(true);

    const isCorrect = correctCaptions.some(correctCaption => correctCaption.id === caption.id);
    const matchingCorrectCaptions = correctCaptions.filter(correctCaption => correctCaption.id !== caption.id);
    const score = isCorrect ? 5 : 0;

    setResult({
      correct: isCorrect,
      message: isCorrect ? (loggedIn ? `Correct! You earned 5 points.` : 'Correct!') : (loggedIn ? 'Incorrect.' : 'Incorrect.'),
      correctCaptions: matchingCorrectCaptions,
    });

    if (loggedIn) {
      const roundId = round + 1;
      await API.saveScores(roundId, user.id, score);
    }

    
    const roundData = {
      user_id: user.id,
      round: round + 1,
      meme_id:  meme ? meme.id : null, // Ensure memeId is included here
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

  const nextRound = () => {
    setRound((prevRound) => prevRound + 1);
    setAttempted(false);
    setSelectedCaption(null);
    setResult(null);
    setTimer(ROUND_TIME);
  };

  const startGame = () => {
    setRound(0);
    setGameOver(false);
    setAttempted(false);
    setSelectedCaption(null);
    setResult(null);
    setTimer(ROUND_TIME);
    fetchRandomMeme();
  };

  const submitGame = async () => {
    try {
      await API.saveScores(gameData);
      console.log('Submitting game data:', gameData); 
      alert('Game results submitted successfully!');
      navigate(`/game-summary/`);
    } catch (err) {
      console.error('Failed to submit game results:', err);
      alert('Failed to submit game results.');
    }
  };
  const calculateTotalScore = () => {
    return gameData.reduce((totalScore, roundData) => totalScore + roundData.score, 0);
  };

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (<Spinner animation="border" />);
  }

  if (gameOver) {
    return (
      <Container className="text-center">
        <h3>Game Over! Thanks for playing!</h3>
        <Button onClick={startGame}>Play Again</Button>
      </Container>
    );
  }
  return (
    <Container className="mt-5">
          <h3>Round {round + 1} of {loggedIn ? TOTAL_ROUNDS_LOGGED_IN : TOTAL_ROUNDS_ANONYMOUS}</h3>
          <div>Time Remaining: {timer} seconds</div>
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
                      disabled={attempted} // Disable buttons after first attempt 
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
