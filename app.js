//const express = require('express');
//const {body, validationResult} = require('express-validator');
//const uuid = require('uuid');
//const cookieParser = require('cookie-parser');
//import { v4 as uuidv4 } from 'uuid';
//const { randomUUID } = require('crypto');
//const Lobby = require('./Lobby');
//const csv = require('csv-parser');
//const fs = require('fs');
//const ws = require('ws');
import express from 'express';
import { body, validationResult } from 'express-validator';
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

const baseBlackCardsFilePath = 'baseBlackCards.txt';
const baseWhiteCardsFilePath = 'baseWhiteCards.txt';

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
app.use(cookieParser("Midnight City"));

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");

// socket.io setup
//const http = require('http');
import http from 'http';

const hostname = 'localhost';

const server = http.createServer(app);
// The server inside the curly brackets allows the websocket
// to listen on the same port as express
const wss = new WebSocketServer({ server });

//const { Server } = require('socket.io')
//const io = new Server(server)

const port = 3000;

let baseBlackCards = [];
let baseWhiteCards = [];

fs.readFile(baseBlackCardsFilePath, (err, data) => {
    let lines = data.toString().replace(/[\r]+/gm, "").split('\n');

    baseBlackCards = baseBlackCards.concat(lines);
    //console.log(baseBlackCards);
});

fs.readFile(baseWhiteCardsFilePath, (err, data) => {
    let lines = data.toString().replace(/[\r]+/gm, "").split('\n');

    baseWhiteCards = baseWhiteCards.concat(lines);
    //console.log(baseWhiteCards);
});

const openLobbies = [new Lobby("Uhhhh", randomUUID(), "Steven"), new Lobby("oooooo", randomUUID())];
const users = {};

console.log(openLobbies);

app.use(express.static('public'));

// Feels like theres a better way to get the lobby
// Maybe using a map to store the lobbyId and the lobby object?
function findLobby(lobbyId) {
    for (let i = 0; i < openLobbies.length; i++) {
        if (openLobbies[i].getLobbyId() === lobbyId) {
            return openLobbies[i];
        }
    }
    return null;
}

function findLobbyByOwnerId(ownerId) {
    for (let i = 0; i < openLobbies.length; i++) {
        if (openLobbies[i].getOwnerUuid() === ownerId) {
            return openLobbies[i];
        }
    }
    return null;
}

app.get('/', (req, res) => {
    res.render(__dirname + '/views/chooseUsername');
    // httpOnly means the cookie can't be accessed by client side javascript
    res.cookie("uuid", randomUUID(), { signed: true, httpOnly: true, secure: true, sameSite: true });
    //res.json(uuid.v4());
})

app.post('/', (req, res) => {
    const username = req.body.username;
    //console.log(req.signedCookies.uuid);
    const uuid = req.signedCookies.uuid;
    //const username = req.body.username.escape().trim();
    //username.trim().escape();

    // Add more input validation here
    if (username.length < 1) {
        res.render(__dirname + '/views/chooseUsername', { enteredName: username, errorMsg: 'Please enter a valid username' });
    } else {
        users[uuid] = username;
        res.redirect('/chooseLobby/' + username);

    }
})

app.get('/chooseLobby/:name', (req, res) => {
    res.sendFile(__dirname + '/public/chooseLobby.html');
    //res.json(openLobbies);
})

app.get('/api/lobbiesAvailable', (req, res) => {
    // Find out if it is a good idea to send the lobbyId to the client
    // and if not then find an alternative
    // Should be fine since I separated lobbyId from the users ID
    const lobbiesData = [];
    for (let i = 0; i < openLobbies.length; i++) {
        lobbiesData.push(openLobbies[i].getLobbyDisplayData())
    }
    res.json(lobbiesData);
})

app.get('/createLobby', (req, res) => {
    const uuid = req.signedCookies.uuid;
    const lobby = new Lobby(users[uuid], uuid);
    openLobbies.push(lobby);
    //console.log(openLobbies);
    console.log(lobby.getLobbyId());
    res.cookie("lobbyId", lobby.getLobbyId(), { signed: true, httpOnly: true, secure: true, sameSite: true });
    res.sendFile(__dirname + '/public/createLobby.html');
})

// Does this need input validation?
// Client side sends formData object to server, hence the need for multer
app.post('/api/setLobbyDetails', upload.none(), (req, res) => {
    //console.log(req.body);
    const uuid = req.signedCookies.uuid;
    const lobby = findLobbyByOwnerId(uuid);
    lobby.setGameMode(req.body.gameMode);
    lobby.setMaxNumberOfPlayers(parseInt(req.body.maxNumOfPlayers));
    // Might need input validation for the password
    console.log(req.body.lobbyPassword);
    lobby.setPassword(req.body.lobbyPassword);
    //openLobbies.push([req.body.])
    //console.log(openLobbies);
    res.sendStatus(200);
})

