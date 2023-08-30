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

// Services and Models

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'info-dialog',
	templateUrl: 'info.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class InfoDialogComponent implements OnInit, OnDestroy {
	// Public properties
	info = [''];
	title = '';

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<QuestionssEditDialogComponent>
	 * @param data: any
	 */
	constructor(public dialogRef: MatDialogRef<InfoDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.info = this.data.info;
		this.title = this.data.title;
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
	}

	/**
	 * Returns page title
	 */
	getTitle(): string {
		if (this.title !== '') {
			return this.title;
		}

		return 'الشروط و الاحكام';
	}

	/**
	 * Alert Close event
	 */
	onAlertClose($event) {
	}
}
