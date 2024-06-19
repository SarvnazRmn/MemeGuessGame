[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/AVMm0VzU)
# Exam #1: "Exam Title"
## Student: s326344 ROUMIANFAR SARVNAZSADAT 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...


## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)


## API Server

- POST `/api/login`: Authenticates a user and starts a session.
  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "message": "Login successful", "user": { "id": "integer", "username": "string" }}`
  - response status codes:
      - 200: OK - Login successful.
      - 400: Bad Request - Invalid request body or missing parameters.
      - 401: Unauthorized - Incorrect username or password.
- POST `/api/logout` : Logs out the authenticated user and ends the session.
  - Request Body: None
  - Response: `{ "message": "Logout successful" }`
  - Response Status Codes:
      - 200: OK - Logout successful.
- GET `/api/memes`: Retrieves a random meme.
  - request parameters: None
  - Response: `{ "memeId": "integer", "imageUrl": "string" }`
  - response status codes:
      - 200: OK - Meme retrieved successfully.
      - 500: Internal Server Error - Server error while retrieving meme.
-  GET `/api/meme/captions`: Retrieves seven possible captions for a given meme .
  - request Parameters: memeId
  - Response: `{ captions: [{ id: integer, text: string }, { id: integer, text: string },...] }`
      - 200: OK - Captions retrieved successfully.
      - 500: Internal Server Error - Server error while retrieving captions.

- POST `/api/games`:  Starts a new game for the authenticated user.
  - Request Body: None
  - Response: `{ "gameId": "integer", "rounds": [] }`
  - response status codes:
      - 200: OK - New game started successfully.
      - 500: Internal Server Error - Server error while starting a new game.
- POST `/api/games/rounds`:  Starts a new round in an existing game.
  - Path Parameters: `gameId (game ID), roundId (round ID)`
  - Request Body: `{ "caption": "string" }`
  - Response: `{ "correct": "boolean", "score": "integer", "bestCaptions": ["string", "string"] }`
  - response status codes:
      - 200: OK - New round started successfully.
      - 400: Bad Request - Invalid request body or parameters.
      - 404: Not Found - Game or round not found.
      - 500: Internal Server Error - Server error while starting a new round.

- POST `/api/game/round/guess`:  Submits a guess for a round.
  - Path Parameters: `gameId, roundId `
  - Request Body: `{ captionId: integer }`
  - Response: `{ correct: boolean, score: integer, bestCaptions: [{ id: integer, text: string }] }`
  - response status codes:
      - 200: OK - The guess was successfully processed.
      - 400: Bad Request - Invalid request body or parameters.
      - 404: Not Found - Game or round not found.
      - 500: Internal Server Error - Server error while starting a new round.

- GET `/api/users/profile`: Retrieves the profile and game history of a user.
  - Path Parameters: `userId (user ID)`
  - Response: `{ "user": { "id": "integer", "username": "string" }, "games": [{ "gameId": "integer", "rounds": [{ "meme": "string", "score": "integer" }] }] }`
  - response status code:
      - 200: OK - Profile and game history retrieved successfully.
      - 404: Not Found - User not found.
      - 500: Internal Server Error - Server error while retrieving profile.


- PUT `/api/something`: purpose
  - request parameters and request body content
  - response body content
  - response status codes and possible errors
- ...

## Database Tables

- Table `users` - Stores user details including a unique username and a hashed password.
- Table `memes` - Contains the meme images. Each meme is represented by its URL.
- Table `captions` - Stores the text for captions that can be associated with memes.
- Table `meme_caption` - Logs each guess made by a player during a round.
- Table `games` - Keeps track of individual game sessions played by users.
- Table `rounds` - Details each round within a game, including the meme displayed, the caption selected by the player, whether the guess was correct, and the score for that round.
- Table `guesses` - Logs each guess made by a player during a round.
## Screenshots

![Screenshot1](./img/screenshot.jpg)

![Screenshot2](./img/screenshot.jpg)


## Users Credentials

- username, password (plus any other requested info)

usename: sarvenaz
password: sarvenaz
hashed pass: c71416e7a96152cb505da1298807f1fffde71bc1353a51245f242f6761751d52
salt: 1a2b3c4d5e6f7g8h

- username, password (plus any other requested info)

username: newUser
password: newUser
hashed password: 2c2e55af556279a53708039aecc297464b272beedd3cd9973337b5df786ce1fa
salt: 9i0j1k2l3m4n5o6p