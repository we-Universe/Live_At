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
import {ScheduleModel} from '../models/schedule.model';

class AnswerForm {
	id: number;
	text: string;
	validator: FormGroup;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'livat-schedule-edit-dialog',
	templateUrl: 'schedule-edit.dialog.component.html',
	styles: [`
        .close {
            position: absolute;
            top: 1px;
            left: 1px;
            cursor: pointer;
        }

        .close:hover {
            color: red;
        }
	`],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ScheduleEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	userSchedules: ScheduleModel;
	scheduleForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	myControl = new FormControl();
	filteredOptions: Observable<any[]>;
	answers = [];
	numberOfAnswers = [];
	statuses = [];
	merchants = [];
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
	 * @param dialogRef: MatDialogRef<schedulessEditDialogComponent>
	 * @param data: any
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param layoutUtilsService
	 * @param http
	 */
	constructor(public dialogRef: MatDialogRef<ScheduleEditDialogComponent>,
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
		this.userSchedules = this.data.Live;
		this.numberOfAnswers = [];

		this.userSchedules.liveAnswers.forEach(answer => {
			let answersForm = new AnswerForm();
			answersForm.id = answer.id;
			answersForm.text = answer.text;
			answersForm.validator = this.fb.group({
				answer: new FormControl(answersForm.text, Validators.required),
			});

			this.answers.push(answersForm);
			this.numberOfAnswers.push(1);
		});

		while (this.numberOfAnswers.length < 2) {
			this.addAnswer();
		}

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
		this.getMerchants();
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
		let liveFromDate = new Date(+new Date(this.userSchedules.liveFromDate) - this.tzoffset).toISOString().substr(0, 16);
		let liveToDate = new Date(+new Date(this.userSchedules.liveToDate) - this.tzoffset).toISOString().substr(0, 16);
		let correctIndex = this.userSchedules.liveAnswers.findIndex(item => this.userSchedules.correctAnswer === item.text);


		this.scheduleForm = this.fb.group({
			id: [this.userSchedules.id, Validators.required],
			// liveName: new FormControl(this.userSchedules.liveName, Validators.required),
			merchant: [this.userSchedules.merchantId, Validators.required],
			prize: new FormControl(this.userSchedules.prize, Validators.required),
			// code: new FormControl(this.userSchedules.code, Validators.required),
			liveQuestion: new FormControl(this.userSchedules.liveQuestion, Validators.required),
			// liveAnswers: new FormControl(this.userSchedules.liveAnswers, Validators.required),
			correctAnswer: [(correctIndex + 1).toString(), Validators.required],
			liveFromDate: new FormControl(liveFromDate, Validators.required),
			liveToDate: new FormControl(liveToDate, Validators.required),
			isActive: [this.userSchedules.isActive, Validators.compose([
				Validators.required
			])
			],
		});
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.userSchedules.id > 0) {
			return `تعديل البث`;
		}

