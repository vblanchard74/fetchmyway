import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

import Geosuggest from 'react-geosuggest';

class SearchBar extends Component {

	componentWillMount() {
		this.props.getPlaces();
		
	}


	constructor(props) {

		super(props);

		this.state = {isLoading :false, showForm:false};

		this.onChange = this.onChange.bind(this);
		this.getAutocomplete = this.getAutocomplete.bind(this);
		this.displayForm = this.displayForm.bind(this);

	}


	onChange(value) {
		if(value != '') {
			this.setState({showForm : false});
			this.props.selectPlace(this.props.id,value);
			this.props.deleteRoute(parseInt(this.props.id)); //Delete the route if the place has changed
			this.props.deleteRoute(parseInt(this.props.id)-1);
		}
	}



	getAutocomplete(input) {
		return fetch('http://free.rome2rio.com/api/1.4/json/Autocomplete?key=c3zB0hIA&languageCode='+window.AppState.getLocale()+'&query='+input+'')
			.then((response) => response.json())
			.then((json) => {
				return { options: json.places };
			});
	}

	displayForm() {

		if(this.props.longName && !this.state.showForm){
			return (<a onClick={() => this.setState({showForm : true})}>{this.props.longName}</a>);    	
		}else{
			return (
			<Geosuggest 
				onSuggestSelect={this.onChange}
				placeholder={this.props.searchPromptText}
				initialValue={this.props.longName}
			/>);
				
		}
	}

	render() {

		if(!this.props.map) {
			return <div>LOADING</div>;
		}

		return (
			
			<div>
				<h3 className="section-heading">{this.displayForm()}</h3>	
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		places : state.places
	};
}


export default connect(mapStateToProps, actions)(SearchBar);