import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

const GameSummaryPage = ({ loggedIn, user }) => {
  const { totalScore } = useParams(); // Get totalScore from URL params

  if (!loggedIn) {
    // Redirect or show error if user is not logged in
    return <Navigate to="/login" />;
  }

  return (
    <Container className="mt-5">
      <h2>Game Summary</h2>
      <hr />

      <div className="mb-4">
        <h3>Total Score: {totalScore}</h3>
      </div>

      {/* Game history display */}
      {/* Assuming you have gameHistory, correctlyMatchedCaptions as props */}
      {/* Replace with your actual implementation */}
      <div>
        <h4>Game History</h4>
        {/* Render game history here */}
      </div>

      <div>
        <h4>Correctly Matched Memes and Captions</h4>
        {/* Render correctly matched memes and captions here */}
      </div>

      <div className="mt-4">
        <Link to="/game">
          <Button variant="primary">Start new game</Button>
        </Link>
      </div>
    </Container>
  );
};

export default GameSummaryPage;
