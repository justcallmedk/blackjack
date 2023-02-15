export class Person {

  constructor() {
    //global person consts
    this.hands = [];
    this.total = {
      min: 0,
      max: 0
    };
    this.tendies = 5000;
  }

  get() {
    return {
      hands: this.hands,
      total: this.total
    };
  }

  set(card) {
    const value = card.substr(1);
    if(value === 'A') {
      this.total.min += 1;
      this.total.max += 11;
    }
    else if(isNaN(value)) {
      this.total.min += 10;
      this.total.max += 10;
    }
    else {
      this.total.min += parseInt(value);
      this.total.max += parseInt(value);
    }
  	this.hands.push(card);
  }

  withdraw(tendies) {
    this.tendies -= tendies;
  }

  deposit(tendies) {
    this.tendies += tendies;
  }

  getTendies() {
    return this.tendies;
  }

  reset() {
    this.hands = [];
    this.total = {
      min: 0,
      max: 0
    };
  }
}