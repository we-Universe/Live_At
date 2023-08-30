import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'delete-appointment-modal-content',
	templateUrl: './delete-appointment-modal.component.html',
	styleUrls: ['./delete-appointment-modal.component.scss'],
})
export class DeleteAppointmentModalContent implements OnInit {
	@Input() name;
	@Output() deleteAppointmentEvent: EventEmitter<any> = new EventEmitter();

	constructor(public activeModal: NgbActiveModal) {
	}
	ngOnInit(): void {
	}

	deleteAppointment() {
		// hit api to add the appointment
		this.deleteAppointmentEvent.emit();
		this.activeModal.close('Submit');
	}
}
