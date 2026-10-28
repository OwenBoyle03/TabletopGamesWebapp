'use strict'
import GameView from './GameView.js';

//const { response } = require("express");

//import { response } from "express";

//import { WebSocket } from "./ws.js";

//const socket = io();

//const model = new GameModel();

const waitingScreen = document.getElementById('waitingScreen');

const view = new GameView();

let clickedResponseCard = null;
let clickedPlayerCards = [];

let responseChoices = [];
let playerCardsIndexes = [];

const ws = new WebSocket('ws://localhost:3000');

let gameModeSelect = view.getGameModeCard();
let maxNumberOfPlayersSelect = view.getMaxNumberOfPlayersCard();
let lobbyPasswordInputField = view.getLobbyPasswordCard();
let startGameButton = view.getStartButtonCard();

function setPlayerCardsIndexes(playerCards) {
    playerCardsIndexes = [];
    for (let i = 0; i < playerCards.length; i++) {
        playerCardsIndexes.push(playerCards[i][1]);
    }
    console.log("Player cards indexes: " + playerCardsIndexes);
}

function addPlayerCardsIndexes(newPlayerCards) {
    for (let i = 0; i < newPlayerCards.length; i++) {
        playerCardsIndexes.push(newPlayerCards[i][1]);
    }
    console.log("Player cards indexes: " + playerCardsIndexes);
}

function setLobbyOptionsEventListeners() {
    gameModeSelect = view.getGameModeCard();
    maxNumberOfPlayersSelect = view.getMaxNumberOfPlayersCard();
    lobbyPasswordInputField = view.getLobbyPasswordCard();
    startGameButton = view.getStartButtonCard();
    
    gameModeSelect.getCanvas().addEventListener('click', changeLobbySettings);
    maxNumberOfPlayersSelect.getCanvas().addEventListener('click', changeLobbySettings);

    lobbyPasswordInputField.getCanvas().addEventListener('focus', passwordInputCardFocused);
    lobbyPasswordInputField.getCanvas().addEventListener('blur', passwordInputCardBlurred);
    
    startGameButton.getCanvas().addEventListener('click', startGame);
}

function removeLobbyOptionsEventListeners() {
    //gameModeSelect.getCanvas().removeEventListener();
    //maxNumberOfPlayersSelect.getCanvas().removeEventListener();

    lobbyPasswordInputField.getCanvas().removeEventListener('focus', passwordInputCardFocused);
    lobbyPasswordInputField.getCanvas().removeEventListener('blur', passwordInputCardBlurred);

    startGameButton.getCanvas().removeEventListener('click', startGame);
}

function textInputCardFocused(card) {
    card.toggleOnCursorOverTime();
    card.getCanvas().addEventListener('keydown', handleKeyPress);
}

function textInputCardBlurred(card) {
    card.toggleOffCursorOverTime();
    card.getCanvas().removeEventListener('keydown', handleKeyPress);
}

function passwordInputCardFocused() {
    lobbyPasswordInputField.toggleOnCursorOverTime();
    lobbyPasswordInputField.getCanvas().addEventListener('keydown', handlePasswordInputKeyPress);
}

function passwordInputCardBlurred() {
    lobbyPasswordInputField.toggleOffCursorOverTime();
    lobbyPasswordInputField.getCanvas().removeEventListener('keydown', handlePasswordInputKeyPress);
    ws.send(JSON.stringify({ "changeLobbyPassword": lobbyPasswordInputField.getCardText() }));
}

function changeLobbySettings() {
    const selectedGameMode = gameModeSelect.value;
    const selectedMaxNumberOfPlayers = maxNumberOfPlayersSelect.value;
    const lobbyPassword = lobbyPasswordInputField.getCardText();
    const lobbySettings = {
        gameMode: selectedGameMode,
        maxNumberOfPlayers: selectedMaxNumberOfPlayers,
        lobbyPassword: lobbyPassword
    };
    ws.send(JSON.stringify(lobbySettings));
    console.log("Lobby settings sent: " + JSON.stringify(lobbySettings));
}

function startGame() {
    //startGameButton.removeEventListener('click', startGame);
    console.log("Start Game button clicked");
    removeLobbyOptionsEventListeners();
    ws.send(JSON.stringify({ "startGame": true }));
    view.hideLobbyOwnerOptionsUI();
    view.displayWaitingScreen();
}

function responseCardClicked(i) {
    if (clickedResponseCard === i) {
        
        view.getResponses()[i].drawCard();
        clickedResponseCard = null;
        console.log("Clicked Response Cards: " + clickedResponseCard);

    } else if (clickedResponseCard !== null) {

        view.getResponses()[clickedResponseCard].drawCard();
        view.getResponses()[i].highlightCard();
        clickedResponseCard = i;
        console.log("Clicked Response Cards: " + clickedResponseCard);

    } else {
    
        view.getResponses()[i].highlightCard();
        clickedResponseCard = i;
        console.log("Clicked Response Cards: " + clickedResponseCard);

    }
}

function playerCardClicked(i, responsesAllowed) {
    console.log("Player card clicked: " + i);

    if (clickedPlayerCards.includes(i)) {

        view.getPlayerCards()[i].drawCard();
        clickedPlayerCards.splice(clickedPlayerCards.indexOf(i), 1);
        console.log("Clicked Player Cards: " + clickedPlayerCards);

    } else if (clickedPlayerCards.length < responsesAllowed) {
        // Outer (else) if statement checks if the player has already input the max number of cards for the response

        if (!clickedPlayerCards.includes(i)) {
            view.getPlayerCards()[i].highlightCard();
            clickedPlayerCards.push(i);
            console.log("Clicked Player Cards: " + clickedPlayerCards);
        }

    }
}

// Removes the event listeners and buttons for the cardZar and clears all previous input
function removeCardZarInput() {
    view.removeResponseCardClickListeners(responseCardClicked);
    view.removeSubmitButtonEventListener();
    view.removeSubmitButton();
    clickedResponseCard = null;
}

// Removes the event listeners and buttons for the player and clears all previous input
function removePlayerInput() {
    view.removeRelevantEventListenerFromPlayerCards();
    view.removeSubmitButtonEventListener();
    view.removeSubmitButton();

    // Sorts the clicked player cards in descending order so they can be spliced out of the
    // playerCardsIndexes array correctly if theres multiple cards
    clickedPlayerCards.sort((a, b) => b - a);

    // Clears any clicked player cards from view and removes them from the players hand
    for (let i = 0; i < clickedPlayerCards.length; i++) {
        view.removePlayerCard(clickedPlayerCards[i]);
        playerCardsIndexes.splice(clickedPlayerCards[i], 1);
        //console.log("Removing player card: " + clickedPlayerCards[i]);
    }

    clickedPlayerCards = [];
}

function cardZarSubmit() {
    if (clickedResponseCard !== null) {
        sendCardZarChoice({ "chosenResponseCardIndex": clickedResponseCard,
                            "chosenResponseCardOwner": responseChoices[clickedResponseCard]["playerUuid"]
        });
        removeCardZarInput();
    }
}

function playerSubmit(responsesAllowed) {

    if (clickedPlayerCards.length === responsesAllowed) {

        const clickedPlayerCardsIndexes = [];
        for (let i = 0; i < clickedPlayerCards.length; i++) {
            clickedPlayerCardsIndexes.push(playerCardsIndexes[clickedPlayerCards[i]]);
        }

        sendPlayerCards({ "chosenPlayerCards": clickedPlayerCardsIndexes });

        removePlayerInput();

    }

}

ws.addEventListener('open', function open() {
    setWebSocketEventListeners();
});

function sendPlayerCards(clickedPlayerCards) {
    //console.log("Player cards indexes to send: " + clickedPlayerCards["chosenPlayerCards"]);
    //console.log("Response choices: " + JSON.stringify(responseChoices));
    //console.log("Player cards indexes: " + JSON.stringify(playerCardsIndexes));
    //console.log("Sending player cards: " + JSON.stringify(clickedPlayerCards));
    ws.send(JSON.stringify(clickedPlayerCards));
}

function sendCardZarChoice(clickedResponseCard) {
    ws.send(JSON.stringify(clickedResponseCard));
}

function refillPlayerCards() {
    ws.send(JSON.stringify({ "getWhiteCard": true, "numberOfCards": (10-(playerCardsIndexes.length)) }));
}

function setWebSocketEventListeners() {
    /*
    ws.addEventListener('message', function message(data) {
        console.log('Received: %s', data);
    });
     */

    ws.addEventListener('message', webSocketMessageHandler);

    //ws.send(JSON.stringify({"message": "Connection successful, hello from the game!"}));
}

function webSocketMessageHandler(event) {
    let parsedData = JSON.parse(event.data);
    console.log('Received: ');
    console.log(parsedData);

    if (parsedData["setUsername"]) {

        // Sets the username for the player and sends it to the server
        const username = prompt("Please enter your username:");
        ws.send(JSON.stringify({ "username": username }));
        console.log("Username sent: " + username);

    } else if (parsedData["invalidUsername"]) {
        console.log(parsedData["invalidUsername"]);

        // Prompts the player to enter a valid username and sends it to the server
        const username = prompt("Invalid username, please enter a valid username:");
        ws.send(JSON.stringify({ "username": username }));
        console.log("Username sent: " + username);

    } else if (parsedData["inputPassword"]) {

        // Prompts the player to enter the lobby password and sends it to the server
        const password = prompt("Please enter the lobby password:");
        ws.send(JSON.stringify({ "lobbyPassword": password }));
        console.log("Lobby password sent: " + password);

    } else if (parsedData["invalidPassword"]) {

        // Prompts the player to enter a valid lobby password and sends it to the server
        const password = prompt("Invalid lobby password, please enter a valid lobby password:");
        ws.send(JSON.stringify({ "lobbyPassword": password }));
        console.log("Lobby password sent: " + password);

    } else if (parsedData["firstContact"] && parsedData["isLobbyOwner"]) {
        // Shows the lobby owner options UI and sets the event listeners for the options

        view.displayLobbyOwnerOptionsUI();
        setLobbyOptionsEventListeners();
        view.addPlayerScoreCard(parsedData["playersNames"][0], 0);
        console.log("You are the lobby owner");
        
    } else if (parsedData["firstContact"] && parsedData["isLobbyOwner"] === false) {
        // Shows the waiting screen for non lobby owners while the lobby owner is setting up the game
        // and sets the current players

        view.displayWaitingScreen();
        view.addMultiplePlayerScoreCards(parsedData["playersNames"]);
        console.log("You are not the lobby owner");

    } else if (parsedData["gameStarted"]) {
        // Sets up the game page with the game state data received from the server

        view.resetPlayerScoreCards();
        view.hideWaitingScreen();
        view.createBlackCard();
        /*playerCards = parsedData["deck"];
        view.setPlayerCards(playerCards);*/
        setPlayerCardsIndexes(parsedData["deck"]);
        view.setPlayerCards(parsedData["deck"]);
        view.displayAllPlayersChoiceCards();
        console.log("Game has started");

    } else if (parsedData["newRound"]) { 
        // Sets up the game page for a new round with the game state data received from the server

        // Sets the black card text
        view.setBlackCardText(parsedData["blackCard"]);
        console.log(parsedData["blackCard"]);

        // Removes old response cards from previous round
        view.removeAllResponseCards();
        view.clearResponseCardDiv();

        // Will need to add code here to reset the players score cards and to update them with the
        // new cardZar for the round, and to reset anything done for a round win graphically
        view.reDrawAllPlayerScoreCards();
        view.getPlayerScoreCardByIndex(parsedData["cardZarIndex"]).displayCardZarIndicator();

        // Sets event listeners for the player's cards and shows the submit button if they're not the
        // cardZar and changes the players score cards to show who the cardZar is
        if (parsedData["isCardZar"]) {
            //view.setCardZar("");
        } else {
            //view.setCardZar(parsedData["cardZar"]);
            view.addRelevantEventListenerToPlayerCards(playerCardClicked, handleKeyPress, parsedData["numberOfResponseCardsAllowed"]);
            view.addSubmitButton();
            view.addSubmitButtonEventListener(playerSubmit.bind(this, parsedData["numberOfResponseCardsAllowed"]));
        }

        // Start the timer
        if (timer) {
            clearInterval(timer);
            timer = null;
            view.hideTurnTimer();
        }
        turnTimer(parsedData["endOfTurnTimer"]);

    } else if (parsedData["cardZarsTurn"]) { 
        //console.log(parsedData["whiteCardResponses"]);
        
        // This includes the indexes of the response cards so I'll have to remove them
        // from the data before setting the response cards text
        responseChoices = parsedData["whiteCardResponses"];
        console.log("Response choices: ");
        console.log(responseChoices);
        view.changeAllResponseCardsText(responseChoices);

        if (parsedData["isCardZar"]) {
            view.checkForResponseCardClick(responseCardClicked);
            view.addSubmitButton();
            view.addSubmitButtonEventListener(cardZarSubmit);
        } else {
            removePlayerInput();
        }

        // Start the timer
        if (timer) {
            clearInterval(timer);
            timer = null;
            view.hideTurnTimer();
        }
        turnTimer(parsedData["endOfTurnTimer"]);

    } else if (parsedData["roundWinner"]) {
        console.log("Round Winner");

        if (parsedData["isCardZar"]) {
            removeCardZarInput();
        } else {
            refillPlayerCards();
        }

        // Need to display round winner and update scores here before the new round starts
        console.log("Index: %s", parsedData["winningResponse"]["chosenResponseCardIndex"]);
        if (parsedData["winningResponse"]["chosenResponseCardIndex"] !== null) {
            view.getResponses()[parsedData["winningResponse"]["chosenResponseCardIndex"]].highlightCard();
        }
        // Add something below to highlight winners player score card
        view.changePlayerScoreCard(parsedData["winnerIndex"], parsedData["winnersName"], parsedData["winnersScore"]);
        view.getPlayerScoreCardByIndex(parsedData["winnerIndex"]).highlightCard();

    } else if (parsedData["gameWinner"]) {
        console.log("Game Winner");

        if (parsedData["isCardZar"]) {
            removeCardZarInput();
        }

        // Add code here to display waiting screen and owner options after winner displayed
        //view.hideBlackCard();
        view.destroyBlackCard();
        view.removeAllPlayerCards();
        view.removeAllResponseCards();
        view.clearResponseCardDiv();
        //view.hideTurnTimer();
        view.showGameWinnerScreen(parsedData["winner"]);
        setTimeout( () => { view.hideGameWinnerScreen(); }, 5000);

        if (parsedData["isLobbyOwner"]) {
            setTimeout( () => {
                view.displayLobbyOwnerOptionsUI();
                setLobbyOptionsEventListeners();
            }, 5000);
        } else {
            setTimeout( () => { view.displayWaitingScreen(); }, 5000);
        }

    } else if (parsedData["endTurnTimerEarly"]) {
        // Clears the turn timer if the turn ended early

        if (timer) {
            clearInterval(timer);
            timer = null;
            view.hideTurnTimer();
        }

    } else if (parsedData["responseCardReceived"]) {
        // Handles the case when a response has been submitted by another player

        if (parsedData["numberOfResponseCards"] > 1) {
            view.addMultipleBlankResponseCardsFromOnePlayer(parsedData["numberOfResponseCards"]);
        } else {
            view.addResponseCard("");
        }

    } else if (parsedData["newPlayerCard(s)"]) {
        // Handles the case when the player receives new cards for their hand
        addPlayerCardsIndexes(parsedData["newPlayerCard(s)"]);
        view.addPlayerCards(parsedData["newPlayerCard(s)"]);

    } else if (parsedData["playerJoined"]) {

        view.addPlayerScoreCard(parsedData["playerName"], 0);

    } else if (parsedData["playerLeft"]) {

        view.removePlayerScoreCard(parsedData["playerName"]);

    } else if (parsedData["ping"]) {

        console.log("Ping received from server");
        ws.send(JSON.stringify({ "pong": true }));

    } else if (parsedData["blackCard"]) {
        // Displays the black card
        // May not be necessary so commented out for now

        /*
        console.log(parsedData["blackCard"]);
        view.setBlackCardText(parsedData["blackCard"]);
            */

    } else if (parsedData["endOfTurnTimer"]) {
        // Displays the turn timer and starts counting down
        // May not be necessary so commented out for now

        /*
        console.log(parsedData["endOfTurnTimer"]);
        // To make sure that there isn't multiple timers running at once by clearing the previous timer
        // if there is one before starting a new one
        if (timer) {
            clearInterval(timer);
            timer = null;
            view.hideTurnTimer();
        }
        turnTimer(parsedData["endOfTurnTimer"]);
            */

    } else {
        console.log(parsedData);
        //view.displayWaitingScreen();
        //console.log("You are not the lobby owner");
        //view.displayGameUI();
    }
}

