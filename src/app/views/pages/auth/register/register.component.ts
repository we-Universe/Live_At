// Angular
import {
	ChangeDetectorRef,
	Component,
	NgZone,
	OnDestroy,
	OnInit,
	ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// RxJS
import { finalize, takeUntil, tap } from "rxjs/operators";
// Translate
import { TranslateService } from "@ngx-translate/core";
// NGRX
import { Store } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
// Auth
import {
	AuthNoticeService,
	AuthService,
	Register,
	User,
} from "../../../../core/auth/";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { ConfirmPasswordValidator } from "./confirm-password.validator";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import globalVariables from "../../globalVariables";
import { InfoDialogComponent } from "../info-popup/info.dialog.component";
import { MatDialog } from "@angular/material";
import { LayoutUtilsService } from "../../../../core/_base/crud";
import set = Reflect.set;
import { IfStmt } from "@angular/compiler";

@Component({
	selector: "kt-register",
	templateUrl: "./register.component.html",
	encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent implements OnInit, OnDestroy {
	isMerchant = true;
	isPinSent = false;
	subscriptionId = 0;
	registerForm: FormGroup;
	loading = false;
	active = new BehaviorSubject(true);
	errors: any = [];
	// Subscriptions
	instpattern = /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/;
	fBpattern = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
	private subscriptions: Subscription[] = [];
	// Store
	token = "";
	credentialsSubscription: Subscription = null;
	headers = null;
	requestOptions = {};
	dataChanged = new BehaviorSubject<{ isPinSent: boolean; subId: number }>({
		isPinSent: this.isPinSent,
		subId: this.subscriptionId,
	});
	info = [
		`يتم الاشتراك بواسطة حساب الفيسبوك\ انستغرام.`,
		`يتم ارسال كود على رقم الموبايل للمشترك جوال او اوريدو او اسرائيلي.`,
		`يشترط على المتسابقين دخول صفحات المحلات المشتركة باللايف ومتابعة اللايف ومن ثم الاجابة على السؤال.`,
		`يدخل اسم المتسابق السحب في الصفحة الرئيسية للمسابقة.`,
		`يمكن لصاحب المحل تقديم جوائز من خلال اللايف الخاص به.`,
		`نحن نضمن لك متابعات من مستخدمي السوشال ميديا في الضفة والداخل على ان تكون متابعات فعالة وحقيقية بحيث يتفاعل معك من يتابعك.`,
		`الرجاء تعبئة النموذج بالبيانات الكاملة وصيغة التواصل معك من اجل اتمام الاتفاق.`,
		`ملاحظة : b `,
		`يجب أن يكون الاشتراك في المسابقة وفقا للشروط المقررة والتاريخ والزمن المحددين في إشعار المسابقة. وسيؤدي عدم الالتزام بذلك لاستبعاد المشارك من المسابقة.`,
		`عدد اللايفات اليومية محدود جدا وستكون الاولوية لاول 20 محل تشترك في مسابقة لايفات`,
	];
	private unsubscribe: Subject<any>; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
	isFbUrlvalid: boolean;

	/**
	 * Component constructor
	 *
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * @param router: Router
	 * @param auth: AuthService
	 * @param layoutUtilsService
	 * @param http
	 * @param store: Store<AppState>
	 * @param fb: FormBuilder
	 * @param cdr
	 * @param route
	 * @param dialog
	 * @param zone
	 */
	constructor(
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private router: Router,
		private auth: AuthService,
		private layoutUtilsService: LayoutUtilsService,
		private http: HttpClient,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private zone: NgZone
	) {
		this.unsubscribe = new Subject();
		let queryParamSubscriber = this.route.queryParams.subscribe(
			(params) => {
				this.isMerchant = params["subscriber"] !== "user";
			}
		);
		this.subscriptions.push(queryParamSubscriber);
	}

	/*
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (this.isMerchant) {
			const dialogRef = this.dialog.open(InfoDialogComponent, {
				data: {
					info: this.info,
					title: "الية الاشتراك",
				},
			});
		}

		this.authNoticeService.setNotice("");
		this.credentialsSubscription = this.store
			.select("credentials")
			.subscribe((state) => {
				this.token = state.authToken;
				if (!this.isMerchant && this.token === undefined) {
					this.router.navigateByUrl("/");
				}
				this.headers = new HttpHeaders({
					Authorization: "Bearer " + this.token,
					responseType: "text",
				});
				this.requestOptions = {
					headers: this.headers,
					// responseType: 'text'
				};
			});

		this.subscriptions.push(this.credentialsSubscription);
		this.initRegisterForm();
	}

	/*
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.subscriptions.forEach((el) => el.unsubscribe());
		this.loading = false;
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initRegisterForm() {
		this.registerForm = this.fb.group(
			{
				mobileNumber: [
					"",
					Validators.compose([
						Validators.required,
						Validators.minLength(9),
						Validators.maxLength(14),
						Validators.pattern("[0-9]*"),
					]),
				],
				pinCode: [
					"",
					this.isMerchant
						? ""
						: Validators.compose([
								Validators.required,
								Validators.minLength(4),
								Validators.maxLength(4),
								Validators.pattern("[0-9]*"),
						  ]),
				],
				operator: [
					"",
					this.isMerchant
						? ""
						: Validators.compose([Validators.required]),
				],
				fullname: [
					"",
					Validators.compose([
						Validators.required,
						Validators.minLength(3),
						Validators.maxLength(100),
					]),
				],
				email: [
					"",
					Validators.compose([
						// Validators.required,
						Validators.email,
						Validators.minLength(3),
						// https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
						Validators.maxLength(320),
					]),
				],
				storeName: ["", Validators.compose([Validators.required])],
				fbUrl: [
					"",
					Validators.compose([
						Validators.required,
						Validators.pattern(this.fBpattern),
					]),
				],
				insUrl: [
					"",
					Validators.compose([
						Validators.required,
						Validators.pattern(this.instpattern),
					]),
				],
				storeType: ["", Validators.compose([])],
				storeIntro: ["", Validators.compose([])],
				// username: ['', Validators.compose([
				// 	Validators.required,
				// 	Validators.minLength(3),
				// 	Validators.maxLength(100)
				// ]),
				// ],
				// password: ['', Validators.compose([
				// 	Validators.required,
				// 	Validators.minLength(3),
				// 	Validators.maxLength(100)
				// ])
				// ],
				// confirmPassword: ['', Validators.compose([
				// 	Validators.required,
				// 	Validators.minLength(3),
				// 	Validators.maxLength(100)
				// ])
				// ],
				// agree: [false, Validators.compose([Validators.required])],
				merchantSubscriptionType: [
					"withLives",
					Validators.compose([Validators.required]),
				],
			}
			// , {
			// 	validator: ConfirmPasswordValidator.MatchPassword
			// }
		);
		const controls = this.registerForm.controls;
		Object.keys(controls).forEach((controlName) =>
			controls[controlName].markAsUntouched()
		);
	}

	sendPinCode() {
		const controls = this.registerForm.controls;
		let inError = false;
		// check form
		if (controls["mobileNumber"].invalid) {
			controls["mobileNumber"].markAsTouched();
			inError = true;
		}

		if (controls["operator"].invalid) {
			controls["operator"].markAsTouched();
			inError = true;
		}

		if (inError) {
			return;
		}

		this.authNoticeService.setNotice("");
		this.isPinSent = false;
		this.registerForm.controls["pinCode"].setValue("");
		this.subscriptionId = 0;
		this.loading = true;
		this.http
			.post(
				globalVariables.baseUrl + "api/Users/optIn",
				{
					msisdn: controls.mobileNumber.value,
					operator: controls.operator.value,
				},
				{ headers: this.headers }
			)
			.pipe(
				finalize(() => {
					this.loading = false;
				})
			)
			.subscribe(
				(res: any) => {
					if (res.status === "noBilling" || res.status === "Active") {
						this.zone.run(() => {
							this.router
								.navigateByUrl("/dashboard")
								.then((res) => {
									this.router.navigate["/dashboard"];
								})
								.catch((err) => {});
						});
						return;
					}
					this.subscriptionId = res.data;
					this.dataChanged.next({
						isPinSent: true,
						subId: this.subscriptionId,
					});
				},
				(err) => {
					let msg =
						"حدث خطأ أثناء عملية الاشتراك ، الرجاء اعادة المحاولة";
					if (err.error) {
						if (err.error.message) {
							msg = err.error.message;
						}
					}

					this.authNoticeService.setNotice(msg, "danger");
				}
			);
	}

	isFbUrlExist(controls) {
		var url = controls.fbUrl.value.split("com/");
		if (url[1] !== "" && url[1] != null && url[1] !== undefined) {
			this.http.get("https://graph.facebook.com/?id=" + url[1]).subscribe(
				(res: any) => {},
				(err) => {
					console.log(err);
					if (err.error.error.code != 200) {
						this.authNoticeService.setNotice('الرجاء إدخال رابط صفحة الفيس بوك الخاصة بك بشكل صحيح', 'danger');
					} else {
						if (this.validateInstUrl(controls.insUrl.value)) {
							this.continueWithMerchantSubmit(controls);
						} else {
							this.authNoticeService.setNotice('الرجاء إدخال رابط حساب الانستجرام الخاص بك بشكل صحيح', 'danger');
						}
					}
				}
			);
		}
	}

	continueWithMerchantSubmit(controls) {
		// check form
		this.authNoticeService.setNotice("");
		this.loading = true;

		// if (!controls.agree.value) {
		// 	// you must agree the terms and condition
		// 	// checkbox cannot work inside mat-form-field https://github.com/angular/material2/issues/7891
		// 	this.authNoticeService.setNotice('You must agree the terms and condition', 'danger');
		// 	return;
		// }

		if (!controls.merchantSubscriptionType.value) {
			// you must agree the terms and condition
			// checkbox cannot work inside mat-form-field https://github.com/angular/material2/issues/7891
			this.authNoticeService.setNotice(
				"الرجاء اختيار نوع الاشتراك",
				"danger"
			);
			return;
		}

		this.http
			.post(globalVariables.baseUrl + "api/Merchants", {
				name: controls.fullname.value,
				isActive: true,
				mobile: controls.mobileNumber.value,
				email: controls.email.value,
				businessName: controls.storeName.value,
				fbUrl: controls.fbUrl.value,
				instagramUrl: controls.insUrl.value,
				merchantBusinessType: controls.storeType.value,
				description: controls.storeIntro.value,
				withLive:
					controls.merchantSubscriptionType.value === "withLives",
			})
			.subscribe(
				(res: any) => {
					let msg =
						"اهلا وسهلا بكم في مسابقة لايفات تم تسجيل طلبك بنجاح وسوف تتواصل معك ادارة المسابقة قريبا للترتيب معكم";
					// if (controls.merchantSubscriptionType.value === 'withoutLives') {
					// 	msg = 'لقد تم اشتراك بنجاح في الخدمة٬ ستقوم ادارة المسابقة بالتواصب معك قريبا';
					// }
					// this.layoutUtilsService.showActionNotification(msg);
					this.authNoticeService.setNotice(msg, "success");
					// this.registerForm.clearValidators();
					// this.initRegisterForm();
					this.resetForm()
					this.loading = false;
				},
				(err) => {
					this.loading = false;
					this.authNoticeService.setNotice(
						"لقد حدث خطأ أثناء عملية الاشتراك٬ الرجاء اعادة المحاولة",
						"danger"
					);
				}
			);
	}

	validateFBUrl(FBUrl): boolean {
		var pattern = /^(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?$/;
		if (pattern.test(FBUrl)) {
			return true;
		} else {
			return false;
		}
	}

	validateInstUrl(insUrl): boolean {
		var pattern = /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/;
		if (pattern.test(insUrl)) {
			return true;
		} else {
			return false;
		}
	}

	resetForm() {
		this.initRegisterForm()
		this.registerForm.reset();
		this.active.next(false);
		setTimeout(() => (this.active.next(true)), 0);
	}

	/**
	 * Form Submit
	 */
	submit() {
		const controls = this.registerForm.controls;

		if (this.isMerchant) {
			if (this.registerForm.invalid) {
				Object.keys(controls).forEach((controlName) =>
					controls[controlName].markAsTouched()
				);
				return;
			}
			this.isFbUrlExist(controls);
		} else {
			if (controls["pinCode"].invalid) {
				controls["pinCode"].markAsTouched();
				return;
			}

			this.loading = true;
			this.http
				.post(
					globalVariables.baseUrl + "api/Users/verfiy",
					{
						id: this.subscriptionId,
						msisnd: controls.mobileNumber.value,
						verificationCode: controls.pinCode.value,
					},
					{ headers: this.headers }
				)
				.pipe(
					finalize(() => {
						this.loading = false;
					})
				)
				.subscribe(
					(res: any) => {
						this.loading = false;
						this.zone.run(() => {
							this.router
								.navigateByUrl("/dashboard")
								.then((res) => {
									this.router.navigate["/dashboard"];
								})
								.catch((err) => {});
						});
					},
					(err) => {
						let msg =
							"حدث خطأ أثناء عملية الاشتراك ، الرجاء اعادة المحاولة";
						if (err.error) {
							if (err.error.message) {
								msg = err.error.message;
							}
						}

						this.authNoticeService.setNotice(msg, "danger");
					}
				);
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

		const result =
			control.hasError(validationType) &&
			(control.dirty || control.touched);
		return result;
	}
}
