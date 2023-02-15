import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { Deck } from './classes/deck.js';
import { Person } from './classes/person.js';

// status enum
const STATUS = {
	BUST: '*** BUST ***',
	DEALER_WIN: '*** DEALER WIN ***',
	PLAYER_WIN: '*** PLAYER WIN ***',
	PLAYER_BJ: '*** PLAYER BLACKJACK ***',
	PUSH: '*** PUSH ***'
};

// TODO
// 1. deck empty scenario
// 2. insurance
// 3. split

const playerTurn = async () => {
	const currentHand = myPlayer.get();
	console.info(currentHand);

	//check for bust
	if(currentHand.total.min > 21) {
		return STATUS.BUST;
	}
	else if(currentHand.total.min === 21 || currentHand.total.max === 21) {
		//on 21, skip to dealer turn, unless blackjacked
		if(currentHand.length !== 2) {
			console.info('=== DEALER\'S TURN ===');
			return dealerTurn();
		}
		//if dealer does not have blackjack, it's a win, otherwise push
		const dealerHand = myDealer.get();
		if(dealerHand.total.min === 21 || dealerHand.total.max === 21) {
			return STATUS.PUSH;
		}
		return STATUS.PLAYER_WIN;
	}

	//command line interface for hit/stand
	const rl = readline.createInterface({ input, output });
	const answer = await rl.question('Hit(enter) or Stand(s) ?\n: ');
	rl.close();

	if(answer === '') {
		myPlayer.set(myDeck.draw());
		return playerTurn();
	}
	else if(answer === 's') {
		//moving on to dealer's turn
		console.info('=== DEALER\'S TURN ===');
		return dealerTurn();
	}
	else {
		console.error('Unknown command');
		return playerTurn();
	}
};

const dealerTurn = async () => {
	const dealerHand = myDealer.get();
	console.info(dealerHand);
	const playerHand = myPlayer.get();

	//dealer has blackjack
	if(dealerHand.hands.length === 2 && (dealerHand.total.min === 21 || dealerHand.total.max === 21)) {
		if(playerHand.hands.length === 2 && (playerHand.total.min === 21 || playerHand.total.max === 21)) {
			return STATUS.PUSH;
		}
		return STATUS.DEALER_WIN;
	}

	//bust on over 21, player win
	if(dealerHand.total.min > 21) {
		return STATUS.PLAYER_WIN;
	}
	//stand on 17~21, measure up
	else if(dealerHand.total.max >= 17 && dealerHand.total.max <= 21) {
		const playerTotal = playerHand.total.max > 21 ? playerHand.total.min : playerHand.total.max;
		if(dealerHand.total.max > playerTotal) {
			return STATUS.DEALER_WIN;
		}
		else if(dealerHand.total.max < playerTotal) {
			return STATUS.PLAYER_WIN;
		}
		else {
			return STATUS.PUSH;
		}
	}
	//below, 16, draw more
	else {
		myDealer.set(myDeck.draw());
		return dealerTurn();
	}
};

//sets up for a new round of game
const setup = async () => {
	//player broke
	const tendies = myPlayer.getTendies();
	if(tendies <= 0) {
		return false;
	}

	//command line interface for wager
	const rl = readline.createInterface({ input, output });
	const answer = await rl.question('How much tendies (' + tendies + ')?\n: ');
	rl.close();

	let bet = parseInt(answer);
	bet = (isNaN(bet) || bet >= tendies) ? tendies : bet;
	myPlayer.withdraw(bet);
	console.info('=== betting ' + bet + ' ===');
	currentBet = bet;

	myPlayer.reset();
	myDealer.reset();

	//dealer draws two
	const dealerBlind = myDeck.draw();
	const dealerNonBlind = myDeck.draw();
	myDealer.set(dealerBlind);
	myDealer.set(dealerNonBlind);

	//player draws two
	myPlayer.set(myDeck.draw());
	myPlayer.set(myDeck.draw());
	console.info('Dealer reveals : ' + dealerNonBlind);
	return true;
};

const myDeck = new Deck();
const myPlayer = new Person();
const myDealer = new Person();
let currentBet;

const run = async () => {
	await setup();
	while(true) {
		const status = await playerTurn();

		//pay up
		if(status === STATUS.PLAYER_WIN) {
			myPlayer.deposit(currentBet * 2);
		}
		else if(status === STATUS.PUSH) {
			myPlayer.deposit(currentBet);
		}
		else if(status ===STATUS.PLAYER_BJ) { //bj pays 2.5x
			myPlayer.deposit(currentBet * 2.5);
		}

		console.info(status);
		if(!await setup()) { //setup will return false on broke
			break;
		}
		console.info('\n=== NEW ROUND ===\n');
	}
	console.info('bubye');
};

run();