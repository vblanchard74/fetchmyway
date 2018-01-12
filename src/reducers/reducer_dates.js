import _ from 'lodash';

import {GET_DATE} from '../actions/types';
import {ADD_PLACE} from '../actions/types';
import {DELETE_PLACE} from '../actions/types';
import {CALCUL_DATE} from '../actions/types';
import {CHOOSE_ROUTE} from '../actions/types';
import {CLEAR_ROUTE} from '../actions/types';

const INITIAL_STATE = [
{id:0, date:''},
{id:1, date:''}
];

// State argument is not application state, only the state this reducer is responsible for
export default function(state = INITIAL_STATE, action) {
	
	switch(action.type) {
	case GET_DATE:
		return state;
	case ADD_PLACE:
		return state.concat({id:state.length, date:''});
	case DELETE_PLACE:
		return _.dropRight(state);
	case CALCUL_DATE:
		return state.map(item => {
			return {
				...item,
				date: action.payload[item.id]
			};
		});
	case CHOOSE_ROUTE:
		return state.map(item => {
			return {
				...item,
				date: action.payload.dates[item.id]
			};
		});
	case CLEAR_ROUTE:
		return state.map(item => {
			return {
				...item,
				date: action.payload.dates[item.id]
			};
		});
	default:
		return state;
	}
}