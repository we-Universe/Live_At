import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {fromEvent, merge, Subscription, of} from 'rxjs';
import {Store, ActionsSubject} from '@ngrx/store';
import { AppState } from '../../../../../app/core/reducers';
import globalVariables from '../../globalVariables';
import { LayoutUtilsService } from '../../../../../app/core/_base/crud';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'kt-draw-live-daily',
  templateUrl: './draw-live-daily.component.html',
  styleUrls: ['./draw-live-daily.component.scss']
})
export class DrawLiveDailyComponent implements OnInit {

  constructor(private router: Router,
    private store: Store<AppState>,
    private http: HttpClient,
    private layoutUtilsService: LayoutUtilsService,
    ) { }
  merchantId = ''
  merchants = [];
  winners = [];
  headers = null;
	requestOptions = {};
  drawType='live'
  numberOfWinner = ''
  numberOfAnswers = ''
  isLoadingResultsEmitter$ = new BehaviorSubject<boolean>(false);
  date = new Date();
	tzoffset = (this.date).getTimezoneOffset() * 60000;
	dateFrom = new Date(+new Date(this.date.getFullYear(), this.date.getMonth(), 1) - this.tzoffset).toISOString().slice(0, 16);
	dateTo = new Date(+new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0) - this.tzoffset).toISOString().slice(0, 16);
  private subscriptions: Subscription[] = [];
	// Store
	token = '';
	credentialsSubscription: Subscription = null;
  
  ngOnInit() {

    this.credentialsSubscription = this.store.select('credentials').subscribe(state => {
			this.token = state.authToken;
			this.headers = new HttpHeaders({Authorization: 'Bearer ' + this.token, responseType: 'text'});
			this.requestOptions = {
				headers: this.headers,
				// responseType: 'text'
			};
		});
    this.subscriptions.push(this.credentialsSubscription);
    this.getMerchants()
  }

  drawNow(){
    this.winners = []

    // JSON.parse(localStorage.getItem("msisdn"));
		let dateFrom = new Date(+new Date(this.dateFrom) - this.tzoffset).toISOString().slice(0, 16);
    let dateTo = new Date(+new Date(this.dateTo) - this.tzoffset).toISOString().slice(0, 16);

    if(this.drawType === 'daily'){
      if(this.numberOfWinner !== '0' && this.numberOfWinner !== undefined && this.numberOfWinner !== null && this.numberOfWinner !== ''){
        if(this.numberOfAnswers !== '0' && this.numberOfAnswers !== undefined && this.numberOfAnswers !== null && this.numberOfAnswers !== ''){
          this.isLoadingResultsEmitter$.next(true);
          this.http.post(
            globalVariables.baseUrl + 'api/Draws/Daily',
            {
              winnersCount: Number(this.numberOfWinner),
              fromDate: this.dateFrom,
              toDate: this.dateTo,
              questionsCount : Number(this.numberOfAnswers) 
            },
            {headers: this.headers}
          )
            .subscribe((res: any) => {
              this.numberOfWinner = ''
              this.numberOfAnswers = ''
              res.data.map(item =>{
                this.winners.push(item.mobile)
              })
              this.isLoadingResultsEmitter$.next(false);
              localStorage.setItem('msisdn', JSON.stringify(this.winners));
              this.router.navigateByUrl('/drawmsisdn')
            }, (err) => {
              this.layoutUtilsService.showActionNotification('لم يتم السحب الرجاء المحاولة مجددا');
              this.isLoadingResultsEmitter$.next(false);
            });
        }else{
          this.layoutUtilsService.showActionNotification('الرجاء ادخال عددالاجابات');
        }
       

      }else{
        this.layoutUtilsService.showActionNotification('الرجاء ادخال عدد الرابحين');
      }
    }else{
      if(this.numberOfWinner !== '0' && this.numberOfWinner !== undefined && this.numberOfWinner !== null && this.numberOfWinner !== ''){
        if(this.merchantId!==''){
          this.isLoadingResultsEmitter$.next(true);
          this.http.get(
            globalVariables.baseUrl + 'api/Draws/live/'+ Number(this.merchantId)+'?WinnersCount='+Number(this.numberOfWinner),
            {headers: this.headers}
          )
            .subscribe((res: any) => {
              this.numberOfWinner = ''
              res.data.map(item =>{
                this.winners.push(item.mobile)
              })
              this.isLoadingResultsEmitter$.next(false);
              localStorage.setItem('msisdn', JSON.stringify(this.winners));
              this.router.navigateByUrl('/drawmsisdn')
            }, (err) => {
              this.layoutUtilsService.showActionNotification('لم يتم السحب الرجاء المحاولة مجددا');
              this.isLoadingResultsEmitter$.next(false);
            });
        }else{
          this.layoutUtilsService.showActionNotification('الرجاء ادخال البث');
        }
      }else{
        this.layoutUtilsService.showActionNotification('الرجاء ادخال عدد الرابحين');
      }
    }
  }

  getMerchants() {
		this.http.get(
			globalVariables.baseUrl + 'api/Lives/NoDraw',
			{ headers: this.headers }
		).subscribe((res: any) => {
			this.merchants = res.data.map(item => {
				return {
					name: item.businessName,
					id: item.id
				};
			});
		});
	}

  resetData(){
    this.drawType='live'
    this.numberOfWinner = ''
    this.numberOfAnswers = ''
    this.dateFrom = new Date(+new Date(this.date.getFullYear(), this.date.getMonth(), 1) - this.tzoffset).toISOString().slice(0, 16);
	  this.dateTo = new Date(+new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0) - this.tzoffset).toISOString().slice(0, 16);
  }
  
}

