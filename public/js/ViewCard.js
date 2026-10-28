'use strict'

export default class ViewCard {
    constructor(colour, text, width, height, nodeToConnectTo, textScale = 0.09) {
        this.colour = colour;
        this.text = text;
        this.width = width;
        this.height = height;
        // A textScale of 1 would make the text the same size as the height of the card
        this.textScale = textScale;

        if (this.width > this.height) {
            this.cardRadius = width * 0.036;
        } else {
            this.cardRadius = height * 0.036;
        }

        this.textColour = 'black';
        if (this.colour === 'black') {
            this.textColour = 'white';
        }

        this.canvas = document.createElement('canvas');
        //this.canvas.setAttribute('id', 'cardCanvas');
        // ?? is a nullish coalescing operator, if classOfCanvas is null or undefined, it will use 'default' instead
        //this.canvas.setAttribute('class', classOfCanvas ?? 'default');
        this.canvas.setAttribute('width', ('' + width));
        this.canvas.setAttribute('height', ('' + height));
        this.context = this.canvas.getContext('2d');

        nodeToConnectTo.appendChild(this.canvas);

        //this.drawCard();
    }

    getCanvas() {
        return this.canvas;
    }

    removeCanvas() {
        this.canvas.remove();
    }

    clearCanvas() {
        //this.context.clearRect(0, 0, this.width, this.height);
        this.canvas.width = this.canvas.width;
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

    changeCardTextCentred(text) {
        this.text = text;
        this.drawCardWithCentredText();
    }

    drawCard() {

        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);

        this.wrapTextToCard();

        /*
        this.context.font = "" + (this.height * 0.05) + "px Arial";
        this.context.fillStyle = '#000000';
        this.context.fillText(this.text, (this.width * 0.05), (this.height * 0.9));
        this.context.fillStyle = '#d18c47';
         */

        //console.log("Card has been drawn");
    }

    drawCardWithCentredText() {

        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);

        this.wrapTextToCardCentred();

    }

    drawCardWithCentredTextNoWrap() {

        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);

        this.drawCentredTextToCardNoWrap();

    }

    drawCardWithVerticalCentredTextNoWrap() {

        this.drawRoundedRectangle(this.colour, this.height, this.width, this.cardRadius);

        this.drawVerticalCentredTextToCardNoWrap();

    }

    drawRoundedRectangleWithoutFill(topLeftX, topLeftY, width, height, cornerRadius) {

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

        this.drawRoundedRectangleWithoutFill(0, 0, width, height, cornerRadius);

        this.context.fill();
    }

    // This doesn't work if the text is sufficiently long enough without spaces
    wrapSpecificTextToCard(text) {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * this.textScale) + "px Arial";

        // Sets the position from which text is positioned
        this.context.textBaseline = "top";

        // Sets the position from which text is positioned relative to x coordinate
        this.context.textAlign = "left";

        this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, (this.width - (this.width * 0.97)), (this.height - (this.height * 0.98)), (this.width * 0.97));

        const words = text.split(' ');
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

    wrapTextToCard() {
        this.wrapSpecificTextToCard(this.text);
    }

    // Need to add wrapping
    wrapTextToCardCentred() {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * this.textScale) + "px Arial";
        //this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        // Sets the position from which text is positioned relative to x coordinate
        this.context.textAlign = "left";

        this.adjustedWidth = this.width * 0.9;

        //this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, this.width / 2, this.height / 2);

        // Sets the position from which text is positioned
        //this.context.textBaseline = "top";

        this.context.fillStyle = this.textColour;

        const words = this.text.split(' ');
        let xMeasuredLines = [];
        let line = '';
        //let textY = (this.height - (this.height * 0.98));

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.context.measureText(testLine);
            const testWidth = metrics.width;

            if (words[i] === "\n") {
                xMeasuredLines.push(([line, (this.width - this.context.measureText(line).width) / 2]));
                //this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
                line = '';
                //textY += (this.height * 0.09);
            } else if (testWidth > this.adjustedWidth && i > 0) {
                xMeasuredLines.push(([line, (this.width - this.context.measureText(line).width) / 2]));
                //this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
                line = words[i] + ' ';
                //textY += (this.height * 0.09);
            } else {
                line = testLine;
            }
        }

        xMeasuredLines.push(([line, (this.width - this.context.measureText(line).width) / 2]));
        //console.log("X Measured Lines: " + xMeasuredLines);

        //console.log(xMeasuredLines);

        //xMeasuredLines = xMeasuredLines.filter(line => line[0] !== '\n');

        //console.log(xMeasuredLines);

        const numberOfLines = xMeasuredLines.length;
        //console.log("Number of lines: " + numberOfLines);
        for (let j = 0; j < numberOfLines; j++) {
            this.context.fillText(xMeasuredLines[j][0], xMeasuredLines[j][1], (this.height / (numberOfLines+1)) * (j+1));
            //console.log((this.height / (numberOfLines+1)) * (j+1));
        }

        //this.context.fillText(line, (this.width - (this.width * 0.97)), textY);
    }

    drawCentredTextToCardNoWrap() {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * this.textScale) + "px Arial";

        // Sets the position from which text is positioned relative to y coordinate
        this.context.textBaseline = "middle";

        // Sets the position from which text is positioned relative to x coordinate
        this.context.textAlign = "center";

        this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, (this.width / 2), (this.height / 2));

        // The last parameter is a max width for the text, if the text exceeds this width, it will be scaled down to fit within it
        this.context.fillText(this.text, (this.width / 2), (this.height / 2), this.width * 0.9);

    }

    drawVerticalCentredTextToCardNoWrap() {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * this.textScale) + "px Arial";

        // Sets the position from which text is positioned relative to y coordinate
        this.context.textBaseline = "middle";

        // Sets the position from which text is positioned relative to x coordinate
        this.context.textAlign = "left";

        this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, (this.width / 2), (this.height / 2));

        // The last parameter is a max width for the text, if the text exceeds this width, it will be scaled down to fit within it
        this.context.fillText(this.text, (this.width - (this.width * 0.97)), (this.height / 2), this.width * 0.9);

    }

    highlightCard() {

        //this.context.lineWidth = this.height * 0.008;
        if (this.width > this.height) {
            this.context.lineWidth = this.width * 0.005;
        } else {
            this.context.lineWidth = this.height * 0.01;
        }
        this.context.strokeStyle = 'blue';

        //this.drawRoundedRectangleWithoutFill(this.height-(this.height * 0.99), this.width-(this.width * 0.99), this.height-(this.height * 0.005), this.width-(this.width * 0.005), this.cardRadius * 0.99);
        // Base the distance of the highlight from the edge of the card on 1% of the largest dimension of the card
        if (this.width > this.height) {
            this.drawRoundedRectangleWithoutFill((this.width * 0.01), (this.width * 0.01), this.width-(this.width * 0.01), this.height-(this.width * 0.01), (this.cardRadius * 0.99));
        } else {
            this.drawRoundedRectangleWithoutFill((this.height * 0.01), (this.height * 0.01), this.width-(this.height * 0.01), this.height-(this.height * 0.01), (this.cardRadius * 0.99));
        }

        this.context.stroke();
    }
