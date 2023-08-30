// NGRX
import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../../environments/environment';

import * as fromAuthReducer from '../auth/_reducers/auth.reducers'

// tslint:disable-next-line:no-empty-interface
export interface AppState {
	router: any;
	credentials: fromAuthReducer.AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
	router: fromRouter.routerReducer, credentials: fromAuthReducer.authReducer,
};

export const metaReducers: Array<MetaReducer<AppState>> = !environment.production ? [storeFreeze] : [];
