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
import {QuestionModel} from '../models/questions.model';
import {logger} from 'codelyzer/util/logger';

class AnswerForm {
	id: number;
	text: string;
	validator: FormGroup;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'livat-questions-edit-dialog',
	templateUrl: 'questions-edit.dialog.component.html',
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
export class QuestionsEditDialogComponent implements OnInit, OnDestroy {
	// Public properties
	userQuestions: QuestionModel;
	questionForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	myControl = new FormControl();
	filteredOptions: Observable<any[]>;
	statuses = [];
	numberOfAnswers = [];
	answers = [];
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
	 * @param fb: FormBuilder
	 * @param store: Store<AppState>
	 * @param layoutUtilsService
	 * @param http
	 */
	constructor(public dialogRef: MatDialogRef<QuestionsEditDialogComponent>,
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
		this.userQuestions = this.data.Question;
		this.createForm();
		this.numberOfAnswers = [];


		this.userQuestions.questionAnswers.forEach(answer => {
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
		let correctIndex = this.userQuestions.questionAnswers.findIndex(item => this.userQuestions.correctAnswer === item.text);

		this.questionForm = this.fb.group({
			id: [this.userQuestions.questionId, Validators.required],
			questionText: new FormControl(this.userQuestions.questionText, Validators.required),
			questionAnswers: new FormControl(this.userQuestions.questionAnswers, Validators.required),
			correctAnswer: [(correctIndex + 1).toString(), Validators.required],
			// questionStatus: [this.userQuestions.questionStatusId, this.userQuestions.id > 0 ? Validators.required : ''],
			// correctAnswer: [this.userQuestions.correctAnswer, Validators.required],
		});
	}

	addAnswer() {
		let answersForm = new AnswerForm();
		answersForm.validator = this.fb.group({
			answer: new FormControl(answersForm.text, Validators.required),
		});

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
	 * Returns page title
	 */
	getTitle(): string {
		if (this.userQuestions.id > 0) {
			return `تعديل السؤال`;
		}

		return 'اضافة حركة';
	}

	/**
	 * question control is invalid
	 * @param controlName: string
	 */
	isControlInvalid(controlName: string): boolean {
		const control = this.questionForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	/** ACTIONS */
	// getٍStatues() {
	// 	this.http.get(
	// 		globalVariables.baseUrl + 'api/questionStatuses',
	// 		{ headers: this.headers }
	// 	).subscribe((res: any) => {
	// 		this.statuses = res.data.map(item => {
	// 			return {
	// 				name: item.name,
	// 				id: item.id
	// 			};
	// 		});

	// 		this.questionForm.controls["questionStatus"].setValue(this.userQuestions.questionStatusId);
	// 	});
	// }

	/**
	 * Returns prepared customer
	 */

	prepareQuestions(): QuestionModel {
		const controls = this.questionForm.controls;
		const _question = new QuestionModel();
		_question.id = this.userQuestions.id;
		_question.questionId = this.userQuestions.questionId;
		_question.questionText = controls.questionText.value;
		_question.questionAnswers = controls.questionAnswers.value;
		// _question.questionCreationDate = controls.questionCreationDate.value;
		// _question.questionStatusId = controls.questionStatus.value;
		_question.correctAnswer = controls.correctAnswer.value;

		return _question;
	}

	/**
	 * On Submit
	 */
	onSubmit() {
		this.hasFormErrors = false;
		const controls = this.questionForm.controls;

		/** question form */
		if (this.questionForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const editedQuestions = this.prepareQuestions();
		if (editedQuestions.id > 0) {
			this.updateQuestions(editedQuestions);
		} else {
			this.createQuestions(editedQuestions);
		}
	}

	/**
	 * Update customer
	 *
	 * @param _question: QuestionModel
	 */
	updateQuestions(_question: QuestionModel) {
		// let questionCreationDate = new Date(+new Date(_question.questionCreationDate) - this.tzoffset).toISOString().slice(0, 16);

		let answers = [];
		let correctAnsId = 0;
		let correctAnsText = '';
		for (let index = 0; index < this.numberOfAnswers.length; index++) {
			const element = this.answers[index];
			if (element.id === undefined || element.id === null || (element.id === 0 && Number(_question.correctAnswer) === (index + 1))) {
				element.id = 0;
			} else {
				answers.push({id: element.id, text: element.text});
			}

			if (Number(_question.correctAnswer) === (index + 1)) {
				correctAnsId = element.id;
				if (correctAnsId === 0) {
					correctAnsText = element.text;
				}
			}
		}


		this.http.put(
			globalVariables.baseUrl + 'api/Questions',
			{
				id: _question.questionId,
				text: _question.questionText,
				correctAnswerId: correctAnsId,
				answers,
				newCorrectAnswer: correctAnsText
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_question, isEdit: true});
			}, err => {
				let msg = 'فشل في تعديل السؤال';
				if (err.error) {
					msg = err.error.msg;
				}

				this.layoutUtilsService.showActionNotification(msg);
			});
	}

	/**
	 * Create customer
	 *
	 * @param _question: QuestionModel
	 */
	createQuestions(_question: QuestionModel) {
		// let questionCreationDate = new Date(+new Date(_question.questionCreationDate) - this.tzoffset).toISOString().slice(0, 16);

		let answers = [];
		let wrongsAnswer = [];
		for (let index = 0; index < this.numberOfAnswers.length; index++) {
			const element = this.answers[index];
			answers.push(element.text);
			if ((Number(_question.correctAnswer) - 1) !== index) {
				wrongsAnswer.push(element.text);
			}
		}
		let correctChoice = answers[Number(_question.correctAnswer) - 1];

		this.http.post(
			globalVariables.baseUrl + 'api/Questions/daily',
			{
				questionText: _question.questionText,
				wrongAnswers: wrongsAnswer,
				correctAnswer: correctChoice

				// questionCreationDate: questionCreationDate,
				// questionStatusId: +_question.questionStatusId
			},
			{headers: this.headers}
		)
			.subscribe((res: any) => {
				this.dialogRef.close({_question, isEdit: false});
			}, err => {
				let msg = 'فشل في اضافة السؤال';
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
