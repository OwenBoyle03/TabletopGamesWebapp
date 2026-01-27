'use strict'
//const { randomUUID } = require('crypto');
import CAHGame from './CAHGame.js';
import { randomUUID } from "crypto";
//const csv = require('csv-parser');
//const fs = require('fs');

//const baseBlackCardsFilePath = 'baseBlackCards.csv';

class Lobby {
    constructor(ownerName, uuid, password = "") {
        this.lobbyOwnerName = ownerName;
        this.gameMode = "Cards Against Humanity";
        this.maxNumberOfPlayers = 8;
        this.numberOfPlayers = 1;
        this.ownerUuid = uuid;
        this.lobbyId = randomUUID();
        this.password = password;
        this.players = [ uuid ];
        this.game = new CAHGame([uuid]);
    }

    setLobbyOwnerName(lobbyOwnerName) {
        this.lobbyOwnerName = lobbyOwnerName;
    }

    setGameMode(gameMode) {
        if (gameMode === "Cards Against Humanity") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
        } else if (gameMode === "Uno") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
        } else if (gameMode === "Chess") {
            this.gameMode = "Cards Against Humanity";
            this.game = new CAHGame(this.players);
        }
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

    /*
    toggleGameStarted() {
        this.gameStarted = !this.gameStarted;
    }
     */

    getLobbyOwnerName() {
        return this.lobbyOwnerName;
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


    getLobbyDisplayData() {
        let passwordRequired = (this.password !== "");

        return {    lobbyOwnerName: this.lobbyOwnerName,
                    gameMode: this.gameMode,
                    maxNumberOfPlayers: this.maxNumberOfPlayers,
                    password: passwordRequired,
                    lobbyId: this.lobbyId
                }

    }

    getGame() {
        return this.game;
    }

    // Needs re-write for new CAHGame object
    addPlayer(uuid) {
        this.players.push(uuid);
        this.game.addPlayerScore(uuid);
        //this.playersScores.push({ uuid: 0 });
        this.numberOfPlayers += 1;
    }

    // Needs re-write for new CAHGame object
    removePlayer(uuid) {
        // The players and playersScores arrays are in the same order
        const playerIndex = this.players.indexOf(uuid);
        //this.playersScores.splice(playerIndex, 1)
        this.players.splice(playerIndex, 1);
        this.game.removePlayerScore(playerIndex);
        this.numberOfPlayers -= 1;
    }
}

// The commented out version is exporting in the old/ CommonJS way
// The one below is the new ES modules
//module.exports = Lobby;
export default Lobby;