// Angular
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutConfigService } from '../../../core/_base/layout';
import { Store } from '@ngrx/store';
import { AppState } from '../../../core/reducers';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import globalVariables from '../globalVariables';

@Component({
	selector: 'livat-schedule',
	templateUrl: 'schedule.component.html',
	styleUrls: ['schedule.component.scss'],
})
export class ScheduleComponent  implements OnInit {

	// Subscriptions
	private subscriptions: Subscription[] = [];
	// Store
	token = '';
	credentialsSubscription: Subscription = null;
	headers = null;
	requestOptions = {};
	role = '';

	constructor(private layoutConfigService: LayoutConfigService, private store: Store<AppState>,
		private http: HttpClient) {
	}

	ngOnInit(): void {
		this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.token = state.authToken;
			this.headers = new HttpHeaders({ Authorization: 'Bearer ' + this.token, responseType: 'text' });
			this.requestOptions = {
				headers: this.headers,
				// responseType: 'text'
			};
		});

		this.subscriptions.push(this.credentialsSubscription);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	/** Actions */
}
