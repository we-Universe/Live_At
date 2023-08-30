import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'kt-drawmsisdnld',
	templateUrl: './drawmsisdnld.component.html',
	styleUrls: ['./drawmsisdnld.component.scss']
})
export class DrawmsisdnldComponent implements OnInit {

	constructor() { }

	counter = 0
	finishedDraw = false
	history = []
	winners = []

	ngOnInit() {
		this.winners = JSON.parse(localStorage.getItem("msisdn"));
		console.log("this.winners");
		console.log(this.winners);
		
	}

	DrawMSISDN() {
		let ball = document.getElementsByClassName('ball')
		let numbers = this.winners[this.counter]
		// console.log(numbers)

		this.playSound()
		//write numbers inside balls
		this.finishedDraw = true
		for (let i = 0; i < ball.length; i++) {
			this.writeDownNumber(i, ball, numbers)
		}

		setTimeout(() => {
			this.history.push(numbers)
			if (this.counter > this.winners.length - 1) this.finishedDraw = true
			else this.finishedDraw = false
		}, 1000 * 10.5)

		if (this.counter === this.winners.length - 1) this.finishedDraw = true
		this.counter = this.counter + 1
	}

	writeDownNumber(i, ball, numbers) {
		let refreshIntervalId = setInterval(function () {
			let random = Math.floor(Math.random() * 9) + 1
			ball[i].innerHTML = random
		}, 100)

		setTimeout(() => {
			clearInterval(refreshIntervalId)
			ball[i].innerHTML = numbers[i]
		}, 1000 * (i + 1))
	}

	playSound() {
		let audio = new Audio('./assets/media/spin.mp3')
		audio.play()
	}
}
