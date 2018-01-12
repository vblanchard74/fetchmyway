import axios from 'axios';
import moment from 'moment';

import {GET_CONFIG} from './types';
import {MAIN_LOADING} from './types';
import {INITIALIZE} from './types';
import {CHANGE_DATE} from './types';
import {GET_DATE} from './types';
import {CALCUL_DATE} from './types';
import {DELETE_DATE} from './types';
import {SELECT_PLACE} from './types';
import {GET_PLACES} from './types';
import {ADD_PLACE} from './types';
import {DELETE_PLACE} from './types';
import {GET_TRIP} from './types';
import {GET_ROUTES} from './types';
import {CHOOSE_ROUTE} from './types';
import {DELETE_ROUTE} from './types';
import {CLEAR_ROUTE} from './types';
import {MOVEPLACE_UP} from './types';
import {MOVEPLACE_DOWN} from './types';
import {CHANGE_ITINERARY} from './types';
import {CHECK_OPTION} from './types';
import {CHECK_MAPOPTION} from './types';

var helpers = require('../helpers.js').default;

// CONFIG
export function getConfig() {
	return {
		type:GET_CONFIG,
		payload:null
	};
}

export function mainLoading(isLoading) {
	return {
		type:MAIN_LOADING,
		payload:isLoading
	};
}

export function checkOption(opt,chk) {
	return {
		type:CHECK_OPTION,
		payload:{opt, chk}
	};
}

export function checkMapOption(opt,chk) {
	return {
		type:CHECK_MAPOPTION,
		payload:{opt, chk}
	};
}

// DATE
export function changeDate(date) {
	const valid = moment(date).isValid();
	return {
		type:CHANGE_DATE,
		payload:{date,valid}
	};
}

export function deleteDate() {
	return {
		type:DELETE_DATE
	};
}

export function getDates() {
	return {
		type:GET_DATE
	};
}

export function calculDate(dates) {
	return {
		type:CALCUL_DATE,
		payload:dates
	};
}


// PLACES
export function initialize() {
	return {
		type:INITIALIZE,
		payload:null
	};
}

export function getPlaces() {
	return {
		type:GET_PLACES,
		payload:null
	};
}

export function selectPlace(id,place) {
	const selectedPlace = {id:id, infos:place};
	return {
		type:SELECT_PLACE,
		payload:selectedPlace
	};
}

export function addPlace() {
	return {
		type:ADD_PLACE
	};
}

export function deletePlace(id) {

	return {
		type:DELETE_PLACE,
		payload:id
	};
}


export function movePlaceUp(id) {

	return {
		type:MOVEPLACE_UP,
		payload:id
	};
}

export function movePlaceDown(id) {

	return {
		type:MOVEPLACE_DOWN,
		payload:id
	};
}

//ROUTES
export function getTrip() {
	return {
		type:GET_TRIP,
		payload:null
	};
}

export function getRoutes(orig,dest,opt) {
	const id = orig.id;
	const extraData = {id:id,opt:opt};
	const url = `
		https://free.rome2rio.com/api/1.4/json/Search
		?key=c3zB0hIA
		&oPos=${orig.infos.location.lat},${orig.infos.location.lng}
		&dPos=${dest.infos.location.lat},${dest.infos.location.lng}
		&oName=${orig.infos.label}&dName=${dest.infos.label}
		&languageCode=${window.AppState.getLocale()}
		&currencyCode=${window.AppState.getCurrency()}
		&noAir=${opt.noAir}
		&noRail=${opt.noRail}
		&noBus=${opt.noBus}
		&noFerry=${opt.noFerry}
		&noCar=${opt.noCar}
		&noRideshare=${opt.noRideshare}
		&noTowncar=${opt.noTowncar}
	`;
	const request = axios.get(url, {extraData});

	

	return {
		type:GET_ROUTES,
		payload:request 
	};
}

export function chooseRoute(id, routeKey, trip, date) {

	var dates = helpers.calculDates(trip,date,id,routeKey);
	
	return {
		type:CHOOSE_ROUTE,
		payload:{id, routeKey, dates}
	};

}

export function deleteRoute(id) {

	return {
		type:DELETE_ROUTE,
		payload:id
	};

}

export function clearRoute(id, routeKey, trip, date) {

	var dates = helpers.calculDates(trip,date,id,routeKey,true);

	return {
		type:CLEAR_ROUTE,
		payload:{id, routeKey, dates}
	};

}

export function changeItinerary(id, routeid, segment, itineraryid) {

	return {
		type:CHANGE_ITINERARY,
		payload:{id, routeid, segment, itineraryid} 
	};

}