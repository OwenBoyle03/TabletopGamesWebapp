'use strict'

const mainDiv = document.getElementById('main');
const playerCardsDiv = document.getElementById('playerCards');
//const timerAndSubmitButtonDiv = document.getElementById('timerAndSubmitButton');
//const turnTimerDiv = document.getElementById('turnTimer');
const submitButtonDiv = document.getElementById('submitButton');

const view = new GameView();

const testCard = new ViewCard('white', 'This is a test card. ', 500, 700, playerCardsDiv);
testCard.drawCard();

testCard.getCanvas().addEventListener('focus', () => {
    //testCard.addCharToCurrentCardText('a');
    //testCard.getCanvas().focus();
    toggleOnCursorOverTime();
    testCard.getCanvas().addEventListener('keydown', handleKeyPress);
});

testCard.getCanvas().addEventListener('blur', () => {
    toggleOffCursorOverTime();
    testCard.getCanvas().removeEventListener('keydown', handleKeyPress);
});

function handleKeyPress(event) {
    if (event.key === 'Backspace') {
        testCard.removeLastCharFromCurrentCardText();
    } else if (event.key.length === 1) {
        testCard.addCharToCurrentCardText(event.key);
    }
}

// Added to ViewCard

let cursorTimer = null;

function toggleOnCursorOverTime() {
    cursorTimer = setInterval(() => {
        if (testCard.hasCursorAtEndOfCardText()) {
            testCard.removeCursorFromCardText();
        } else {
            testCard.displayCursorAtEndOfCardText();
        }
    }, 500);
}

function toggleOffCursorOverTime() {
    if (cursorTimer) {
        clearInterval(cursorTimer);
        cursorTimer = null;
        testCard.removeCursorFromCardText();
    }
}

/*

addCharToCurrentCardText(char) {
        this.text += char;
        this.drawCard();
    }

    removeLastCharFromCurrentCardText() {
        // Pretty sure this should be -2
        this.text = this.text.substring(0, this.text.length - 1);
        this.drawCard();
    }

    displayCursorAtEndOfCardText() {
        this.text += "|";
        this.drawCard();
    }

    removeCursorFromCardText() {
        if (this.text.endsWith("|")) {
            this.removeLastCharFromCurrentCardText();
        }
        this.drawCard();
    }

*/