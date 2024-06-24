import React from 'react';
import { Container, Table ,Button} from 'react-bootstrap';

function Summary({ gameHistory, correctlyMatchedCaptions }) {

    const calculateTotalScore = () => {
        return gameHistory.reduce((total, game) => {
          return total + game.rounds.reduce((roundTotal, round) => roundTotal + round.score, 0);
        }, 0);
      };
    
    const totalScore = calculateTotalScore();

    const handleRefresh = () => {
        window.location.reload();
      };



      return (
        <Container>
          {gameHistory && gameHistory.length > 0 && (
            <div>
              <h2>Game History:</h2>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Meme</th>
                    <th>Score</th>
                    <th>Selected Correct Caption</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((game, index) => (
                    game.rounds.map((round, roundIndex) => (
                      <tr key={`${index}-${roundIndex}`}>
                        <td>{roundIndex + 1}</td>
                        <td>
                          <img
                            src={round.meme_url}
                            alt={`Meme ${index + 1}`}
                            style={{ maxWidth: '100px', maxHeight: '100px' }} // Adjust dimensions as needed
                          />
                        </td>
                        <td>{round.score}</td>
                        <td>{round.score === 5 ? round.selected_caption : ''}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </Table>
              <p>Total Score: {totalScore}</p>
              <Button onClick={handleRefresh}>Start New Game</Button>
            </div>
          )}
        </Container>
      );
    }
    
    export default Summary;
