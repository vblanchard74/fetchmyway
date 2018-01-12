import React from 'react';
import { Component,PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';

import _ from 'lodash';
/*global google:true*/
import {FormattedMessage, FormattedNumber} from 'react-intl';

import Panel from 'react-bootstrap/lib/Panel';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

var helpers = require('../helpers.js').default;

class RouteCard extends Component {

	constructor(props) {
		super(props);
		this.state = {open: false, pathState: []};
		this.listTransportIcons = this.listTransportIcons.bind(this);
		this.listDetails = this.listDetails.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
	}

	static contextTypes = {
		router: PropTypes.object
	}

	onItineraryLink(id) {
		this.props.chooseRoute(parseInt(this.props.id), this.props.idkey);
		setTimeout(() => this.context.router.push('/route/' + this.props.id + '/' + this.props.idkey + '/itinerary/' + id), 10);
	}

	onAgencyLink(id) {
		this.props.chooseRoute(parseInt(this.props.id), this.props.idkey);
		setTimeout(() => this.context.router.push('/route/' + this.props.id + '/' + this.props.idkey + '/agency/' + id), 10);
	}

	onMouseOver(){ //Preview path on mouse over
		let pathArray = [];
		if(this.state.pathState.length > 0){
			this.state.pathState.map((onePath) => {
				var newPath = new google.maps.Polyline({
					path: onePath.path,
					geodesic: false,
					strokeColor: onePath.color,
					strokeOpacity: 1.0,
					strokeWeight:6, 
					visible:true, 
					editable:false
				});
				newPath.setMap(this.props.map.state.map);
			});
		}else{
			this.props.route.segments.map((segment) => {
				let path = helpers.decodepaths(segment, this.props.id, this.props.trip);

				var newPath = new google.maps.Polyline({
					path: path.path,
					geodesic: false,
					strokeColor: path.color,
					strokeOpacity: 1.0,
					strokeWeight:6, 
					visible:true, 
					editable:false
				});
				pathArray.push(newPath);
				newPath.setMap(this.props.map.state.map);
			});
			this.setState({pathState: pathArray});
		}
	}

	onMouseOut(){
		if(this.state.pathState.length > 0){
			this.state.pathState.map((onePath) => {
				onePath.setMap(null);
			});
		}
		this.setState({pathState: []});
	}

	listTransportIcons(route) {
		return route.segments.map((segment,i) => {
			if(i > 0 && segment.vehicle == route.segments[i-1].vehicle) {
				return '';
			}
			return (<img key={i} src={'./style/img/icon_'+helpers.findVehicle(this.props.vehicles,segment.vehicle).kind+'.png'} width='32px' height='32px' title={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} alt={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} />);
		});
	}

	listDetails(route) {
		const tooltipFlights = <Tooltip id='tooltip'><FormattedMessage id='tooltipChangeFlight' defaultMessage='You can change your flight by clicking here.'/></Tooltip>;
		const tooltipAgencies = <Tooltip id='tooltip'><FormattedMessage id='tooltipAgency' defaultMessage='Get more informations on that line.'/></Tooltip>;
		const tooltipCarItinerary = <Tooltip id='tooltip'><FormattedMessage id='tooltipCarItinerary' defaultMessage='See the driving directions...'/></Tooltip>;
		let lastitem = '';
		let itinerariesLink = '';
		let tripRow = '';
		let placeRow = '';
		let price = '';
		return route.segments.map((segment, i) => {
			if(segment == route.segments.slice(-1)[0]){lastitem = ' lastitem';} //Styling property
			if(_.isNumber(segment.chosenItinerary)){itinerariesLink = ' itinerariesLinkOK';}else{itinerariesLink = ' itinerariesLinkNO';} //Flight link border is red if never changed
			//Special rules for flights
			if(segment.segmentKind == 'air'){
				tripRow = (
				<OverlayTrigger placement='top' overlay={tooltipFlights}>
					<a onClick={() => {this.onItineraryLink(i);}}>
						<li className={'detailtrip'+itinerariesLink}>
							<div className='detail'>
								<img src={'./style/img/icon_'+helpers.findVehicle(this.props.vehicles,segment.vehicle).kind+'.png'} width='24px' height='24px' title={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} alt={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} />
							</div>		
							<p>
								{helpers.MinToHours(helpers.getTotalHopsDuration(segment.outbound[segment.chosenItinerary || 0]),'minutes')} - {Math.round(segment.distance)} km	- <FormattedMessage id='fromTo' defaultMessage='From {from} to {to}' values={{from: <FormattedNumber value={helpers.getTotalPrice(this.props.route).priceL} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />, to: <FormattedNumber value={helpers.getTotalPrice(this.props.route).priceH} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />}}/>	<Glyphicon glyph='plane' />
							</p> 
						</li>
					</a>
				</OverlayTrigger>);
				placeRow = (
				<li className={'detailplace'+lastitem}>
					<div className='detail'></div>
					<p>{helpers.findPlace(this.props.places, segment.outbound[segment.chosenItinerary || 0].hops[0].arrPlace).shortName}</p>
				</li>);
			}else{
				if(segment.indicativePrices){
					if(segment.indicativePrices[0].priceLow){
						price = <span>- <FormattedMessage id='fromTo' defaultMessage='From {from} to {to}' values={{from: <FormattedNumber value={segment.indicativePrices[0].priceLow} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0}/>, to: <FormattedNumber value={segment.indicativePrices[0].priceHigh} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />}}/></span>;
					}else{
						price = <span>- <FormattedNumber value={segment.indicativePrices[0].price || 0} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} /></span>;
					}		
				}else{
					price = '';
				}
				if(segment.agencies){
					tripRow = (
					<OverlayTrigger placement='top' overlay={tooltipAgencies}>
						<a onClick={() => {this.onAgencyLink(i);}}>
							<li className='detailtrip itinerariesLinkOK'>
								<div className='detail'>
									<img src={'./style/img/icon_'+helpers.findVehicle(this.props.vehicles,segment.vehicle).kind+'.png'} width='24px' height='24px' title={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} alt={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} /> 
								</div>
								<p>
									{helpers.MinToHours(segment.transitDuration+segment.transferDuration,'minutes')} - {Math.round(segment.distance)} km {price} <Glyphicon glyph='info-sign' />
								</p>
							</li>
						</a>
					</OverlayTrigger>);
				}else if(helpers.findVehicle(this.props.vehicles,segment.vehicle).kind == 'car'){
					const carDep = helpers.findVehicle(this.props.places,segment.depPlace);
					const carArr = helpers.findVehicle(this.props.places,segment.arrPlace);
					tripRow = (
					<OverlayTrigger placement='top' overlay={tooltipCarItinerary}>
						<a href={'https://maps.google.com/maps?saddr='+carDep.lat+','+carDep.lng+'&daddr='+carArr.lat+','+carArr.lng} target='_blank'>
							<li className='detailtrip itinerariesLinkOK'>
								<div className='detail'>
									<img src={'./style/img/icon_'+helpers.findVehicle(this.props.vehicles,segment.vehicle).kind+'.png'} width='24px' height='24px' title={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} alt={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} /> 
								</div>
								<p>
									{helpers.MinToHours(segment.transitDuration+segment.transferDuration,'minutes')} - {Math.round(segment.distance)} km {price} <Glyphicon glyph='road' />
								</p>
							</li>
						</a>
					</OverlayTrigger>);
				}else{
					tripRow = (
					<li className='detailtrip'>
						<div className='detail'>
							<img src={'./style/img/icon_'+helpers.findVehicle(this.props.vehicles,segment.vehicle).kind+'.png'} width='24px' height='24px' title={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} alt={helpers.findVehicle(this.props.vehicles,segment.vehicle).name} />
						</div>
						<p>
							{helpers.MinToHours(segment.transitDuration+segment.transferDuration,'minutes')} - {Math.round(segment.distance)} km {price}
						</p>
					</li>);
				}
				placeRow = (
					<li className={'detailplace'+lastitem}>
						<div className='detail'></div>
							<p>{helpers.findPlace(this.props.places, segment.arrPlace).shortName}</p>
					</li>);
			}
	//***********************//    
			return(
				<div key={i}>
					{tripRow}
					{placeRow}
				</div>
			);
		});
	}


	render() {



		let buttonSelect; //Button show either 'Choose' or 'Clear'
		if(this.props.activeCard == 'success') {
			buttonSelect = <button className='btn btn-danger' onClick={() => {
				setTimeout(() => this.props.clearRoute(parseInt(this.props.id), this.props.idkey, this.props.trip, this.props.config.dDate), 10);
			}
			}><FormattedMessage id='clear' defaultMessage='Clear'/></button>;
		}else{
			buttonSelect = <button className='btn btn-primary' onClick={() => {
				setTimeout(() => this.props.chooseRoute(parseInt(this.props.id), this.props.idkey, this.props.trip, this.props.config.dDate), 10);
			}
			}><FormattedMessage id='choose' defaultMessage='Choose'/></button>;
		}

		let buttonDetails; //Show either 'Details' or 'Hide Details'
		let buttonText = '';
		if(this.state.open) {
			buttonText = <FormattedMessage id='hideDetails' defaultMessage='Hide details'/>;
		}else{
			buttonText = <FormattedMessage id='showDetails' defaultMessage='Show details'/>;
		}
		buttonDetails = <button className='btn btn-primary' onClick={ ()=> this.setState({ open: !this.state.open })}>{buttonText}</button>;

		let totalPrice = ''; //Format price
		if(helpers.getTotalPrice(this.props.route).priceL < helpers.getTotalPrice(this.props.route).priceH){
			totalPrice = <FormattedMessage id='fromTo' defaultMessage='From {from} to {to}' values={{from: <FormattedNumber value={helpers.getTotalPrice(this.props.route).priceL} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0}/>, to: <FormattedNumber value={helpers.getTotalPrice(this.props.route).priceH} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />}}/>;
		}else{
			totalPrice = <FormattedNumber value={helpers.getTotalPrice(this.props.route).priceL} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0}/>;
		}


		return (
		<Panel className='routeCard' key={this.props.idkey} header={this.props.route.name} bsStyle={this.props.activeCard} onMouseEnter={() => this.onMouseOver()} onMouseLeave={() => this.onMouseOut()}>
		<p>{helpers.MinToHours(helpers.getTotal(this.props.route,'duration'),'minutes')} - {Math.round(helpers.getTotal(this.props.route,'distance'))} km - {totalPrice}</p>
		<p>{this.listTransportIcons(this.props.route)}</p>
		<p><FormattedMessage id='stopovers' values={{num:this.props.route.segments.length}} defaultMessage=''/></p>
		<Panel className='detailspanel' collapsible expanded={this.state.open}>
			<ul className='detailsul'>
				<li className='detailplace firstitem'><div className='detail'></div><p>{helpers.findPlace(this.props.places, this.props.route.segments[0].depPlace).shortName}</p></li>
				{this.listDetails(this.props.route)}
			</ul>
		</Panel>
		{buttonSelect}
		{buttonDetails}
		</Panel>
		);
	}

}

function mapStateToProps(state) {
	return {
		trip : state.trip,
		config : state.config
	};
}


export default connect(mapStateToProps, actions)(RouteCard);
