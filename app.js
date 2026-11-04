import express from 'express';
import {body, validationResult} from 'express-validator';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import Lobby from './Lobby.js';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This is here to allow the server to be tested because the secure cookie option requires HTTPS
// and localhost is not HTTPS
const isProduction = process.env.NODE_ENV === 'production';

// This is so the server can understand multipart/form-data
// which is for more complex form data like files and
// when using the formData object in javascript to send
// data to the server using a fetch request
//const multer = require("multer");
import multer from 'multer';
const upload = multer();

const app = express();

app.use(express.static('public'));

// Limits the size of the request body to 10kb
app.use(express.json( { limit: '10kb' } ));

app.use(express.urlencoded({ extended: true }));
// const cookieParserKey = "";
const cookieParserKey = "" + fs.readFileSync('./cookieParserKey.txt');
app.use(cookieParser(cookieParserKey));

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");

// socket.io setup
//const http = require('http');
import http from 'http';
import req from "express/lib/request.js";

//const hostname = 'localhost';
const hostname = '0.0.0.0';

const server = http.createServer(app);
// The server inside the curly brackets allows the websocket
// to listen on the same port as express
const wss = new WebSocketServer({ server });

const port = 3000;

const allLobbies = new Map();

let testLobbyId = randomUUID();
let testLobby = new Lobby(randomUUID(), "Steven", testLobbyId);
allLobbies.set(testLobbyId, testLobby);
testLobby.setOwnerNameAndInitialisePlayersMap("Uhhhh");
testLobby.setLobbyOpen(true);

testLobbyId = randomUUID();
testLobby = new Lobby(randomUUID(), "", testLobbyId);
allLobbies.set(testLobbyId, testLobby);
testLobby.setOwnerNameAndInitialisePlayersMap("oooooo");
testLobby.setLobbyOpen(true);

app.use(express.static('public'));

function findLobbyByOwnerId(ownerId) {

    let lobbies = allLobbies.entries();
    let currentLobby = {};

    for (let i = 0; i < allLobbies.size; i++) {
        //
        currentLobby = lobbies.next().value[1];
        if (currentLobby.getOwnerUuid() === ownerId) {
            return currentLobby;
        }
    }

    return null;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/chooseLobby.html');
})

// Lobbies are only available to join if they are open and the lobby owner has set their username
app.get('/api/lobbiesAvailable', (req, res) => {
    const lobbiesData = [];
    
    allLobbies.forEach((lobby) => {
        if (lobby.isOpen()) {
            lobbiesData.push(lobby.getLobbyDisplayData());
        }
    });

    res.json(lobbiesData);
})

// Can't join the lobby until the user has set their username
app.get('/createLobby', (req, res) => {
    console.log("Made it to createLobby");
    const uuid = randomUUID();
    const lobbyId = randomUUID();

    const lobby = new Lobby(uuid, "", lobbyId);
    allLobbies.set(lobbyId, lobby);

    res.cookie("uuid", uuid, { signed: true, httpOnly: true, secure: isProduction, sameSite: true });
    res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: isProduction, sameSite: true });

    // Gets added to openLobbies when the lobby owner sets their username
    //openLobbies.set(lobbyId, lobby);

    res.sendFile(__dirname + '/public/gamePage.html');
})

app.post('/joinLobby', (req, res) => {
    console.log("Made it to joinLobby");
    
    const lobbyId = req.body.lobbyId;

    // Check for valid lobbyId here, if not valid send back an error message
    if (typeof lobbyId !== 'string' || (!/^[0-9a-f-]{36}$/i.test(lobbyId)) || lobbyId.length !== 36) {
        //res.json({ error: "Invalid lobby ID" });
        //return;
        // Http status code 400 means server can't process the request
        // because it considers the request invalid
        return res.status(400).json({ error: "Invalid lobby ID" });
    }

    // Check if the lobby exists
    const lobby = allLobbies.get(lobbyId);

    if (!lobby) {
        // Http status code 404 means the requested resource doesn't exist
        return res.status(404).json({ error: "Lobby not found" });
    }

    // Could add a check in this if statement to check if the lobby has started
    // but I might just filter it out of the open lobbies pool instead
    // Checks to see if the lobby is full
    if ((lobby.getNumberOfPlayers() >= lobby.getMaxNumberOfPlayers())) {
        // Http status code 409 means server understood the request but can't complete it
        // because it conflicts with the current state of a resource
        return res.status(409).json({ error: "Lobby is full" });
    } else {
        res.cookie("uuid", randomUUID(), { signed: true, httpOnly: true, secure: isProduction, sameSite: true });
        res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: isProduction, sameSite: true });
        return res.sendFile(__dirname + '/public/gamePage.html');
        //.json( { message: "Joined lobby" } )
    }
})

