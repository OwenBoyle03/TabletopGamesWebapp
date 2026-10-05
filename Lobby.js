'use strict'
//const { randomUUID } = require('crypto');
import CAHGame from './CAHGame.js';
import EventEmitter from "events";
//import { randomUUID } from "crypto";
//const csv = require('csv-parser');
//const fs = require('fs');

//const baseBlackCardsFilePath = 'baseBlackCards.csv';

// Players must not be allowed to join before the lobby owner has set their username.
class Lobby extends EventEmitter {
    constructor(uuid, password = "", lobbyId) {
        super();
        //this.lobbyOwnerName = ownerName;
        this.gameMode = "Cards Against Humanity";
        this.maxNumberOfPlayers = 8;
        this.numberOfPlayers = 1;
        this.ownerUuid = uuid;
        this.lobbyId = lobbyId;
        this.password = password;
        // Change this to false once test lobbies are removed
        this.hasPassword = (password !== "");
        //this.players = [ uuid ];
        this.players = new Map();
        this.lobbyOpen = false;
        this.game = new CAHGame(([uuid]));
        this.setupCAHEventEmitters();
    }

    setOwnerNameAndInitialisePlayersMap(ownerName) {
        this.players.set(this.ownerUuid, ownerName);
    }

    setLobbyOpen(isOpen) {
        this.lobbyOpen = isOpen;
    }

    isOpen() {
        return this.lobbyOpen;
    }

    /*
    setLobbyOwnerName(lobbyOwnerName) {
        this.lobbyOwnerName = lobbyOwnerName;
    }
        */

    setGameMode(gameMode) {
        if (gameMode === "Cards Against Humanity") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
            this.game.removeAllListeners();
            this.setupCAHEventEmitters();
        } else if (gameMode === "Uno") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
            this.game.removeAllListeners();
            this.setupUNOEventEmitters();
        } else if (gameMode === "Chess") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
            this.game.removeAllListeners();
            this.setupChessEventEmitters();
        }
    }

    // Doing it this way rather than generically allows the lobby object
    // to put data in the eventEmitter as well
    setupCAHEventEmitters() {
        this.game.on('gameStarted', () => {
            this.emit("gameStarted");
        });

        this.game.on('newRound', (data) => {
            this.emit("newRound", data);
        });

        this.game.on('cardZarsTurn', (data) => {
            this.emit("cardZarsTurn", data);
        });

        this.game.on('endOfCardZarsTurn', (data) => {
            this.emit("endOfCardZarsTurn", data);
        });

        this.game.on('responseCardReceived', (data) => {
            this.emit("responseCardReceived", data);
        });

        /*
        this.game.on('clearWhiteCardResponses', (data) => {
            this.emit("clearWhiteCardResponses", data);
        });
         */

        this.game.on('playerLeft', (data) => {
            this.emit("playerLeft", data);
        });
    }

    setupUNOEventEmitters() {

    }


    setupChessEventEmitters() {

    }

    setMaxNumberOfPlayers(maxNumberOfPlayers) {
        this.maxNumberOfPlayers = maxNumberOfPlayers;
    }

    setOwnerUuid(uuid) {
        this.ownerUuid = uuid;
    }

    setPassword(password) {
        this.password = password;
    }

    requiresPassword() {
        return this.hasPassword;
    }

    setHasPassword(hasPassword) {
        this.hasPassword = hasPassword;
    }

    /*
    toggleGameStarted() {
        this.gameStarted = !this.gameStarted;
    }
     */

    getLobbyOwnerName() {
        return this.players.get(this.ownerUuid);
    }

    getGameMode() {
        return this.gameMode;
    }

    getMaxNumberOfPlayers() {
        return this.maxNumberOfPlayers;
    }

    getNumberOfPlayers() {
        return this.numberOfPlayers;
    }

    getOwnerUuid() {
        return this.ownerUuid;
    }

    getLobbyId() {
        return this.lobbyId;
    }

    getPassword() {
        return this.password;
    }

    getPlayers() {
        return this.players;
    }

    getPlayerName(uuid) {
        return this.players.get(uuid);
    }

    getPlayersNames() {
        return Array.from(this.players.values());
    }

    getPlayerIndexByUuid(uuid) {
        const playersArray = Array.from(this.players.keys());
        return playersArray.indexOf(uuid);
    }

    getLobbyDisplayData() {

        return {    lobbyOwnerName: this.getLobbyOwnerName(),
                    gameMode: this.gameMode,
                    maxNumberOfPlayers: this.maxNumberOfPlayers,
                    password: this.requiresPassword(),
                    lobbyId: this.lobbyId
                }

    }

    getGame() {
        return this.game;
    }

    addPlayer(uuid, playerName) {
        this.players.set(uuid, playerName);
        this.emit("playerJoined", { playerName: playerName });
        this.game.addPlayerScore(uuid);
        //this.playersScores.push({ uuid: 0 });
        this.numberOfPlayers += 1;
    }

    removePlayer(uuid) {
        this.emit("playerLeft", { playerName: this.players.get(uuid) });
        this.players.delete(uuid);
        this.game.removePlayerScore(uuid);
        this.numberOfPlayers -= 1;
    }
}

// The commented out version is exporting in the old/ CommonJS way
// The one below is the new ES modules
//module.exports = Lobby;
export default Lobby;