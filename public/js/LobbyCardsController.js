'use strict'
import LobbyCardsView from './LobbyCardsView.js';

async function getLobbies() {
    const response = await fetch('/api/lobbiesAvailable');
    //console.log(data);
    return await response.json();
    //fetch('/api/lobbiesAvailable').then(res => res.json()).then()
}

/*
const params = new URLSearchParams(window.location.search);
const username = params.get('username');
*/

const view = new LobbyCardsView();
view.checkForCreateLobbyCardClick(createLobbyCardClicked);

getLobbies().then(data => { view.setLobbyData(data);
                            view.displayAllLobbyCards();
                            view.checkForLobbyCardClick(lobbyCardClicked);});


function createLobbyCardClicked() {
    window.location.href = '/createLobby';
}

const joinLobbyForm = document.getElementById('joinLobbyForm');
const lobbyIdInput = document.getElementById('lobbyIdInput');

function lobbyCardClicked(i) {
    const lobbyDetails = view.getLobbyData()[i];
    lobbyIdInput.value = lobbyDetails["lobbyId"];
    joinLobbyForm.submit();
}