wss.on('connection', (ws, req) => {
    console.log(cookie.parse(req.headers.cookie ?? ''));

    const cookies = cookie.parse(req.headers.cookie ?? '');

    const lobbyId = cookieParser.signedCookie(cookies.lobbyId, cookieParserKey);
    const uuid = cookieParser.signedCookie(cookies.uuid, cookieParserKey);

    const lobby = allLobbies.get(lobbyId);
    //console.log(lobby.getLobbyDisplayData());

    console.log("Lobby ID: " + lobbyId);
    console.log("Lobby: " + lobby);
    console.log("UUID: " + uuid);

    if (!lobby) {
        ws.send(JSON.stringify({ "error": "Lobby not found" }));
        ws.close();
        return;
    }

    if (!(lobby.requiresPassword())) {
        authenticatePlayer(ws, lobby, uuid);
    } else {
        requestAuthentication(ws, lobby, uuid);
    }

});

// Checks if the player is the lobby owner and if so adds the lobby options otherwise
// it just adds the player to the lobby and starts the game connection
function authenticatePlayer(ws, lobby, uuid) {

    if (lobby.getOwnerUuid() === uuid) {
        startLobbyOwnerConnection(ws, lobby, uuid);
    } else {
        //lobby.addPlayer(uuid, users.get(uuid));
        startPlayerNameConnection(ws, lobby, uuid);
    }

}

function inputValidation(data) {

}

function inputSanitization(data) {

}

function inputEscaping(data) {

}

function requestAuthentication(ws, lobby, uuid) {

    ws.send(JSON.stringify({ "requestAuthentication": true }));

    let numberOfAuthenticationAttempts = 0;

    function handleAuthenticationMessage(data) {
        data = JSON.parse(data);

        // Add whatever validation is necessary I don't know yet
        // Maybe some input sanitization and length checks, but for now just check if it exists
        if (lobby.getPassword() === data["password"]) {
            ws.send(JSON.stringify({ "authenticationSuccess": true }));
            ws.off('message', handleAuthenticationMessage);
            authenticatePlayer(ws, lobby, uuid);
        } else {
            ws.send(JSON.stringify({ "authenticationFailed": true }));
            numberOfAuthenticationAttempts++;

            if (numberOfAuthenticationAttempts >= 5) {
                ws.send(JSON.stringify({ "authenticationCompleteFailure": true, "error": "Too many attempts" }));
                ws.close();
            }
        }
    }

    ws.on('message', handleAuthenticationMessage);

}

// Makes the owner set their username and the makes the lobby visible to other players
function startLobbyOwnerConnection(ws, lobby, uuid) {

    ws.send(JSON.stringify({ "setUsername": true }));

    // Checks the username is valid before allowing it to be set
    function handleOwnerUsernameMessage(data) {
        data = JSON.parse(data);

        // Add whatever validation is necessary I don't know yet
        // Maybe some input sanitization and length checks, but for now just check if it exists
        if (data["username"]) {
            //console.log("Lobby owner set their username to: " + data["username"]);
            // Turns off the message listener so it doesn't call handleOwnerUsernameMessage
            ws.off('message', handleOwnerUsernameMessage);
            lobby.setOwnerNameAndInitialisePlayersMap(data["username"]);
            // Without this the lobby won't be visible to other players
            lobby.setLobbyOpen(true);
            startGameConnection(ws, lobby, uuid);
        } else {
            ws.send(JSON.stringify({ "invalidUsername": true, "error": "Invalid username" }));
        }
    }

    ws.on('message', handleOwnerUsernameMessage);

}

// Makes the player set their username and then starts the game connection
function startPlayerNameConnection(ws, lobby, uuid) {

    ws.send(JSON.stringify({ "setUsername": true }));

    // Checks the username is valid before allowing it to be set
    function handlePlayerUsernameMessage(data) {
        data = JSON.parse(data);

        // Add whatever validation is necessary I don't know yet
        // Maybe some input sanitization and length checks, but for now just check if it exists
        if (data["username"]) {
            ws.off('message', handlePlayerUsernameMessage);
            lobby.addPlayer(uuid, data["username"]);
            startGameConnection(ws, lobby, uuid);
        } else {
            ws.send(JSON.stringify({ "invalidUsername": true, "error": "Invalid username" }));
        }
    }

    ws.on('message', handlePlayerUsernameMessage);

}

