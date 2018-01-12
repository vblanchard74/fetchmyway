import React from 'react';
import { Component,PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import _ from 'lodash';
import SearchBar from './search-bar';
import Messages from './messages';

import {FormattedMessage, FormattedNumber} from 'react-intl';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import Table from 'react-bootstrap/lib/Table';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import CheckBox from 'react-bootstrap/lib/CheckBox';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import { CSSTransitionGroup } from 'react-transition-group';
import Datetime from 'react-datetime';
import moment from 'moment';


var helpers = require('../helpers.js').default;

class PlacesList extends Component {

	componentWillMount() {
		this.props.getConfig();
		this.props.getPlaces();
		this.props.getDates();
	}

	constructor(props) {

		super(props);

		this.state = {
			isLoading :false,
			optHeader : <span><Glyphicon glyph='triangle-bottom' />Options</span>,
		};

		this.onDateChange = this.onDateChange.bind(this);
		this.onDateDelete = this.onDateDelete.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.displayDate = this.displayDate.bind(this);
		this.listTransportIcons = this.listTransportIcons.bind(this);
		this.displayCheckbox = this.displayCheckbox.bind(this);
		this.displayMapCheckbox = this.displayMapCheckbox.bind(this);
		this.clickOptionHeader = this.clickOptionHeader.bind(this);
		this.checkOption = this.checkOption.bind(this);
		this.listPlaces = this.listPlaces.bind(this);
		this.onRouteClick = this.onRouteClick.bind(this);
		this.moveUp = this.moveUp.bind(this);
		this.moveDown = this.moveDown.bind(this);
	}

	static contextTypes = {
		router: PropTypes.object
	}

	displayDate(){
		let clearDateButton = <Button bsSize='xsmall' type='button' className='btn-danger' onClick={() => {this.onDateDelete();}}><Glyphicon glyph='remove' /></Button>;
		if(this.props.config.dDate == ''){clearDateButton = '';}

		var yesterday = Datetime.moment().subtract( 1, 'day' );
		var valid = function( current ){
			return current.isAfter( yesterday );
		};
		
		return <Grid fluid className='dateForm'>
					<Row>
						<Col xs={10} md={10} lg={10} className='col-centered'>
							<Row className='show-grid vertical-align'>  
								<Col xs={11} md={11} lg={11}>
									<Datetime 
										value={this.props.config.dDate}
										locale={window.AppState.getLocale()} 
										onChange={this.onDateChange}
										closeOnSelect={true}
										isValidDate={ valid }
										inputProps={{
											placeholder:Messages[window.AppState.getLocale()].dDatePlaceHolder,
											readOnly:true
										}}
									/>
								</Col>
								<Col xs={1} md={1} lg={1}>
									<CSSTransitionGroup
										transitionName="dateClearButton"
										transitionEnterTimeout={500}
										transitionLeaveTimeout={300}>
										{clearDateButton}
									</CSSTransitionGroup>
								</Col>
							</Row>
						</Col>
					</Row>
				</Grid>;
	}

	onDateChange(date){
		this.props.changeDate(date);
		this.props.calculDate(helpers.calculDates(this.props.trip,date));
	}

	onDateDelete(){
		this.props.deleteDate();
		this.props.calculDate(helpers.calculDates(this.props.trip,''));
	}

	onAdd(){   // Add a destination to the list
		this.props.addPlace();
	}

	onDelete(id){
		this.props.deleteRoute(parseInt(id)); //Remove following route 
		if(id > 0){this.props.deleteRoute(parseInt(id)-1);} //Remove previous route if it's not the first place
		this.props.deletePlace(id);
		setTimeout(() => this.props.calculDate(helpers.calculDates(this.props.trip,this.props.config.dDate)), 10);
	}

	onRouteClick(id){
		const orig = this.props.places[id];
		const dest = this.props.places[id+1];
		if(orig.isSet && dest.isSet) {
			this.context.router.push('/route/' + orig.id);
		}
	}

	moveUp(id){
		this.props.deleteRoute(parseInt(id)-2); //Remove routes
		this.props.deleteRoute(parseInt(id)-1); 
		this.props.deleteRoute(parseInt(id)); 
		this.props.movePlaceUp(id);
		setTimeout(() => this.props.calculDate(helpers.calculDates(this.props.trip,this.props.config.dDate)), 10);
		
	}

	moveDown(id){
		this.props.deleteRoute(parseInt(id)-1); //Remove routes
		this.props.deleteRoute(parseInt(id)); 
		this.props.deleteRoute(parseInt(id)+1); 
		this.props.movePlaceDown(id);
		setTimeout(() => this.props.calculDate(helpers.calculDates(this.props.trip,this.props.config.dDate)), 10);
	}

	clickOptionHeader(exp) {
		if(exp == true) {
			this.setState({ optHeader: <span><Glyphicon glyph='triangle-right' />Options</span> });
		}else{
			this.setState({ optHeader: <span><Glyphicon glyph='triangle-bottom' />Options</span> });
		}
		
	}

	displayCheckbox(opt) {
		let checked = ''; if(this.props.config.options[opt] == true){checked = 'checked';}
		return <td><CheckBox checked={checked} onChange={ event => this.checkOption(opt,event.target.checked)}><FormattedMessage id={opt} defaultMessage={opt} /></CheckBox></td>;
	}

	checkOption(opt,chk){ //Check/Uncheck an option
		this.props.checkOption(opt, chk);
	}

	displayMapCheckbox(opt) {
		let checked = ''; if(this.props.config.mapoptions[opt] == true){checked = 'checked';}
		return <td><CheckBox checked={checked} onChange={ event => this.checkMapOption(opt,event.target.checked)}><FormattedMessage id={opt} defaultMessage={opt} /></CheckBox></td>;
	}

	checkMapOption(opt,chk){ //Check/Uncheck a map option
		this.props.checkMapOption(opt, chk);
	}

	listTransportIcons(route) {
		return route.segments.map((segment,i) => {
			if(i > 0 && segment.segmentKind == route.segments[i-1].segmentKind) {
				return '';
			}
			return (<img key={i} src={'../style/img/icon_'+segment.kind+'.png'} width='32px' height='32px' />);
		});
	}


	listPlaces() {
		const formTranslations = { //Pass the translations to the search bar for React Select
			noResultsText: Messages[window.AppState.getLocale()].searchNoResultsText || 'Search...',
			searchPromptText: Messages[window.AppState.getLocale()].searchPromptText || 'Type to search',
			searchingText: Messages[window.AppState.getLocale()].searchSearching || 'Searching...'
		};
		let routeLink = '';
		
		const tooltipMoveUp = <Tooltip id='tooltip'><FormattedMessage id='tooltipMoveUp' defaultMessage='Move up on the list' /></Tooltip>;
		const tooltipMoveDown = <Tooltip id='tooltip'><FormattedMessage id='tooltipMoveDown' defaultMessage='Move down on the list' /></Tooltip>;
		const tooltipDelete = <Tooltip id='tooltip'><FormattedMessage id='tooltipDelete' defaultMessage='Remove this place from your trip' /></Tooltip>;
		return this.props.places.map((placesItem,i,arr) => { 				//Create a Place for each place in the state
			if(this.props.trip[i] && !_.isNull(this.props.trip[i].chosenRoute) ){
				routeLink = (<Panel collapsible defaultExpanded header={this.props.trip[i].infos.routes[this.props.trip[i].chosenRoute].name} bsStyle='primary'>
								<ListGroup fill>
									<ListGroupItem><b><FormattedMessage id='duration' defaultMessage='Duration' />: </b>{helpers.MinToHours(helpers.getTotal(this.props.trip[i].infos.routes[this.props.trip[i].chosenRoute],'duration'),'minutes')}</ListGroupItem>
									<ListGroupItem><b>Distance: </b>{Math.round(helpers.getTotal(this.props.trip[i].infos.routes[this.props.trip[i].chosenRoute],'distance'))} km</ListGroupItem>
									<ListGroupItem><b><FormattedMessage id='price' defaultMessage='Price' />: </b><FormattedNumber value={helpers.getTotalPrice(this.props.trip[i].infos.routes[this.props.trip[i].chosenRoute]).priceL} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} /> ~ <FormattedNumber value={helpers.getTotalPrice(this.props.trip[i].infos.routes[this.props.trip[i].chosenRoute]).priceH} style='currency' currency={window.AppState.getCurrency()} minimumFractionDigits={0} /></ListGroupItem>
									<ListGroupItem bsStyle='info' onClick={() => {this.onRouteClick(placesItem.id);}}><FormattedMessage id='clickTransport2' defaultMessage='Click to change the selected route' /></ListGroupItem>
								</ListGroup>
							</Panel>);
			}else{
				if(placesItem != _.last(arr)) { 
					if(!arr[i].isSet || !arr[i+1].isSet) {
						routeLink = <Button bsStyle='primary' block disabled={true}><FormattedMessage id='disabledTransport' defaultMessage='Please choose an origin and a destination'/></Button>; //Button is disabled if both origin and destination are empty
					}else{
						routeLink = <Button bsStyle='primary' block onClick={() => {this.onRouteClick(placesItem.id);}}><FormattedMessage id='clickTransport' defaultMessage='Click to select the route from {from} to {to}' values={{from: helpers.formatAddress(arr[i].infos.gmaps,'cityOnly'), to: helpers.formatAddress(arr[i+1].infos.gmaps,'cityOnly')}}/></Button>; 
					}   
				}  
			}
			let dateList = this.props.dates;			
			let pDate = '';
			let dateButton = '';
			if(dateList[placesItem.id] && !_.isUndefined(dateList[placesItem.id].date) && moment(dateList[placesItem.id].date).isValid()){pDate = moment(dateList[placesItem.id].date).format('LLLL'); dateButton = <Glyphicon glyph='calendar' />;}
			let headerLabel = <FormattedMessage id='placeNum' values={{num: placesItem.id}} defaultMessage='Stopover {num}' />;
			let buttonTop = <OverlayTrigger placement='left' overlay={tooltipMoveUp}><Button bsStyle='primary' bsSize='xsmall' onClick={() => {this.moveUp(placesItem.id);}}><Glyphicon glyph='triangle-top' /></Button></OverlayTrigger>;
			let buttonBottom = <OverlayTrigger placement='left' overlay={tooltipMoveDown}><Button bsStyle='primary' bsSize='xsmall' onClick={() => {this.moveDown(placesItem.id);}}><Glyphicon glyph='triangle-bottom' /></Button></OverlayTrigger>;
			let buttonMiddle = <OverlayTrigger placement='left' overlay={tooltipDelete}><Button bsSize='xsmall' type='button' className='btn-danger' onClick={() => {this.onDelete(placesItem.id);}}><Glyphicon glyph='remove' /></Button></OverlayTrigger>;     
			if(placesItem == _.last(arr)) { 
				routeLink=<Button bsStyle='danger' block onClick={() => {this.onAdd();}}><FormattedMessage id='addPlace' defaultMessage='Add a new place' /></Button>;//Same for last place down button, and add button instead of transport link
				buttonBottom=<Button bsSize='xsmall' disabled={true}><Glyphicon glyph='triangle-bottom' /></Button>;
				headerLabel = <FormattedMessage id='arrival' defaultMessage='Arrival' />;
			}   
			if(placesItem == _.head(arr)) { 
				buttonTop= <Button bsSize='xsmall' disabled={true}><Glyphicon glyph='triangle-top' /></Button>;          //First place up button is disabled and no tooltip
				headerLabel = <FormattedMessage id='depart' defaultMessage='Departure' />;
			}
			const placeHeader =
				<Grid fluid>
							<Row className='show-grid vertical-align'>  
								<Col xs={4} md={4} lg={4}>
									{headerLabel}
								</Col>
								<Col xs={8} md={8} lg={8} className='placeDate'>
									{dateButton}{_.upperFirst(pDate)}
								</Col>
							</Row>
				</Grid>;

			if(arr.length == 1){buttonMiddle=<Button bsSize='xsmall' type='button' className='btn-danger' disabled={true} onClick={() => {this.onDelete(placesItem.id);}}><Glyphicon glyph='remove' /></Button>;} //Disable delete button if there's only one place
			
			return (
					<li key={placesItem.id} className='list-group'>
						<Grid fluid>
							<Row className='show-grid vertical-align'>  
								<Col xs={1} md={1} lg={1}>
									<ul className="controlButtonList">
										<li>{buttonTop}</li>
										<li>{buttonMiddle}</li>
										<li>{buttonBottom}</li>
									</ul>
								</Col>
								<Col xs={11} md={11} lg={11}>
									<Panel header={placeHeader} bsStyle='primary'>
										<SearchBar id={placesItem.id} longName={placesItem.infos.label} map={this.props.map} noResultsText={formTranslations.noResultsText} searchPromptText={formTranslations.searchPromptText} searchingText={formTranslations.searchingText}/>
									</Panel>  
								</Col>
							</Row>
							<Row className='show-grid'>
								<Col xs={1} md={1} lg={1}>
								</Col>
								<Col xs={11} md={11} lg={11} className='routeSelectBtn'>
									{routeLink}
								</Col>
							</Row>
						</Grid>     
					</li>
				);
		});
	}

	render() {

		if(!this.props.map) {
			return <div>LOADING</div>;
		}

		return (
			<div>
				<Panel onSelect={ ()=> this.clickOptionHeader(this.refs.optPanel.state.expanded)} collapsible defaultExpanded header={this.state.optHeader} className='optionsPanel' ref='optPanel'>
					<FormGroup>
						<Table bordered condensed>
							<tbody>
								<tr>
									{this.displayCheckbox('noAir')}
									{this.displayCheckbox('noRail')}
								</tr>
								<tr>
									{this.displayCheckbox('noBus')}
									{this.displayCheckbox('noFerry')}
								</tr>
								<tr>
									{this.displayCheckbox('noCar')}
									{this.displayCheckbox('noRideshare')}
								</tr>
								<tr>
									{this.displayCheckbox('noTowncar')}
									{this.displayCheckbox('noStop')}
								</tr>
								<tr>
									{this.displayCheckbox('noStopover')}
									{this.displayMapCheckbox('displayArrows')}
								</tr>
							</tbody>
						</Table>
					</FormGroup>
				</Panel>
				{this.displayDate()}
				<div className='places-list'>
					<ul>{this.listPlaces()}</ul>
				</div>
			</div>
		);
	}

}

function mapStateToProps(state) {
	return {
		places : state.places,
		trip : state.trip,
		config : state.config,
		dates : state.dates
	};
}

export default connect(mapStateToProps, actions)(PlacesList);

