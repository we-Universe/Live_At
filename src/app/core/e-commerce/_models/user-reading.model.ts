export class UserReadingModel {
	readingDate: string;
	id: number;
	gasolinePumpId: string;
	gpNumber: string;
	categoryId: string;
	categoryName: string;
	userId: number;
	userName: string;
	shiftId: string;
	shift: string;
	shiftInitalReading: string;
	shiftFinalReading: string;
	amount: string;
	unitPrice: number;
	totalPrice: number;
	shiftStartDate: string;
	shiftEndDate: string;
	discounts: string;
	coupons: string;
	oils: string;
	checks: string;
	deliveredMoneyByEmployee: string;

	clear() {
		this.readingDate = new Date().toISOString().substr(0, 16);
		this.id = 0;
		this.gpNumber = '';
		this.userId = 0;
		this.userName = '';
		this.shift = '';
		this.shiftInitalReading = '';
		this.shiftFinalReading = '';
		this.amount = '';
		this.unitPrice = 0;
		this.totalPrice = 0;
		this.shiftStartDate = new Date().toISOString().substr(0, 16);
		this.shiftEndDate = new Date().toISOString().substr(0, 16);
	}
}
