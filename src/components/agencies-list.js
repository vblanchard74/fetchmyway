import React from 'react';
import { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import { Link } from 'react-router';
import _ from 'lodash';

import {FormattedMessage} from 'react-intl';

var helpers = require('../helpers.js').default;

import Well from 'react-bootstrap/lib/Well';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

class AgenciesList extends Component {

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
		this.agencyDetails = this.agencyDetails.bind(this);
	}

	agencyDetails() {
		const agencies = this.props.trip[this.props.params.id].infos.routes[this.props.params.routeid].segments[this.props.params.segment].agencies;
		return agencies.map((agency,i) => {
			let aInfo = helpers.findAgency(this.props.trip[this.props.params.id].infos.agencies, agency.agency);
			let aIcon = '';
			if(aInfo.icon){aIcon = <img 
							src={'https://www.rome2rio.com'+aInfo.icon.url}
							width={aInfo.icon.w+'px'}
							height={aInfo.icon.h+'px'}
							title={aInfo.name}
							alt={aInfo.name}
						/>;}
			let aLink = '';if(aInfo.url){aLink = <a href={aInfo.url} target='_blank'>{aIcon} {aInfo.name}</a>;}
			let aPhone = '';if(aInfo.phone){aPhone = <p><FormattedMessage id='phone' defaultMessage='Phone number'/>: {aInfo.phone}</p>;}
			let aDur = '';if(agency.duration){aDur = <p><FormattedMessage id='duration' defaultMessage='Duration'/>: {helpers.MinToHours(agency.duration,'minutes')}</p>;}
			let aFreq = '';if(agency.operatingDays){aFreq = <p><FormattedMessage id='frequency' defaultMessage='Frequency'/>: {helpers.decodeDays(agency.operatingDays)}</p>;}
			let aLines = '';if(agency.lineNames){aLines = <p><FormattedMessage id='lines' values={{num:agency.lineNames.length}} defaultMessage='Line(s)'/>: {agency.lineNames.join(', ')}</p>;}
			let aLinks = '';if(agency.links){aLinks = <p>{agency.links[0].text} <a href={agency.links[0].url} target='_blank'>{agency.links[0].displayUrl}</a></p>;}
			return(
				<div key={i}>
					<Well>
						{aLink}
						{aPhone}
						{aDur}
						{aFreq}
						{aLines}
						{aLinks}
					</Well>
				</div>
			);
		});
	}


	render() {

		if(_.isUndefined(this.props.trip[this.props.params.id].infos.routes)) {														
			return <div></div>;
		}

		return (
		<div>
			<Link to={'/route/'+this.props.params.id} className="btn btn-primary"><Glyphicon glyph='menu-left' /><FormattedMessage id='goBack' defaultMessage="Back"/></Link>
			{this.agencyDetails()}
		</div>
		);
	}

}

function mapStateToProps(state) {
	return {
		trip : state.trip
	};
}


export default connect(mapStateToProps, actions)(AgenciesList);