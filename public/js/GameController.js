'use strict'
import GameView from './GameView.js';

//const { response } = require("express");

//import { response } from "express";

//import { WebSocket } from "./ws.js";

//const socket = io();

//const model = new GameModel();

const waitingScreen = document.getElementById('waitingScreen');
const proxyInput = document.createElement('input');
setUpHiddenProxyInput();

const view = new GameView();

let clickedResponseCard = null;
let clickedPlayerCards = [];

let responseChoices = [];
let playerCardsIndexes = [];

//const ws = new WebSocket('ws://localhost:3000');
const ws = new WebSocket(`ws://${window.location.host}`);

let gameModeSelect = view.getGameModeCard();
let maxNumberOfPlayersSelect = view.getMaxNumberOfPlayersCard();
let lobbyPasswordInputField = view.getLobbyPasswordCard();
let startGameButton = view.getStartButtonCard();

let usernameInputField = view.getInputUsernameCard();
let joinLobbyPasswordInputField = view.getJoinLobbyInputPasswordCard();

function setUpHiddenProxyInput() {
    proxyInput.type = "text";
    proxyInput.style.position = "fixed";
    proxyInput.style.opacity = "0";
    proxyInput.style.left = "50%";
    proxyInput.style.top = "50%";
    proxyInput.style.transform = "translate(-50%, -50%)";
    proxyInput.style.fontSize = "16px";
    document.body.appendChild(proxyInput);
}

function removeHiddenProxyInput() {
    document.body.removeChild(proxyInput);
}

function openMobileKeyboard() {
    proxyInput.focus();
}

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

    lobbyPasswordInputField.getCanvas().addEventListener('click', passwordInputCardClicked);
    proxyInput.addEventListener('blur', passwordInputCardSubmit);
    
    startGameButton.getCanvas().addEventListener('click', startGame);
}

function removeLobbyOptionsEventListeners() {
    //gameModeSelect.getCanvas().removeEventListener();
    //maxNumberOfPlayersSelect.getCanvas().removeEventListener();

    lobbyPasswordInputField.getCanvas().removeEventListener('click', passwordInputCardClicked);
    proxyInput.removeEventListener('blur', passwordInputCardSubmit);
    proxyInput.value = "";

    startGameButton.getCanvas().removeEventListener('click', startGame);
}

function setInputUsernameCardEventListeners() {
    usernameInputField = view.getInputUsernameCard();
    usernameInputField.getCanvas().addEventListener('click', usernameInputCardClicked);
    proxyInput.addEventListener('blur', usernameInputCardSubmit);
}

function removeInputUsernameCardEventListeners() {
    usernameInputField.getCanvas().removeEventListener('click', usernameInputCardClicked);
    proxyInput.removeEventListener('blur', usernameInputCardSubmit);
}

function setInputPasswordCardEventListeners() {
    joinLobbyPasswordInputField = view.getJoinLobbyInputPasswordCard();
    joinLobbyPasswordInputField.getCanvas().addEventListener('click', joinLobbyPasswordInputCardClicked);
    proxyInput.addEventListener('blur', joinLobbyPasswordInputCardSubmit);
}

function removeInputPasswordCardEventListeners() {
    joinLobbyPasswordInputField.getCanvas().removeEventListener('click', joinLobbyPasswordInputCardClicked);
    proxyInput.removeEventListener('blur', joinLobbyPasswordInputCardSubmit);
}

function passwordInputCardClicked() {

    lobbyPasswordInputField.toggleOnCursorOverTime();
    proxyInput.focus();
    // lobbyPasswordInputField.getCanvas().addEventListener('keydown', handlePasswordInputKeyPress);
    // keydown event detects each individual key press and if a key is held down it will send multiple keydown events
    // input event detects when the value of an input element has changed, returns the entire value of the text
    // Still need a keydown event for the enter key to submit
    proxyInput.addEventListener('input', lobbyPasswordInputField.changeCardTextUsingInputEvent);
    proxyInput.addEventListener('keydown', checkForPasswordInputCardSubmit);

}

function passwordInputCardSubmit() {

    proxyInput.removeEventListener('keydown', checkForPasswordInputCardSubmit);
    proxyInput.removeEventListener('input', lobbyPasswordInputField.changeCardTextUsingInputEvent);
    lobbyPasswordInputField.toggleOffCursorOverTime();
    /*
    proxyInput.removeEventListener('blur', passwordInputCardSubmit);
    proxyInput.blur();
    proxyInput.addEventListener('blur', passwordInputCardSubmit);
    */
    // May need to blur the proxy input to close the mobile keyboard and remove the event listeners from the proxy input
    // I may also need to remove event listeners from the mobile input on this card specifically
    // since it stays and can be interacted with again
    //lobbyPasswordInputField.getCanvas().blur();
    ws.send(JSON.stringify({    "changeLobbyPassword": true,
                                "password": lobbyPasswordInputField.getCardText()
                            }));
    
}

