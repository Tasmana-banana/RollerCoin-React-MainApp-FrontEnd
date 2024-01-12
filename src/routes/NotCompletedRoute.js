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

const NotCompletedRoute = ({ children, isAuthorizedSocket, isAuthorizedNode, language, ...rest }) => {
	return (
		<Route
			{...rest}
			render={() =>
				isAuthorizedSocket && !isAuthorizedNode ? (
					children
				) : (
					<Redirect
						to={{
							pathname: `${getLanguagePrefix(language)}/${isAuthorizedSocket && isAuthorizedNode ? "" : "sign-in"}`,
						}}
					/>
				)
			}
		/>
	);
};

NotCompletedRoute.propTypes = {
	children: PropTypes.string.isRequired,
	rest: PropTypes.object.isRequired,
	isAuthorizedSocket: PropTypes.bool.isRequired,
	isAuthorizedNode: PropTypes.bool.isRequired,
	language: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, null)(NotCompletedRoute);
