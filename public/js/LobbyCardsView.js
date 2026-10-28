'use strict';
import ViewCard from './ViewCard.js';

export default class LobbyCardsView {
    constructor() {
        this.lobbyData;
        this.mainCanvas = document.getElementById('main');
        // Checking for canvas support
        if (this.mainCanvas.getContext) {
            this.mainCanvas.remove();
        }

        this.cardWidth = 1000;
        this.cardHeight = 700;

        this.lobbyCardsDiv = document.getElementById('lobbies');

        this.lobbyCards = [];

        this.createLobbyCard = new ViewCard("black", "Create Lobby", this.cardWidth, this.cardHeight, this.lobbyCardsDiv);
        this.createLobbyCard.drawCard();
        //this.displayAllLobbyCards();

        //this.testCard2 = new ViewCard("white", "Cards Against Humanity", this.cardWidth, this.cardHeight, this.responsesDiv);
    }

    setLobbyData(lobbyData) {
        this.lobbyData = lobbyData;
    }

    getLobbyData() {
        return this.lobbyData;
    }

    getLobbyCards() {
        return this.lobbyCards;
    }

    getCreateLobbyCard() {
        return this.createLobbyCard;
    }

    displayAllLobbyCards() {

        let cardText = "";
        // Display lobby choices
        for (let i = 0; i < this.lobbyData.length; i++) {
            cardText =  this.lobbyData[i]["lobbyOwnerName"] + "'s Lobby \n Game Mode: " +
                        this.lobbyData[i]["gameMode"] + " \n Max Number of Players: " +
                        this.lobbyData[i]["maxNumberOfPlayers"] +
                        " \n " + (this.lobbyData[i]["password"] ? "Password Required " : "") + " \n";
            this.lobbyCards[i] = new ViewCard("white", cardText, this.cardWidth, this.cardHeight, this.lobbyCardsDiv);
            this.lobbyCards[i].drawCard();
        }
    }

    checkForLobbyCardClick(handler) {
        for (let i = 0; i < this.lobbyCards.length; i++) {
            this.lobbyCards[i].getCanvas().addEventListener('click', () => handler(i));
        }
    }

    checkForCreateLobbyCardClick(handler) {
        this.createLobbyCard.getCanvas().addEventListener('click', () => handler());
    }
}