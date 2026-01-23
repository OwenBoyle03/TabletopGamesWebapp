'use strict'

class GameView {

    constructor() {
        this.mainCanvas = document.getElementById('main');
        // Checking for canvas support
        if (this.mainCanvas.getContext) {
            this.mainCanvas.remove();
        }

        this.cardWidth = 500;
        this.cardHeight = 700;

        this.blackCardDiv = document.getElementById('blackCard');
        this.responsesDiv = document.getElementById('responses');
        this.playerCardsDiv = document.getElementById('playerCards');

        this.blackCard = new ViewCard("black", "", this.cardWidth, this.cardHeight, this.blackCardDiv);
        this.responses = [];
        this.playerCards = [];

        //this.testCard = new ViewCard("black", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
        //this.displayCardsInStartPosition();


        //this.testCard2 = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
    }

    getBlackCard() {
        return this.blackCard;
    }

    setBlackCardText(text) {
        this.blackCard.setText(text);
    }

    getResponses() {
        return this.responses;
    }

    setResponses(responses) {
        for (let i = 0; i < responses.length; i++) {
            this.responses[i] = new ViewCard("white", responses[i], this.cardWidth, this.cardHeight, this.responsesDiv);
        }
    }

    getPlayerCards() {
        return this.playerCards;
    }

    setPlayerCards(playerCardsText) {
        for (let i = 0; i < playerCardsText.length; i++) {
            this.playerCards[i] = new ViewCard("white", playerCardsText[i], this.cardWidth, this.cardHeight, this.playerCardsDiv);
        }
    }

    addPlayerCard(playerCardText) {
        this.playerCards.push(new ViewCard("white", playerCardText, this.cardWidth, this.cardHeight, this.playerCardsDiv));
    }

    removePlayerCard(index) {
        this.playerCards.splice(index, 1);
    }

    displayAllCards() {

        // Display question / black card
        this.blackCard.drawCard();

        // Display responses
        for (let i = 0; i < this.responses.length; i++) {
            this.responses[i].drawCard();
        }

        // Display player choices
        for (let i = 0; i < 10; i++) {
            this.playerCards[i].drawCard();
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
        for (let i = 0; i < this.responses.length; i++) {
            this.getResponses()[i].getCanvas().addEventListener('click', () => handler(i));
        }
    }

    checkForPlayerCardClick(handler) {
        for (let i = 0; i < this.playerCards.length; i++) {
            this.getPlayerCards()[i].getCanvas().addEventListener('click', () => handler(i));
        }
    }

    removeResponseCardClickListeners() {
        for (let i = 0; i < this.responses.length; i++) {
            this.getResponses()[i].getCanvas().removeEventListener('click');
        }
    }

    removePlayerCardClickListeners() {
        for (let i = 0; i < this.playerCards.length; i++) {
            this.getPlayerCards()[i].getCanvas().removeEventListener('click');
        }
    }

    checkForSpecificResponseCardClick(handler, i) {
        this.getResponses()[i].getCanvas().addEventListener('click', () => handler(i));
    }

    checkForSpecificPlayerCardClick(handler, i) {
        this.getPlayerCards()[i].getCanvas().addEventListener('click', () => handler(i));
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