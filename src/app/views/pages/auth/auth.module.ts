// Angular
import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// Material
import {
	MatButtonModule,
	MatCheckboxModule,
	MatDialogContent,
	MatDialogModule,
	MatFormFieldModule,
	MatInputModule,
	MatRadioModule,
	MatSelectModule
} from '@angular/material';
// Translate
import {TranslateModule} from '@ngx-translate/core';
// NGRX
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
// CRUD
// import { InterceptService } from '../../../core/_base/crud/';
// Module components
import {AuthComponent} from './auth.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {AuthNoticeComponent} from './auth-notice/auth-notice.component';
// Auth
import {AuthEffects, AuthGuard, authReducer, AuthService} from '../../../core/auth';
import {InfoDialogComponent} from './info-popup/info.dialog.component';
import {PortletModule} from '../../partials/content/general/portlet/portlet.module';
import {AdminAuthGuard} from '../../../core/auth/_guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full'
			},
			{
				path: 'login',
				component: LoginComponent,
				data: {returnUrl: window.location.pathname}
			},
			{
				path: 'register',
				component: RegisterComponent
			},
			{
				path: 'forgot-password',
				component: ForgotPasswordComponent,
			}
		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		RouterModule.forChild(routes),
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatRadioModule,
		MatDialogModule,
		MatSelectModule,
		TranslateModule.forChild(),
		StoreModule.forFeature('auth', authReducer),
		EffectsModule.forFeature([AuthEffects]),
		PortletModule
	],
	providers: [
		// InterceptService,
		// {
		// 	provide: HTTP_INTERCEPTORS,
		// 	useClass: InterceptService,
		// 	multi: true
		// },
	],
	exports: [AuthComponent],
	entryComponents: [],
	declarations: [
		AuthComponent,
		LoginComponent,
		RegisterComponent,
		ForgotPasswordComponent,
		AuthNoticeComponent
	]
})

export class AuthModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthModule,
			providers: [
				AuthService,
				AuthGuard,
				AdminAuthGuard
			]
		};
	}
}