function checkForPasswordInputCardSubmit(event) {

    if (event.key === 'Enter') {
        //passwordInputCardSubmit();
        // Doing it this way means I don't have to remove the event listeners from the proxy
        // input and can just blur it to trigger the submit function
        proxyInput.blur();
    }

}

//let handleUsernameInputKeyPress = null;

function usernameInputCardClicked() {

    usernameInputField.toggleOnCursorOverTime();
    proxyInput.focus();
    //usernameInputField.getCanvas().addEventListener('keydown', handleUsernameInputKeyPress);
    proxyInput.addEventListener('input', usernameInputField.changeCardTextUsingInputEvent);
    proxyInput.addEventListener('keydown', checkForUsernameInputCardSubmit);
    
}

function usernameInputCardSubmit() {

    proxyInput.removeEventListener('keydown', checkForUsernameInputCardSubmit);
    proxyInput.removeEventListener('input', usernameInputField.changeCardTextUsingInputEvent);
    usernameInputField.toggleOffCursorOverTime();
    removeInputUsernameCardEventListeners();
    proxyInput.blur();
    ws.send(JSON.stringify({ "username": usernameInputField.getCardText() }));
    console.log("Username sent: " + usernameInputField.getCardText());

    proxyInput.value = "";
    view.hideInputUsernameCard();

}

function checkForUsernameInputCardSubmit(event) {

    if (event.key === 'Enter') {
        usernameInputCardSubmit();
    }

}


//let handleJoinLobbyPasswordInputKeyPress = null;

function joinLobbyPasswordInputCardClicked() {

    joinLobbyPasswordInputField.toggleOnCursorOverTime();
    proxyInput.focus();
    //joinLobbyPasswordInputField.getCanvas().addEventListener('keydown', handleJoinLobbyPasswordInputKeyPress);
    proxyInput.addEventListener('input', joinLobbyPasswordInputField.changeCardTextUsingInputEvent);
    proxyInput.addEventListener('keydown', checkForJoinLobbyPasswordInputCardSubmit);

}

function joinLobbyPasswordInputCardSubmit() {

    proxyInput.removeEventListener('keydown', checkForJoinLobbyPasswordInputCardSubmit);
    proxyInput.removeEventListener('input', joinLobbyPasswordInputField.changeCardTextUsingInputEvent);
    joinLobbyPasswordInputField.toggleOffCursorOverTime();
    removeInputPasswordCardEventListeners();
    proxyInput.blur();
    ws.send(JSON.stringify({ "password": joinLobbyPasswordInputField.getCardText() }));
    console.log("Lobby password sent: " + joinLobbyPasswordInputField.getCardText());

    proxyInput.value = "";
    view.hideJoinLobbyInputPasswordCard();

}

function checkForJoinLobbyPasswordInputCardSubmit(event) {

    if (event.key === 'Enter') {
        joinLobbyPasswordInputCardSubmit();
    }

}

/*
function handleKeyPress(event, card) {
    if (event.key === 'Backspace') {
        console.log(card);
        card.removeLastCharFromCurrentCardText();
    } else if (event.key.length === 1) {
        card.addCharToCurrentCardText(event.key);
    }
}
    */

function handleKeyPressWithSubmission(event, card, submitFunction) {
    if (event.key === 'Backspace') {
        console.log(card);
        card.removeLastCharFromCurrentCardText();
    } else if (event.key === 'Enter') {
        submitFunction();
    } else if (event.key.length === 1) {
        card.addCharToCurrentCardText(event.key);
    }
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

        view.getPlayerCard(i).drawCard();
        clickedPlayerCards.splice(clickedPlayerCards.indexOf(i), 1);
        console.log("Clicked Player Cards: " + clickedPlayerCards);

    } else if (clickedPlayerCards.length < responsesAllowed) {
        // Outer (else) if statement checks if the player has already input the max number of cards for the response

        if (!clickedPlayerCards.includes(i)) {
            view.getPlayerCard(i).highlightCard();
            clickedPlayerCards.push(i);
            console.log("Clicked Player Cards: " + clickedPlayerCards);

            // Checks if this is a blank card
            if (view.getPlayerCard(i).isTextEditable()) {
                textInputCardClicked(view.getPlayerCard(i));
            }
        }

    }
}

let proxyInputBlurHandler = null;

