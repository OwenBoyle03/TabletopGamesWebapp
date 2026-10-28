'use strict'
import ViewCard from './ViewCard.js';
import ViewCardEditable from './ViewCardEditable.js';

export default class GameView {

    constructor() {
        this.mainCanvas = document.getElementById('main');
        // Checking for canvas support
        if (this.mainCanvas.getContext) {
            this.mainCanvas.remove();
        }

        this.cardWidth = 500;
        this.cardHeight = 700;

        this.playersScoreDiv = document.getElementById('playersScores');
        this.playersScoreCards = [];

        this.informationAndOptionsDiv = document.getElementById('informationAndOptions');
        this.waitingScreenCard = null;
        this.gameModeCard = null;
        this.maxNumberOfPlayersCard = null;
        this.lobbyPasswordCard = null;
        this.startButtonCard = null;
        this.gameWinnerScreen = null;

        this.turnTimerDiv = document.getElementById('turnTimer');
        this.turnTimerCard = null;

        this.submitButtonDiv = document.getElementById('submitButton');
        this.submitButtonCard = null;

        this.blackCardDiv = document.getElementById('blackCard');
        this.responsesDiv = document.getElementById('responses');
        this.playerCardsDiv = document.getElementById('playerCards');

        //this.blackCard = new ViewCard("black", "", this.cardWidth, this.cardHeight, this.blackCardDiv);
        this.blackCard = null;
        this.responseCards = [];
        this.playerCards = [];
        this.playerCardListeners = [];
        this.submitButtonListener = null;

        //this.testCard = new ViewCard("black", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
        //this.displayCardsInStartPosition();


        //this.testCard2 = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
    }

    createBlackCard() {
        this.blackCard = new ViewCard("black", "", this.cardWidth, this.cardHeight, this.blackCardDiv);
    }

    destroyBlackCard() {
        if (this.blackCard) {
            this.blackCard.removeCanvas();
            this.blackCard = null;
        }
    }

    getGameModeCard() {
        return this.gameModeCard;
    }

    getMaxNumberOfPlayersCard() {
        return this.maxNumberOfPlayersCard;
    }

    getLobbyPasswordCard() {
        return this.lobbyPasswordCard;
    }

    getStartButtonCard() {
        return this.startButtonCard;
    }

    getBlackCard() {
        return this.blackCard;
    }

    setBlackCardText(text) {
        this.blackCard.changeCardText(text);
    }

    hideBlackCard() {
        this.blackCard.clearCanvas();
        //this.blackCard = null;
    }

    clearResponseCardDiv() {
        this.responsesDiv.replaceChildren();
        //this.responseCards = [];
    }

    getResponses() {
        return this.responseCards;
    }

    addResponseCard(response) {
        this.responseCards.push(new ViewCard("white", response, this.cardWidth, this.cardHeight, this.responsesDiv));
        this.responseCards[this.responseCards.length - 1].drawCard();
    }

    addMultipleBlankResponseCardsFromOnePlayer(numberOfCards) {
        const newDivForThisPlayersResponses = document.createElement('div');
        this.responsesDiv.appendChild(newDivForThisPlayersResponses);
        for (let i = 0; i < numberOfCards; i++) {
            this.responseCards.push(new ViewCard("white", "", this.cardWidth, this.cardHeight, newDivForThisPlayersResponses));
            this.responseCards[this.responseCards.length - 1].drawCard();
        }
    }

    removeResponseCard(index) {
        this.responseCards[index].removeCanvas();
        this.responseCards.splice(index, 1);
    }

    removeAllResponseCards() {
        for (let i = 0; i < this.responseCards.length; i++) {
            this.responseCards[i].removeCanvas();
        }
        this.responseCards = [];
    }

    changeResponseCardText(index, text) {
        this.responseCards[index].changeCardText(text);
    }

    changeAllResponseCardsText(responses) {
        for (let i = 0; i < responses.length; i++) {
            this.responseCards[i].changeCardText(responses[i]["cardText"]);
        }
    }

    setResponses(responses) {
        for (let i = 0; i < responses.length; i++) {
            this.responseCards[i] = new ViewCard("white", responses[i], this.cardWidth, this.cardHeight, this.responsesDiv);
        }
    }

    getPlayerCards() {
        return this.playerCards;
    }

    setPlayerCards(playerCards) {
        for (let i = 0; i < playerCards.length; i++) {
            if (playerCards[i][0] === "Blank Card") {
                this.playerCards.push(new ViewCardEditable("white", "", this.cardWidth, this.cardHeight, this.playerCardsDiv));
            } else {
                this.playerCards.push(new ViewCard("white", playerCards[i][0], this.cardWidth, this.cardHeight, this.playerCardsDiv));
            }
            console.log("Player card " + playerCards[i][1] + " has been set to " + playerCards[i][0]);
        }
    }

