import React from 'react';
import { Route,  IndexRoute } from 'react-router'; 

import App from './components/app';
import PlacesList from './components/places-list';
import RoutesList from './components/routes-list';
import ItinerariesList from './components/itineraries-list';
import AgenciesList from './components/agencies-list';



export default (
	<Route path="/" component={App} >
		<IndexRoute component={PlacesList} />
		<Route path="route/:id" component={RoutesList} />
		<Route path="route/:id/:routeid/itinerary/:segment" component={ItinerariesList} />
		<Route path="route/:id/:routeid/agency/:segment" component={AgenciesList} />
		<Route path="*" component={PlacesList} />
	</Route>
);