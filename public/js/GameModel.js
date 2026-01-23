'use strict'

class GameModel {

    constructor(boardSize = 8, pieceRowCount = 4) {
        this.boardState = [];
        this.boardSize = boardSize;
        this.pieceRowCount = pieceRowCount;
        this.setBoardToStartPosition(this.boardSize, this.pieceRowCount);
    }

    getBoardSize() {
        return this.boardSize;
    }

    getPieceRowCount() {
        return this.pieceRowCount;
    }

    changeBoardSize(size) {
        this.boardSize = size;

        if (this.pieceRowCount > (size/2)) {
            this.pieceRowCount = (size/2);
        }

        this.setBoardToStartPosition();
    }

    changeRowCount(pieceRowCount) {
        this.pieceRowCount = pieceRowCount;

        this.setBoardToStartPosition();
    }

    setBoardToStartPosition() {
        // 1 represents the black pieces, 2 represents the white pieces
        /*this.boardState = [[1,1,1,1,0,0,0,0],
                           [1,1,1,1,0,0,0,0],
                           [1,1,1,1,0,0,0,0],
                           [1,1,1,1,0,0,0,0],
                           [0,0,0,0,2,2,2,2],
                           [0,0,0,0,2,2,2,2],
                           [0,0,0,0,2,2,2,2],
                           [0,0,0,0,2,2,2,2]];
         */
        // Need to modify this to allow it to add the correct number of pieces
        // in the right configuration which I also need to figure out.

        this.boardState = [];

        for (let i = 0; i < this.boardSize; i++) {
            this.boardState.push([]);
            for (let j = 0; j < this.boardSize; j++) {
                this.boardState[i].push(0);
            }
        }

        // Nested loop to add all pieces
        for (let i = 0; i < this.pieceRowCount; i++) {
            for (let j = 0; j < (this.boardSize/2); j++) {
                this.boardState[j][i] = 1;

                this.boardState[(this.boardSize-1-j)][(this.boardSize-1-i)] = 2;
            }
        }
        //console.log("The board state in the model class is: ");
        //console.log(this.boardState);
    }

    setBoardToTutorialStartPosition() {
        // 1 represents the black pieces, 2 represents the white pieces
        this.boardState = [[2,2,0,2,2,1,0,0],
                           [2,2,2,2,1,0,1,0],
                           [0,2,0,2,0,0,0,1],
                           [2,0,2,2,0,0,0,1],
                           [2,1,0,0,0,0,1,1],
                           [0,2,0,1,1,1,1,0],
                           [0,0,2,0,0,1,1,0],
                           [0,0,0,0,0,0,1,1]];
    }

    setBoardState(boardState) {
        this.boardState = boardState;
    }

    getBoardState() {
        return this.boardState;
    }

    movePiece(newX, newY, oldX, oldY) {
        const piece = this.boardState[oldY][oldX];
        this.boardState[oldY][oldX] = 0;
        this.boardState[newY][newX] = piece;
    }

    isBoardCoordEmpty(pieceX, pieceY) {
        return !(this.boardState[pieceY][pieceX]);
    }

    isBoardCoordWithinBounds(coord) {
        return !(coord > (this.boardSize-1) || coord < 0);
    }

    // This monstrosity could also be done better
    evaluateAllLegalMoves(pieceX, pieceY) {
        let legalMoves = [];
        let visitedList = [{ x: pieceX, y: pieceY }];

        if (this.isBoardCoordWithinBounds(pieceY-1) && (this.isBoardCoordEmpty(pieceX, pieceY-1))) {
            legalMoves.push({ x: pieceX, y: pieceY - 1 });
        }

        if (this.isBoardCoordWithinBounds(pieceX-1) && (this.isBoardCoordEmpty(pieceX-1, pieceY))) {
            legalMoves.push({ x: pieceX-1, y: pieceY });
        }

        if (this.isBoardCoordWithinBounds(pieceY+1) && (this.isBoardCoordEmpty(pieceX, pieceY+1))) {
            legalMoves.push({ x: pieceX, y: pieceY+1 });
        }

        if (this.isBoardCoordWithinBounds(pieceX+1) && (this.isBoardCoordEmpty(pieceX+1, pieceY))) {
            legalMoves.push({ x: pieceX+1, y: pieceY });
        }

        let currentPossibleJumpMoves = this.evaluateAllJumpOvers(pieceX, pieceY, visitedList);
        if (currentPossibleJumpMoves.length) {
            legalMoves = legalMoves.concat(currentPossibleJumpMoves);
        }

        return legalMoves;
    }

