// Angular
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, HostListener, NgZone, OnDestroy, OnInit} from '@angular/core';
// Lodash
import {shuffle} from 'lodash';
import {BehaviorSubject, Subscription} from 'rxjs';
// Services
// Widgets model
import {LayoutConfigService, SparklineChartOptions} from '../../../core/_base/layout';
import {Widget4Data} from '../../partials/content/widgets/widget4/widget4.component';
import globalVariables from '../globalVariables';
// NGRX
import {Store, ActionsSubject} from '@ngrx/store';
import {AppState} from '../../../core/reducers';
import {MatDialog, MatSnackBar} from '@angular/material';
import {QuestionsEditDialogComponent} from '../questions/questions-view/questions-edit/questions-edit.dialog.component';
import {QuestionDialogComponent} from './question-popup/question.dialog.component';
import {LayoutUtilsService, MessageType} from '../../../core/_base/crud';
import {Router} from '@angular/router';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
	closeResult: string;
	isDailyQuestion = false;
	remainingTimeInterval = null;
	changesHappened = new BehaviorSubject<{ showSchedule: boolean, showLiveQuestion: boolean, showDailyQuestion: boolean, showOtherPagesSection: boolean }>
	({showSchedule: false, showLiveQuestion: false, showDailyQuestion: false, showOtherPagesSection: false});
	activeLives = [
		// {
		// 	id: 0,
		// 	fbFrameSrc: `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FAlShiniSupermarket&tabs&width=340&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId`,
		// 	merchantName: 'الشني',
		// 	instgramUrl: 'https://www.instagram.com/supermarket_al_shini/',
		// 	activeLiveFinishTime: '2021/04/11 15:00:00',
		// 	activeLiveReaminingTime: '',
		// },
	];

	otherPages = [
		// {
		// 	fbFrameSrc: `https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/AlShiniSupermarket/&tabs&width=340&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId`,
		// 	merchantName: 'الشني',
		// 	instgramUrl: 'https://www.instagram.com/supermarket_al_shini/',
		// 	activeLiveFinishTime: '2021/04/10 15:00:00',
		// 	activeLiveReaminingTime: '',
		// },
		// {
		// 	fbFrameSrc: `https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/MaxMarSupermarkets/&tabs&width=340&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId`,
		// 	merchantName: 'ماكس مار',
		// 	instgramUrl: 'https://www.instagram.com/maxmarsupermarket/',
		// 	activeLiveFinishTime: '2021/04/10 16:00:00',
		// 	activeLiveReaminingTime: '',
		// },
	];

	todaySchedule = [
		// {
		// 	time: '9:00',
		// 	icon: 'fa fa-genderless kt-font-danger',
		// 	text: 'لايف للشني للسحب على ايفون',
		// },
		// {
		// 	time: '10:30',
		// 	icon: 'fa fa-genderless kt-font-success',
		// 	text: 'لايف لماكس مار للسحب على خمس جوائز نقدية',
		// 	attachment: '\n' +
		// 		'<a href="#"><img src="https://yellowpages.com.ps/images/companies/logos/152052588938990928-300x300.png?token=4a35c817f6c030fe6f21fa39f3e5fceb" title="" alt=""></a>'
		// },
		// {
		// 	time: '1:00',
		// 	icon: 'fa fa-genderless kt-font-brand',
		// 	text: 'لايف لمطعم سامر',
		// 	attachment: '\n' +
		// 		'<a href="#"><img src="https://shobiddak.com/uploads/picture/daleel/name/11623/thumb_SDC10032.JPG" title="" alt=""></a>'
		// },
		// {
		// 	time: '12:00',
		// 	icon: 'fa fa-genderless kt-font-info',
		// 	text: 'Appointment with Mrs. Amal',
		// 	attachment: '\n' +
		// 		'<a href="$event.preventDefault();"><img src="./assets/media/users/100_11.jpg" title="" alt=""></a>'
		// },
		// {
		// 	time: '12:45',
		// 	icon: 'fa fa-genderless kt-font-success',
		// 	text: 'AEOL Meeting With',
		// 	attachment: '\n' + '<a href="$event.preventDefault();"><img src="./assets/media/users/100_4.jpg" title="" alt=""></a>'
		// },
		// {
		// 	time: '13:00',
		// 	icon: 'fa fa-genderless kt-font-danger',
		// 	text: 'Appointment with Mr. Ahmad',
		// },
		// {
		// 	time: '14:00',
		// 	icon: 'fa fa-genderless kt-font-brand',
		// 	text: 'Appointment with Mrs. Nadia',
		// 	attachment: '\n' +
		// 		'<a href="$event.preventDefault();"><img src="./assets/media/users/100_4.jpg" title="" alt=""></a>'
		// },
	];

	// Subscriptions
	private subscriptions: Subscription[] = [];
	// Store
	token = '';
	credentialsSubscription: Subscription = null;
	headers = null;
	requestOptions = {};
	innerWidth = window.innerWidth;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService
	 * @param http
	 * @param store
	 * @param dialog
	 * @param snackBar
	 * @param layoutUtilsService
	 * @param router
	 * @param zone
	 */
	constructor(private layoutConfigService: LayoutConfigService,
				private http: HttpClient,
				private store: Store<AppState>,
				public dialog: MatDialog,
				public snackBar: MatSnackBar,
				private layoutUtilsService: LayoutUtilsService,
				private router: Router,
				private zone: NgZone,
	) {
	}

	ngOnInit(): void {
		this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.token = state.authToken;
			this.headers = new HttpHeaders({Authorization: 'Bearer ' + this.token, responseType: 'text'});
			this.requestOptions = {
				headers: this.headers,
				// responseType: 'text'
			};
		});

		this.subscriptions.push(this.credentialsSubscription);

		this.getPaymentStatus();
		this.getDailyLives();
		this.getOtherPages();
		// TODO: Enable it on production
		// this.remainingTimeInterval = setInterval(() => {
		// 	this.setLiveRemainingTime();
		// }, 100);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		if (this.remainingTimeInterval != null) {
			clearInterval(this.remainingTimeInterval);
		}

		this.subscriptions.forEach(el => el.unsubscribe());
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.innerWidth = event.target.innerWidth;
	}

	setLiveRemainingTime() {
		for (let i = 0; i < this.activeLives.length; i++) {
			let finishDate = new Date(this.activeLives[i].activeLiveFinishTime);
			let currentDate = new Date();

			const milliseconds = +finishDate - +currentDate;
			if (milliseconds > 0) {
				this.activeLives[i].activeLiveReaminingTime = (Math.floor(milliseconds / 60000)).toString();
			}
		}
	}

	openInstgramPage(url) {
		console.log(url);
		window.open(url, '_blank');
	}

	goToQuestion(i = 0) {
		console.log(this.isDailyQuestion);
		const dialogRef = this.dialog.open(QuestionDialogComponent, {
			data: {
				isDailyQuestion: this.isDailyQuestion,
				id: i
			}
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification('تم تسجيل اجابتك، تأكد انك قمت بعمل اعجاب لصفحة الفيس بوك و متابعة لحساب الانستجرام لتدخل السحب', MessageType.Create);
			this.getActiveLives();
		});
	}

	getPaymentStatus() {
		return this.http.get(
			globalVariables.baseUrl + 'api/users/payment/status',
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				let role = localStorage.getItem('role');
				if (!res.isPaid && role !== 'Admin') {
					this.zone.run(() => {
						this.router.navigateByUrl('/auth/register?subscriber=user')
							.then(res => {
								this.router.navigate['/auth/register?subscriber=user'];
							}).catch(err => {
						});
					});
				}
			}, (err) => {
			});
	}

	getActiveLives() {
		this.http.get(
			globalVariables.baseUrl + 'api/Lives/active',
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.activeLives = res.data.map(item => {
					return {
						...item,
						fbFrameSrc: 'https://www.facebook.com/plugins/page.php?href=' + item.fbUrl + '&tabs&width=340&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId'
					};
				});
				this.changesHappened.next({
					showSchedule: true,
					showLiveQuestion: !this.isDailyQuestion,
					showDailyQuestion: this.isDailyQuestion,
					showOtherPagesSection: true
				});
				this.setLiveRemainingTime();
			}, (err) => {
			});
	}

	getOtherPages() {
		this.http.get(
			globalVariables.baseUrl + 'api/Merchants/pages',
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.otherPages = res.data.map(item => {
					return {
						...item,
						fbFrameSrc: 'https://www.facebook.com/plugins/page.php?href=' + item.fbUrl + '&tabs&width=340&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId'
					};
				});
				this.changesHappened.next({
					showSchedule: true,
					showLiveQuestion: !this.isDailyQuestion,
					showDailyQuestion: this.isDailyQuestion,
					showOtherPagesSection: true
				});
			}, (err) => {
			});
	}

	getDailyLives() {
		this.http.get(
			globalVariables.baseUrl + 'api/Lives/today',
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.isDailyQuestion = res.data.isDaily;
				console.log(this.isDailyQuestion);
				if (!this.isDailyQuestion) {
					this.getActiveLives();
				} else {
					this.changesHappened.next({
						showSchedule: true,
						showLiveQuestion: !this.isDailyQuestion,
						showDailyQuestion: this.isDailyQuestion,
						showOtherPagesSection: true
					});
				}
				this.todaySchedule = res.data.lives.map(item => {
					let startTime = new Date(item.startDateTime).getHours() + ':' + (new Date(item.startDateTime).getMinutes() > 9 ? new Date(item.startDateTime).getMinutes() : '0' + new Date(item.startDateTime).getMinutes());
					let endTime = new Date(item.endDateTime).getHours() + ':' + (new Date(item.endDateTime).getMinutes() > 9 ? new Date(item.endDateTime).getMinutes() : '0' + new Date(item.endDateTime).getMinutes());
					return {
						time: startTime + ' - ' + endTime,
						icon: 'fa fa-genderless kt-font-danger',
						text: item.businessName + ' - ' + item.prize,
					};
				});
				this.changesHappened.next({
					showSchedule: true,
					showLiveQuestion: !this.isDailyQuestion,
					showDailyQuestion: this.isDailyQuestion,
					showOtherPagesSection: true
				});
			}, (err) => {
				this.todaySchedule = [];
			});
	}
}
