import React from 'react';
import { Component,PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import { Link } from 'react-router';

import RouteCard from './route-card';

import {FormattedMessage} from 'react-intl';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';


class RoutesList extends Component {


	componentWillMount() {
		this.props.getConfig();
		this.props.getPlaces();

		const orig = this.props.places[this.props.params.id];
		const dest = this.props.places[parseInt(this.props.params.id)+1];

		
		if(!orig.isSet || !dest.isSet) {     //Check if orig and dest for this route are set																											
			this.context.router.push('/');	   //Redirect to Index if not
		}else if(!this.props.trip[this.props.params.id] || !this.props.trip[this.props.params.id].infos.routes || (this.props.trip[this.props.params.id].options != {} && this.props.trip[this.props.params.id].options != this.props.config.options)) { //Check if a route for between those two points exists or has already been chosen
			this.props.mainLoading(true);
			this.props.getRoutes(orig,dest,this.props.config.options)     //Get the available routes if all is set
		.then(() => { 
			this.props.mainLoading(false);
		});  
		}
	}

	constructor(props) {
		super(props);

		this.listRoutes = this.listRoutes.bind(this);
	}

	static contextTypes = {
		router: PropTypes.object
	}

	listRoutes() {	
		let activeCard = '';
		if(this.props.trip[this.props.params.id].infos.routes.length < 1){return <FormattedMessage id='noRouteFound' defaultMessage='Sorry, no route was found for this trip.'/>;}
		return this.props.trip[this.props.params.id].infos.routes.map((route,i) => {        //List the routes
			if (i == this.props.trip[this.props.params.id].chosenRoute) { activeCard = 'success';}else{activeCard = 'default';}
			return (
				<RouteCard map={this.props.map.refs.wrappedInstance.refs.map} places={this.props.trip[this.props.params.id].infos.places} vehicles={this.props.trip[this.props.params.id].infos.vehicles} route={route} id={this.props.params.id} key={i} idkey={i} activeCard={activeCard} />
			);
		});
	}

	render() {

		const orig = this.props.places[this.props.params.id];
		const dest = this.props.places[parseInt(this.props.params.id)+1];


		if(!orig.isSet || !dest.isSet || !this.props.trip[this.props.params.id] || !this.props.trip[this.props.params.id].infos.routes || this.props.config.mainLoading || !this.props.map.refs.wrappedInstance.refs.map) { //Wait for states and loading TOO MANY
			return <div></div>;
		}

		return (
			<div>
				<Link to='/' className='btn btn-primary'><Glyphicon glyph='menu-left' /><FormattedMessage id='goBack' defaultMessage='Back'/></Link>
				<h2><FormattedMessage id='fromTo' defaultMessage='From {from} to {to}' values={{from: orig.infos.label, to: dest.infos.label}}/></h2>
				<div className='routes-list'>
					{this.listRoutes()}
				</div>
			</div>
		);
	}

	}

function mapStateToProps(state) {
	return {
		places : state.places,
		trip : state.trip,
		config : state.config
	};
}


export default connect(mapStateToProps, actions)(RoutesList);