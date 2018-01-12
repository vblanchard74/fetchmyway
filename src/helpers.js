import React from 'react';
import {FormattedMessage} from 'react-intl';
import moment from 'moment';
import _ from 'lodash';
/*global google:true*/

let helpers =  {
	MinToHours: function(duration,unit) {       // Convert the duration to clean display with hours unit is 'minutes' or 'seconds'
		var d = moment.duration(parseInt(duration), unit);
		var hours = Math.floor(d.asHours());
		var mins = Math.floor(d.asMinutes()) - hours * 60;

		if (hours > 0) {
			if(mins > 0) {
				return (hours + ' h ' + mins + ' mn');
			}else{
				return (hours + ' h ');
			}
		} else {
			return (mins + ' mn');
		}
	},
	ToKM: function(distance) {
		distance = Math.round(distance / 1000);
		var dist = distance.toString();
		return dist + ' km';
	},
	//Get Vehicle from ID
	findVehicle: function (vehicleList,code) { //Parameters : Vehicles, the code (digit) / Result object : kind, name
		return vehicleList[parseInt(code)];
	},
	//Get Place from ID
	findPlace: function (placeList,code) { //Parameters : Places, the code (digit) / Result object : kind, shortName, lat , lng
		return placeList[parseInt(code)];
	},
	//Get Airline from ID
	findAirline: function (airlineList,code) { //Parameters : Airlines, the code (digit) / Result object : code, {icon}, name, url
		return airlineList[parseInt(code)];
	},
	//Get Aircraft from ID
	findAircraft: function (aircraftList,code) { //Parameters : Aircrafts, the code (digit) / Result object : code, manufacturer, model
		return aircraftList[parseInt(code)];
	},
	//Get Agencies from ID
	findAgency: function (agencyList,code) { //Parameters : Agencies, the code (digit) / Result object : {icon}, name, url
		return agencyList[parseInt(code)];
	},
	//Get the sum of the segments duration or distance
	getTotal: function (route,typeofT) { //type is 'distance' or 'duration' or 'price'
		let total = 0;
		_.forEach(route.segments, function(segment) { 
			if(typeofT == 'distance') {total += segment.distance;}
			else if(typeofT == 'duration'){
				if(segment.segmentKind == 'air') {
					total += helpers.getTotalHopsDuration(segment.outbound[segment.chosenItinerary || 0]);
				}else{
					total += segment.transitDuration + segment.transferDuration;
				}
			}
		});
		return total;
	},
	//Get the sum of the segments prices
	getTotalPrice: function (route) { //type is 'distance' or 'duration' or 'price'
		let total = {'priceL':0,'priceH':0};
		_.forEach(route.segments, function(segment) { 
			if(segment.segmentKind == 'air') {
				if(segment.outbound[segment.chosenItinerary || 0].indicativePrices[0].priceLow){
					total.priceL += segment.outbound[segment.chosenItinerary || 0].indicativePrices[0].priceLow;
					total.priceH += segment.outbound[segment.chosenItinerary || 0].indicativePrices[0].priceHigh;
				}else{
					total.priceL += segment.outbound[segment.chosenItinerary || 0].indicativePrices[0].price;
					total.priceH += segment.outbound[segment.chosenItinerary || 0].indicativePrices[0].price;
				}
			}else{
				if(segment.indicativePrices){
					if(segment.indicativePrices[0].priceLow){
						total.priceL += segment.indicativePrices[0].priceLow;
						total.priceH += segment.indicativePrices[0].priceHigh;
					}else{
						total.priceL += segment.indicativePrices[0].price;
						total.priceH += segment.indicativePrices[0].price;
					}
				}
			}
		});
		return total;
	},
	getTotalHopsDuration: function(itinerary) {
		let duration = 0;
		_.forEach(itinerary.hops, function(hop) { 
			duration += hop.duration;
			if(hop.layoverDuration) {duration += hop.layoverDuration; }
		});
		return duration;
	},
	//Format gmaps adress
	formatAddress: function(gmaps,format) { //address components : street_number, route, locality, administrative_area_level_1 / 2, country, postal_code
		switch(format) {
		case 'cityOnly':
			if(_.find(gmaps.address_components, function(o) { return o.types[0] == 'locality'; })){
				return _.find(gmaps.address_components, function(o) { return o.types[0] == 'locality'; }).long_name;
			}else{
				return gmaps.address_components[0].long_name;
			}
			break;
		case 'country':
			return _.find(gmaps.address_components, function(o) { return o.types[0] == 'country'; });
			break;
		default:
		}
		

	},
	//Decimal to binary array
	dec2bin: function(n) {
		return n.toString(2).split('');
	},
	//Decode bitmask, Format days
	decodeDays: function(days) {
		var binary = helpers.dec2bin(days);
		var weekdays = [];
		var except ='';
		if(window.AppState.getLocale() == 'fr-FR'){
			weekdays = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
			except = 'Sauf';
		}else{
			weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
			except = 'Except';
		}
		while(binary.length < 7){
			binary.unshift( '0' );
		}
		var count = _.countBy(binary);
		count = count['1'];
		if(count == 7){
			return <FormattedMessage id='daily' defaultMessage='Daily' />;
		}else if(count == 6){
			return except+' '+weekdays[_.indexOf(binary, '0')];
		}else if(days == 124){
			return <FormattedMessage id='weekdays' defaultMessage='Weekdays' />;
		}else if(count == 5){
			return except+' '+weekdays[_.indexOf(binary, '0')]+', '+weekdays[_.lastIndexOf(binary, '0')];
		}else if(count == 4){
			return except+' '+weekdays[_.indexOf(binary, '0')]+', '+weekdays[_.indexOf(binary, '0',_.indexOf(binary, '0')+1)]+', '+weekdays[_.lastIndexOf(binary, '0')];
		}else if(count == 3){
			return weekdays[_.indexOf(binary, '1')]+', '+weekdays[_.indexOf(binary, '1',_.indexOf(binary, '1')+1)]+', '+weekdays[_.lastIndexOf(binary, '1')];
		}else if(days == 3){
			return 'Weekends';
		}else if(count == 2){
			return weekdays[_.indexOf(binary, '1')]+', '+weekdays[_.lastIndexOf(binary, '1')];
		}else if(count == 1){
			return weekdays[_.indexOf(binary, '1')];
		}else if(count == 0){
			return <FormattedMessage id='unavailable' defaultMessage='Unavailable' />;
		}
	},
	getItineraryDetails: function(itinerary) {
		const result = {
			departure: _.head(itinerary.hops).depTime, //Take the departure time from the first hop
			arrival: _.last(itinerary.hops).arrTime, //Take the arrival time from the last hop
			frequency: helpers.decodeDays(itinerary.operatingDays), 
			priceLow: itinerary.indicativePrices[0].priceLow || itinerary.indicativePrices[0].price || 0,
			priceHigh: itinerary.indicativePrices[0].priceHigh || itinerary.indicativePrices[0].price || 0,		
			duration: helpers.MinToHours(helpers.getTotalHopsDuration(itinerary),'minutes')
		};
		return result;		
	},
	decodepaths(segment, tripID, trip){
		let color = '';
		var decodepaths = {};
		if(segment.segmentKind == 'air') { //If the segment is a flight, build the path manually
			const ItineraryID = segment.chosenItinerary || 0; //Check if an itinerary has been chosen or take the first one
			//Find position of the starting airport, iterate thru the hops to find terminal airports and build the path
			var depPlace = helpers.findPlace(trip[tripID].infos.places,segment.outbound[ItineraryID].hops[0].depPlace);
			decodepaths = [new google.maps.LatLng({'lat':depPlace.lat,'lng':depPlace.lng})];
			segment.outbound[ItineraryID].hops.map((k) => {
				let arrPlace = helpers.findPlace(trip[tripID].infos.places,k.arrPlace);
				decodepaths.push(new google.maps.LatLng({'lat':arrPlace.lat,'lng':arrPlace.lng}));
			});
		}else{  //The segment isn't a flight, use the provided path
			decodepaths = google.maps.geometry.encoding.decodePath(segment.path);
		}
		switch(helpers.findVehicle(trip[tripID].infos.vehicles,segment.vehicle).kind) { //Set the path color
		case 'ferry':
			color = '#78cbc4';
			break;
		case 'bus':
		case 'shuttle':
			color = '#7ac143';
			break;
		case 'train':
		case 'tram':
		case 'subway':
			color = '#f78e1e';
			break;
		case 'walk':
			color = '#ed1c8f';
			break;
		case 'plane':
			color = '#00bce4';
			break;
		case 'unknown':
			color = '#cdcccc';
			break;
		default:
			color = '#731472';
		}             
		var path = {
			'path' : decodepaths,
			'color' : color
		};
		return path;
	},

	calculDates(trip,dDate,idR=undefined,routeK=undefined,clear=false){
		let newDate = dDate;
		let dates = [];
		let chosen = '';
		dates.push(dDate);
		_.forEach(trip, function(t,k) {
			if(k == parseInt(idR)){
				if(clear == true){
					chosen = null;
				}else{
					chosen = routeK;
				}		
			}else{
				if(_.isNull(t.chosenRoute)){chosen = null;}else{chosen = t.chosenRoute;}
			}
			if(t.infos && !_.isNull(chosen) && !_.isUndefined(dDate) && dDate != ''){
				_.forEach(t.infos.routes[chosen].segments, function(s) {
					if(s.segmentKind == 'air'){
						var binary = helpers.dec2bin(s.outbound[s.chosenItinerary || 0].operatingDays);
						var days = [];
						_.forEach(binary, function(nD,day) {
							if(nD == 1){
								let time = moment(s.outbound[s.chosenItinerary || 0].hops[0].depTime, 'HH:mm');
								let depDay = moment(newDate).day(day).hours(moment(time).hours()).minutes(moment(time).minutes());
								if(moment(depDay).isBefore(newDate) === true){
									depDay = moment(depDay).add(7, 'days');
								}
								days.push(depDay);
							}
						});
						newDate = moment.min(days).add(helpers.getTotalHopsDuration(s.outbound[s.chosenItinerary || 0]), 'minutes');
					}else{
						newDate = moment(newDate).add(moment.duration((s.transitDuration + s.transferDuration), 'minutes'));
					}
				});
				dates.push(newDate);
			}else{
				dates.push('');
			}
		});
		return dates;
	}
};

export default helpers;