app.post('/api/startGame', (req, res) => {
    const uuid = req.signedCookies.uuid;
    //console.log(uuid);
    const lobby = findLobbyByOwnerId(uuid);
    //console.log(lobby);

    lobby.getGame().startGame();
    res.redirect(307, '/joinLobbyOwner');
})

// Still debating whether to have polling or continuous connection?
app.get('/api/checkForGameStart', (req, res) => {
    const lobbyId = req.signedCookies.lobbyId;

    const lobby = findLobby(lobbyId);

    let gameStarted = lobby.getGame().getGameStarted();

    //const date = new Date();

    const startOfTimer = Date.now();

    while (!gameStarted && (Date.now() > (startOfTimer + 30000))) {
        gameStarted = lobby.getGame().getGameStarted();
        console.log("Game not started yet");
    }

    //console.log(gameStarted);

    res.json({ "gameStarted": lobby.getGame().getGameStarted() });
    //res.send(lobby.getGameStarted());
})



app.get('/api/getGameInformation', (req, res) => {
    const lobbyId = req.signedCookies.lobbyId;
    const lobby = findLobby(lobbyId);

    res.json(lobby.getGame().getGameStateData());
})

app.get('/api/waitForGameContinue', (req, res) => {
    const lobbyId = req.signedCookies.lobbyId;

    const lobby = findLobby(lobbyId);

    let allPlayersReady = lobby.getGame().getAllPlayersMadeMove();

    //const date = new Date();

    const startOfTimer = Date.now();

    while (!allPlayersReady && (Date.now() > (startOfTimer + 30000))) {
        allPlayersReady = lobby.getGame().getAllPlayersMadeMove();
        console.log("Players have made move: " + allPlayersReady);
    }

    //console.log(gameStarted);

    res.json({ "allPlayersReady": lobby.getGame().getAllPlayersMadeMove() });
})

app.post('/joinLobby', (req, res) => {
    // Add validation here to check if a lobby has a password and
    // if so check if the password is correct
    // Do I need to add validation for the lobbyId?
    const userId = req.signedCookies.uuid;
    const lobbyId = req.body.lobbyId;
    const lobby = findLobby(lobbyId);
    console.log("Join lobby user id: " + userId);
    console.log("Join lobby lobby id: " + lobbyId);
    console.log("Join lobby object: ");
    console.log(lobby);

    //console.log(lobby);

    // Checks to see if the lobby is full
    if (lobby.getNumberOfPlayers() < lobby.getMaxNumberOfPlayers()) {

        // Checks for lobby password
        if (lobby.getPassword() === "") {
            lobby.addPlayer(userId);
            res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });
            res.sendFile(__dirname + '/public/gamePage.html');
        } else {
            res.redirect('/joinLobby/passwordInput/' + lobbyId);
        }

    } else {
        res.json({ error: "Lobby is full" });
    }
})

app.post('/joinLobbyOwner', (req, res) => {
    const userId = req.signedCookies.uuid;
    const lobby = findLobbyByOwnerId(userId);

    res.cookie("lobbyId", lobby.getLobbyId(), { signed: true, httpOnly: true, secure: true, sameSite: true });
    res.sendFile(__dirname + '/public/gamePage.html');
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
    const lobby = findLobby(lobbyId);

    //console.log(req.body);
    //console.log(enteredPassword);

    if (enteredPassword === lobby.getPassword()) {
        lobby.addPlayer(userId);
        res.cookie("lobbyId", lobbyId, { signed: true, httpOnly: true, secure: true, sameSite: true });
        res.sendFile(__dirname + '/public/gamePage.html');
    } else {
        res.render(__dirname + '/views/passwordInput', { enteredPassword: enteredPassword, errorMsg: 'The entered password is incorrect' });
    }

})

app.post('/lobbyDetails', (req, res) => {
    res.sendFile(__dirname + '/public/lobby.html');
})

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});

/*
app.get('/:id', (req, res) => {
    res.render(__dirname + '/views/cardsGamePage');
})
*/

/*
app.post('/:id', (req, res) => {
    res.sendFile(__dirname + '/public/gamePage.html');
})
 */


/*
io.on('connection', (socket) => {
    console.log('a user connected');
    players[socket.id] = { name: "Player", score: 0, cardCzar: false, answer: false };
    console.log(players);

    // server connect would send the data to
    // io emit sends the data to all connected
    io.emit('updatePlayers', players);
})
 */

server.listen(port, hostname, () => {
    console.log(`Example app listening at http://${hostname}:${port}`)
})