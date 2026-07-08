'use strict'
import EventEmitter from 'events';
import fs from 'fs';

class CAHGame extends EventEmitter {
    constructor(players) {
        super();
        this.gameStarted = false;
        this.isCardZarsTurn = false;
        this.cardZar = players[0];
        this.cardZarIndex = 0;
        this.blackCard = null;
        this.whiteCardResponses = new Map();
        this.winningResponse = null;
        // Set to 1 for testing purposes, can be changed to 5 or whatever in the future
        this.pointsToWin = 5;
        this.turnTimer = null;
        this.amountOfTimePerTurn = 30000;
        this.endOfTurnTimer = null;
        this.blackCardPacks = [];
        this.whiteCardPacks = [];

        this.readinCardPacks();

        this.playersScores = [];
        for (let i = 0; i < players.length; i++) {
            this.playersScores.push({ player: players[i], score: 0 });
        }

        /*
        this.playersScores = new Map();
        for (let i = 0; i < players.length; i++) {
            this.playersScores.set(players[i], 0);
        }
            */
        //console.log("This is the value of cardZar: %s", this.cardZar);
    }

    readinCardPacks() {

        const baseBlackCardsFilePath = 'baseBlackCardPack.txt';
        const baseWhiteCardsFilePath = 'baseWhiteCardPack.txt';

        fs.readFile(baseBlackCardsFilePath, (err, data) => {
            let lines = data.toString().replace(/[\r]+/gm, "").split('\n');

            this.blackCardPacks = this.blackCardPacks.concat(lines);
            //console.log(baseBlackCards);
        });

        fs.readFile(baseWhiteCardsFilePath, (err, data) => {
            let lines = data.toString().replace(/[\r]+/gm, "").split('\n');

            this.whiteCardPacks = this.whiteCardPacks.concat(lines);
            //console.log(baseWhiteCards);
        });

        //console.log(this.whiteCardPacks);
    }

    getIsCardZarsTurn() {
        return this.isCardZarsTurn;
    }

    getRandomBlackCard() {
        const randomNumber = Math.floor(Math.random() * this.blackCardPacks.length);
        //console.log("Black Card: " + this.blackCardPacks[randomNumber]);
        return this.blackCardPacks[randomNumber];
    }

    getRandomWhiteCard() {
        const cardIndex = Math.floor(Math.random() * this.whiteCardPacks.length);
        return [this.whiteCardPacks[cardIndex], cardIndex];
    }

    getRandomWhiteCardDeck(numberOfCards) {
        const whiteCardDeck = [];
        for (let i = 0; i < numberOfCards; i++) {
            whiteCardDeck.push(this.getRandomWhiteCard());
        }
        return whiteCardDeck;
    }

    setBlackCard() {
        this.blackCard = this.getRandomBlackCard();
        //this.emit("blackCardUpdated", this.blackCard);
    }

    getNumberofResponseCardsAllowed(blackCard) {
        // Uses regex to find one or more underscores in a row (_+) and finds all matches (g)
        const numberOfBlanks = (blackCard.match(/_+/g) || []).length;
        if (numberOfBlanks === 0) {
            return 1;
        } else {
            return numberOfBlanks;
        }
    }

    setGameStartedTrue() {
        this.gameStarted = true;
        this.emit("gameStarted");
    }

    setGameStartedFalse() {
        this.gameStarted = false;
    }

    getAllPlayersMadeMove() {
        return this.allPlayersMadeMove;
    }

    setAllPlayersMadeMove(value) {
        this.allPlayersMadeMove = value;
    }

    getGameStateData() {
        return {
            //gameStarted: this.gameStarted,
            cardZar: this.cardZar,
            //playersScores: this.playersScores,
            //whiteCardResponses: this.whiteCardResponses,
            endOfTurnTimer: this.endOfTurnTimer
            //winningResponse: this.winningResponse
        };
    }

    getEndOfTurnTimer() {
        return this.endOfTurnTimer;
    }
/*
    setBlackCardFilePosition(blackCard) {
        this.blackCard = blackCard;
    }
    */

    setWinningResponse(winningResponse) {
        this.winningResponse = winningResponse;
    }

