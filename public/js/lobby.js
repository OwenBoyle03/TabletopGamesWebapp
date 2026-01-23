'use strict'

async function checkForGameStart() {
    const response = await fetch('/api/checkForGameStart');
    //console.log(data);
    let res = await response;

    if (res === 400) {
        console.log("Stuffs bad");
    }

    return res;
    //fetch('/api/lobbiesAvailable').then(res => res.json()).then()
}

function setupGamePage() {

}

let gameStart = false;

while (!gameStart) {
    setTimeout(() => {
        gameStart = checkForGameStart();
    }, 10000);
}

function gameLoop() {
    while(true) {

    }
}