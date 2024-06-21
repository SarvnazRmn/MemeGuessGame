import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';


const ProfilePage = ({ loggedIn, user }) => {

  const [gameHistory, setGameHistory] = useState(null);
  const [totalScore, setTotalScore] = useState(0);


  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const historyData = await API.getUserGameHistory(user.id); // Fetch game history
        setGameHistory(historyData);

        const total = historyData.reduce((sum, game) => {
          const gameTotalScore = game.rounds.reduce((gameSum, round) => gameSum + round.score, 0);
          return sum + gameTotalScore;
        }, 0);
        setTotalScore(total);
      } catch (error) {
        console.error('Error fetching game history:', error);
      }
    };

    if (loggedIn && user) {
      fetchGameHistory();
    }
  }, [loggedIn, user]);



  return (
    <div>
      <h2>User Profile</h2>
      {loggedIn ? (
        user ? (
          <>
            <p>Welcome, {user.username}!</p>
            <h3>Total Score Across All Games: {totalScore}</h3>
            {gameHistory ? (
              <>
                <h3>Game History</h3>
                {gameHistory.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <Card.Title>Game ID: {game.game_id}</Card.Title>
                        <Card.Text>Total Score for Game: {game.totalScore}</Card.Text>
                        {game.rounds.map((round, roundIndex) => (
                          <div key={roundIndex} className="mb-3">
                            <Row>
                              <Col md={4}>
                                <Card.Img variant="top" src={round.meme_url} alt={`Meme ${roundIndex + 1}`} />
                              </Col>
                              <Col md={8}>
                                <Card.Text>Round Score: {round.score}</Card.Text>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <p>No game history found.</p>
                )}
              </>
            ) : (
              <p>Loading game history...</p>
            )}
          </>
        ) : (
          <p>Loading user information...</p>
        )
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default ProfilePage;