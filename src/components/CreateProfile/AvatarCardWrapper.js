import React from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";

import "../../assets/scss/CreateProfile/AvatarCardWrapper.scss";

const AvatarCardWrapper = ({ title, children }) => (
	<div className="avatar-card-wrapper">
		<h2 className="page-title mt-5 mb-3">{title}</h2>
		<div className="card-wrapper">
			<Row>{children}</Row>
		</div>
	</div>
);

AvatarCardWrapper.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export default AvatarCardWrapper;
