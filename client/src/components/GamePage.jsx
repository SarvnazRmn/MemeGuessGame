import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';

function GamePage({ loggedIn }) {
  console.log("GamePage - loggedIn:", loggedIn); // Debug log
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [correctCaptions, setCorrectCaptions] = useState([]);


  useEffect(() => {
    const fetchRandomMeme = async () => {
      setLoading(true);
      try {
        const memeData = await API.getMemeWithCaptions();
        //client memorize the 2 first answer are correct.
        setCaptions(memeData.captions);
        setMeme(memeData.meme);
        setCorrectCaptions(memeData.captions.slice(0, 2)); // First two are correct
        setError('');

        // Shuffle the captions for display
        const shuffledCaptions = [...memeData.captions];
        for (let i = shuffledCaptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCaptions[i], shuffledCaptions[j]] = [shuffledCaptions[j], shuffledCaptions[i]];
        }
        setCaptions(shuffledCaptions);

      } catch (err) {
        setError(err.message || 'Failed to fetch meme and captions');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomMeme();
  }, []);

//check if the answer is correct.
  const handleCaptionClick = (caption) => {
    setSelectedCaption(caption);
    const isCorrect = correctCaptions.some(correctCaption => correctCaption.id === caption.id);
    
    if (isCorrect) {
      setResult({ correct: true, message: loggedIn ? 'Correct! You earned 5 points.' : 'Correct!' });
    } else {
      setResult({ correct: false, message: 'Incorrect.' });
    }
  };


  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  
  return (
    <Container className="mt-5">
      {loading && <Spinner animation="border" />}
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
              {captions.map((caption, index) => (
                <Button key={caption.id} variant="outline-primary" className="my-2" onClick={() => handleCaptionClick(caption)}>
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
    </Container>
  );
}

export default GamePage;