// Angular
import { Component, Input, OnInit } from '@angular/core';

export interface Timeline2Data {
	time: string;
	text: string;
	icon?: string;
	attachment?: string;
}

@Component({
	selector: 'kt-timeline2',
	templateUrl: './timeline2.component.html',
	styleUrls: ['./timeline2.component.scss']
})
export class Timeline2Component implements OnInit {
	// Public properties
	@Input() data: Timeline2Data[];

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (!this.data) {
			this.data = [
			];
		}
	}
}