    addPlayerCard(playerCard) {
        this.playerCards.push(new ViewCard("white", playerCard[0], this.cardWidth, this.cardHeight, this.playerCardsDiv));
    }

    addPlayerCards(playerCards) {
        for (let i = 0; i < playerCards.length; i++) {
            this.addPlayerCard(playerCards[i]);
        }
        this.reDrawAllPlayerCards();
    }

    reDrawAllPlayerCards() {
        for (let i = 0; i < this.playerCards.length; i++) {
            this.playerCards[i].drawCard();
        }
    }

    removePlayerCard(index) {
        this.playerCards[index].removeCanvas();
        this.playerCards.splice(index, 1);
    }

    removeAllPlayerCards() {
        for (let i = 0; i < this.playerCards.length; i++) {
            this.playerCards[i].removeCanvas();
        }
        this.playerCards = [];
    }

    displayAllCards() {

        // Display question / black card
        this.blackCard.drawCard();

        // Display responses
        for (let i = 0; i < this.responseCards.length; i++) {
            this.responseCards[i].drawCard();
        }

        // Display player choices
        for (let i = 0; i < 10; i++) {
            this.playerCards[i].drawCard();
        }
    }

    displayAllPlayersChoiceCards() {
        // Display player choices
        for (let i = 0; i < 10; i++) {
            this.playerCards[i].drawCard();
        }
    }

    addSubmitButton() {
        this.submitButtonCard = new ViewCard("black", "Submit", this.cardWidth/2, this.cardHeight/2, this.submitButtonDiv);
        this.submitButtonCard.drawCardWithCentredTextNoWrap();
    }

    removeSubmitButton() {
        if (this.submitButtonCard) {
            this.submitButtonCard.removeCanvas();
            this.submitButtonCard = null;
        }
    }

    addSubmitButtonEventListener(handler) {
        if (this.submitButtonCard) {
            this.submitButtonListener = () => handler();
            this.submitButtonCard.getCanvas().addEventListener('click', this.submitButtonListener);
        }
    }

    removeSubmitButtonEventListener(handler) {
        if (this.submitButtonCard) {
            this.submitButtonCard.getCanvas().removeEventListener('click', this.submitButtonListener);
            this.submitButtonListener = null;
        }
    }


    addPlayerScoreCard(playerName, score) {
        const playerScoreCard = new ViewCard("white", (playerName + ": " + score + " points"), this.cardWidth*2, this.cardHeight/5, this.playersScoreDiv, 0.4);
        playerScoreCard.drawCardWithVerticalCentredTextNoWrap();
        this.playersScoreCards.push(playerScoreCard);
    }

    addMultiplePlayerScoreCards(playerNames) {
        for (let i = 0; i < playerNames.length; i++) {
            this.addPlayerScoreCard(playerNames[i], 0);
        }
    }

    changePlayerScoreCard(playerIndex, playerName, score) {
        console.log("Players: " + this.playersScoreCards);
        console.log("Changing player score card for player index " + playerIndex + " to score " + score);
        this.playersScoreCards[playerIndex].setText(playerName + ": " + score + " points");
        this.playersScoreCards[playerIndex].drawCardWithVerticalCentredTextNoWrap();
    }

