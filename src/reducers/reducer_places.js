import _ from 'lodash';

import {INITIALIZE} from '../actions/types';
import {GET_PLACES} from '../actions/types';
import {SELECT_PLACE} from '../actions/types';
import {ADD_PLACE} from '../actions/types';
import {DELETE_PLACE} from '../actions/types';
import {SHOW_MARKER} from '../actions/types';
import {CLOSE_MARKER} from '../actions/types';
import {MOVEPLACE_UP} from '../actions/types';
import {MOVEPLACE_DOWN} from '../actions/types';

const INITIAL_STATE = [
{id:0, isSet:false, showInfo:true, infos:{}},
{id:1, isSet:false, showInfo:true, infos:{}}
];

// State argument is not application state, only the state this reducer is responsible for
export default function(state = INITIAL_STATE, action) {
	
	switch(action.type) {
	case INITIALIZE:
		return state.map(item => {
			return {
				...item
			};
		});
	case GET_PLACES:
		return state;
	case SELECT_PLACE:
		return state.map(item => {
			if (item.id !== action.payload.id) {
				return item;
			}
			return {
				...item,
				isSet: true,
				infos: action.payload.infos,
			};

		});
	case ADD_PLACE:
		return state.concat({id:state.length, isSet:false, showInfo:true, infos:{longName:''}});
	case DELETE_PLACE:
		state = _.filter(state, function(o) { return o.id != action.payload; }); //Delete item with the chosen ID
		_.forEach(state, function(n, key) { //Reorder the places
			n.id = key;
		});
		return state;
	case SHOW_MARKER:
		return state.map(item => {
			if (item.id !== action.payload) {
				return item;
			}
			return {
				...item,
				showInfo: true,
			};
		});
	case CLOSE_MARKER:
		return state.map(item => {
			if (item.id !== action.payload) {
				return item;
			}
			return {
				...item,
				showInfo: false,
			};
		});
	case MOVEPLACE_UP: {
		let stateUp = state;
		[stateUp[action.payload-1],stateUp[action.payload]] = [stateUp[action.payload],stateUp[action.payload-1]]; //Swap the two places and reorder
		return state.map((item, key) => {																	   // ''
			return {
				id:key,
				isSet: stateUp[key].isSet,
				showInfo: stateUp[key].showInfo,
				date:'',
				infos: stateUp[key].infos
			};
		});
	}
	case MOVEPLACE_DOWN: {
		let stateDown = state;
		[stateDown[action.payload+1],stateDown[action.payload]] = [stateDown[action.payload],stateDown[action.payload+1]]; //Swap the two places and reorder
		return state.map((item, key) => {																	   // ''
			return {
				id:key,
				isSet: stateDown[key].isSet,
				showInfo: stateDown[key].showInfo,
				date:'',
				infos: stateDown[key].infos
			};
		});
	}
	default:
		return state;
	}
}