function textInputCardClicked(card) {

    card.toggleOnCursorOverTime();
    proxyInput.focus();
    proxyInput.addEventListener('input', card.changeCardTextUsingInputEvent);
    proxyInput.addEventListener('keydown', checkForTextInputCardFinished);

    proxyInputBlurHandler = () => textInputFinished.bind(this, card);

    proxyInput.addEventListener('blur', proxyInputBlurHandler);

}

function checkForTextInputCardFinished(event) {

    if (event.key === 'Enter') {
        //textInputFinished(card);
        // Doing it this way means I don't have to remove the event listeners from the proxy
        // input and can just blur it to trigger the submit function
        proxyInput.blur();
    }

}

function textInputFinished(card) {

    /*
    proxyInput.removeEventListener('keydown', checkForUsernameInputCardSubmit);
    proxyInput.removeEventListener('input', usernameInputField.changeCardTextUsingInputEvent);
    */
    card.toggleOffCursorOverTime();
    proxyInput.removeEventListener('blur', proxyInputBlurHandler);
    console.log("Blank card set to: " + card.getCardText());

    proxyInput.value = "";
    proxyInputBlurHandler = null;
    
}

// Removes the event listeners and buttons for the cardZar and clears all previous input
function removeCardZarInput() {
    view.removeResponseCardClickListeners(responseCardClicked);
    view.removeSubmitButtonEventListener();
    view.removeSubmitButton();
    clickedResponseCard = null;
}

const playerCardListeners = [];

function addEventListenersToPlayerCards(numberOfCards) {
    // Have to store the annoymous functions in order to remove the event listeners

    for (let i = 0; i < view.getPlayerCards().length; i++) {
        const listener = () => playerCardClicked(i, numberOfCards);
        playerCardListeners.push(listener);
        view.getPlayerCard(i).getCanvas().addEventListener('click', listener);
    }
}

function removeEventListenersFromPlayerCards() {
        
    for (let i = 0; i < view.getPlayerCards().length; i++) {
        view.getPlayerCard(i).getCanvas().removeEventListener('click', playerCardListeners[i]);
    }

}

// Removes the event listeners and buttons for the player and clears all previous input
function removePlayerInput() {
    removeEventListenersFromPlayerCards();
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

        // Don't particularly like using an array for both indexes and raw text, but it works for now
        const clickedPlayerCardsIndexesAndBlankTexts = [];
        //const blankCardTexts = [];
        for (let i = 0; i < clickedPlayerCards.length; i++) {
            if (view.getPlayerCard(clickedPlayerCards[i]).isTextEditable()) {
                clickedPlayerCardsIndexesAndBlankTexts.push(view.getPlayerCard(clickedPlayerCards[i]).getCardText());
            } else {
                clickedPlayerCardsIndexesAndBlankTexts.push(playerCardsIndexes[clickedPlayerCards[i]]);
            }
        }

        sendPlayerCards({ "chosenPlayerCards": clickedPlayerCardsIndexesAndBlankTexts });

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

        /*
        const username = prompt("Please enter your username:");
        ws.send(JSON.stringify({ "username": username }));
        console.log("Username sent: " + username);
        */

        view.displayInputUsernameCard();
        setInputUsernameCardEventListeners();

    } else if (parsedData["invalidUsername"]) {
        console.log(parsedData["invalidUsername"]);

        // Prompts the player to enter a valid username and sends it to the server

        /*
        const username = prompt("Invalid username, please enter a valid username:");
        ws.send(JSON.stringify({ "username": username }));
        console.log("Username sent: " + username);
        */

        view.displayInvalidUsernameInputCard();
        setInputUsernameCardEventListeners();

    } else if (parsedData["requestAuthentication"]) {

        // Prompts the player to enter the lobby password and sends it to the server

        /*
        const password = prompt("Please enter the lobby password:");
        ws.send(JSON.stringify({ "password": password }));
        console.log("Lobby password sent: " + password);
        */

        view.displayJoinLobbyInputPasswordCard();
        setInputPasswordCardEventListeners();

    } else if (parsedData["authenticationFailed"]) {

        // Prompts the player to enter a valid lobby password and sends it to the server

        /*
        const password = prompt("Invalid lobby password, please enter a valid lobby password:");
        ws.send(JSON.stringify({ "password": password }));
        console.log("Lobby password sent: " + password);
        */

        view.displayInvalidPasswordInputCard();
        setInputPasswordCardEventListeners();

    } else if (parsedData["authenticationCompleteFailure"]) {

        // Prompts the player to enter a valid lobby password and sends it to the server
        alert("Too many failed attempts, you have been disconnected from the server.");
        console.log(parsedData["error"]);

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
            addEventListenersToPlayerCards(parsedData["numberOfResponseCardsAllowed"]);
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
        console.log("Unknown message received from server");
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

function updatePageBasedOnGameStateData() {

}