/*
    drawLeftAndRightArrows() {
        this.context.fillStyle = 'black';
        this.context.beginPath();

        // Left arrow
        this.context.moveTo((this.width * 0.1), (this.height / 2) - (this.height * 0.05));
        this.context.lineTo((this.width * 0.1), ((this.height / 2) + (this.height * 0.05)));
        this.context.lineTo((this.width * 0.05), (this.height / 2));

        // Right arrow
        this.context.moveTo((this.width * 0.9), (this.height / 2) - (this.height * 0.05));
        this.context.lineTo((this.width * 0.9), ((this.height / 2) + (this.height * 0.05)));
        this.context.lineTo((this.width * 0.95), (this.height / 2));
        
        this.context.closePath();

        this.context.fill();
    }
*/

    drawLeftArrow() {
        this.context.fillStyle = 'black';
        this.context.beginPath();

        // Left arrow
        this.context.moveTo((this.width * 0.1), (this.height / 2) - (this.height * 0.05));
        this.context.lineTo((this.width * 0.1), ((this.height / 2) + (this.height * 0.05)));
        this.context.lineTo((this.width * 0.05), (this.height / 2));
        
        this.context.closePath();

        this.context.fill();
    }

    drawRightArrow() {
        this.context.fillStyle = 'black';
        this.context.beginPath();

        // Right arrow
        this.context.moveTo((this.width * 0.9), (this.height / 2) - (this.height * 0.05));
        this.context.lineTo((this.width * 0.9), ((this.height / 2) + (this.height * 0.05)));
        this.context.lineTo((this.width * 0.95), (this.height / 2));
        
        this.context.closePath();

        this.context.fill();
    }

    drawLeftAndRightArrows() {
        this.drawLeftArrow();
        this.drawRightArrow();
    }

    displayCardZarIndicator() {
        // Sets the font and size of the text
        this.context.font = "" + (this.height * this.textScale) + "px Arial";

        // Sets the position from which text is positioned relative to y coordinate
        this.context.textBaseline = "middle";

        // Sets the position from which text is positioned relative to x coordinate
        this.context.textAlign = "right";

        this.context.fillStyle = this.textColour;

        //this.context.fillText(this.text, (this.width / 2), (this.height / 2));

        // The last parameter is a max width for the text, if the text exceeds this width, it will be scaled down to fit within it
        this.context.fillText("CardZar", (this.width * 0.97), (this.height / 2), (this.width * 0.9));
    }

    // Mouse scaling calculations
    getCanvasScaledMousePosition(e) {
        let bounds = this.canvas.getBoundingClientRect();

        // Raw mouse position
        let mouseX = e.clientX;
        let mouseY = e.clientY;

        // Mouse position account for canvas position
        mouseX = mouseX - bounds.left - scrollX;
        mouseY = mouseY - bounds.top - scrollY;

        // Mouse position normalised for canvas bounds
        mouseX /= bounds.width;
        mouseY /= bounds.height;

        // Mouse position scaled to canvas coordinates
        mouseX *= this.canvas.width;
        mouseY *= this.canvas.height;

        // Since the mouse position is given in terms of pixel and the canvas measurements
        // are a mix of pixel and css scaling the mouse position needs to be scaled as well
        return { x: mouseX, y: mouseY };
    }

}