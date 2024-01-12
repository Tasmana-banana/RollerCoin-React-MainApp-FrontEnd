import React from "react";
import PropTypes from "prop-types";
import { Redirect, Route } from "react-router-dom";
import { connect } from "react-redux";
import getLanguagePrefix from "../services/getLanguagePrefix";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	language: state.game.language,
});

const PrivateRoute = ({ children, isAuthorizedSocket, isAuthorizedNode, language, ...rest }) => {
	const isFullAuth = isAuthorizedSocket && isAuthorizedNode;
	const isNotCompletedUser = isAuthorizedSocket && !isAuthorizedNode;
	return <Route {...rest} render={() => (isFullAuth ? children : (window.location.href = `${getLanguagePrefix(language)}/${isNotCompletedUser ? "game/choose_game" : "sign-in"}`))} />;
};

PrivateRoute.propTypes = {
	children: PropTypes.string.isRequired,
	rest: PropTypes.object.isRequired,
	isAuthorizedSocket: PropTypes.bool.isRequired,
	isAuthorizedNode: PropTypes.bool.isRequired,
	language: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, null)(PrivateRoute);
