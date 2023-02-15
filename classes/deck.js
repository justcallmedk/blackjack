export class Deck {

  constructor() {
    //global deck consts
    this.SUITS = ['C','S','D','H'];
    this.FACES = {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K'
    };

    //create crads in the deck, then shuffle.
    this.deck = [];
    for(const suit of this.SUITS) {
      for(let i = 1; i <= 13; i++) {
        const card = suit + (this.FACES[i] ? this.FACES[i] : i);
        this.deck.push(card);
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  get() {
    return this.deck;
  }

  draw() {
  	return this.deck.pop();
  }
}