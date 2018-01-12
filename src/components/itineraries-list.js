import React from 'react';
import { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import { Link } from 'react-router';
import _ from 'lodash';

import {FormattedMessage, FormattedNumber} from 'react-intl';

import Panel from 'react-bootstrap/lib/Panel';
import Well from 'react-bootstrap/lib/Well';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

var helpers = require('../helpers.js').default;

class ItinerariesList extends Component {

	componentWillMount() {
		if(_.isUndefined(this.props.trip[this.props.params.id].infos.routes)) {    																											
			this.context.router.push('/');	   //Redirect to Index if not set
		}
	}

	static contextTypes = {
		router: PropTypes.object
	}

	constructor(props) {
		super(props);
		this.itineraryDetails = this.itineraryDetails.bind(this);
		this.listItineraries = this.listItineraries.bind(this);
		this.onRowSelect = this.onRowSelect.bind(this);
		this.tablePriceFormatter = this.tablePriceFormatter.bind(this);
	}

	listItineraries() {
		let list = [];
		this.props.trip[this.props.params.id].infos.routes[this.props.params.routeid].segments[this.props.params.segment].outbound.map((itinerary,i) => {
			if(this.props.config.options.noStopover == true && itinerary.hops.length > 1){
			}else{
				var item = helpers.getItineraryDetails(itinerary);
				item.id = i; //Add unique id for the sort table
				list.push(item);
			}
		});
		return list;
	}

	itineraryDetails() {		
		const trip = this.props.trip[this.props.params.id].infos;
		const itinerary = trip.routes[this.props.params.routeid].segments[this.props.params.segment].outbound[this.props.trip[this.props.params.id].infos.routes[this.props.params.routeid].segments[this.props.params.segment].chosenItinerary || 0];
		let layover = '';
		let aircraft = '';
		let depTerminal = '';
		let arrTerminal = '';
		return itinerary.hops.map((hop,i) => {
			if(hop.layoverDuration > 0){
				layover = 
				<FormattedMessage id='stopovers2' values={{airport:helpers.findPlace(trip.places,hop.depPlace).shortName, time:helpers.MinToHours(hop.layoverDuration,'minutes')}} defaultMessage='Layover in {airport} for {time}'/>;
			}
			if(!_.isUndefined(hop.aircraft)){
				aircraft =
				<p><FormattedMessage id='aircraft' defaultMessage='Aircraft'/>: {helpers.findAircraft(trip.aircrafts,hop.aircraft).manufacturer} {helpers.findAircraft(trip.aircrafts,hop.aircraft).model}</p>;
			}
			if(!_.isUndefined(hop.depTerminal)){
				depTerminal = '(Terminal '+hop.depTerminal+')';
			}
			if(!_.isUndefined(hop.arrTerminal)){
				arrTerminal = '(Terminal '+hop.arrTerminal+')';
			}
			return (
				<div key={i} className='itineraryDetails'>
						<div className='flyLayover'>{layover}</div>
						<Well>
							<p><FormattedMessage id='airline' defaultMessage='Airline'/>: <a href={helpers.findAirline(trip.airlines,hop.airline).url} target='_blank'>{helpers.findAirline(trip.airlines,hop.airline).name}</a></p>
							<p><FormattedMessage id='flightNumber' defaultMessage='Flight Number'/>: {hop.flight}</p>
							<p><FormattedMessage id='depart' defaultMessage='Departure'/>: {hop.depTime} {depTerminal}</p>
							<p><FormattedMessage id='arrival' defaultMessage='Arrival'/>: {hop.arrTime} {arrTerminal}</p>
							<p><FormattedMessage id='duration' defaultMessage='Duration'/>*: {helpers.MinToHours(hop.duration,'minutes')}</p>
							{aircraft}
						</Well>
				</div>
			);
		});		
	}

	onRowSelect(row){ //On selecting a row change the chosen Itinerary for this route then scroll back to top
		this.props.changeItinerary(this.props.params.id, this.props.params.routeid, this.props.params.segment, row.id);
		setTimeout(() => this.props.calculDate(helpers.calculDates(this.props.trip,this.props.config.dDate)), 10);
		scroll(0,0);
	}

	tablePriceFormatter(row, cell) {                  //The price is formatted outside the table so we can sort properly
		return <FormattedMessage id='fromTo' defaultMessage='From {from} to {to}' values={{from: <FormattedNumber value={cell.priceLow} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />, to: <FormattedNumber value={cell.priceHigh} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} />}}/>;
	}

	render() {

		if(_.isUndefined(this.props.trip[this.props.params.id].infos.routes)) {    																											
			return <div></div>;
		}
		
		var itineraries = this.listItineraries();

		var selectRowProp = {
			mode: 'radio',
			clickToSelect: true,
			bgColor: 'rgb(238, 193, 213)',
			onSelect: this.onRowSelect,
			selected:[this.props.trip[this.props.params.id].infos.routes[this.props.params.routeid].segments[this.props.params.segment].chosenItinerary || 0]
		};

		const header = <FormattedMessage id='currentItinerary' defaultMessage='Current Itinerary'/>;
		
		const options = {
			noDataText: <FormattedMessage id='noItinerary' defaultMessage="No data was found. Try changing your preferences."/>
		};
		return (
		<div>
			<Link to={'/route/'+this.props.params.id} className="btn btn-primary"><Glyphicon glyph='menu-left' /><FormattedMessage id='goBack' defaultMessage="Back"/></Link>
			<Panel header={header} bsStyle="primary">{this.itineraryDetails()}</Panel>
			<BootstrapTable data={itineraries} selectRow={selectRowProp} striped={true} hover={true} options={options}>
				<TableHeaderColumn dataField="id" dataSort={false} dataAlign="center" isKey={true} hidden={true}>id</TableHeaderColumn>
				<TableHeaderColumn dataField="departure" dataSort={true} dataAlign="center"><FormattedMessage id="depart" defaultMessage="Departure" /></TableHeaderColumn>
				<TableHeaderColumn dataField="arrival" dataSort={true} dataAlign="center"><FormattedMessage id="arrival" defaultMessage="Arrival" /></TableHeaderColumn>
				<TableHeaderColumn dataField="frequency" dataSort={false} dataAlign="center"><FormattedMessage id="frequency" defaultMessage="Frequency" /></TableHeaderColumn>
				<TableHeaderColumn dataField="priceLow" dataSort={true} dataAlign="center" dataFormat={this.tablePriceFormatter}><FormattedMessage id="price" defaultMessage="Price" /></TableHeaderColumn>
				<TableHeaderColumn dataField="duration" dataSort={true} dataAlign="center"><FormattedMessage id="duration" defaultMessage="Duration" />*</TableHeaderColumn>
			</BootstrapTable>
			<div>*<FormattedMessage id="durationWarning" defaultMessage="Durations are estimated" /></div>
		</div>
		);
	}

}

function mapStateToProps(state) {
	return {
		trip : state.trip,
		config : state.config
	};
}


export default connect(mapStateToProps, actions)(ItinerariesList);