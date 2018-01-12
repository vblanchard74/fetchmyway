import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {FormattedMessage} from 'react-intl';
import * as actions from '../actions';
/*global google:true*/
import Header from './header';

import WorldMap from './world-map';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';

import moment from 'moment';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			width: window.innerWidth,
		};
	}

	componentWillMount(){
		this.props.getConfig();
		window.addEventListener('resize', this.handleWindowSizeChange);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleWindowSizeChange);
	}

	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	};

	onSelect(event) {
		if(event != 2){
			this.props.mainLoading(true);
			setTimeout(() => google.maps.event.trigger(this.gmap.refs.wrappedInstance.refs.map.state.map, 'resize'), 2500);
			var LatLngList = new Array ();
			_.forEach(this.props.places, function(n) {
				if(n.isSet) {
					LatLngList.push(new google.maps.LatLng (n.infos.location.lat,n.infos.location.lng));
				}
			});
			var bounds = new google.maps.LatLngBounds();
			for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
				bounds.extend(LatLngList[i]);
			}


			if(LatLngList.length == 0 ){
				setTimeout(() => this.gmap.refs.wrappedInstance.refs.map.state.map.panTo({lat:0,lng:0}), 2550);
			}	
			else if(LatLngList.length == 1 ){
				setTimeout(() => this.gmap.refs.wrappedInstance.refs.map.state.map.panTo(LatLngList[0]), 2550);
			}else{
				setTimeout(() => this.gmap.refs.wrappedInstance.refs.map.state.map.fitBounds(bounds), 2550);
			}
			setTimeout(() => this.props.mainLoading(false), 2600);
		}
	}

	render() {
		const { width } = this.state;
		const isMobile = width <= 1024;
		let layout = '';
		const tab1 = <FormattedMessage id='worldMapTab' defaultMessage='Switch to the map'/>;
		const tab2 = <FormattedMessage id='infoPanelTab' defaultMessage='Switch to the info panel'/>;
		moment.locale(window.AppState.getLocale());
		let loading = (this.props.config.mainLoading ? 'maploading' : ''); //Look at the config state for loading screen
		if (isMobile) {
			layout = <Tabs defaultActiveKey={2} onSelect={event => {this.onSelect(event);}} id="main-tabs" style={{height: '100%', width:'100%'}}>
				<Tab eventKey={1} title={tab1}><WorldMap ref={googleMap => {if (!googleMap) {return ;} this.gmap = googleMap;} }/></Tab>
				<Tab eventKey={2} title={tab2}><div className='rightPanel'>
									{this.props.children && React.cloneElement(this.props.children, {
										map: this.gmap
									})}
								</div></Tab>
			</Tabs>;
		} else {
			layout = 
						<Row className="show-grid" style={{height: '100%'}}>
							<Col md={8} lg={9} style={{height: '100%'}}><WorldMap ref={googleMap => {if (!googleMap) {return ;} this.gmap = googleMap;} }/></Col>
							<Col md={4} lg={3}>
								<div className='rightPanel'>
									{this.props.children && React.cloneElement(this.props.children, {
										map: this.gmap
									})}
								</div>
							</Col>
						</Row>;
					
		}
		
		return (
			<div style={{height: '100%'}}>
				<div id={loading}></div>
				<div style={{height: '100%'}}>
					<Grid fluid style={{height: '100%'}}>
						<Row className="show-grid">
							<Col xs={12} md={12} lg={12}><Header currency={this.props.config.currency}/></Col>
						</Row>
					{layout}
					</Grid>
				</div>
			</div>
			);
	}
}

function mapStateToProps(state) {
	return {
		config : state.config,
		places : state.places
	};
}


export default connect(mapStateToProps, actions)(App);