		return 'اضافة حركة';
	}

	/**
	 * schedule control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.scheduleForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */
	getMerchants() {
		this.http.get(
			globalVariables.baseUrl + 'api/merchants/active',
			{headers: this.headers}
		).subscribe((res: any) => {
			this.merchants = res.data.map(item => {
				return {
					name: item.name,
					id: item.id
				};
			});

			this.scheduleForm.controls['merchant'].setValue(this.userSchedules.merchantId);
		});
	}

	// getٍStatues() {
	// 	this.http.get(
	// 		globalVariables.baseUrl + 'api/scheduleStatuses',
	// 		{ headers: this.headers }
	// 	).subscribe((res: any) => {
	// 		this.statuses = res.data.map(item => {
	// 			return {
	// 				name: item.name,
	// 				id: item.id
	// 			};
	// 		});

	// 		this.scheduleForm.controls["scheduleStatus"].setValue(this.userSchedules.scheduleStatusId);
	// 	});
	// }

	addAnswer() {
		let answersForm = new AnswerForm();
		answersForm.validator = this.fb.group({
			answer: new FormControl(answersForm.text, Validators.required),
		});
		answersForm.id = 0;
		this.answers.push(answersForm);
		this.numberOfAnswers.push(1);
	}

	deleteAnswer(index) {
		this.answers.splice(index, 1);
		this.numberOfAnswers.splice(index, 1);
	}

	resetAnswers() {
		this.answers.splice(2);
		this.numberOfAnswers.splice(2);
	}

	/**
	 * Returns prepared schedule
	 */
	prepareSchedules(): ScheduleModel {
		const controls = this.scheduleForm.controls;
		const _schedule = new ScheduleModel();
		_schedule.id = this.userSchedules.id;
		_schedule.liveQuestionId = this.userSchedules.liveQuestionId;
		// _schedule.liveName = controls.liveName.value;
		_schedule.merchant = controls.merchant.value;
		// _schedule.merchant = this.userSchedules.merchant;
		// _schedule.prize = controls.prize.value;
		// _schedule.code = controls.code.value;
		_schedule.liveQuestion = controls.liveQuestion.value;
		// _schedule.liveAnswers = controls.liveAnswers.value;
		_schedule.prize = controls.prize.value;
		// _schedule.scheduleStatusId = controls.scheduleStatus.value;
		_schedule.correctAnswer = controls.correctAnswer.value;
		_schedule.liveFromDate = controls.liveFromDate.value;
		_schedule.liveToDate = controls.liveToDate.value;
		_schedule.isActive = controls.isActive.value;
		return _schedule;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.scheduleForm.controls;

		if(controls.correctAnswer.value > this.numberOfAnswers.length)
		{
			this.scheduleForm.controls["correctAnswer"].setValue('');
		}

		/** schedule form */
		if (this.scheduleForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
		}

		for (let index = 0; index < this.numberOfAnswers.length; index++) {
			const element = this.answers[index];

			const controls = element.validator.controls;

			/** check form */
			if (element.validator.invalid) {
				console.log(element.validator);

				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);

				this.hasFormErrors = true;
			}
		}

		if (this.hasFormErrors) {
			return;
		}

		const editedSchedules = this.prepareSchedules();
		if (editedSchedules.id > 0) {
			this.updateSchedules(editedSchedules);
		} else {
			this.createSchedules(editedSchedules);
		}
	}

	/**
	 * Update schedule
	 *
	 * @param _schedule: ScheduleModel
	 */
	updateSchedules(_schedule: ScheduleModel) {
		let liveFromDate = new Date(+new Date(_schedule.liveFromDate) - this.tzoffset).toISOString().slice(0, 16);
		let liveToDate = new Date(+new Date(_schedule.liveToDate) - this.tzoffset).toISOString().slice(0, 16);

		let answers = [];
		let correctAnsId = 0;
		let correctAnsText = '';
		for (let index = 0; index < this.numberOfAnswers.length; index++) {
			const element = this.answers[index];
			if (element.id === undefined || element.id === null || (element.id === 0 && Number(_schedule.correctAnswer) === (index + 1))) {
				element.id = 0;
			} else {
				answers.push({id: element.id, text: element.text});
			}

			if (Number(_schedule.correctAnswer) === (index + 1)) {
				correctAnsId = element.id;
				if (correctAnsId === 0) {
					correctAnsText = element.text;
				}
			}
		}

		let question = {
			id: 0,
			text: _schedule.liveQuestion,
			correctAnswerId: correctAnsId,
			answers,
			newCorrectAnswer: correctAnsText
		};
		this.http.put(
			globalVariables.baseUrl + 'api/Lives',
			{
				id: _schedule.id,
				merchantId: Number(_schedule.merchant),
				liveQuestionId: Number(_schedule.liveQuestionId),
				startDateTime: _schedule.liveFromDate,
				endDateTime: _schedule.liveToDate,
				prize: _schedule.prize,
				isActive: _schedule.isActive,
				question
				// scheduleStatusId: +_schedule.scheduleStatusId
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_schedule, isEdit: true});
			}, err => {
				let msg = 'فشل في تعديل البث';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/**
	 * Create schedule
	 *
	 * @param _schedule: ScheduleModel
	 */
	createSchedules(_schedule: ScheduleModel) {
		let liveFromDate = new Date(+new Date(_schedule.liveFromDate) - this.tzoffset).toISOString().slice(0, 16);
		let liveToDate = new Date(+new Date(_schedule.liveToDate) - this.tzoffset).toISOString().slice(0, 16);

		let answers = [];
		let wrongsAnswer = [];
		for (let index = 0; index < this.numberOfAnswers.length; index++) {
			const element = this.answers[index];
			answers.push(element.text);
			if ((Number(_schedule.correctAnswer) - 1) !== index) {
				wrongsAnswer.push(element.text);
			}
		}

		// {
		// 	"merchantId": 0,
		// 	"startDateTime": "2021-04-20T08:27:59.718Z",
		// 	"endDateTime": "2021-04-20T08:27:59.718Z",
		// 	"prize": "string",
		// 	"questionRequest": {
		// 	  "questionText": "string",
		// 	  "wrongAnswers": [
		// 		"string"
		// 	  ],
		// 	  "correctAnswer": "string"
		// 	}
		//   }

		let correctChoice = answers[Number(_schedule.correctAnswer) - 1];

		this.http.post(
			globalVariables.baseUrl + 'api/Lives',
			{
				merchantId: Number(_schedule.merchant),
				startDateTime: liveFromDate,
				endDateTime: liveToDate,
				prize: _schedule.prize,
				questionRequest: {
					questionText: _schedule.liveQuestion,
					wrongAnswers: wrongsAnswer,
					correctAnswer: correctChoice
				}
				// ..._schedule,
				// liveFromDate,
				// liveToDate,
				// liveAnswers: answers
				// scheduleStatusId: +_schedule.scheduleStatusId
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_schedule, isEdit: false});
			}, err => {
				let msg = 'فشل في اضافة البث';
				
				if(err.error.StatusCode == 409){
					msg = 'لا تستطيع اضافة لايف في نفس الوفت.'
				}
				this.layoutUtilsService.showActionNotification(msg);

				
			});
	}

	/** Alert Close event */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
