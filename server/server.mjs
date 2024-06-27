import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {check, validationResult , body, query} from 'express-validator';
import {getUser} from './user-dao.mjs';
import { getMeme, getRandomCaptions, getBestMatchingCaptions} from './meme-dao.mjs';
import { getUserGameHistory, saveScores} from './game-dao.mjs';
import bodyParser from 'body-parser';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init
const app = express();
const port = 3001;


// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());


// CORS setup to allow requests from our client
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use(cors(corsOptions));



//Passport setup for handling user login
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

//store into session the user information
passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  
//get the user unformation from the session
  passport.deserializeUser(function (user, cb) { 
    return cb(null, user);
  });
  
  
/////////////////////////////////////////////////////////////////
 
//this middleware function checks if the user is logged in
  const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
  }
 
  
  //keeping track of user sessions
  app.use(session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
  }));

  //store authentication information in the session
  app.use(passport.authenticate('session'));




/////////////////////////////////////////////////////////////////
  
// POST /api/sessions
  // Login endpoint
app.post('/api/sessions', [
  //validating username and password
  check('username', 'Username is needed').notEmpty(),
  check('password', 'Password is needed').notEmpty(),
  ], (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //after authentication is successfull, this function will be called
  passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          return res.status(401).send(info); // wrong login
        }
        req.login(user, (err) => {
          if (err)
            return next(err);

          // req.user contains the authenticated user, we send all the user info back
            return res.status(201).json(req.user);
        });
    })(req, res, next);
  });


/////////////////////////////////////////////////////////////////
  
// GET /api/sessions/current
  // Endpoint to get the current session user
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });
  

/////////////////////////////////////////////////////////////////
  
// DELETE /api/session/current 
  // Logout endpoint
  app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
  });


/////////////////////////////////////////////////////////////////
 
//GET / api / memes / captions
 // Endpoint to get a meme with captions
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


/////////////////////////////////////////////////////////////////
// POST /api/saveResults
// Endpoint to save game results
app.post(
  '/api/saveResults',
  [
    // Validation 
    body().isArray().withMessage('Game data should be an array'),
    body('*.user_id').isInt().withMessage('User ID should be an integer'),
    body('*.round').isInt().withMessage('Round should be an integer'),
    body('*.meme_id').isInt().withMessage('Meme ID should be an integer'),
    body('*.selected_caption_id').isInt().withMessage('Selected Caption ID should be an integer'),
    body('*.score').isInt({ min: 0, max:5 }).withMessage('Score should be a non-negative integer between 0 and 5')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const gameData = req.body;
    try {
      await saveScores(gameData);
      res.status(200).send({ message: 'Game results saved successfully' });
    } catch (err) {
      res.status(500).send({ error: 'Error saving game results: ' + err.message });
    }
  }
);

/////////////////////////////////////////////////////////////////
// POST /api/userGameHistory/:userId
// Endpoint to get user game history
app.get('/api/userGameHistory/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const gameHistory = await getUserGameHistory(userId);
    res.status(200).json(gameHistory);
  } catch (error) {
    console.error('Error fetching user game history:', error);
    res.status(500).json({ error: 'Failed to fetch user game history' });
  }
});




export const startServer = () => {
  app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });

}