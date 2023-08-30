// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog, MatTableDataSource } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, delay, take } from 'rxjs/operators';
import { fromEvent, merge, Subscription, of } from 'rxjs';
// Translate Module
import { TranslateService } from '@ngx-translate/core';
// NGRX
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import { MerchantModel } from '../models/merchants.model';
// Components
import { MerchantsEditDialogComponent } from '../merchants-edit/merchants-edit.dialog.component';
// Http
import { HttpClient, HttpHeaders } from '@angular/common/http';
import globalVariables from '../../../globalVariables';

// Table with EDIT item in MODAL
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/compgetItemCssClassByStatusonents/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'livat-merchants-view',
	templateUrl: 'merchants.component.html',
	styleUrls: ['merchants.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantsViewComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: MatTableDataSource<MerchantModel>;
	displayedColumns = ['mobileNumber', 'fullname', 'email', 'storeName', 'fbUrl', 'insUrl', 'storeType', 'storeIntro', 'merchantSubscriptionType', 'merchantCreationDate', 'isActive', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	isLoadingResults = false;
	// Filter fields
	statuses = '';
	selectedMerchantStatus = '';
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	dateFrom = new Date(+new Date(this.date.getFullYear(), this.date.getMonth(), 1) - this.tzoffset).toISOString().slice(0, 16);
	dateTo = new Date(+new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0) - this.tzoffset).toISOString().slice(0, 16);
	// Filter data
	// Selection
	selection = new SelectionModel<MerchantModel>(true, []);
	customersResult: MerchantModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	// Store
	token = '';
	credentialsSubscription: Subscription = null;
	headers = null;
	requestOptions = {};
	role = '';
	// Language
	languageText = {
		empty: 'لا يوجد بيانات لعرضها',
		searching: 'جار البحث ...',
		search: 'بحث',
		filterEmptyMessage: 'لا يوجد بيانات مطابقة ل ',
		confirm: 'تأكيد',
		close: 'الغاء',
		add: 'اضافة',
		itemsPerPage: 'عدد الصفوف بالصفحة:',
		firstPage: 'الصفحة الأولى',
		lastpage: 'الصفحة الأخيرة',
		previousPage: 'الصفحة السابقة',
		nextPage: 'الصفحة التالية'
	};
	// Symmary data
	totalBalance = 0;

	/**
	 * Component constructor
	 *
	 * @param dialog: MatDialog
	 * @param snackBar: MatSnackBar
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 * @param http
	 */
	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private http: HttpClient
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// Init DataSource
		this.dataSource = new MatTableDataSource();

		this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.token = state.authToken;
			this.headers = new HttpHeaders({ Authorization: 'Bearer ' + this.token, responseType: 'text' });
			this.requestOptions = {
				headers: this.headers,
				// responseType: 'text'
			};
		});

		this.subscriptions.push(this.credentialsSubscription);
		this.loadMerchantsList();
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.subscriptions.forEach(el => el.unsubscribe());
	}

	arabicRangeLabel = (page: number, pageSize: number, length: number) => {
		if (length === 0 || pageSize === 0) {
			return `0 من ${length}`;
		}

		length = Math.max(length, 0);

		const startIndex = page * pageSize;

		// If the start index exceeds the list length, do not try and fix the end index to the end.
		const endIndex = startIndex < length ?
			Math.min(startIndex + pageSize, length) :
			startIndex + pageSize;

		return `${startIndex + 1} - ${endIndex} من ${length}`;
	};

	/**
	 * Load Merchants List from service through data-source
	 */
	loadMerchantsList(query = '') {
		this.isLoadingResults = true;
		// let dateFrom = new Date(+new Date(this.dateFrom) - this.tzoffset).toISOString().slice(0, 16);
		// let dateTo = new Date(+new Date(this.dateTo) - this.tzoffset).toISOString().slice(0, 16);
		// let url = '?FromDate=' + dateFrom + '&ToDate=' + dateTo;
		// if (query !== '') {
		// 	url += '&SerachParam=' + query;
		// }

		this.http.get(
			globalVariables.baseUrl + 'api/Merchants/active',
			{ headers: this.headers }
		)
			.subscribe((res: any) => {
				this.isLoadingResults = false;
				let data = [];
				// for (let index = 0; index < res.data.length; index++) {
				// 	const element = res.data[index];
				// 	data.push({
				// 		...element,
				// 	});
				// }

				data = res.data.map(item => {
					return {
						id: item.id,
						mobileNumber: item.mobile,
						fullname: item.name,
						email: item.email,
						storeName: item.businessName,
						fbUrl: item.fbUrl,
						insUrl: item.instagramUrl,
						storeType: item.merchantBusinessType,
						storeIntro: item.description,
						merchantSubscriptionType: item.withLive ? 'مع لايفات' : 'بدون لايفات',
						merchantSubscriptionTypeId: item.withLive ? 'withLives' : 'withoutLives',
						merchantCreationDate: item.creationDate.split('T').join(" "),
						isActive: item.isActive
					}
				})

				this.dataSource = new MatTableDataSource(data);

				if (this.paginator) {
					this.paginator._intl.itemsPerPageLabel = this.languageText.itemsPerPage;
					this.paginator._intl.firstPageLabel = this.languageText.firstPage;
					this.paginator._intl.previousPageLabel = this.languageText.previousPage;
					this.paginator._intl.nextPageLabel = this.languageText.nextPage;
					this.paginator._intl.lastPageLabel = this.languageText.lastpage;

					this.paginator._intl.getRangeLabel = this.arabicRangeLabel;
				}

				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			}, (err) => {
				this.isLoadingResults = false;

				this.dataSource.data = [];

				if (this.paginator) {
					this.paginator._intl.itemsPerPageLabel = this.languageText.itemsPerPage;
					this.paginator._intl.firstPageLabel = this.languageText.firstPage;
					this.paginator._intl.previousPageLabel = this.languageText.previousPage;
					this.paginator._intl.nextPageLabel = this.languageText.nextPage;
					this.paginator._intl.lastPageLabel = this.languageText.lastpage;

					this.paginator._intl.getRangeLabel = this.arabicRangeLabel;
				}

				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			});
	}

	/** ACTIONS */

	/**
	 * Delete Merchant
	 *
	 * @param _item: MerchantModel
	 */
	deleteMerchant(_item: MerchantModel) {
		const _title: string = 'حذف المتجر';
		const _description: string = 'هل أنت متأكد من حذف المتجر';
		const _waitDesciption: string = 'جاري الحذف';
		const _deleteMessage = 'لقد تم الحذف';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.http.delete(
				globalVariables.baseUrl + 'api/Merchants/' + _item.id,
				{ headers: this.headers }
			)
				.subscribe((res: any) => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.loadMerchantsList();
				}, err => {
					let msg = 'فشل في حذف المتجر';
					if (err.error) {
						msg = err.error.msg;
					}

					this.layoutUtilsService.showActionNotification(msg);
				});
		});
	}

	/**
	 * Show add Merchant dialog
	 */
	addMerchant() {
		const newMerchant = new MerchantModel();
		newMerchant.clear(); // Set all defaults fields
		this.editMerchant(newMerchant);
	}

	/**
	 * Show Edit Merchant dialog and save after success close result
	 * @param Merchant: MerchantModel
	 */
	editMerchant(Merchant: MerchantModel) {
		let saveMessageTranslateParam = Merchant.id <= 0 ? 'تم الاضافة بنجاح' : 'تمت التعديل بنجاح';
		const _saveMessage = saveMessageTranslateParam;
		const _messageType = Merchant.id > 0 ? MessageType.Update : MessageType.Create;
		const dialogRef = this.dialog.open(MerchantsEditDialogComponent, {
			data: {
				Merchant
			}
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType);
			this.loadMerchantsList();
		});
	}

	/**
	 * Get file name of the exported excel file
	 */
	getExcelFileName() {
		return 'المتاجر' + '-' + new Date().toISOString().slice(0, 10);
	}

	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: boolean = false): string {
		switch (status) {
			case false:
				return 'danger';
			case true:
				return 'success';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: number
	 */
	getItemStatusString(status: boolean = false): string {
		switch (status) {
			case false:
				return 'غير فعال';
			case true:
				return 'فعال';
		}
		return '';
	}
}
