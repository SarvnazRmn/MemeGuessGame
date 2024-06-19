import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';

function GamePage() {
  const [meme, setMeme] = useState(null);
  const [error, setError] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchRandomMeme = async () => {
      setLoading(true);
      try {
        const memeData = await API.getMemeWithCaptions();
        setMeme(memeData.meme);
        setCaptions(memeData.captions);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch meme and captions');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomMeme();
  }, []);

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  
  return (
    <Container className="mt-5">
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
              {captions.map(caption => (
                <Button key={caption.id} variant="outline-primary" className="my-2">
                  {caption.caption}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default GamePage;