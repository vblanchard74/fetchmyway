import React from 'react';
import { Component,PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import { Link } from 'react-router';

import _ from 'lodash';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';


import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';



class Header extends Component {

	componentWillMount() {
		this.props.getConfig();
	}

	constructor(props) {

		super(props);

		this.state = {
			currentLang: _.find(this.props.config.langList, function(o) { return o.id === window.AppState.getLocale(); }),
			currentCurr: _.find(this.props.config.currList, function(o) { return o.id === window.AppState.getCurrency(); })
		};

		this.langMenu = this.langMenu.bind(this);
		this.onLangChange = this.onLangChange.bind(this);
		this.currencyMenu = this.currencyMenu.bind(this); 
		this.onCurrencyChange = this.onCurrencyChange.bind(this);
	}

	static contextTypes = {
		router: PropTypes.object
	}

	onLangChange(eventKey) {
		window.AppState.setLocale(eventKey);
		setTimeout(() => window.AppState.rerender(), 10);   
	}

	onCurrencyChange(eventKey) {
		window.AppState.setCurrency(eventKey);
		setTimeout(() => window.AppState.rerender(), 10);   
	}

	langMenu() {
		let displayLang = [];
		for (let L of _.filter(this.props.config.langList, function(o) { return o.id != window.AppState.getLocale(); })) {
			displayLang.push(<MenuItem key={L.id} eventKey={L.id} onSelect={this.onLangChange}><span className={'flag-icon '+L.icon}></span><span>{L.name}</span></MenuItem>);
		}
		return (
			<Dropdown id='dropdown-custom-1' pullRight>
					<Dropdown.Toggle>		        
						<span className={'flag-icon '+this.state.currentLang.icon}></span><span className='activeDropdownItem'>{this.state.currentLang.name}</span>
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{displayLang}
					</Dropdown.Menu>
			</Dropdown>
		);
	}

	currencyMenu() {
		let displayCurr = [];
		for (let C of _.filter(this.props.config.currList, function(o) { return o.id != window.AppState.getCurrency(); })) {
			displayCurr.push(<MenuItem key={C.id} eventKey={C.id} onSelect={this.onCurrencyChange}><Glyphicon glyph={C.icon} /><span>{C.name}</span></MenuItem>);
		}
		return (
			<Dropdown id='dropdown-custom-1' pullRight>
					<Dropdown.Toggle>		        
						<Glyphicon glyph={this.state.currentCurr.icon} /><span className='activeDropdownItem'>{this.state.currentCurr.name}</span>
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{displayCurr}
					</Dropdown.Menu>
			</Dropdown>
		);
	}

	render() {
		return (
			<div className='header'>
				<Grid fluid>
					<Row className="show-grid">
						<Col xs={7} md={7}>
							<Link to='/'><img src='./style/img/logo.png' /></Link>
							<a href='https://github.com/vblanchard74/fetchmyway' target='_blank' className='ghLink'><img src='./style/img/github.png' />Source</a>				
						</Col>
						<Col xs={5} md={5}>
							<ButtonToolbar>   	     	
								{this.langMenu()}		
								{this.currencyMenu()}	    
							</ButtonToolbar>
						</Col>
					</Row>	
				</Grid>		
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		config : state.config
	};
}

export default connect(mapStateToProps, actions)(Header);