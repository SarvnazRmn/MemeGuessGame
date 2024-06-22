import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {check, validationResult} from 'express-validator';
import {getUser} from './user-dao.mjs';
import { getMeme, getRandomCaptions, getBestMatchingCaptions} from './meme-dao.mjs';
import { getUserGameHistory, createGame, submitGame} from './game-dao.mjs';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
// init
const app = express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use(cors(corsOptions));




// Passport: set up local strategy -- NEW
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function (user, cb) { // this user is id+ name
    return cb(null, user);
  });
  
  

 //create a middleware function to check if the user is logged in, we can protect our API by using this middleware function
  const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
  }
  
  app.use(session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.authenticate('session'));




  // POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).send(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          return res.status(201).json(req.user);
        });
    })(req, res, next);
  });




  // GET /api/sessions/current -- NEW
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });
  


  // DELETE /api/session/current -- NEW
  app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
  });



  // GET /api/memes
app.get('/api/memes', async (req, res) => {
  try {
    const meme = await getMeme();
    res.status(200).json({ memeId: meme.id, imageUrl: meme.url });
  } catch (err) {
    res.status(500).json({ error: ' Server error while retrieving meme.' });
  }
});
  


 //GET / api / memes / captions
 app.get('/api/meme/captions', async (req, res) => {
  try {
    const meme = await getMeme();
    const memeId = meme.id;

    // Fetch best-matching captions for the meme ID
    const bestMatchingCaptions = await getBestMatchingCaptions(memeId);
    const bestMatchingIds = bestMatchingCaptions.map(caption => caption.id);

    // Fetch random captions excluding the best-matching ones
    const randomCaptions = await getRandomCaptions(bestMatchingIds, 5);

    // Combine the best-matching captions with the random captions
    const allCaptions = [
      ...bestMatchingCaptions.slice(0, 2), // First two are correct
      ...randomCaptions.map(caption => ({ ...caption, correct: false }))
    ];

    res.status(200).json({ meme, captions: allCaptions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// GET /api/users/:userId/game-history
app.get(`/api/user/:userId/game-history`, async (req, res) => {
  const { userId } = req.params;
  try {
    const games = await getUserGameHistory(userId);
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create a new game for logged-in user
app.post('/api/game', isLoggedIn, async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log('Received create game request for userId:', userId);
    const gameId = await createGame(userId);
    res.json({ gameId });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Error creating game' });
  }
});


// Submit all rounds for a game 
app.post('/api/game/:gameId/submit', isLoggedIn, async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const roundsData = req.body.rounds;

    // Check number of rounds should be 3 
    if (!Array.isArray(roundsData) || roundsData.length !== 3) {
      return res.status(400).json({ error: 'You must submit exactly 3 rounds' });
    }

    const result = await submitGame(gameId, roundsData);
    res.json(result);
  } catch (error) {
    console.error('Error submitting game:', error);
    res.status(500).json({ error: 'Error submitting game' });
  }
});


  app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });