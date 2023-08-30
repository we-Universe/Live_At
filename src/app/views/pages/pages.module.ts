// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// Partials
import { PartialsModule } from '../partials/partials.module';
// Pages
import { CoreModule } from '../../core/core.module';
import { MailModule } from './apps/mail/mail.module';
import { ECommerceModule } from './apps/e-commerce/e-commerce.module';
import { UserManagementModule } from './user-management/user-management.module';
import { MatInputModule, MatFormFieldModule, MatDatepickerModule, MatAutocompleteModule, MatListModule, MatSliderModule, MatCardModule, MatSelectModule, MatButtonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatCheckboxModule, MatMenuModule, MatTabsModule, MatTooltipModule, MatSidenavModule, MatProgressBarModule, MatProgressSpinnerModule, MatSnackBarModule, MatTableModule, MatGridListModule, MatToolbarModule, MatBottomSheetModule, MatExpansionModule, MatDividerModule, MatSortModule, MatStepperModule, MatChipsModule, MatPaginatorModule, MatDialogModule, MatRippleModule, MatRadioModule, MatTreeModule, MatButtonToggleModule } from '@angular/material';
import {InfoDialogComponent} from './auth/info-popup/info.dialog.component';

const materialModules = [
	MatInputModule,
	MatFormFieldModule,
	MatDatepickerModule,
	MatAutocompleteModule,
	MatListModule,
	MatSliderModule,
	MatCardModule,
	MatSelectModule,
	MatButtonModule,
	MatIconModule,
	MatNativeDateModule,
	MatSlideToggleModule,
	MatCheckboxModule,
	MatMenuModule,
	MatTabsModule,
	MatTooltipModule,
	MatSidenavModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatSnackBarModule,
	MatTableModule,
	MatGridListModule,
	MatToolbarModule,
	MatBottomSheetModule,
	MatExpansionModule,
	MatDividerModule,
	MatSortModule,
	MatStepperModule,
	MatChipsModule,
	MatPaginatorModule,
	MatDialogModule,
	MatRippleModule,
	MatRadioModule,
	MatTreeModule,
	MatButtonToggleModule
];

@NgModule({
	declarations: [InfoDialogComponent],
	entryComponents: [InfoDialogComponent],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		CoreModule,
		PartialsModule,
		MailModule,
		ECommerceModule,
		UserManagementModule,
		materialModules,
		FormsModule,
		ReactiveFormsModule,
	],
	providers: []
})
export class PagesModule {
}
