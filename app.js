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

// This is so the server can understand multipart/form-data
// which is for more complex form data like files and
// when using the formData object in javascript to send
// data to the server using a fetch request
//const multer = require("multer");
import multer from 'multer';
const upload = multer();

const app = express();

app.use(express.static('public'));
app.use(express.json());
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

const hostname = 'localhost';

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

const users = new Map();

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
    const uuid = randomUUID();
    const lobbyId = randomUUID();

    res.cookie("uuid", uuid, { signed: true, httpOnly: true, secure: true, sameSite: true });
    res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });

    const lobby = new Lobby(uuid, "", lobbyId);
    allLobbies.set(lobbyId, lobby);
    // Gets added to openLobbies when the lobby owner sets their username
    //openLobbies.set(lobbyId, lobby);

    res.sendFile(__dirname + '/public/gamePage.html');
})

app.post('/joinLobby', (req, res) => {
    
    const lobbyId = req.body.lobbyId;
    const lobby = allLobbies.get(lobbyId);

    // Checks to see if the lobby is full
    if (lobby.getNumberOfPlayers() < lobby.getMaxNumberOfPlayers()) {

        res.cookie("uuid", randomUUID(), { signed: true, httpOnly: true, secure: true, sameSite: true });
        res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });
        res.sendFile(__dirname + '/public/gamePage.html');

    } else {
        res.json({ error: "Lobby is full" });
    }
})

app.post('/api/lobbyOwnerName', (req, res) => {
    const ownerName = req.body.ownerName;
    const uuid = req.signedCookies.uuid;
    users.set(uuid, ownerName);

    const lobbyId = randomUUID();
    const lobby = new Lobby(ownerName, uuid, "", lobbyId);
    allLobbies.set(lobbyId, lobby);
})

wss.on('connection', (ws, req) => {

    const cookies = cookie.parse(req.headers.cookie ?? '');

    const lobbyId = cookieParser.signedCookie(cookies.lobbyId, cookieParserKey);
    const uuid = cookieParser.signedCookie(cookies.uuid, cookieParserKey);

    const lobby = allLobbies.get(lobbyId);
    //console.log(lobby.getLobbyDisplayData());

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
                ws.send(JSON.stringify({ "authenticationFailed": true, "error": "Too many attempts" }));
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
        console.log(users);
        console.log("Game winner event: " + users.get(data["winner"]) + ", " + JSON.stringify(data["winner"]));
        ws.send(JSON.stringify({    "gameWinner": true, "winner": users.get(data["winner"]), "isCardZar": (data["cardZar"] === uuid), 
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
        lobby.setPassword(data["lobbyPassword"]);
    }

    // Handles when the lobby owner changes the number of players allowed in the lobby
    if (lobby.getOwnerUuid() === uuid && data["changeNumberOfPlayers"]) {
        lobby.setMaxNumberOfPlayers(data["changeNumberOfPlayers"]);
    }

    // Handles when the lobby owner changes the lobby password
    // Validate the password here, maybe check if it's empty or too long or something
    if (lobby.getOwnerUuid() === uuid && data["changeLobbyPassword"]) {
        if (data["changeLobbyPassword"] === "") {
            lobby.setPassword("");
            lobby.setHasPassword(false);
        } else {
            lobby.setPassword(data["changeLobbyPassword"]);
            lobby.setHasPassword(true);
            console.log("Lobby password changed to: " + data["changeLobbyPassword"]);
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