    getWinningResponse() {
        return this.winningResponse;
    }
/*
    getBlackCardFilePosition() {
        return this.blackCard;
    }
    */

    getGameStarted() {
        return this.gameStarted;
    }

    getPlayersScores() {
        return this.playersScores;
    }

    getSpecificPlayersScore(uuid) {
        for (let i = 0; i < this.playersScores.length; i++) {
            if (this.playersScores[i].player === uuid) {
                return this.playersScores[i].score;
            }
        }
        //return this.playersScores.get(uuid);
        return null;
    }

    getCardZar() {
        return this.cardZar;
    }

    shufflePlayerOrder() {
        let j = 0;
        // Shuffles the keys
        // this.playersScores.size
        for (let i = (this.playersScores.length - 1); i > 0; i--) {
            // Should this not be i+1 instead of i++ ?
            j = Math.floor(Math.random() * (i+1));
            [this.playersScores[i], this.playersScores[j]] = [this.playersScores[j], this.playersScores[i]];
        }

        /*
        // Creates a copy map with the order of the shuffled keys and values of the og map
        const shuffledPlayersScores = new Map();
        for (let i = 0; i < playersScoresKeys.length; i++) {
            shuffledPlayersScores.set(playersScoresKeys[i], this.playersScores.get(playersScoresKeys[i]));
        }

        this.playersScores = shuffledPlayersScores;
        //console.log("Shuffled Players Scores: ");
        */
        console.log(this.playersScores);
    }

    updateCardZarIndex() {
        if (this.cardZarIndex+1 === this.playersScores.length) {
            this.cardZarIndex = 0;
        } else {
            this.cardZarIndex++;
        }
    }

    startGame() {
        this.shufflePlayerOrder();
        this.cardZarIndex = 0;
        this.cardZar = this.playersScores[this.cardZarIndex].player;
        this.setGameStartedTrue();
        //this.emit("gameStarted", this.gameStarted);
        setTimeout(() => { this.newRound(); }, 5000);
        //this.gameLoop();
    }

    newRound() {
        this.updateCardZarIndex();
        this.cardZar = this.playersScores[this.cardZarIndex].player;
        console.log("Card Zar: " + this.cardZar);
        console.log("Players Scores: ");
        console.log(this.playersScores);
        //this.emit("cardZar", this.cardZar);
        
        this.setBlackCard();

        this.turnTimer = setTimeout(() => { this.cardZarsTurn(); }, this.amountOfTimePerTurn);
        this.endOfTurnTimer = (Date.now() + 30000);
        // This needs to emit the cardZar, the black card and the start of the timer
        //this.emit("newRound", this.getGameStateData());
        this.emit("newRound", { "endOfTurnTimer": this.endOfTurnTimer, "cardZar": this.cardZar, 
                                "blackCard": this.blackCard,
                                "numberOfResponseCardsAllowed": this.getNumberofResponseCardsAllowed(this.blackCard) });
    }

    endTurnEarly(nextTurnFunction) {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
            this.endOfTurnTimer = null;
            this.emit("endTurnTimerEarly");
        }

