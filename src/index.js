import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, browserHistory } from 'react-router'; 
import routes from './routes';

import {addLocaleData} from 'react-intl';
import {IntlProvider} from 'react-intl-redux';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';


import ReduxPromise from 'redux-promise';

import reducers from './reducers';

import Messages from './components/messages';

addLocaleData([
	...enLocaleData,
	...frLocaleData,
]);


const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);

window.AppState = {

	container: document.querySelector('.container-fluid'),

	getLocale: function() {
		return localStorage.getItem('locale') || 'en-US';
	},

	setLocale: function(lang) {
		localStorage.setItem('locale', lang);
	},

	getCurrency: function() {
		return localStorage.getItem('currency') || 'USD';
	},

	setCurrency: function(currency) {
		localStorage.setItem('currency', currency);
	},

	render: function() {
		var locale = this.getLocale();


		ReactDOM.render((
			<Provider store={createStoreWithMiddleware(reducers)}>
				<IntlProvider locale={locale} messages={Messages[locale]}>
					<Router history={browserHistory} routes={routes} />
				</IntlProvider>
			</Provider>
			), this.container);
	},

	unmount: function() {
		ReactDOM.unmountComponentAtNode(this.container);
	},

	rerender: function() {
		this.unmount();
		this.render();
	}
};

window.AppState.render();
