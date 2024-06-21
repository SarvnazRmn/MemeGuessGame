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

////////////////////////////////////////////////

  const getMeme = async() => {
    const response = await fetch(SERVER_URL + '/api/memes', {
      credentials: 'include',
    });
    const meme = await response.json();
    if (response.ok) {
      return meme;
    } else {
      throw meme;  // an object with the error coming from the server
    }
  };
  
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
      const response = await fetch(SERVER_URL +  `/api/user/${userId}/game-history`, {
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch game history from server');
      }
  
      return await response.json(); 
    } catch (error) {
      console.error('Failed to fetch game history:', error);
      throw error;
    }
  };



  const API = { logIn, getUserInfo, getMeme, getMemeWithCaptions, getUserGameHistory, logOut};
  
export default API;