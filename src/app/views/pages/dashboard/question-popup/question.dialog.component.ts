// Angular
import {Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, HostListener} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// Material
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
// RxJS
import {Subscription, of, Observable, BehaviorSubject} from 'rxjs';
import {delay, map, startWith} from 'rxjs/operators';
// NGRX
import {Update} from '@ngrx/entity';
import {Store, select} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {LayoutUtilsService} from '../../../../core/_base/crud';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {selectCustomersActionLoading} from '../../../../core/e-commerce';
import globalVariables from '../../globalVariables';

// Services and Models

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'info-dialog',
	templateUrl: 'question.dialog.component.html',
	styleUrls: ['question.dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class QuestionDialogComponent implements OnInit, OnDestroy {
	// Public properties
	showQuestion = new BehaviorSubject<boolean>(false);
	isDailyQuestion = false;
	isDailyAnswered = false;
	liveId = 0;
	questionElements = {
		question: {
			id: 0,
			text: ''
		},
		answers: []
	};
	viewLoading = false;
	answerWidth = this.getAnswerWidth();
	registerForm: FormGroup;
	loading = false;
	errors: any = [];

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
	 * @param dialogRef: MatDialogRef<QuestionssEditDialogComponent>
	 * @param data: any
	 * @param store
	 * @param layoutUtilsService
	 * @param http
	 * @param fb
	 */
	constructor(public dialogRef: MatDialogRef<QuestionDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private store: Store<AppState>,
				private layoutUtilsService: LayoutUtilsService,
				private http: HttpClient,
				private fb: FormBuilder,) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.registerForm = this.fb.group({
			pinCode: ['', Validators.compose([
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(4),
				// Validators.pattern('[0-9]*')
			])
			]
		});

		this.isDailyQuestion = this.data.isDailyQuestion;
		this.liveId = this.data.id;
		this.store.pipe(select(selectCustomersActionLoading)).subscribe(res => this.viewLoading = res);

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
		if (this.isDailyQuestion) {
			this.getQuestion();
		}
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.registerForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		return 'سؤال البث';
	}

	/**
	 * Get answer width depending on the largest answer
	 */
	getAnswerWidth() {
		let width = 0;
		let a: number[] = this.questionElements.answers.map(answer => {
			return answer.text.length;
		});

		if (a.length > 0) {
			width = Math.max(...a) + 20;
		}

		return width;
	}

	/** Alert Close event */
	onAlertClose($event) {
	}

	/**
	 * Get question
	 */
	getQuestion() {
		const controls = this.registerForm.controls;
		if (!this.isDailyQuestion) {

			// check form
			if (controls['pinCode'].invalid) {
				controls['pinCode'].markAsTouched();
				return;
			}
		}

		if (this.isDailyQuestion) {
			this.http.get(
				globalVariables.baseUrl + 'api/Questions/daily/today',
				{headers: this.headers}
			)
				.subscribe((res: any) => {
					let data = res.data;
					this.isDailyAnswered = data.isAnswered;
					this.questionElements.question = data.dailyQuestion.question;
					this.questionElements.question.id = data.dailyQuestion.id;
					this.questionElements.answers = data.answers;
					this.answerWidth = this.getAnswerWidth();
					this.showQuestion.next(true);
				}, (err) => {
					let msg = 'حدث خطأ اثناء عملية جلب السؤال٬ الرجاء المحاولة في وقت اخر';
					if (err.error) {
						if (err.error.msg) {
							msg = err.error.msg;
						}
					}

					this.layoutUtilsService.showActionNotification(msg);
				});
		} else {
			this.http.post(
				globalVariables.baseUrl + 'api/Lives/verify-code',
				{
					liveId: this.liveId,
					code: controls.pinCode.value
				},
				{headers: this.headers}
			)
				.subscribe((res: any) => {
					let data = res.data;
					let question = data.liveQuestion.liveQuestion.question;
					question.id = data.liveQuestion.liveQuestion.id;
					let answers = data.liveQuestion.answers;
					this.questionElements = {
						question,
						answers
					};
					this.answerWidth = this.getAnswerWidth();
					this.showQuestion.next(true);
				}, err => {
					let msg = 'الكود غير صحيح';
					if (err.error) {
						if (err.error.msg) {
							msg = err.error.msg;
						}
					}

					this.layoutUtilsService.showActionNotification(msg);
				});
		}
	}

	/**
	 * Submit answer
	 */
	answerQuestion(answerId) {
		let path = 'api/Questions/live/' + this.liveId + '/answer';
		if (this.isDailyQuestion) {
			path = 'api/Questions/daily/answer';
		}

		this.http.post(
			globalVariables.baseUrl + path,
			{
				liveOrDailyQuestionId: this.questionElements.question.id,
				answerId
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({success: true});
			}, err => {
				let msg = 'حدث خطأ اثناء اجابة السؤال';
				if (err.error) {
					if (err.error.msg) {
						msg = err.error.msg;
					}
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}
}
