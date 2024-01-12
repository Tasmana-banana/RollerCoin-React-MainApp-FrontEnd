import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import PropTypes from "prop-types";

import "../../assets/scss/Profile/ProfileCard.scss";

const ProfileCard = ({ title, titleIcon, className, children }) => (
	<Card className={`profile-card-wrapper ${className}`}>
		<CardHeader>
			<div className="d-flex align-items-center">
				<div className="header-image-wrapper">
					<img className="header-image" height={16} width={16} src={titleIcon} alt="Card icon" />
				</div>
				<p className="header-text">{title}</p>
			</div>
		</CardHeader>
		<CardBody>{children}</CardBody>
	</Card>
);

ProfileCard.propTypes = {
	title: PropTypes.string.isRequired,
	titleIcon: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

ProfileCard.defaultProps = {
	className: "",
};

export default ProfileCard;
