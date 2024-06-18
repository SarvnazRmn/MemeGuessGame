import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import API from '../assets/API.mjs';

function GamePage() {
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRandomMeme = async () => {
      setLoading(true);
      try {
        const memeData = await API.getMeme();
        setMeme(memeData);
        setError('');
    } catch (error) {
      console.error('Error fetching meme:', error); // Log the error for debugging
      setError('Failed to fetch meme. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

    fetchRandomMeme();
  }, []);

  const handleFetchAnotherMeme = async () => {
    setLoading(true);
    try {
      const memeData = await API.getMeme();
      setMeme(memeData);
      setError('');
    } catch (error) {
      console.error('Error fetching meme:', error); // Log the error for debugging
      setError('Failed to fetch meme. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-start align-items-center pt-3">
      <h2>The Game Begins!</h2>
      <p>Guess the meme...</p>
      {loading && <Spinner animation="border" role="status" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {meme && (
        <div>
          <img
            src={meme.imageUrl}
            alt="Meme"
            style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }}
          />
        </div>
      )}
      <button className="btn btn-primary" onClick={handleFetchAnotherMeme}>
        Fetch Another Meme
      </button>
    </Container>
  );
}

export default GamePage;