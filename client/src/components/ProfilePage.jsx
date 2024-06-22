import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
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
    <Container className="mt-5">
      {loggedIn ? (
        user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
              <PersonCircle size={50} style={{ marginRight: '1rem' }} />
              <div>
                <h2>{user.username}</h2>
                <p>Here you can view your game history and track your total scores.</p>
              </div>
            </div>
  
            {gameHistory ? (
              <>
                <div style={{ marginTop: '2rem' }}>
                  <h3>Game History</h3>
                  {gameHistory.length > 0 ? (
                    gameHistory.map((game, index) => {
                      const gameScore = game.rounds.reduce((sum, round) => sum + round.score, 0);
                      return (
                        <Card key={index} className="mb-3">
                          <Card.Body>
                            <Card.Title>Game ID: {game.game_id}</Card.Title>
                            <hr />
                            {game.rounds.map((round, roundIndex) => (
                              <div key={roundIndex} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                                <Row>
                                  <Col md={4}>
                                    <Card.Img 
                                      variant="top" 
                                      src={round.meme_url} 
                                      alt={`Meme ${roundIndex + 1}`} 
                                      style={{ width: '100px', height: '100px' }} 
                                    />
                                  </Col>
                                  <Col md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Card.Text>Round Score: {round.score}</Card.Text>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                            <Row>
                              <Col md={{ span: 8, offset: 4 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Card.Text style={{ fontWeight: 'bold' }}>Game Score: {gameScore}</Card.Text>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    })
                  ) : (
                    <p>No game history found.</p>
                  )}
                </div>
              </>
            ) : (
              <p>Loading game history...</p>
            )}
  
            <div style={{ marginTop: '2rem' }}>
              <hr style={{ borderTop: '1px solid #ddd' }} />
              <h4 style={{ marginTop: '1rem' }}>Total Score Across All Games: <span style={{ fontWeight: 'bold', color: 'blue' }}>{totalScore}</span></h4>
            </div>
          </>
        ) : (
          <p>Loading user information...</p>
        )
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </Container>
  );
  
};

export default ProfilePage;