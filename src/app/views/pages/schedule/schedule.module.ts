// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { ScheduleComponent } from './schedule.component';
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
import {ScheduleEditDialogComponent} from './schedule-view/schedule-edit/schedule-edit.dialog.component';
import {ScheduleViewComponent} from './schedule-view/schedule/schedule.component';
import {InfoDialogComponent} from '../auth/info-popup/info.dialog.component';

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
				component: ScheduleComponent
			},
		]),
		materialModules,
		MatTableExporterModule
	],
	entryComponents: [ScheduleEditDialogComponent],
	exports: [],
	providers: [],
	declarations: [
		ScheduleComponent,
		ScheduleViewComponent,
		ScheduleEditDialogComponent
	]
})
export class ScheduleModule {
}
