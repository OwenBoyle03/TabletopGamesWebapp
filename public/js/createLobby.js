'use strict'

const lobbyForm = document.getElementById('changeLobbyForm');
const startGameButton = document.getElementById('startGameButton');

async function setLobbyDetails(formData) {
    const response = await fetch('/api/setLobbyDetails', { method: "POST", body: formData });
    //console.log(data);
    //return await response.json();
    return await response.text();
    //fetch('/api/lobbiesAvailable').then(res => res.json()).then()
}

lobbyForm.addEventListener('submit', (e) =>
    {   e.preventDefault();
        const formData = new FormData(lobbyForm);
        setLobbyDetails(formData).then(data => { console.log(data);})
    });

const params = new URLSearchParams(window.location.search);
const username = params.get('username');