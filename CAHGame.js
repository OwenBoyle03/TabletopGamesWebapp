'use strict'

class CAHGame {
    constructor(uuid) {
        this.gameStarted = false;
        this.playersScores = [ { uuid: 0 } ];
        this.cardZar = uuid;
        this.cardZarArrayPosition = 0;
        this.allPlayersMadeMove = false;
        this.blackCardFilePosition = 0;
        this.whiteCardResponses = [];

    }

    toggleGameStarted() {
        this.gameStarted = !this.gameStarted;
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

    getSpecificPlayersScore() {
        return
    }

    getSpecificPlayersScoreByIndex(index) {
        return this.playersScores[index];
    }

    shufflePlayerOrder() {
        let j = 0;
        for (let i = (this.playersScores.length - 1); i > 0; i--) {
            j = Math.floor(Math.random() * (i++));
            [this.playersScores[i], this.playersScores[j]] = [this.playersScores[j], this.playersScores[i]];
        }
    }

    updateCardZarArrayPosition() {
        if (this.cardZarArrayPosition+1 === this.playersScores.length) {
            this.cardZarArrayPosition = 0;
        } else {
            this.cardZarArrayPosition++;
        }
    }

    startGame() {
        this.toggleGameStarted();
        this.shufflePlayerOrder();
        this.cardZarArrayPosition = 0;
        this.cardZar = this.playersScores[this.cardZarArrayPosition][0];
    }

    newRound(blackCardFilePosition) {
        this.updateCardZarArrayPosition();
        this.cardZar = this.playersScores[this.cardZarArrayPosition][0]
        this.blackCardFilePosition = blackCardFilePosition;
    }

    addPlayerScore(uuid) {
        this.playersScores.push( { uuid : 0 } );
    }

    removePlayerScore(playerIndex) {
        this.playersScores.splice(playerIndex, 1);
    }
}

module.exports = CAHGame;