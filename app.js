import express from 'express';
import {body, validationResult} from 'express-validator';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import Lobby from './Lobby.js';
import csv from 'csv-parser';
import fs from 'fs';
import WebSocket from 'ws';
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
const cookieParserKey = "Midnight City";
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

const openLobbies = new Map();

let testLobbyId = randomUUID();
openLobbies.set(testLobbyId, new Lobby("Uhhhh", randomUUID(), "Steven", testLobbyId));

testLobbyId = randomUUID();
openLobbies.set(testLobbyId, new Lobby("oooooo", randomUUID(), "", testLobbyId));

const users = new Map();

app.use(express.static('public'));

function findLobbyByOwnerId(ownerId) {

    let lobbies = openLobbies.entries();
    let currentLobby = {};

    for (let i = 0; i < openLobbies.size; i++) {
        //
        currentLobby = lobbies.next().value[1];
        if (currentLobby.getOwnerUuid() === ownerId) {
            return currentLobby;
        }
    }

    return null;
}

app.get('/', (req, res) => {
    //res.render(__dirname + '/views/chooseUsername');
    res.sendFile(__dirname + '/public/chooseLobby.html');
    // httpOnly means the cookie can't be accessed by client side javascript
    res.cookie("uuid", randomUUID(), { signed: true, httpOnly: true, secure: true, sameSite: true });
    //res.json(uuid.v4());
})

app.get('/api/lobbiesAvailable', (req, res) => {
    const lobbiesData = [];
    
    openLobbies.forEach((lobby) => {
        lobbiesData.push(lobby.getLobbyDisplayData());
    });

    res.json(lobbiesData);
})

app.get('/createLobby', (req, res) => {
    res.sendFile(__dirname + '/public/gamePage.html');
})

app.post('/joinLobby', (req, res) => {
    // Add validation here to check if a lobby has a password and
    // if so check if the password is correct
    // Do I need to add validation for the lobbyId?
    const userId = req.signedCookies.uuid;
    const lobbyId = req.body.lobbyId;
    const lobby = openLobbies.get(lobbyId);

    // Checks to see if the lobby is full
    if (lobby.getNumberOfPlayers() < lobby.getMaxNumberOfPlayers()) {

        // Checks for lobby password
        if (lobby.getPassword() === "") {
            lobby.addPlayer(userId, users.get(userId));
            res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });
            res.sendFile(__dirname + '/public/gamePage.html');
        } else {
            res.redirect('/joinLobby/passwordInput/' + lobbyId);
        }

    } else {
        res.json({ error: "Lobby is full" });
    }
})

app.get('/joinLobby/passwordInput/:lobbyId', (req, res) => {
    //res.render(__dirname + '/views/passwordInput', { lobbyId: req.params.lobbyId });
    res.render(__dirname + '/views/passwordInput');
})

app.post('/joinLobby/passwordInput/:lobbyId', (req, res) => {
    // Add password validation and escape characters
    // Add the same validation for the lobbyId

    const userId = req.signedCookies.uuid;
    const lobbyId = req.params.lobbyId;
    const enteredPassword = req.body.password;
    const lobby = openLobbies.get(lobbyId);

    if (enteredPassword === lobby.getPassword()) {
        lobby.addPlayer(userId, users.get(userId));
        res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });
        res.sendFile(__dirname + '/public/gamePage.html');
    } else {
        res.render(__dirname + '/views/passwordInput', { enteredPassword: enteredPassword, errorMsg: 'The entered password is incorrect' });
    }

})

app.post('/api/lobbyOwnerName', (req, res) => {
    const ownerName = req.body.ownerName;
    const uuid = req.signedCookies.uuid;
    users.set(uuid, ownerName);

    const lobbyId = randomUUID();
    const lobby = new Lobby(ownerName, uuid, "", lobbyId);
    openLobbies.set(lobbyId, lobby);
})

wss.on('connection', (ws, req) => {

    const cookies = cookie.parse(req.headers.cookie ?? '');

    const lobbyId = cookieParser.signedCookie(cookies.lobbyId, cookieParserKey);
    const lobby = openLobbies.get(lobbyId);
    const game = lobby.getGame();
    const uuid = cookieParser.signedCookie(cookies.uuid, cookieParserKey);

    console.log(lobbyId);
    console.log(uuid);
    console.log(lobby.getLobbyDisplayData());
    //console.log(game);

    ws.on('error', console.error);

    ws.on('message', (data) => {
        handleWebSocketMessage.apply(this, [ws, data, lobby, game, uuid]);
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

});

function handleWebSocketMessage(ws, data, lobby, game, uuid) {
    console.log('Received: %s', data);
    data = JSON.parse(data);
    

    if (game.getCardZar() === uuid && data["chosenResponseCardOwner"] && game.getIsCardZarsTurn()) {
        game.chooseRoundWinner(data);
    }

    if (game.getCardZar() !== uuid && data["chosenPlayerCards"] && !game.getIsCardZarsTurn()) {
        game.addToWhiteCardResponses(uuid, data["chosenPlayerCards"]);
    }

    if (lobby.getOwnerUuid() === uuid && data["gameMode"]) {
        lobby.setGameMode(data["gameMode"]);
        lobby.setMaxNumberOfPlayers(data["maxNumOfPlayers"]);
        lobby.setPassword(data["lobbyPassword"]);
    }

    if (lobby.getOwnerUuid() === uuid && data["changeNumberOfPlayers"]) {
        lobby.setMaxNumberOfPlayers(data["changeNumberOfPlayers"]);
    }

    if (lobby.getOwnerUuid() === uuid && data["changeLobbyPassword"]) {
        lobby.setPassword(data["changeLobbyPassword"]);
    }

    if (lobby.getOwnerUuid() === uuid && data["startGame"]) {
        game.startGame();
    }

    if (data["getWhiteCard"]) {
        console.log(JSON.stringify(data));
        ws.send(JSON.stringify({ "newPlayerCard(s)": game.getRandomWhiteCardDeck(data["numberOfCards"]) }));
    }
}


server.listen(port, hostname, () => {
    console.log(`Example app listening at http://${hostname}:${port}`)
})