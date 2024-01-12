import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/SingleComponents/OfferwallBanner.scss";
import offerwallImg from "../../assets/img/offerwall/offerwall_banner.gif";

const mapStateToProps = (state) => ({
	language: state.game.language,
});

const OfferwallBanner = ({ language }) => (
	<div className="offerwall-banner-container">
		<h3 className="banner-title">Task wall</h3>
		<p className="banner-description">Get rewarded instantly</p>
		<LazyLoad offset={100}>
			<img className="banner-img" src={offerwallImg} width="300" height="180" alt="offerwall" />
		</LazyLoad>
		<div className="button-wrapper">
			<Link to={`${getLanguagePrefix(language)}/taskwall`} className="tree-dimensional-button btn-gold w-100">
				<span className="btn-text">Get FREE RLT now!</span>
			</Link>
		</div>
	</div>
);

OfferwallBanner.propTypes = {
	language: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, null)(OfferwallBanner);
