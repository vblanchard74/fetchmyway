import {GET_CONFIG} from '../actions/types';
import {MAIN_LOADING} from '../actions/types';
import {CHECK_OPTION} from '../actions/types';
import {CHECK_MAPOPTION} from '../actions/types';
import {CHANGE_DATE} from '../actions/types';
import {DELETE_DATE} from '../actions/types';

const INITIAL_STATE = {
	mainLoading:false, 
	currency:'USD', 
	rate:1,
	dDate:'', 
	options:{ 
		'noAir':false,
		'noRail':false,
		'noBus':false,
		'noFerry':false,
		'noCar':false,
		'noRideshare':false,
		'noTowncar':false,
		'noStop':true,
		'noStopover':false
	},
	mapoptions:{
		'displayArrows':true
	},
	langList:[
		{'id':'en-US', 'icon':'flag-icon-gb', 'name':'English'},
		{'id':'fr-FR', 'icon':'flag-icon-fr', 'name':'Français'}
	],
	currList:[
		{'id':'USD', 'icon':'usd', 'name':'US Dollar'},
		{'id':'EUR', 'icon':'eur', 'name':'Euro'}
	]
};

// State argument is not application state, only the state this reducer is responsible for
export default function(state = INITIAL_STATE, action) {
	let opt = {};
	switch(action.type) {
	case GET_CONFIG:
		return state;
	case MAIN_LOADING:
		return {...state, mainLoading:action.payload};
	case CHECK_OPTION:
		opt = {...state.options, [action.payload.opt]:action.payload.chk};
		return {...state, options:opt};
	case CHECK_MAPOPTION:
		opt = {...state.mapoptions, [action.payload.opt]:action.payload.chk};
		return {...state, mapoptions:opt};	
	case CHANGE_DATE:
		if(action.payload.valid === true) {
			return {...state, dDate:action.payload.date};
		}else{
			return {...state};
		}
	case DELETE_DATE:
		return {...state, dDate:''};	
	default:
		return state;
	}
}