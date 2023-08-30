// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
	MatAutocompleteModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatListModule, MatSliderModule, MatSlideToggleModule,
	MatButtonModule,
	MatIconModule,
	MatNativeDateModule,
	MatSelectModule,
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
} from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { MatTableExporterModule } from 'mat-table-exporter';
import {MerchantsComponent} from './merchants.component';
import {MerchantsViewComponent} from './merchants-view/merchants/merchants.component';
import {MerchantsEditDialogComponent} from './merchants-view/merchants-edit/merchants-edit.dialog.component';

@NgModule({
	imports: [
		NgbModule,
		CommonModule,
		PartialsModule,
		CoreModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild([
			{
				path: '',
				component: MerchantsComponent
			},
		]),
		materialModules,
		MatTableExporterModule
	],
	entryComponents: [MerchantsEditDialogComponent],
	exports: [],
	providers: [],
	declarations: [
		MerchantsComponent,
		MerchantsViewComponent,
		MerchantsEditDialogComponent
	]
})
export class MerchantsModule {
}
