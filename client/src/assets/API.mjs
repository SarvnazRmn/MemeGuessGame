
const SERVER_URL = 'http://localhost:3001';

const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

/////////////////////////////////////////////////


  const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };

////////////////////////////////////////////////

  const logOut = async() => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
  }


/////////////////////////////////////////////////

  const getMemeWithCaptions = async () => {
    try {
      const response = await fetch(SERVER_URL + `/api/meme/captions`);
      if (!response.ok) {
        throw new Error('Failed to fetch meme with captions from server');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch meme with captions:', error);
      throw error;
    }
  };

  //////////////////////////////////////////

  const getUserGameHistory = async (userId) => {
    try {
      const response = await fetch(SERVER_URL +  `/api/userGameHistory/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch game history from server');
      }
  
      const result = await response.json();
      console.log('Fetched user game history:', result);
      return result;
    } catch (error) {
      console.error('Error fetching user game history:', error);
    }
  };



////////////////////////////////////////////////

const saveScores = async (gameData) => {
  try {
    console.log('Sending gameData:', gameData);
    const response = await fetch(`${SERVER_URL}/api/saveResults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      throw new Error('Failed to save game results');
    }
    
    const result = await response.json();
    console.log('Save result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    
  }
};



  const API = { logIn, getUserInfo, getMemeWithCaptions, getUserGameHistory,saveScores, logOut};
  
export default API;