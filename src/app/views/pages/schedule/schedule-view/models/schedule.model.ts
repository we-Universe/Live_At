export class ScheduleModel {
	id: number;
	// liveName: string;
	merchantId: string;
	merchant: string;
	prize: string;
	code: string;
	liveQuestion: string;
	liveAnswers: [{
		id: number,
		text: string
	}];
	correctAnswer: string;
	liveFromDate: string;
	liveToDate: string;
	liveQuestionId: string;
	isActive: boolean;

	clear() {
		this.id = 0;
		// this.liveName = '';
		this.merchantId = '';
		this.merchant = '';
		this.prize = '';
		this.code = '';
		this.liveQuestion = '';
		this.liveQuestionId = ''
		this.liveAnswers = [
			{
				id : 0 ,
				text : ''
			}
		];
		this.correctAnswer = '';
		this.liveFromDate = new Date().toISOString().substr(0, 16);
		this.liveToDate = new Date().toISOString().substr(0, 16);
		this.isActive = true;
	}

	init() {
		this.id = 1;
		// this.liveName = 'الشني';
		this.merchantId = '1';
		this.merchant = 'الشني';
		this.prize = ' ايفون';
		this.code = ' 1111';
		this.liveQuestion = 'ما كان عرض اليوم';
		this.liveAnswers = [
			{
				id : 0 ,
				text : '123'
			}
		];
		this.correctAnswer = '1';
		this.liveFromDate = new Date('2021-04-13 12:00').toISOString().substr(0, 16);
		this.liveToDate = new Date('2021-04-13 1:00').toISOString().substr(0, 16);
	}
}
