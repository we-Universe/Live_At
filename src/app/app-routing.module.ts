// Angular
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// Components
import {BaseComponent} from './views/theme/base/base.component';
import {ErrorPageComponent} from './views/theme/content/error-page/error-page.component';
// Auth
import {AuthGuard} from './core/auth';
import {AdminAuthGuard} from './core/auth/_guards/auth.guard';

const routes: Routes = [

	{path: 'auth', loadChildren: () => import('app/views/pages/auth/auth.module').then(m => m.AuthModule)},
	{
		path: 'privacy-policy',
		loadChildren: () => import('app/views/pages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)
	},
	{
		path: 'drawmsisdn',
		loadChildren: () => import('app/views/pages/draw-msisdn/drawmsisdnld/drawmsisdnld.module').then(m => m.DrawMsisdnLDModule),
		canActivate: [AdminAuthGuard],
	},
	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('app/views/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
			},
			{
				path: 'schedule',
				loadChildren: () => import('app/views/pages/schedule/schedule.module').then(m => m.ScheduleModule),
				canActivate: [AdminAuthGuard],
			},
			{
				path: 'drawLD',
				loadChildren: () => import('app/views/pages/draw-msisdn/draw-live-daily/draw-live-daily.module').then(m => m.DrawLiveDailyModule),
				canActivate: [AdminAuthGuard],
			},
			{
				path: 'merchants',
				loadChildren: () => import('app/views/pages/merchants/merchants.module').then(m => m.MerchantsModule),
				canActivate: [AdminAuthGuard],
			},
			{
				path: 'influencers',
				loadChildren: () => import('app/views/pages/influencers/influencers.module').then(m => m.InfluencersModule),
				canActivate: [AdminAuthGuard],
			},
			{
				path: 'questions',
				loadChildren: () => import('app/views/pages/questions/questions.module').then(m => m.QuestionsModule),
				canActivate: [AdminAuthGuard],
			},
			// {
			// 	path: 'mail',
			// 	loadChildren: () => import('app/views/pages/apps/mail/mail.module').then(m => m.MailModule),
			// },
			// {
			// 	path: 'ecommerce',
			// 	loadChildren: () => import('app/views/pages/apps/e-commerce/e-commerce.module').then(m => m.ECommerceModule),
			// },
			// {
			// 	path: 'ngbootstrap',
			// 	loadChildren: () => import('app/views/pages/ngbootstrap/ngbootstrap.module').then(m => m.NgbootstrapModule),
			// },
			// {
			// 	path: 'material',
			// 	loadChildren: () => import('app/views/pages/material/material.module').then(m => m.MaterialModule),
			// },
			// {
			// 	path: 'user-management',
			// 	loadChildren: () => import('app/views/pages/user-management/user-management.module').then(m => m.UserManagementModule),
			// },
			// {
			// 	path: 'wizard',
			// 	loadChildren: () => import('app/views/pages/wizard/wizard.module').then(m => m.WizardModule),
			// },
			// {
			// 	path: 'builder',
			// 	loadChildren: () => import('app/views/theme/content/builder/builder.module').then(m => m.BuilderModule),
			// },
			// {
			// 	path: 'error/403',
			// 	component: ErrorPageComponent,
			// 	data: {
			// 		type: 'error-v6',
			// 		code: 403,
			// 		title: '403... Access forbidden',
			// 		desc: 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator',
			// 	},
			// },
			// {path: 'error/:type', component: ErrorPageComponent},
			{path: '', redirectTo: 'dashboard', pathMatch: 'full'},
			{path: '**', redirectTo: 'dashboard', pathMatch: 'full'},
		],
	},

	{path: '**', redirectTo: '', pathMatch: 'full'},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {
}
