import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import _ from 'lodash';
import {withGoogleMap, GoogleMapLoader, GoogleMap, Marker, Polyline, InfoWindow} from 'react-google-maps';
/*global google:true*/
var helpers = require('../helpers.js').default;
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import MarkerClusterer from '../../node_modules/react-google-maps/lib/addons/MarkerClusterer';

import {FormattedMessage} from 'react-intl';

import moment from 'moment';

class WorldMap extends Component {


	constructor(props) {

		super(props);

		this.state = {
			center: {
				lat: 0,
				lng: 0,
			},
			zoom:3
		};

		this.handleMarkerClick = this.handleMarkerClick.bind(this);
		this.handleMarkerClose = this.handleMarkerClose.bind(this);
	}

	componentWillMount() {
		this.props.initialize();
		this.props.getPlaces();
	}

	componentWillUpdate(nextProps) {
		this.stops = []; //Store all the stops coordinates and check later for duplicates infowindows
		if(this.refs.map.state.map){
			if(nextProps.places != this.props.places || nextProps.trip != this.props.trip ){  //Pan if places is the props that changed
				var LatLngList = new Array ();
				_.forEach(nextProps.places, function(n) {
					if(n.isSet) {
						LatLngList.push(new google.maps.LatLng (n.infos.location.lat,n.infos.location.lng));
					}
				});
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
					bounds.extend(LatLngList[i]);
				}


				if(LatLngList.length == 1 ){  //Zoom if there's only one or duplicates cities, fit if there are more
					this.refs.map.state.map.panTo(LatLngList[0]);
				}else{
					this.refs.map.state.map.fitBounds(bounds);
				}

			}
			
			//Update center and zoom when updating props
			this.setState({center: this.refs.map.state.map.getCenter()});
			this.setState({zoom: this.refs.map.state.map.getZoom()});
		}
	}

	handleMarkerClick(id) {
		this.props.showMarker(id);
	}

	handleMarkerClose(id) {
		this.props.closeMarker(id);
	}


	render() {

		const GoogleMapLoader = withGoogleMap(props => (
			<GoogleMap
				ref={props.map}
				defaultZoom={props.zoom}
				center={props.center}
				options={{gestureHandling: 'greedy'}}
			>
			
			<MarkerClusterer
				averageCenter
				enableRetinaIcons
				gridSize={60}
			>

			{/* Create main markers and bubbles */}
			{this.props.places.map((place) => {
				let dateList = this.props.dates;
				if(place.infos.location){
					var regionName = '';
					var countryName = helpers.formatAddress(place.infos.gmaps,'country');
					let pDate = '';
					let dateButton = '';
					if(dateList[place.id] && !_.isUndefined(dateList[place.id].date) && moment(dateList[place.id].date).isValid()){pDate = moment(dateList[place.id].date).format('LLLL'); dateButton = <Glyphicon glyph='calendar' />;}
					regionName = place.infos.gmaps.address_components[0].longName;
					this.stops.push({'lat':_.ceil(place.infos.location.lat,4),'lng':_.ceil(place.infos.location.lng,4)});
					return (
						<Marker
							position={{
								lat: place.infos.location.lat,
								lng: place.infos.location.lng
							}}
							key={place.id}
							defaultAnimation='2'
							icon={'./style/img/numicons/number_'+place.id+'.png'}>
							{place.showInfo && (
							<InfoWindow 
							>
								<div className="markerBubble">
									<h4>{place.infos.label}</h4>
									<hr/>
									<p>{regionName}</p>
									<p><span className={'flag-icon flag-icon-'+_.lowerCase(countryName.short_name)+''}></span>{countryName.long_name}</p>
									<p>{dateButton}{_.upperFirst(pDate)}</p>
								</div>
							</InfoWindow>
							)}
						</Marker>
					);
				}
			})}

			{/* Create polylines */}
			{this.props.trip.map((trip,i) => {
				//If allowed in the config : display arrows on the polylines
				let arrows = {};
				if(this.props.config.mapoptions.displayArrows){arrows = {
					'icon':{
						path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
						scale:3,
						strokeColor:'#000000',
						'strokeOpacity':0.4},
					'offset': '100%',
					'repeat':'500px'
				};}
				//
				if(!_.isNull(trip.chosenRoute)){
					return trip.infos.routes[trip.chosenRoute].segments.map((segment, key) => {
						let segmentPath = helpers.decodepaths(segment, i, this.props.trip);
						return (
							<Polyline
								path={segmentPath.path} 
								key={key}
								options={{ 
									strokeColor:segmentPath.color, 
									strokeOpacity:1.0, 
									strokeWeight:6, 
									visible:true, 
									geodesic:false, 
									editable:false,
									icons:[arrows]
								}} 
							/>
						);
					});
				}
			})}

			{/* Create main stops markers and bubbles */}
			{this.props.trip.map((trip) => {
				if(!_.isNull(trip.chosenRoute)){
					return trip.infos.routes[trip.chosenRoute].segments.map((segment, key) => {
						let vehicle = helpers.findVehicle(trip.infos.vehicles,segment.vehicle);
						let vehicleKind = <p><img src={'./style/img/icon_'+vehicle.kind+'_black.png'} width='20px' height='20px' />{_.upperFirst(vehicle.name)}</p>;
						if(segment.segmentKind == 'air'){
							return segment.outbound[segment.chosenItinerary || 0].hops.map((hop, key2, hops) => {
								let arrPlace = helpers.findPlace(trip.infos.places,hop.depPlace);
								let placeKind = '';
								if(arrPlace.kind){placeKind = <p><FormattedMessage id={arrPlace.kind || ''} defaultMessage={_.upperFirst(arrPlace.kind)}/></p>;}
								if((hop != _.last(hops)) && _.find(this.stops,{'lat':_.ceil(arrPlace.lat,4),'lng':_.ceil(arrPlace.lng,4)}) == undefined ){
									this.stops.push({'lat':_.ceil(arrPlace.lat,4),'lng':_.ceil(arrPlace.lng,4)});
									return (
										<Marker
											position={new google.maps.LatLng({'lat':arrPlace.lat,'lng':arrPlace.lng})}
											key={key+'-'+key2}
											defaultAnimation='2'
											>
											<InfoWindow>
												<div className="markerBubble">
													<h3>{arrPlace.shortName}</h3>
													<hr/>
													{placeKind}
													{vehicleKind}
												</div>
											</InfoWindow>
										</Marker>
									);
								}
							});		
						}else{
							let arrPlace = helpers.findPlace(trip.infos.places,segment.depPlace);				
							let placeKind = '';	
							if(arrPlace.kind){placeKind = <p><FormattedMessage id={arrPlace.kind || ''} defaultMessage={_.upperFirst(arrPlace.kind)}/></p>;}
							if(_.find(this.stops,{'lat':_.ceil(arrPlace.lat,4),'lng':_.ceil(arrPlace.lng,4)}) == undefined ){
								this.stops.push({'lat':_.ceil(arrPlace.lat,4),'lng':_.ceil(arrPlace.lng,4)});
								return (
									<Marker
										position={new google.maps.LatLng({'lat':arrPlace.lat,'lng':arrPlace.lng})}
										key={key}
										defaultAnimation='2'
										>
										<InfoWindow>        
											<div className="markerBubble">
												<h3>{arrPlace.shortName}</h3>
												<hr/>
												{placeKind}
												{vehicleKind}
											</div>
										</InfoWindow>
									</Marker>
								);
							}
						}
					});
				}
			})}

			{/* Create intermediate markers and bubbles */}
			{this.props.trip.map((trip) => {
				if(!_.isNull(trip.chosenRoute)){
					if(this.props.config.options.noStop === false){
						return trip.infos.routes[trip.chosenRoute].segments.map((segment) => {
							if(segment.stops && segment.stops.length > 0){
								return segment.stops.map((stop, key2) => { 
									let stoPlace = helpers.findPlace(trip.infos.places,stop.place);	
									if(_.find(this.stops,{'lat':_.ceil(stoPlace.lat,4),'lng':_.ceil(stoPlace.lng,4)}) == undefined){
										this.stops.push({'lat':_.ceil(stoPlace.lat,4),'lng':_.ceil(stoPlace.lng,4)});
										return (
											<Marker
												position={new google.maps.LatLng({'lat':stoPlace.lat,'lng':stoPlace.lng})}
												key={key2}
												defaultAnimation='2'
												icon={'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png'}>
												>
												<InfoWindow>        
													<div className="markerBubble">
														<h3>{stoPlace.shortName}</h3>
													</div>
												</InfoWindow>
											</Marker>
										);
									}
								});
							}
						});

					}}
			})}



			</MarkerClusterer>
			</GoogleMap>
		));
		return (
			<div className='GoogleMapWrap' style={{height: '100%'}}>
				<GoogleMapLoader
					ref='map'
					containerElement={ <div style={{height: '100%'}}/> }
					mapElement={<div style={{ height: '100%' }} /> }
					zoom={this.state.zoom}
					center={this.state.center}
					onMarkerClick={this.handleMarkerClick}
				/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		places : state.places,
		trip : state.trip,
		config: state.config,
		dates : state.dates
	};
}


export default connect(mapStateToProps, actions, null , { withRef: true })(WorldMap);



