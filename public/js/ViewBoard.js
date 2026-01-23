'use strict'

class ViewBoard {
    constructor(canvas, context, boardSize, distanceBetweenSquares) {
        this.canvas = canvas;
        this.context = context;
        this.boardSize = boardSize;
        this.distanceBetweenSquares = distanceBetweenSquares;
        //this.distanceToCentreOfSquare = distanceToCentreOfSquare;
    }

    changeBoardSize(boardSize) {
        this.boardSize = boardSize;
        this.distanceBetweenSquares = 1000 / boardSize;
    }

    drawBoard() {
        // Sets colour of following drawings
        this.context.fillStyle = '#ffcf9e';

        // Creates a rectangle the size of the canvas
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Change colour
        this.context.fillStyle = '#d18c47';

        // Uses a loop to add alternating colour squares
        // 125 is the height/width of the canvas divided by 8
        // i is the y value, j is the x value
        for (let i = 0; i < this.boardSize; i++) {
            if (i % 2) {
                for (let j = 0; j < (this.boardSize/2); j++) {
                    this.context.fillRect((this.distanceBetweenSquares * 2 * j), (this.distanceBetweenSquares * i), this.distanceBetweenSquares, this.distanceBetweenSquares);
                }
            } else {
                for (let j = 0; j < (this.boardSize/2); j++) {
                    this.context.fillRect((this.distanceBetweenSquares + (this.distanceBetweenSquares * 2 * j)), (this.distanceBetweenSquares * i), this.distanceBetweenSquares, this.distanceBetweenSquares);
                }
            }
        }

        this.drawBoardPositionMarkers();

    }

    drawBoardPositionMarkers() {
        // Sets the font and size of the text
        this.context.font = "" + (this.distanceBetweenSquares * 0.3) + "px Arial";

        // Sets the position from which text is positioned
        this.context.textBaseline = "top";

        for (let i = 0; i < this.boardSize; i++) {
            this.context.fillStyle = '#000000';
            this.context.fillText(("" + (String.fromCharCode(65 + i) + "")), 0, (this.distanceBetweenSquares * i));
            this.context.fillStyle = '#d18c47';
        }
        for (let j = 0; j < this.boardSize; j++) {
            this.context.fillStyle = '#000000';
            this.context.fillText(("" + (j+1) + ""), ((this.distanceBetweenSquares * 0.83) + (this.distanceBetweenSquares * j)), 0);
            this.context.fillStyle = '#d18c47';
        }
    }

}