    resetPlayerScoreCards() {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            const playerName = this.playersScoreCards[i].getText().split(":")[0];
            this.playersScoreCards[i].setText(playerName + ": 0 points");
            this.playersScoreCards[i].drawCardWithVerticalCentredTextNoWrap();
        }
    }

    removePlayerScoreCard(playerName) {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            if (this.playersScoreCards[i].getText().startsWith(playerName)) {
                this.playersScoreCards[i].removeCanvas();
                this.playersScoreCards.splice(i, 1);
            }
        }
    }

    removeAllPlayerScoreCards() {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            this.playersScoreCards[i].removeCanvas();
        }
        this.playersScoreCards = [];
    }

    reDrawAllPlayerScoreCards() {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            this.playersScoreCards[i].drawCardWithVerticalCentredTextNoWrap();
            // Remember to take this line out
            this.playersScoreCards[i].highlightCard();
        }
    }

    getPlayerScoreCardByIndex(i) {
        return this.playersScoreCards[i];
    }

    highlightWinnerPlayerScoreCard(playerName) {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            if (this.playersScoreCards[i].getText().startsWith(playerName)) {
                this.playersScoreCards[i].highlightCard();
            }
        }
    }

    setCardZarPlayerScoreCard(playerName) {
        for (let i = 0; i < this.playersScoreCards.length; i++) {
            if (this.playersScoreCards[i].getText().startsWith(playerName)) {
                this.playersScoreCards[i].setCardZar();
            }
        }
    }

    /*
    displayCardsInStartPosition() {

        // Display question / black card
        this.blackCard = new ViewCard("black", "Yo mama so fat when she backs up her beeper goes off.", this.cardWidth, this.cardHeight, this.blackCardDiv);

        // Display choice options
        this.responses[0] = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
        this.responses[1] = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);

        // Display player choices
        for (let i = 0; i < 10; i++) {
            this.playerCards[i] = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.playerCardsDiv);
        }
    }
     */

    checkForResponseCardClick(handler) {
        for (let i = 0; i < this.responseCards.length; i++) {
            this.getResponses()[i].getCanvas().addEventListener('click', () => handler(i));
        }
    }

    addRelevantEventListenerToPlayerCards(clickHandler, keyPressHandler, numberOfCards) {
        // Have to store the annoymous functions in order to remove the event listeners
        this.playerCardListeners = [];

        for (let i = 0; i < this.playerCards.length; i++) {
            if (this.playerCards[i].isTextEditable()) {
                const listener = () => keyPressHandler(event, this.playerCards[i]);
                this.playerCardListeners.push(listener);
            } else {
                const listener = () => clickHandler(i, numberOfCards);
                this.playerCardListeners.push(listener);
                this.getPlayerCards()[i].getCanvas().addEventListener('click', listener);
            }
        }
    }

    removeResponseCardClickListeners(handler) {
        for (let i = 0; i < this.responseCards.length; i++) {
            this.getResponses()[i].getCanvas().removeEventListener('click', handler);
        }
    }

    removeRelevantEventListenerFromPlayerCards() {
        for (let i = 0; i < this.playerCards.length; i++) {
            if (this.playerCards[i].isTextEditable()) {
                this.getPlayerCards()[i].getCanvas().removeEventListener('keydown', this.playerCardListeners[i]);
            } else {
                this.getPlayerCards()[i].getCanvas().removeEventListener('click', this.playerCardListeners[i]);
            }
            //this.getPlayerCards()[i].getCanvas().removeEventListener('click', this.playerCardListeners[i]);
        }
    }

    checkForSpecificResponseCardClick(handler, i) {
        this.getResponses()[i].getCanvas().addEventListener('click', () => handler(i));
    }

    checkForSpecificPlayerCardClick(handler, i) {
        this.getPlayerCards()[i].getCanvas().addEventListener('click', () => handler(i));
    }

    displayLobbyOwnerOptionsUI() {
        // const lobbyOwnerOptionsDiv = document.getElementById("lobbyOwnerOptions");
        // lobbyOwnerOptionsDiv.display = "block";

        this.gameModeCard = new ViewCard("white", "Select Game Mode: \n Cards Against Humanity", this.cardHeight, this.cardHeight, this.informationAndOptionsDiv);
        this.gameModeCard.drawCardWithCentredText();
        this.gameModeCard.drawLeftAndRightArrows();

        this.maxNumberOfPlayersCard = new ViewCard("white", "Select Max Number of Players: \n 4", this.cardHeight, this.cardHeight, this.informationAndOptionsDiv);
        this.maxNumberOfPlayersCard.drawCardWithCentredText();
        this.maxNumberOfPlayersCard.drawLeftAndRightArrows();

        this.lobbyPasswordCard = new ViewCardEditable("white", "Set Lobby Password: \n", this.cardHeight, this.cardHeight, this.informationAndOptionsDiv, "centre");
        this.lobbyPasswordCard.drawCard();
        
        this.startButtonCard = new ViewCard("white", "Start Game", this.cardHeight, this.cardHeight, this.informationAndOptionsDiv);
        this.startButtonCard.drawCardWithCentredText();
    }

    hideLobbyOwnerOptionsUI() {
        //const lobbyOwnerOptionsDiv = document.getElementById("lobbyOwnerOptions");
        //lobbyOwnerOptionsDiv.display = "none";

        this.gameModeCard.removeCanvas();
        this.maxNumberOfPlayersCard.removeCanvas();
        this.lobbyPasswordCard.removeCanvas();
        this.startButtonCard.removeCanvas();

        this.gameModeCard = null;
        this.maxNumberOfPlayersCard = null;
        this.lobbyPasswordCard = null;
        this.startButtonCard = null;

        console.log("Lobby owner options have been removed");
    }

    displayWaitingScreen() {
        /*
        const waitingScreen = document.getElementById("waitingScreen");
        waitingScreen.style.display = "block";
        */
        this.waitingScreenCard = new ViewCard("white", "Awaiting Host", this.cardHeight, this.cardHeight, this.informationAndOptionsDiv);
        this.waitingScreenCard.drawCardWithCentredText();
    }

    hideWaitingScreen() {
        this.waitingScreenCard.removeCanvas();
        this.waitingScreenCard = null;
        console.log("Waiting screen has been removed");
    }

    displayTurnTimer(timeRemaining) {
        this.turnTimerCard = new ViewCard("black", ("Time Remaining: " + timeRemaining), this.cardWidth/2, this.cardWidth/2, this.turnTimerDiv);
        this.turnTimerCard.drawCardWithCentredText();
    }

    updateTurnTimer(timeRemaining) {
        if (this.turnTimerCard) {
            this.turnTimerCard.changeCardTextCentred("Time Remaining: " + timeRemaining);
        }
    }

    hideTurnTimer() {
        if (this.turnTimerCard) {
            this.turnTimerCard.removeCanvas();
            this.turnTimerCard = null;
            //console.log("Turn timer has been removed");
        }
    }

    displayPlayerNameCards(playerNames) {

    }

    hidePlayerNameCards() {

    }

    addPlayerNameCard(playerName) {

    }

    removePlayerNameCard(playerName) {
        
    }

    showRoundWinner(winner) {

    }

    hideRoundWinner() {

    }

    showGameWinnerScreen(winner) {
        this.gameWinnerScreen = new ViewCard("white", (winner + " wins!"), this.cardHeight, this.cardHeight, this.informationAndOptionsDiv);
        this.gameWinnerScreen.drawCardWithCentredText();
    }

    hideGameWinnerScreen() {
        this.gameWinnerScreen.removeCanvas();
        this.gameWinnerScreen = null;
    }

    // Mouse scaling calculations
    getCanvasScaledMousePosition(e) {
        let bounds = this.canvas.getBoundingClientRect();

        // Raw mouse position
        let mouseX = e.clientX;
        let mouseY = e.clientY;

        // Mouse position account for canvas position
        mouseX = mouseX - bounds.left - scrollX;
        mouseY = mouseY - bounds.top - scrollY;

        // Mouse position normalised for canvas bounds
        mouseX /= bounds.width;
        mouseY /= bounds.height;

        // Mouse position scaled to canvas coordinates
        mouseX *= this.canvas.width;
        mouseY *= this.canvas.height;

        // Since the mouse position is given in terms of pixel and the canvas measurements
        // are a mix of pixel and css scaling the mouse position needs to be scaled as well
        return { x: mouseX, y: mouseY };
    }

    setPiecePositionToMousePosition(e, index) {
        let scaledMousePosition = this.getCanvasScaledMousePosition(e);
        this.getPiece(index).movePiecePosition(scaledMousePosition.x, scaledMousePosition.y);
    }

    // This might need to be an async function
    reDrawCanvas() {
        this.retrieveContext().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
        this.getBoard().drawBoard();
        this.drawAllPieces();
    }

    // This might need to be an async function
    reDrawCanvasForGameRestart(boardState) {
        this.retrieveContext().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
        this.getBoard().drawBoard();
        this.resetPieces(boardState);
        this.drawAllPieces();
    }

    // Top left board square is boardSquareX = 0, boardSquareY = 0
    drawPositionPuck(x, y) {
        // Sets colour of pieces
        this.context.fillStyle = "grey";

        // Draws piece
        this.context.beginPath();
        // Multiply by 125 to get to the start of the square and add 62.5 to get the centre of square
        // Might need to change the radius for sake of board scaling
        this.context.arc(this.boardPositionToCanvasPosition(x), this.boardPositionToCanvasPosition(y), (this.distanceBetweenSquares * 0.16), 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
        //console.log("Piece has been drawn");
    }

    highlightTheChosenOption(buttonArray, chosenIndex) {
        for (let i = 0; i < buttonArray.length; i++) {
            buttonArray[i].style.color = "initial";
        }
        buttonArray[chosenIndex].style.color = "purple";
    }

    changeTutorialText(text) {
        this.tutorialPara.innerHTML = "<h1>Tutorial</h1><p>" + text + "</p>";
    }

    clearTutorialText() {
        this.tutorialPara.innerHTML = "";
    }

    displayCurrentPlayersTurn(colour) {
        if (colour === "white") {
            this.rightContent.innerHTML = "<h1>White's turn</h1>";
        } else {
            this.rightContent.innerHTML = "<h1>Black's turn</h1>";
        }
    }

    clearCurrentPlayersTurn() {
        this.rightContent.innerHTML = "";
    }

    displayWinScreen(winner) {
        // Sets the font and size of the text
        this.context.font = "" + (50) + "px Arial";

        // Sets the position from which text is positioned
        this.context.textBaseline = "top";

        this.context.fillStyle = 'blue';
        this.context.fillText(( winner + " wins!"), (400), (400));
        this.context.fillStyle = '#d18c47';
    }
}