    evaluateJumpOvers(pieceX, pieceY) {
        let jumpOverList = [];

        if (this.isBoardCoordWithinBounds(pieceY-2) && !this.isBoardCoordEmpty(pieceX, pieceY-1) && this.isBoardCoordEmpty(pieceX, pieceY-2)) {
            jumpOverList.push({x: pieceX, y: pieceY-2});
        }
        if (this.isBoardCoordWithinBounds(pieceX-2) && !this.isBoardCoordEmpty(pieceX-1, pieceY)  && this.isBoardCoordEmpty(pieceX-2, pieceY)) {
            jumpOverList.push({x: pieceX-2, y: pieceY});
        }
        if (this.isBoardCoordWithinBounds(pieceY+2) && !this.isBoardCoordEmpty(pieceX, pieceY+1)  && this.isBoardCoordEmpty(pieceX, pieceY+2)) {
            jumpOverList.push({x: pieceX, y: pieceY+2});
        }
        if (this.isBoardCoordWithinBounds(pieceX+2) && !this.isBoardCoordEmpty(pieceX+1, pieceY)  && this.isBoardCoordEmpty(pieceX+2, pieceY)) {
            jumpOverList.push({x: pieceX+2, y: pieceY});
        }

        return jumpOverList;
    }

    evaluateAllJumpOvers(pieceX, pieceY, visitedList) {
        let jumpOverList = this.evaluateJumpOvers(pieceX, pieceY);

        //let jumpOverListCopy = [...jumpOverList];
        //let currentPossibleJumpMoves = [];
        //let currentPossibleJumpMoves = JSON.parse(JSON.stringify(jumpOverList));
        let currentPossibleJumpMoves = [...jumpOverList];
        let moves = [];

        for (let i = 0; i < jumpOverList.length; i++) {

            if (this.isPieceInList(jumpOverList[i], visitedList)) {
                currentPossibleJumpMoves[i] = 0;
                continue;
            }

            visitedList.push(jumpOverList[i]);
            moves = this.evaluateAllJumpOvers(jumpOverList[i].x, jumpOverList[i].y, visitedList);

            if (moves.length) {
                //currentPossibleJumpMoves = jumpOverList.concat(moves);
                currentPossibleJumpMoves.push(...moves);
            }

        }

        return currentPossibleJumpMoves.filter(number => number !== 0);
    }

    isPieceInList(piece, listOfPieces) {
        for (let i = 0; i < listOfPieces.length; i++) {
            if (JSON.stringify(listOfPieces[i]) === JSON.stringify(piece)) {
                return true;
            }
        }
        return false;
    }


    checkForWinner() {
        // Need to get this working for different scaling boards and number of pieces
        let blackWin = true;
        let whiteWin = true;

        // Nested loop to check all pieces
        for (let i = 0; i < this.pieceRowCount; i++) {
            for (let j = 0; j < (this.boardSize/2); j++) {
                whiteWin = (whiteWin && (this.boardState[j][i] === 2));

                blackWin = (blackWin && (this.boardState[(this.boardSize-1-j)][(this.boardSize-1-i)] === 1));
            }
        }

        if (blackWin) {
            return "Black";
        } else if (whiteWin) {
            return "White";
        }

        return false;
    }

}

//module.exports = GameModel;