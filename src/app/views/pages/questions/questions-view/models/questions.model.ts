export class QuestionModel {
	id: number;
	questionId: number;
	questionText: string;
	questionAnswers: [{
		id: number,
		text: string
	}];
	correctAnswer: string;
	questionCreationDate: string;

	clear() {
		this.id = 0;
		this.questionId = 0;
		this.questionText = '';
		this.questionAnswers = [
			{
				id : 0 ,
				text : ''
			}
		];
		this.correctAnswer = '';
		this.questionCreationDate = new Date().toISOString().substr(0, 16);
	}
}
