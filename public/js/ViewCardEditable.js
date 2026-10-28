'use strict'
import ViewCard from './ViewCard.js';

export default class ViewCardEditable extends ViewCard {
    constructor(colour, text, width, height, nodeToConnectTo, textScale = 0.09) {
        super(colour, text, width, height, nodeToConnectTo, textScale);

        this.cursorDisplayed = false;
        this.cursorTimer = null;

        // This is needed to make the canvas focusable so that it can receive keyboard events
        this.canvas.setAttribute('tabindex', '-1');

    }

    isTextEditable() {
        return true;
    }

    addCharToCurrentCardText(char) {
        this.text += char;
        this.drawCard();
    }

    removeLastCharFromCurrentCardText() {
        this.text = this.text.substring(0, this.text.length - 1);
        this.drawCard();
    }

    displayCursorAtEndOfCardText() {
        this.cursorDisplayed = true;
        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);
        this.wrapSpecificTextToCard(this.text + "|");
    }

    removeCursorFromCardText() {
        /*
        if (this.text.endsWith("|")) {
            this.removeLastCharFromCurrentCardText();
        }
        */
        this.cursorDisplayed = false;
        this.drawCard();
    }

    hasCursorAtEndOfCardText() {
        return this.cursorDisplayed;
    }

    toggleOnCursorOverTime() {
        this.cursorTimer = setInterval(() => {
            if (this.hasCursorAtEndOfCardText()) {
                this.removeCursorFromCardText();
            } else {
                this.displayCursorAtEndOfCardText();
            }
        }, 500);
    }

    toggleOffCursorOverTime() {
        if (this.cursorTimer) {
            clearInterval(this.cursorTimer);
            this.cursorTimer = null;
            this.removeCursorFromCardText();
        }
    }

}