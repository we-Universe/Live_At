// Angular
import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
// RxJS
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
// NGRX
import {select, Store} from '@ngrx/store';
// Auth reducers and selectors
import {AppState} from '../../../core/reducers/';
import {isLoggedIn} from '../_selectors/auth.selectors';

@Injectable()
export class AuthGuard implements CanActivate {
	isAuthorized = false;
	token = '';

	constructor(private store: Store<AppState>, private router: Router, private location: Location, private route: ActivatedRoute) {
		store.select('credentials').subscribe(state => {
			this.isAuthorized = state.loggedIn;
			this.token = state.authToken;
		});
	}

	canActivate(): boolean {
		if (!this.isAuthorized || !this.token) {
			this.router.navigate(['/auth/login']);
			return false;
		}

		return true;
	}

	// canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
	// 	return this.store
	// 		.pipe(
	// 			select(isLoggedIn),
	// 			tap(loggedIn => {
	// 				if (!loggedIn) {
	// 					this.router.navigateByUrl('/auth/login');
	// 				}
	// 				let userPages = ['/dashboard'];
	// 				let role = localStorage.getItem('role');
	// 				let path = this.location.path();
	// 				if (path !== '') {
	// 					if (role !== 'Admin' && !userPages.includes(path)) {
	// 						this.router.navigateByUrl('/dashboard');
	// 					}
	// 				}
	// 			})
	// 		);
	// }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
	isAuthorized = false;
	token = '';

	constructor(private store: Store<AppState>, private router: Router, private location: Location, private route: ActivatedRoute) {
		store.select('credentials').subscribe(state => {
			this.isAuthorized = state.loggedIn;
			this.token = state.authToken;
		});
	}

	canActivate(): boolean {
		if (!this.isAuthorized || !this.token) {
			this.router.navigate(['/auth/login']);
			return false;
		}

		let role = localStorage.getItem('role');
		if (role !== 'Admin') {
			this.router.navigate(['/dashboard']);
			return false;
		}

		return true;
	}
}
