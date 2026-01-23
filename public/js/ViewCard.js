'use strict'

class ViewCard {
    constructor(colour, text, width, height, nodeToConnectTo) {
        this.colour = colour;
        this.text = text;
        this.width = width;
        this.height = height;
        this.cardRadius = height * 0.036;

        this.textColour = 'black';
        if (this.colour === 'black') {
            this.textColour = 'white';
        }

        this.canvas = document.createElement('canvas');
        //this.canvas.setAttribute('id', 'cardCanvas');
        this.canvas.setAttribute('width', ('' + width));
        this.canvas.setAttribute('height', ('' + height));
        this.context = this.canvas.getContext('2d');

        nodeToConnectTo.appendChild(this.canvas);

        //this.drawCard();
    }

    getCanvas() {
        return this.canvas;
    }

    getText() {
        return this.text;
    }

    setText(text) {
        this.text = text;
    }

    changeCardText(text) {
        this.text = text;
        this.drawCard();
    }

    drawCard() {

        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);

        this.wrapTextToCard(this.text, this.width);

        /*
        this.context.font = "" + (this.height * 0.05) + "px Arial";
        this.context.fillStyle = '#000000';
        this.context.fillText(this.text, (this.width * 0.05), (this.height * 0.9));
        this.context.fillStyle = '#d18c47';
         */

        //console.log("Card has been drawn");
    }

    drawRoundedRectangleWithoutFill(colour, topLeftX, topLeftY, height, width, cornerRadius) {

        // Draws card
        this.context.beginPath();

        // Where the arc begins
        this.context.moveTo(cornerRadius, topLeftY);

        // X1 Y1 is the corner being cut to make the arc
        // X2 Y2 is where the arc ends
        // You can guess what the radius does
        this.context.arcTo(topLeftX, topLeftY, topLeftX, cornerRadius, cornerRadius);
        this.context.lineTo(topLeftX, (height - cornerRadius));
        this.context.arcTo(topLeftX, height, cornerRadius, height, cornerRadius);
        this.context.lineTo((width - cornerRadius), height);
        this.context.arcTo(width, height, width, (height - cornerRadius), cornerRadius);
        this.context.lineTo(width, cornerRadius);
        this.context.arcTo(width, topLeftY, (width - cornerRadius), topLeftY, cornerRadius);
        this.context.lineTo(cornerRadius, topLeftY);
        this.context.closePath();
    }

    drawRoundedRectangle(colour, height, width, cornerRadius) {
        this.context.fillStyle = colour;

        this.drawRoundedRectangleWithoutFill(colour, 0, 0, height, width, cornerRadius);

        this.context.fill();
    }

    wrapTextToCard() {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * 0.09) + "px Arial";

        // Sets the position from which text is positioned
        this.context.textBaseline = "top";

        this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, (this.width - (this.width * 0.97)), (this.height - (this.height * 0.98)), (this.width * 0.97));

        const words = this.text.split(' ');
        let line = '';
        let textY = (this.height - (this.height * 0.98));

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.context.measureText(testLine);
            const testWidth = metrics.width;

            if (words[i] === "\n") {
                this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
                line = '';
                textY += (this.height * 0.09);
            } else if (testWidth > this.width && i > 0) {
                this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
                line = words[i] + ' ';
                textY += (this.height * 0.09);
            } else {
                line = testLine;
            }
        }
        this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
    }

    highlightCard() {

        this.context.lineWidth = this.height * 0.008;
        this.context.strokeStyle = 'blue';

        this.drawRoundedRectangleWithoutFill('blue', this.height-(this.height * 0.99), this.width-(this.width * 0.99),this.height-(this.height * 0.01), this.width-(this.width * 0.01), this.cardRadius * 0.99);

        this.context.stroke();
    }


}