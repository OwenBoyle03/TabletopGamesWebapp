'use strict'

class CAHGame {
    constructor(players) {
        this.gameStarted = false;
        this.cardZar = players[0];
        this.cardZarIndex = 0;
        this.allPlayersMadeMove = false;
        this.blackCardFilePosition = 0;
        this.whiteCardResponses = [];
        this.pointsToWin = 5;

        this.playersScores = new Map();
        for (let i = 0; i < players.length; i++) {
            this.playersScores.set(players[i], 0);
        }
    }

    /*
    toggleGameStarted() {
        this.gameStarted = !this.gameStarted;
    }
     */

    setGameStartedTrue() {
        this.gameStarted = true;
    }

    setGameStartedFalse() {
        this.gameStarted = false;
    }

    getAllPlayersMadeMove() {
        return this.allPlayersMadeMove;
    }

    toggleAllPlayersMadeMove() {
        this.allPlayersMadeMove = !this.allPlayersMadeMove;
    }

    setAllPlayersMadeMove(value) {
        this.allPlayersMadeMove = value;
    }

    getGameStateData() {

    }

    setBlackCardFilePosition(blackCard) {
        this.blackCard = blackCard;
    }

    getBlackCardFilePosition() {
        return this.blackCard;
    }

    getGameStarted() {
        return this.gameStarted;
    }

    getPlayersScores() {
        return this.playersScores;
    }

    getSpecificPlayersScore(uuid) {
        return this.playersScores.get(uuid);
    }

    shufflePlayerOrder() {
        const playersScoresKeys = this.playersScores.keys();
        let j = 0;
        // Shuffles the keys
        for (let i = (playersScoresKeys.length - 1); i > 0; i--) {
            j = Math.floor(Math.random() * (i++));
            [playersScoresKeys[i], playersScoresKeys[j]] = [playersScoresKeys[j], playersScoresKeys[i]];
        }

        // Creates a copy map with the order of the shuffled keys and values of the og map
        const shuffledPlayersScores = new Map();
        for (let i = 0; i < playersScoresKeys.length; i++) {
            shuffledPlayersScores.set(playersScoresKeys[i], playersScoresKeys.get(playersScoresKeys[i]));
        }

        this.playersScores = shuffledPlayersScores;
    }

    updateCardZarIndex() {
        if (this.cardZarIndex+1 === this.playersScores.length) {
            this.cardZarIndex = 0;
        } else {
            this.cardZarIndex++;
        }
    }

    startGame() {
        this.setGameStartedTrue();
        this.shufflePlayerOrder();
        this.cardZarIndex = 0;
        this.cardZar = this.playersScores.keys()[this.cardZarIndex];
    }

    newRound(blackCardFilePosition) {
        this.updateCardZarIndex();
        this.cardZar = this.playersScores.keys()[this.cardZarIndex];
        this.blackCardFilePosition = blackCardFilePosition;
    }

    addPlayerScore(uuid) {
        //this.playersScores.push( { uuid : 0 } );
        this.playersScores.set(uuid, 0);
    }

    increasePlayerScore(playerUuid) {
        this.playersScores.set(playerUuid, (this.playersScores.get(playerUuid)+1));
    }

    removePlayerScore(playerUuid) {
        this.playersScores.delete(playerUuid);
    }
}

//module.exports = CAHGame;
export default CAHGame;