let timer = null;

function turnTimer(endOfTurnTimer) {
    view.displayTurnTimer(Math.ceil((endOfTurnTimer - Date.now()) / 1000));
    timer = setInterval(() => {
        const timeRemaining = endOfTurnTimer - Date.now();
        if (timeRemaining <= 0) {
            clearInterval(timer);
            view.hideTurnTimer();
            timer = null;
            console.log("Turn timer ended");
        } else {
            view.updateTurnTimer(Math.ceil(timeRemaining / 1000));
        }
    }, 1000);

    //setTimeout(endTurnTimer, Date.now() - endOfTurnTimer);
}

function handleKeyPress(event, card) {
    if (event.key === 'Backspace') {
        console.log(card);
        card.removeLastCharFromCurrentCardText();
    } else if (event.key.length === 1) {
        card.addCharToCurrentCardText(event.key);
    }
}

function handlePasswordInputKeyPress(event) {
    handleKeyPress(event, lobbyPasswordInputField);
}
/*
let cursorTimer = null;

/*
function toggleOnCursorOverTime(card) {
    cursorTimer = setInterval(() => {
        if (card.hasCursorAtEndOfCardText()) {
            card.removeCursorFromCardText();
        } else {
            card.displayCursorAtEndOfCardText();
        }
    }, 500);
}

function toggleOffCursorOverTime(card) {
    if (cursorTimer) {
        clearInterval(cursorTimer);
        cursorTimer = null;
        card.removeCursorFromCardText();
    }
}
    */

/*
function endTurnTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
*/

function updatePageBasedOnGameStateData() {

}