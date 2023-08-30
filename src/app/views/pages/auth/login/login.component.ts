// Angular
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// RxJS
import {Observable, Subject} from 'rxjs';
import {finalize, takeUntil, tap} from 'rxjs/operators';
// Translate
import {TranslateService} from '@ngx-translate/core';
// Store
import {Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
// Auth
import {AuthNoticeService, AuthService, Login} from '../../../../core/auth';
import {HttpClient} from '@angular/common/http';
import globalVariables from '../../globalVariables';
import {ConfirmPasswordValidator} from '../register/confirm-password.validator';
import {NgZone} from '@angular/core';
// import globalVariables from '../globalVariables';


declare var FB: any;
/**
 * ! Just example => Should be removed in development
 */
const DEMO_PARAMS = {
	// USERNAME: 'admin@demo.com',
	// PASSWORD: 'demo'
	USERNAME: '',
	PASSWORD: ''
};

@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
	// Public params
	loginForm: FormGroup;
	loading = false;
	isLoggedIn$: Observable<boolean>;
	errors: any = [];
	private unsubscribe: Subject<any>;
	code: string;
	private returnUrl: any;
	noAccount = false;

	// Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param zone
	 * @param router: Router
	 * @param auth: AuthService
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 * @param fb: FormBuilder
	 * @param cdr
	 * @param route
	 * @param http
	 */
	constructor(
		private zone: NgZone,
		private router: Router,
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private http: HttpClient,
	) {
		this.route.queryParams.subscribe(params => {
			this.code = params['code'];
		});
		this.unsubscribe = new Subject();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.initLoginForm();
		this.authNoticeService.setNotice('');
		// redirect back to the returnUrl before login
		this.route.queryParams.subscribe(params => {
			this.returnUrl = params.returnUrl || '/';
		});

		(window as any).fbAsyncInit = function() {
			FB.init({
				appId: '168868545269768',
				xfbml: true,
				version: 'v11.0'
			});
			FB.AppEvents.logPageView();
		};

		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = 'https://connect.facebook.net/en_US/sdk.js';
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.loading = false;
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initLoginForm() {
		this.loginForm = this.fb.group({
				email: ['', this.noAccount ? '' : Validators.compose([
					Validators.required,
					Validators.email,
					Validators.minLength(3),
					// https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
					Validators.maxLength(320)
				]),
				],
				fullname: ['', this.noAccount ? '' : Validators.compose([
					Validators.required,
					Validators.minLength(3),
					Validators.maxLength(100)
				])
				],
				mobileNumber: ['', Validators.compose([
					Validators.required,
					Validators.minLength(9),
					Validators.maxLength(14),
					Validators.pattern('[0-9]*')
				])
				],
				password: ['', Validators.compose([
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(20)
				])
				],
				confirmPassword: ['', this.noAccount ? '' : Validators.compose([
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(20)
				])
				]
			},
			{
				validator: ConfirmPasswordValidator.MatchPassword
			}
		);
	}

	/**
	 * login using facebook
	 */
	loginUsingFB() {
		// window.open(
		// 	"https://www.facebook.com/v10.0/dialog/oauth?client_id=283441396588288&redirect_uri=http://localhost:4200/auth&scope=email&state=FACEBOOK",
		// 	"_self"
		// );
		// authResponse:
		// 	accessToken: "EAAEBydfCHwABAHXExsRKA72p6LuvdePDXzNQgeDNqWuGIHUzlAXwofTmFhEwegva2kaAoarTfyUWE7zURxZArZAVSNZB3kL48unn4v2oZArSHNmiDew7l8UNZAAueDG2RH1TTYGS7EsIj1H0ohwHwWRXxW2RafpE7cE32txYHPsDlcrqvTqZAIXZC4ZAbbbJKfRydbsZA3bLhrAZDZD"
		// 	data_access_expiration_time: 1626263052
		// 	expiresIn: 4548
		// 	graphDomain: "facebook"
		// 	signedRequest: "MCx0rUkrPQ_N4sAod3o3WupfQXQiNNUc7Z21z7PK3Ss.eyJ1c2VyX2lkIjoiMzg1MTQzNjQxNDk0NTI5OCIsImNvZGUiOiJBUUJqV2V6TWp2VUJfbU9OWUU4VzdWRjBRTk1tRVNsclZXQnpILVlpWHI5RkdzQXllUWNlajBKZnBQRmR3YUh2YkItWG1YM0t1UjN0bHQyWkNXWjIwM3lmSm5fcmdLTDdzU1pOS2VhQzJXUVlpdDl1TlU5bzZCWUJYMnB2NGpBM0lNQ2w1Q0lKT1doUy1JRVZnSVJma3ZwV29oOWlRcVdZbmU4UlU4bkdTbHZtOWpRT3NVN2NMV1A5VEZSRE5ZZFFpZ0JsMHM4a3NEM1hjRjBmQmZBdHloRHZLM1c1ZG5tVlNCMTdxMjdvZ2QtYmY5X2N0WncxYlY2Qk5fdzJFcXZETXVXYV8zYzRJUVJ6eXhDdmNLT1NoU3pNX0dZN3VscDUzazd6T3NZZ0VXVmdjRmgzLXh2bi04bm1Ec3NRZElPX3kwUjRiWXBMQjYxX1ZUbXc5ZHNCV2F2OCIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjE4NDg3MDUzfQ"
		// 	userID: "3851436414945298"
		// 	__proto__: Object
		// status: "connected"
		FB.login((response) => {
			if (response.status === 'connected') {
				// Logged into your webpage and Facebook.
				let accessToken = response.authResponse.accessToken;
				this.http.post(globalVariables.baseUrl + 'api/Users/login', {accessToken, influenecerCode: this.code})
					.pipe(
						takeUntil(this.unsubscribe),
						finalize(() => {
							this.loading = false;
							this.cdr.markForCheck();
						}))
					.subscribe((res: any) => {
							// localStorage.setItem('token', res.data.token);
							try {
								localStorage.setItem('role', 'user');
								this.store.dispatch(new Login({authToken: res.token}));
								if (!res.user.isPaied) {
									this.zone.run(() => {
										this.router.navigateByUrl('/auth/register?subscriber=user')
											.then(res => {
												this.router.navigate['/auth/register?subscriber=user'];
											}).catch(err => {
										});
									});
								}// Payment page
								else {
									this.zone.run(() => {
										this.router.navigateByUrl(this.returnUrl)
											.then(res => {
												this.router.navigate[this.returnUrl];
											}).catch(err => {
										});
									});
								} // Main page
							} catch (e) {
								console.log(e);
							}
						}
						,
						err => {
							this.authNoticeService.setNotice(err.error.msg, 'danger');
						}
					);
			} else {
				// The person is not logged into your webpage or we are unable to tell.
				this.authNoticeService.setNotice('لقد حدث خطأ اثناء عملية تسجيل الدخول بواسطة الفيس بوك', 'danger');
				// alert('لقد حدث خطأ اثناء عملية تسجيل الدخول بواسطة الفيس بوك');
			}
		});
	}

	/**
	 * Form Submit
	 */
	submit() { //
		const controls = this.loginForm.controls;

		if (this.noAccount) {
			/** check form */
			if (this.loginForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
				return;
			}

			const authData = {
				email: controls.email.value,
				name: controls.fullname.value,
				mobile: controls.mobileNumber.value,
				influenecerCode: this.code,
				password: controls.password.value
			};

			this.loading = true;
			this.http.post(globalVariables.baseUrl + 'api/users/register', authData)
				.pipe(
					takeUntil(this.unsubscribe),
					finalize(() => {
						this.loading = false;
						this.cdr.markForCheck();
					}))
				.subscribe((res: any) => {
					this.authNoticeService.setNotice('لقد تم تسجيل حسابك بنجاح، الرجاء ادخال رقم هاتفك و كلمة السر للدخول', 'success');
					this.noAccount = false;
				}, err => {
					let msg = 'المعلومات المدخلة غير صحيحة';
					if (err.error) {
						if (err.error.message) {
							msg = err.error.message;
						}
					}

					this.authNoticeService.setNotice(msg, 'danger');
				});
		} else {
			let inError = false;
			// check form
			if (controls['mobileNumber'].invalid) {
				controls['mobileNumber'].markAsTouched();
				inError = true;
			}

			if (controls['password'].invalid) {
				controls['password'].markAsTouched();
				inError = true;
			}

			if (inError) {
				return;
			}

			const authData = {
				username: controls.mobileNumber.value,
				password: controls.password.value
			};

			this.loading = true;
			this.http.post(globalVariables.baseUrl + 'login', authData)
				.pipe(
					takeUntil(this.unsubscribe),
					finalize(() => {
						this.loading = false;
						this.cdr.markForCheck();
					}))
				.subscribe((res: any) => {
					localStorage.setItem('role', res.data.role);
					this.store.dispatch(new Login({authToken: res.data.token}));
					if (!res.data.isPaid && res.data.role !== 'Admin') {
						this.zone.run(() => {
							this.router.navigateByUrl('/auth/register?subscriber=user')
								.then(res => {
									this.router.navigate['/auth/register?subscriber=user'];
								}).catch(err => {
							});
						});
					} // Payment page
					else {
						this.zone.run(() => {
							this.router.navigateByUrl(this.returnUrl)
								.then(res => {
									this.router.navigate[this.returnUrl];
								}).catch(err => {
							});
						});
					} // Main page
				}, err => {
					this.authNoticeService.setNotice('المعلومات المدخلة غير صحيحة', 'danger');
				});
		}
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to validators name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}
}
