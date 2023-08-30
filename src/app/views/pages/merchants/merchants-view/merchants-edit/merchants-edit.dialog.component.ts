// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of, Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
// NGRX
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, TypesUtilsService } from '../../../../../core/_base/crud';
// Services and Models
import { selectCustomersActionLoading } from '../../../../../core/e-commerce';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import globalVariables from '../../../globalVariables';
import { MerchantModel } from '../models/merchants.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'livat-merchants-edit-dialog',
	templateUrl: 'merchants-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class MerchantsEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	userMerchants: MerchantModel;
	merchantForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	myControl = new FormControl();
	filteredOptions: Observable<any[]>;
	statuses = [
		{
			name: 'اشتراك بدون لايفات',
			id: 1
		}, {
			name: 'اشتراك مع لايفات',
			id: 2
		}
	];
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
	 * @param dialogRef: MatDialogRef<MerchantssEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param layoutUtilsService
	 * @param http
	 */
	constructor(public dialogRef: MatDialogRef<MerchantsEditDialogComponent>,
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
		this.userMerchants = this.data.Merchant;
		this.createForm();

		this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.role = localStorage.getItem('role');
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
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}

		this.subscriptions.forEach(el => el.unsubscribe());
	}

	createForm() {
		let merchantCreationDate = new Date(+new Date(this.userMerchants.merchantCreationDate) - this.tzoffset).toISOString().substr(0, 16);

		this.merchantForm = this.fb.group({
			id: [this.userMerchants.id, Validators.required],
			// this.userMerchants.id > 0 ? '' :
			mobileNumber: [this.userMerchants.mobileNumber, Validators.compose([
				Validators.required,
				Validators.minLength(9),
				Validators.maxLength(14),
				Validators.pattern('[0-9]*')
			])
			],
			fullname: [this.userMerchants.fullname, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(100)
			])
			],
			email: [this.userMerchants.email, Validators.compose([
				// Validators.required,
				Validators.email,
				Validators.minLength(3),
				// https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
				Validators.maxLength(320)
			]),
			],
			storeName: [this.userMerchants.storeName, Validators.compose([
				Validators.required
			])
			],
			fbUrl: [this.userMerchants.fbUrl, Validators.compose([
				Validators.required
			])
			],
			insUrl: [this.userMerchants.insUrl, Validators.compose([
				Validators.required
			])
			],
			storeType: [this.userMerchants.storeType, Validators.compose([])
			],
			isActive: [this.userMerchants.isActive, Validators.compose([
				Validators.required
			])
			],
			storeIntro: [this.userMerchants.storeIntro, Validators.compose([])
			],
			merchantSubscriptionType: new FormControl(this.userMerchants.merchantSubscriptionTypeId, Validators.required),
			// merchantCreationDate: [merchantCreationDate, Validators.required],
			// merchantStatus: [this.userMerchants.merchantStatusId, this.userMerchants.id > 0 ? Validators.required : ''],
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.userMerchants.id > 0) {
			return `تعديل المتجر`;
		}

		return 'اضافة حركة';
	}

	/**
	 * merchant control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.merchantForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */
	// getٍStatues() {
	// 	this.http.get(
	// 		globalVariables.baseUrl + 'api/merchantStatuses',
	// 		{ headers: this.headers }
	// 	).subscribe((res: any) => {
	// 		this.statuses = res.data.map(item => {
	// 			return {
	// 				name: item.name,
	// 				id: item.id
	// 			};
	// 		});

	// 		this.merchantForm.controls["merchantSubscriptionTypeId"].setValue(this.userMerchants.merchantSubscriptionTypeId);
	// 	});
	// }

	/**
	 * Returns prepared merchant
	 */
	prepareMerchants(): MerchantModel {
		const controls = this.merchantForm.controls;
		const _merchant = new MerchantModel();
		_merchant.id = this.userMerchants.id;
		_merchant.fullname = controls.fullname.value;
		_merchant.email = controls.email.value;
		_merchant.storeName = controls.storeName.value;
		_merchant.fbUrl = controls.fbUrl.value;
		_merchant.insUrl = controls.insUrl.value;
		_merchant.storeType = controls.storeType.value;
		_merchant.storeIntro = controls.storeIntro.value;
		_merchant.isActive = controls.isActive.value;
		_merchant.mobileNumber = controls.mobileNumber.value;
		_merchant.merchantSubscriptionTypeId = controls.merchantSubscriptionType.value;
		// _merchant.merchantCreationDate = controls.merchantCreationDate.value;
		// _merchant.merchantStatusId = controls.merchantStatus.value;

		return _merchant;
	}

	/**
	 * On Submit
	 */
	onSubmit() {

		this.hasFormErrors = false;
		const controls = this.merchantForm.controls;

		/** merchant form */
		if (this.merchantForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		
		const editedMerchants = this.prepareMerchants();
		if (editedMerchants.id > 0) {
			this.updateMerchants(editedMerchants);
		} else {
			this.createMerchants(editedMerchants);
		}
	}

	/**
	 * Update merchant
	 *
	 * @param _merchant: MerchantModel
	 */
	updateMerchants(_merchant: MerchantModel) {
		// let merchantCreationDate = new Date(+new Date(_merchant.merchantCreationDate) - this.tzoffset).toISOString().slice(0, 16);

		this.http.put(
			globalVariables.baseUrl + 'api/Merchants',
			{
				// "id": 0,
				// "name": "string",
				// "fbUrl": "string",
				// "instagramUrl": "string",
				// "mobile": "string",
				// "email": "string",
				// "businessName": "string",
				// "description": "string",
				// "withLive": true,
				// "merchantBusinessType": "string",
				// "isActive": true

				id: _merchant.id,
				name: _merchant.fullname,
				fbUrl: _merchant.fbUrl,
				instagramUrl: _merchant.insUrl,
				mobile:_merchant.mobileNumber,
				email:_merchant.email,
				businessName:_merchant.storeName,
				description:_merchant.storeIntro,
				withLive:_merchant.merchantSubscriptionType === "withLives" ? true : false,
				merchantBusinessType:_merchant.storeType,
				isActive: _merchant.isActive
				// TODO: Modify everything
			},
			{ headers: this.headers }
		)
			.subscribe((res: any) => {
				this.dialogRef.close({ _merchant, isEdit: true });
			}, err => {
				let msg = 'فشل في تعديل المتجر';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/**
	 * Create merchant
	 *
	 * @param _merchant: MerchantModel
	 */
	createMerchants(_merchant: MerchantModel) {

		// let merchantCreationDate = new Date(+new Date(_merchant.merchantCreationDate) - this.tzoffset).toISOString().slice(0, 16);
		  
// 		businessName: "asdasd"
// description: "asdasd"
// email: "bbb@gmail.com"
// fbUrl: "asdasd"
// instagramUrl: "asdasd"
// isActive: true
// merchantBusinessType: "asdasd"
// name: "تركتور٣٣"
// withLive: true

		this.http.post(
			globalVariables.baseUrl + 'api/Merchants',
			{
				
				name: _merchant.fullname,
				merchantBusinessType: _merchant.storeType,
				fbUrl: _merchant.fbUrl,
				instagramUrl: _merchant.insUrl,
				mobile: _merchant.mobileNumber,
				email: _merchant.email,
				businessName: _merchant.storeName,
				description: _merchant.storeIntro,
				isActive: _merchant.isActive,
				withLive: _merchant.merchantSubscriptionTypeId === 'withLives'
			},
			{ headers: this.headers }
		)
			.subscribe((res: any) => {
				this.dialogRef.close({ _merchant, isEdit: false });
			}, err => {
				let msg = 'فشل في اضافة المتجر';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/** Alert Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.merchantForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
