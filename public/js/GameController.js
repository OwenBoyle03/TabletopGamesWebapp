'use strict'
import { WebSocket } from "ws";

//const socket = io();

//const model = new GameModel();

const waitingScreen = document.getElementById('waitingScreen');

const view = new GameView();

let clickedResponseCards = [];
let clickedPlayerCards = [];

const ws = new WebSocket('ws://localhost:3000');

/*
view.checkForResponseCardClick(responseCardClicked);

view.checkForPlayerCardClick(playerCardClicked);
*/

async function checkForGameStart() {
    const response = await fetch('/api/checkForGameStart');
    //console.log(data);
    let gameStart = await response.json();

    if (gameStart === 400) {
        console.log("Stuffs bad");
        return "Stuff not found";
    }

    console.log(gameStart["gameStarted"]);
    if (gameStart["gameStarted"]) {
        getGameInformation().then( (gameStateData) => {
            setupGamePage(gameStateData);
            gameLoop(gameStateData);
            console.log('Game has started');
            //return gameStart;
        });
        return gameStart;
    } else {
        return checkForGameStart();
    }

    //return await res.json();
    //fetch('/api/lobbiesAvailable').then(res => res.json()).then()
}

async function getGameInformation() {
    const response = await fetch('/api/getGameInformation');
    return await response.json();
}

const submitForm = document.getElementById('submitForm');
const submitCardsInput = document.getElementById('submitCardsInput');
const submitButton = document.getElementById('submitButton');

async function sendSelectedCardsAndRemoveSubmitEventListener() {

    submitButton.removeEventListener('click', sendSelectedCardsAndRemoveSubmitEventListener);
    submitCardsInput.value = clickedResponseCards + clickedPlayerCards;
    submitForm.submit();

}

function responseCardClicked(i) {
    if (clickedResponseCards.includes(i)) {
        view.getResponses()[i].drawCard();
        clickedResponseCards.splice(clickedResponseCards.indexOf(i), 1);
        console.log("Clicked Response Cards: " + clickedResponseCards);
    } else {
        view.getResponses()[i].highlightCard();
        clickedResponseCards.push(i);
        console.log("Clicked Response Cards: " + clickedResponseCards);
    }
}

function playerCardClicked(i) {
    if (clickedPlayerCards.includes(i)) {
        view.getPlayerCards()[i].drawCard();
        clickedPlayerCards.splice(clickedPlayerCards.indexOf(i), 1);
        console.log("Clicked Player Cards: " + clickedPlayerCards);
    } else {
        view.getPlayerCards()[i].highlightCard();
        clickedPlayerCards.push(i);
        console.log("Clicked Player Cards: " + clickedPlayerCards);
    }
}

function setupGamePage(gameStateData) {
    // Remove the waiting text and display the UI and set the eventListeners for the cards
    waitingScreen.style.display = 'none';
    submitButton.style.visibility = 'visible';
    view.setBlackCardText(gameStateData["blackCard"]);
    view.setResponses(gameStateData["responses"]);
    view.setPlayerCards(gameStateData["playerCards"]);
    view.displayAllCards();
}

function newRoundSetup(gameStateData) {
    view.setBlackCardText(gameStateData["blackCard"]);
    view.setResponses(gameStateData["responses"]);
    view.addPlayerCard(gameStateData["playerCards"]);
    view.displayAllCards();
}

async function waitForGameContinue() {
    const response = await fetch('/api/waitForGameContinue');
    let data = await response.json();

    if (data === 400) {
        console.log("Stuffs bad in waitForGameContinue");
        return "Stuffs bad in waitForGameContinue";
    }

    if (data["continue"]) {
        return true;
    } else {
        return await waitForGameContinue();
    }
}

async function getNewGameStateAndDisplayResponseCards() {
    const serverResponse = await getGameInformation();

    const gameStateData = await serverResponse.json();

    view.setResponses(gameStateData["responses"]);
    view.displayAllCards();

    return gameStateData;
}

checkForGameStart();

async function gameLoop(gameStateData) {
    let gameOngoing = true;
    while (gameOngoing) {

        if (gameStateData["cardCzar"]) {
            view.removePlayerCardClickListeners();

            await waitForGameContinue();

            gameStateData = await getNewGameStateAndDisplayResponseCards();

            view.checkForResponseCardClick(responseCardClicked);
            submitButton.addEventListener('click', sendSelectedCardsAndRemoveSubmitEventListener);

            await waitForGameContinue();

            view.removeResponseCardClickListeners();

        } else {
            view.removeResponseCardClickListeners();
            view.checkForPlayerCardClick(playerCardClicked);
            submitButton.addEventListener('click', sendSelectedCardsAndRemoveSubmitEventListener);

            await waitForGameContinue();

            view.removePlayerCardClickListeners();

            gameStateData = await getNewGameStateAndDisplayResponseCards();

            await waitForGameContinue();

            gameStateData = await getNewGameStateAndDisplayResponseCards();

            //console.log(gameStateData);

        }

    }
}

ws.on('error', console.error);

ws.on('open', function open() {
    ws.send('something');
});

ws.on('message', function message(data) {
    console.log('Received: %s', data);
});

ws.on('close', function close() {

});