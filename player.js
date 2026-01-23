'use strict';

class Player {
    constructor(name, score, cardCzar, answer) {
        this.name = name;
        this.score = score;
        this.cardCzar = cardCzar;
        this.answer = answer;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    getCardCzar() {
        return this.cardCzar;
    }

    getAnswer() {
        return this.answer;
    }

    setName(name) {
        this.name = name;
    }

    setScore(score) {
        this.score = score;
    }

    setCardCzar(cardCzar) {
        this.cardCzar = cardCzar;
    }

    setAnswer(answer) {
        this.answer = answer;
    }
}