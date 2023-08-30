import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'add-appointment-modal-content',
	templateUrl: './add-appointment-modal.component.html',
	styleUrls: ['./add-appointment-modal.component.scss'],
})
export class AddAppointmentModalContent implements OnInit {
	@Input() name;
	@Output() addAppointmentEvent: EventEmitter<any> = new EventEmitter();

	patientId = new FormControl('', [Validators.required]);
	patientName = new FormControl('', [Validators.required]);
	appointmentDate = new FormControl('', [Validators.required]);

	options: FormGroup;
	patients = [
	];
	formData = {
		newPatient: false,
		patientId: '',
		patientName: '',
		appointmentDate: ''
	};

	constructor(public activeModal: NgbActiveModal, fb: FormBuilder) {
		this.options = fb.group({
			hideRequired: false,
			floatLabel: 'auto',
		});
	}
	ngOnInit(): void {
		// hit api to get previous patients
		this.patients = [
			{
				name: 'Ahmad',
				id: 1
			}
		]
	}

	addAppointment() {
		// hit api to add the appointment
		this.addAppointmentEvent.emit(this.formData);
		this.activeModal.close('Submit');
	}
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
// Modal Activator
@Component({
	selector: 'add-appointment-modal',
	template: `
	<button id="newAppointment" class="btn btn-primary kt-login__btn-primary" (click)="open()">New Appoinment</button>
  `
})
export class AddAppointmentModalComponent {
	@Output() addAppointmentEvent: EventEmitter<any> = new EventEmitter();
	constructor(private modalService: NgbModal) { }

	open() {
		const modalRef = this.modalService.open(AddAppointmentModalContent, { size: 'md' });
		modalRef.componentInstance.name = 'Add Appointment';
		modalRef.componentInstance["addAppointmentEvent"].subscribe(event => {
			this.addAppointmentEvent.emit(event);
		});
	}
}
