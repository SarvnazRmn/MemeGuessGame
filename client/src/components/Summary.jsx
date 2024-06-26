import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate  } from 'react-router-dom';

function Summary({ summaryData, totalScore }) {
   const navigate = useNavigate();

    const handleRefresh = () => {
      navigate('/');
      };

      return (
        <Container className="mt-5">
          <h2>Game Summary</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Meme Image</th>
                <th>Selected Caption</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img src={data.memeUrl} alt="Meme" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  </td>
                  <td>{data.captionText}</td>
                  <td>{data.score}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h3>Total Score: {totalScore}</h3>
      <Button onClick={handleRefresh}>Start New Game</Button>
    </Container>
  );
}

export default Summary;
