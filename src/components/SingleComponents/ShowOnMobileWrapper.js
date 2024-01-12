import React, { Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
});

const ShowOnMobileWrapper = ({ children, isMobile }) => isMobile && <Fragment>{children}</Fragment>;

ShowOnMobileWrapper.propTypes = {
	isMobile: PropTypes.bool.isRequired,
	showOnMobile: PropTypes.bool,
	showOnDesktop: PropTypes.bool,
	children: PropTypes.node.isRequired,
	additionalClass: PropTypes.string,
};
export default connect(mapStateToProps, null)(ShowOnMobileWrapper);
