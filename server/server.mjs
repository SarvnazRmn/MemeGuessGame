import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {check, validationResult} from 'express-validator';
import {getUser} from './user-dao.mjs';
import { getMeme, getRandomCaptions, getBestMatchingCaptions} from './meme-dao.mjs';
import { getUserGameHistory, saveScores} from './game-dao.mjs';


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
  app.use(express.json());



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
  


  // DELETE /api/session/current 
  app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
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
app.get(`/api/user/:userId/game-history`, isLoggedIn, async (req, res) => {
  const { userId } = req.params;
  try {
    const games = await getUserGameHistory(userId);
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/saveResults', async (req, res) => {
  const gameData = req.body;
  try {
    await saveScores(gameData);
    res.status(200).send({ message: 'Game results saved successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Error saving game results: ' + err.message });
  }
});


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