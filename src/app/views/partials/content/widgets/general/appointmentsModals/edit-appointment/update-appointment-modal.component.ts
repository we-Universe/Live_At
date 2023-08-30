import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

@Component({
	selector: 'update-appointment-modal-content',
	templateUrl: './update-appointment-modal.component.html',
	styleUrls: ['./update-appointment-modal.component.scss'],
})
export class UpdateAppointmentModalContent implements OnInit {
	@Input() name;
	@Input() item;
	@Output() updateAppointmentEvent: EventEmitter<any> = new EventEmitter();

	patientId = new FormControl('', [Validators.required]);
	appointmentDate = new FormControl('', [Validators.required]);
	status = new FormControl('', [Validators.required]);

	options: FormGroup;
	patients = [
	];
	formData = {
		Id: 0,
		PatientId: 0,
		PatientName: "",
		AppointmentDate: "",
		Status: ""
	};

	appointmentStatuses = [
		'Completed', 'In Progress', 'Waiting'
	];

	constructor(public activeModal: NgbActiveModal, fb: FormBuilder) {
		this.options = fb.group({
			hideRequired: false,
			floatLabel: 'auto',
		});
	}
	ngOnInit(): void {
		const tzoffset = (new Date()).getTimezoneOffset() * 60000;
		let AppointmentDate = new Date(+new Date(this.item.AppointmentDate) - tzoffset).toISOString().slice(0, 16);

		this.formData = { ...this.item, AppointmentDate };
		console.log(this.formData);
		// hit api to get previous patients
		this.patients = [
			{
				name: 'Ahmad',
				id: 1
			}
		]
	}

	updateAppointment() {
		// hit api to update the appointment
		this.updateAppointmentEvent.emit(this.formData);
		this.activeModal.close('Submit');
	}
}
