export class MerchantModel {
	id: number;
	mobileNumber: string;
	fullname: string;
	email: string;
	storeName: string;
	fbUrl: string;
	insUrl: string;
	storeType: string;
	storeIntro: string;
	merchantSubscriptionTypeId: string;
	merchantSubscriptionType: string;
	merchantCreationDate: string;
	isActive: boolean;

	clear() {
		this.id = 0;
		this.mobileNumber = '';
		this.fullname = '';
		this.email = '';
		this.storeName = '';
		this.merchantSubscriptionType = '';
		this.merchantSubscriptionTypeId = '';
		this.merchantCreationDate = new Date().toISOString().substr(0, 16);
		this.fbUrl = '';
		this.insUrl = '';
		this.storeType = '';
		this.storeIntro = '';
		this.isActive = false;
	}
}