        nextTurnFunction.call(this);

    }

    getResponseCardsText() {
        const responsesText = [];
        // Each of this.whiteCardResponses.values() is an array of indexes from each player
        const responseOwners = Array.from(this.whiteCardResponses.keys());
        const responsesArray = Array.from(this.whiteCardResponses.values());

        for (let i = 0; i < responsesArray.length; i++) {
            for (let j = 0; j < responsesArray[i].length; j++) {
                //responsesArray[i][j] = this.getWhiteCardText(responsesArray[i][j]);
                responsesText.push({ "playerUuid": responseOwners[i], "cardText": this.whiteCardPacks[responsesArray[i][j]] });
            }
        }
       
        return responsesText;
    }

    cardZarsTurn() {
        this.isCardZarsTurn = true;
        this.turnTimer = setTimeout(() => { this.endRound(); }, this.amountOfTimePerTurn);
        this.endOfTurnTimer = (Date.now() + 30000);
        //this.emit("cardZarsTurn", [this.cardZar, this.endOfTurnTimer, Array.from(this.whiteCardResponses.values())]);
        
        this.emit("cardZarsTurn", { "cardZar": this.cardZar, "endOfTurnTimer": this.endOfTurnTimer, 
                                    "whiteCardResponses": this.getResponseCardsText() });
    }

    pauseToDisplayRoundWinner() {
        if (this.gameStarted) {
            //this.emit("roundWinner", this.winningResponse);
            setTimeout(() => { this.newRound(); }, 5000);
        }
    }

    endRound() {
        this.isCardZarsTurn = false;

        // If no cardZar response, give random player the win
        // Currently gives to random player rather than random response, might be changed in the future
        if (this.winningResponse === null) {
            console.log("No winning response, point given to random player");
            const randomNumber = Math.floor(Math.random() * this.playersScores.length);
            const randomPlayer = this.playersScores[randomNumber].player;
            console.log("Random Player: " + randomPlayer);
            //this.winningResponse = { "chosenResponseCardOwner": randomPlayer, "card": this.whiteCardResponses.get(randomPlayer) };
            this.winningResponse = { "chosenResponseCardOwner": randomPlayer, "chosenResponseCardIndex": null };
        }

        //this.emit("endOfCardZarsTurn");

        this.increasePlayerScore(this.winningResponse["chosenResponseCardOwner"]);

        const winner = this.checkForWinner();
        if (winner) {
            this.emit("gameWinner", { "winner": winner, "cardZar": this.cardZar });
            this.setGameStartedFalse();
            this.setAllScoresToZero();
        } else {
            this.emit("roundWinner", { "winningResponse": this.winningResponse, "winnersScore": this.getSpecificPlayersScore(this.winningResponse["chosenResponseCardOwner"]), "cardZar": this.cardZar });
            this.pauseToDisplayRoundWinner();
            //this.newRound();
        }

        //this.pauseToDisplayRoundWinner();
        this.winningResponse = null;
        this.whiteCardResponses.clear();
    }

    addToWhiteCardResponses(playerUuid, cardIndexes) {
        this.whiteCardResponses.set(playerUuid, cardIndexes);
        this.emit("responseCardReceived", { "numberOfResponseCards": cardIndexes.length });
        if (this.checkAllPlayersSubmitted()) {
            this.endTurnEarly(this.cardZarsTurn);
        }
    }

    chooseRoundWinner(data) {
        this.winningResponse = data;
        this.endTurnEarly(this.endRound);
    }

    addPlayerScore(uuid) {
        // If statement is here for future implementation of rejoining
        // But will need some way of showing current players vs old players
        // in playersScores
        /*
        if (this.playersScores.has(uuid)) {
            this.emit("playerJoined", uuid, this.playersScores.get(uuid));
        } else {
            this.playersScores.set(uuid, 0);
            this.emit("playerJoined", uuid, 0);
        }
         */
        //this.playersScores.set(uuid, 0);
        this.playersScores.push({ player: uuid, score: 0 });
        this.emit("playerJoined", uuid);
    }

    increasePlayerScore(playerUuid) {
        //this.playersScores.set(playerUuid, (this.playersScores.get(playerUuid)+1));
        for (let i = 0; i < this.playersScores.length; i++) {
            if (this.playersScores[i].player === playerUuid) {
                this.playersScores[i].score++;
                break;
            }
        }
        console.log("Player %s score increased to %d", playerUuid, this.getSpecificPlayersScore(playerUuid));
        this.emit("increasePlayerScore", playerUuid, this.getSpecificPlayersScore(playerUuid));
    }

    removePlayerScore(playerUuid) {
        //this.playersScores.delete(playerUuid);
        for (let i = 0; i < this.playersScores.length; i++) {
            if (this.playersScores[i].player === playerUuid) {
                this.playersScores.splice(i, 1);
                break;
            }
        }
        this.emit("playerLeft", playerUuid);
    }

    setAllScoresToZero() {
        for (let i = 0; i < this.playersScores.length; i++) {
            this.playersScores[i].score = 0;
        }
    }

    checkAllPlayersSubmitted() {
        return ((this.playersScores.length-1) === this.whiteCardResponses.size);
    }

    checkForWinner() {
        for (let i = 0; i < this.playersScores.length; i++) {
            if (this.playersScores[i].score >= this.pointsToWin) {
                return this.playersScores[i].player;
            }
        }
        return false;
    }

}

export default CAHGame;