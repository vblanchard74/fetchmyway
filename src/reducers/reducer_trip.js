import _ from 'lodash';

import {GET_TRIP} from '../actions/types';
import {GET_ROUTES} from '../actions/types';
import {CHOOSE_ROUTE} from '../actions/types';
import {DELETE_ROUTE} from '../actions/types';
import {CLEAR_ROUTE} from '../actions/types';
import {CHANGE_ITINERARY} from '../actions/types';

const INITIAL_STATE = [
{id:0, infos:{}, chosenRoute:null, options:{} }];

// State argument is not application state, only the state this reducer is responsible for
export default function(state = INITIAL_STATE, action) {

	let data = {};
	
	switch(action.type) {
	case GET_TRIP:
		return state;
	case GET_ROUTES:
		data = action.payload.data;
		if(action.payload.config.extraData.opt.noStopover == true){ //Filter out air segments with stopovers if option is checked
			_.forEach(data.routes, function(route) { 
				_.forEach(route.segments, function(segment) { 
					if(segment.segmentKind == 'air'){
						segment.outbound = _.filter(segment.outbound, function(o) { return o.hops.length < 2; });
						if (segment.outbound.length == 0){
							route.someAir = true;
						}	
					}
				});

			});
			data.routes = _.filter(data.routes, function(o) { return !o.someAir; });
		}
		if(_.isUndefined(_.find(state, { 'id': action.payload.config.extraData.id}))){     //If provided id isn't in the state we concat the new trip element
			return state.concat({id:action.payload.config.extraData.id, infos:data, chosenRoute:null, options:action.payload.config.extraData.opt});
		}else{																//If provided id is in the state we update it
			return state.map(item => {
				if (item.id !== action.payload.config.extraData.id) {
					return item;
				}
				return {
					...item,
					infos:data,
					chosenRoute:null,
					options:action.payload.config.extraData.opt
				};
			});															 
		}
	case CHOOSE_ROUTE:
		return state.map(item => {
			if (item.id !== action.payload.id) {
				return item;
			}
			return {
				...item,
				chosenRoute: action.payload.routeKey
			};
		});
	case DELETE_ROUTE:
		return state.map(item => {
			if (item.id !== action.payload) {
				return item;
			}
			return {
				...item,
				infos:{},
				chosenRoute: null
			};
		});
	case CLEAR_ROUTE:
		return state.map(item => {
			if (item.id !== action.payload.id) {
				return item;
			}
			return {
				...item,
				chosenRoute: null
			};
		});
	case CHANGE_ITINERARY:
		return state.map(item => {
			if (item.id !== parseInt(action.payload.id)) {
				return item;
			}
			let newItem = item;
			newItem.infos.routes[action.payload.routeid].segments[action.payload.segment].chosenItinerary = action.payload.itineraryid;
			return {
				...item,
				...newItem
			};
		});
	default:
		return state;
	}
}