function startGameConnection(ws, lobby, uuid) {

    const game = lobby.getGame();

    console.log(" ");
    //console.log("Lobby ID: " + lobby.getLobbyId());
    console.log("UUID: " + uuid);
    console.log("Lobby Display Data: " + JSON.stringify(lobby.getLobbyDisplayData()));
    //console.log(game);

    ws.on('error', console.error);

    ws.on('message', (data) => {
        handlePlayerMessage.apply(this, [ws, data, lobby, game, uuid]);
    });

    
    ws.send(JSON.stringify({ "firstContact": true, "isLobbyOwner": (lobby.getOwnerUuid() === uuid), "playersNames": lobby.getPlayersNames() }));
    
    game.on('gameStarted', () => {
        ws.send(JSON.stringify({'gameStarted': true, 'deck': game.getRandomWhiteCardDeck(10)}));
        console.log("Game started");
    });

    game.on('newRound', (data) => {
        console.log(data);
        console.log("Card Zar: " + data["cardZar"]);
        ws.send(JSON.stringify({    "newRound": true, "endOfTurnTimer": data["endOfTurnTimer"], 
                                    "cardZar": data["cardZar"], "blackCard": data["blackCard"],
                                    "numberOfResponseCardsAllowed": data["numberOfResponseCardsAllowed"],
                                    "isCardZar": (data["cardZar"] === uuid), "cardZarIndex": lobby.getPlayerIndexByUuid(data["cardZar"]),
                                    "whiteCardDeck": game.getRandomWhiteCardDeck(10) }));
    });

    game.on('cardZarsTurn', (data) => {

        ws.send(JSON.stringify({    "cardZarsTurn": true, "isCardZar": (data["cardZar"] === uuid), 
                                    "endOfTurnTimer": data["endOfTurnTimer"], 
                                    "whiteCardResponses": data["whiteCardResponses"] }));
    });

    game.on('responseCardReceived', (data) => {
        ws.send(JSON.stringify({ "responseCardReceived": true, "numberOfResponseCards": data["numberOfResponseCards"] }));
    });

    game.on('endTurnTimerEarly', () => {
        ws.send(JSON.stringify({ "endTurnTimerEarly": true }));
    });

    game.on('roundWinner', (data) => {
        const winnerUuid = data["winningResponse"]["chosenResponseCardOwner"];
        ws.send(JSON.stringify({ "roundWinner": true, "winningResponse": data["winningResponse"], "winnerIndex": lobby.getPlayerIndexByUuid(winnerUuid), "winnersName": lobby.getPlayerName(winnerUuid), "winnersScore": data["winnersScore"], "isCardZar": (data["cardZar"] === uuid) }));
    });

    game.on('gameWinner', (data) => {
        console.log(lobby.getPlayersNames());
        console.log("Game winner event: " + lobby.getPlayerName(data["winner"]) + ", " + JSON.stringify(data["winner"]));
        ws.send(JSON.stringify({    "gameWinner": true, "winner": lobby.getPlayerName(data["winner"]), "isCardZar": (data["cardZar"] === uuid), 
                                    "isLobbyOwner": (lobby.getOwnerUuid() === uuid) }));
    });

    lobby.on('playerJoined', (data) => {
        ws.send(JSON.stringify({ "playerJoined": true, "playerName": data["playerName"] }));
    });

    lobby.on('playerLeft', (data) => {
        ws.send(JSON.stringify({ "playerLeft": true, "playerName": data["playerName"] }));
    });

    // Ping here?

}

function handlePlayerMessage(ws, data, lobby, game, uuid) {
    console.log('Received: %s', data);
    data = JSON.parse(data);
    

    // Handles when the Card Zar chooses a winner for the round
    if (game.getCardZar() === uuid && data["chosenResponseCardOwner"] && game.getIsCardZarsTurn()) {
        game.chooseRoundWinner(data);
    }

    // Add whatever validation is necessary I don't know yet
    // Maybe some input sanitization and length checks, but for now just check if it exists
    // Handles when a player chooses their response card(s) for the round
    if (game.getCardZar() !== uuid && data["chosenPlayerCards"] && !game.getIsCardZarsTurn()) {
        game.addToWhiteCardResponses(uuid, data["chosenPlayerCards"]);
    }

    // Handles when a player requests new white card(s) from the server
    if (data["getWhiteCard"]) {
        console.log(JSON.stringify(data));
        ws.send(JSON.stringify({ "newPlayerCard(s)": game.getRandomWhiteCardDeck(data["numberOfCards"]) }));
    }

    // Handles when the lobby owner changes the game settings
    if (lobby.getOwnerUuid() === uuid && data["gameMode"]) {
        lobby.setGameMode(data["gameMode"]);
        lobby.setMaxNumberOfPlayers(data["maxNumOfPlayers"]);
        // Add input validation and sanitisation here for the lobby password
        lobby.setPassword(data["lobbyPassword"]);
    }

    // Handles when the lobby owner changes the number of players allowed in the lobby
    if (lobby.getOwnerUuid() === uuid && data["changeNumberOfPlayers"]) {
        lobby.setMaxNumberOfPlayers(data["changeNumberOfPlayers"]);
    }

    // Handles when the lobby owner changes the lobby password
    // Validate the password here, maybe check if it's empty or too long or something
    if (lobby.getOwnerUuid() === uuid && data["changeLobbyPassword"]) {
        console.log("Lobby password change requested: " + data["password"]);
        if (data["password"] === "") {
            lobby.setPassword("");
            lobby.setHasPassword(false);
            console.log("Lobby password removed");
        } else {
            lobby.setPassword(data["password"]);
            lobby.setHasPassword(true);
            console.log("Lobby password changed to: " + data["password"]);
        }
    }

    // Handles when the lobby owner starts the game
    if (lobby.getOwnerUuid() === uuid && data["startGame"]) {
        game.startGame();
    }
}

server.listen(port, hostname, () => {
    console.log(`Example app listening at http://${hostname}:${port}`)
})