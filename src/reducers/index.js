import { combineReducers } from 'redux';
import TripReducer from './reducer_trip';
import PlacesReducer from './reducer_places';
import ConfigReducer from './reducer_config';
import intlReducer from './reducer_intl';
import dateReducer from './reducer_dates';

const rootReducer = combineReducers({
	trip: TripReducer,
	places: PlacesReducer,
	config: ConfigReducer,
	intl: intlReducer,
	dates: dateReducer
});

export default rootReducer;
