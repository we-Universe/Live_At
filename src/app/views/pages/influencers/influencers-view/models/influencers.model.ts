export class InfluencerModel {
	id: number;
	name: string;
	trackingCode: string;
	numberOfUserSubscribedThrough: number;
	creationDate: string;

	clear() {
		this.id = 0;
		this.name = '';
		this.trackingCode = '';
		this.numberOfUserSubscribedThrough = 0;
		this.creationDate = new Date().toISOString().substr(0, 16);
	}
}
