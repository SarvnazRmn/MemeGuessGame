import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';

const TOTAL_ROUNDS = 3;
const ROUND_TIME = 30; // 30 seconds for each round

function GamePage({ loggedIn }) {
  console.log("GamePage - loggedIn:", loggedIn); // Debug log
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
  const [gameOver, setGameOver] = useState(false);

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
      const memeData = await API.getMemeWithCaptions();
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
    if (round < TOTAL_ROUNDS) {
      fetchRandomMeme();
      setTimer(ROUND_TIME); // Reset timer for new round
    } else {
      setGameOver(true);
    }
  }, [round]);

  useEffect(() => {
    if (timer > 0 && !attempted) {
      const timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timer === 0) {
      nextRound();
    }
  }, [timer, attempted]);

  const handleCaptionClick = (caption) => {
    if (attempted) return; // Prevent further attempts if already attempted
    setSelectedCaption(caption);
    setAttempted(true);
    const isCorrect = correctCaptions.some(correctCaption => correctCaption.id === caption.id);
    
    if (isCorrect) {
      setResult({ correct: true, message: loggedIn ? 'Correct! You earned 5 points.' : 'Correct!' });
    } else {
      setResult({ correct: false, message: loggedIn ? 'Wrong caption!' : 'Incorrect.' });
    }
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

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  if (loading) {
    return <Spinner animation="border" />;
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
      <h3>Round {round + 1} of {TOTAL_ROUNDS}</h3>
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
        </Alert>
      )}
      {attempted && (
        <div className="text-center mt-3">
          <Button onClick={nextRound}>
            {round + 1 === TOTAL_ROUNDS ? 'Finish the Game' : 'Next Round'}
          </Button>
        </div>
      )}
    </Container>
  );
}

export default GamePage;
