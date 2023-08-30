// Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
// RXJS
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
// Crud
import { QueryParamsModel } from '../../../../../../core/_base/crud';
// Layout
import { DataTableItemModel, DataTableService } from '../../../../../../core/_base/layout';
import { DataTableDataSource } from './data-table.data-source';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteAppointmentModalContent } from '../appointmentsModals/delete-appointment/delete-appointment-modal.component';
import { UpdateAppointmentModalContent } from '../appointmentsModals/edit-appointment/update-appointment-modal.component';

@Component({
	selector: 'kt-data-table',
	templateUrl: './data-table.component.html',
	styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
	// Public properties
	dataSource: DataTableDataSource;
	displayedColumns = ['Id', 'PatientId', 'PatientName', 'AppointmentDate', 'Status', 'actions']; //'cPrice'
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	selection = new SelectionModel<DataTableItemModel>(true, []);

	/**
	 * Component constructor
	 *
	 * @param dataTableService: DataTableService
	 */
	constructor(private dataTableService: DataTableService, private modalService: NgbModal) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadItems();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new DataTableDataSource(this.dataTableService);
		// First load
		this.loadItems(true);
	}

	/**
	 * Load items
	 *
	 * @param firstLoad: boolean
	 */
	loadItems(firstLoad: boolean = false) {
		const queryParams = new QueryParamsModel(
			{},
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			firstLoad ? 6 : this.paginator.pageSize
		);
		this.dataSource.loadItems(queryParams);
		this.selection.clear();
	}

	/* UserInterface */

	/**
	 * Returns item status
	 *
	 * @param status: number
	 */
	getItemCssClassByStatus(status: string = 'Completed'): string {
		switch (status) {
			case 'Completed':
				return 'success';
			case 'In Progress':
				return 'warning';
			case 'Waiting':
				return 'info';
		}
		return '';
	}

	/* Datatable modals */
	openUpdateModal(item: any) {
		const modalRef = this.modalService.open(UpdateAppointmentModalContent, { size: 'md' });
		modalRef.componentInstance.name = 'Update Appointment';
		modalRef.componentInstance.item = item;
		modalRef.componentInstance["updateAppointmentEvent"].subscribe(event => {
			// delete
			alert("Record updated")
		});
	}

	openDeleteModal() {
		const modalRef = this.modalService.open(DeleteAppointmentModalContent, { size: 'md' });
		modalRef.componentInstance.name = 'Delete Appointment';
		modalRef.componentInstance.id = 1;
		modalRef.componentInstance["deleteAppointmentEvent"].subscribe(event => {
			// delete
			alert("Record deleted")
		});
	}
}
