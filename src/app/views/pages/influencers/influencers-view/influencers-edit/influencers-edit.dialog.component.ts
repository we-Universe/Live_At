// Angular
import {Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// Material
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
// RxJS
import {Subscription, of, Observable} from 'rxjs';
import {delay, map, startWith} from 'rxjs/operators';
// NGRX
import {Update} from '@ngrx/entity';
import {Store, select} from '@ngrx/store';
// State
import {AppState} from '../../../../../core/reducers';
// CRUD
import {LayoutUtilsService, TypesUtilsService} from '../../../../../core/_base/crud';
// Services and Models
import {selectCustomersActionLoading} from '../../../../../core/e-commerce';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import globalVariables from '../../../globalVariables';
import {InfluencerModel} from '../models/influencers.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'livat-influencers-edit-dialog',
	templateUrl: 'influencers-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class InfluencersEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	userInfluencers: InfluencerModel;
	influencerForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	myControl = new FormControl();
	filteredOptions: Observable<any[]>;
	statuses = [];
	// Private properties
	private componentSubscriptions: Subscription;
	// Subscriptions
	private subscriptions: Subscription[] = [];
	// Store
	token = '';
	credentialsSubscription: Subscription = null;
	headers = null;
	requestOptions = {};
	role = '';

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<InfluencerssEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param layoutUtilsService
	 * @param http
	 */
	constructor(public dialogRef: MatDialogRef<InfluencersEditDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private fb: FormBuilder,
				private store: Store<AppState>,
				private layoutUtilsService: LayoutUtilsService,
				private http: HttpClient) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectCustomersActionLoading)).subscribe(res => this.viewLoading = res);
		this.userInfluencers = this.data.Influencer;
		this.createForm();

		this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.role = localStorage.getItem('role');
			this.token = state.authToken;
			this.headers = new HttpHeaders({Authorization: 'Bearer ' + this.token, responseType: 'text'});
			this.requestOptions = {
				headers: this.headers,
				// responseType: 'text'
			};
		});

		this.subscriptions.push(this.credentialsSubscription);
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}

		this.subscriptions.forEach(el => el.unsubscribe());
	}

	createForm() {
		this.influencerForm = this.fb.group({
			id: [this.userInfluencers.id, Validators.required],
			name: new FormControl(this.userInfluencers.name, Validators.required),
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.userInfluencers.id > 0) {
			return `تعديل المؤثر`;
		}

		return 'اضافة حركة';
	}

	/**
	 * influencer control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.influencerForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */
	// getٍStatues() {
	// 	this.http.get(
	// 		globalVariables.baseUrl + 'api/influencerStatuses',
	// 		{ headers: this.headers }
	// 	).subscribe((res: any) => {
	// 		this.statuses = res.data.map(item => {
	// 			return {
	// 				name: item.name,
	// 				id: item.id
	// 			};
	// 		});

	// 		this.influencerForm.controls["influencerStatus"].setValue(this.userInfluencers.influencerStatusId);
	// 	});
	// }

	/**
	 * Returns prepared customer
	 */
	prepareInfluencers(): InfluencerModel {
		const controls = this.influencerForm.controls;
		const _influencer = new InfluencerModel();
		_influencer.id = this.userInfluencers.id;
		_influencer.name = controls.name.value;

		return _influencer;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.influencerForm.controls;

		/** influencer form */
		if (this.influencerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedInfluencers = this.prepareInfluencers();
		if (editedInfluencers.id > 0) {
			this.updateInfluencers(editedInfluencers);
		} else {
			this.createInfluencers(editedInfluencers);
		}
	}

	/**
	 * Update customer
	 *
	 * @param _influencer: InfluencerModel
	 */
	updateInfluencers(_influencer: InfluencerModel) {
		this.http.put(
			globalVariables.baseUrl + 'api/Influencers',
			{
				id: _influencer.id,
				name: _influencer.name
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_influencer, isEdit: true});
			}, err => {
				let msg = 'فشل في تعديل المؤثر';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/**
	 * Create customer
	 *
	 * @param _influencer: InfluencerModel
	 */
	createInfluencers(_influencer: InfluencerModel) {
		this.http.post(
			globalVariables.baseUrl + 'api/Influencers',
			{
				name: _influencer.name
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_influencer, isEdit: false});
			}, err => {
				let msg = 'فشل في اضافة المؤثر';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/** Alect Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
