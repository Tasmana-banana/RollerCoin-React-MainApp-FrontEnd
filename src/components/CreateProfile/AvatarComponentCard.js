import React from "react";
import { Col } from "reactstrap";
import PropTypes from "prop-types";

const AvatarComponentCard = ({ type, code, gender, updateAvatarConfig, isSelected }) => (
	<Col xs="4">
		<div className={`img-for-select ${isSelected ? "selected-item" : ""}`} onClick={() => updateAvatarConfig({ [type]: code })}>
			<img src={`${process.env.AVATARS_STATIC_URL}/static/images/components/${gender}/${type}/${code}.png`} alt={`${type}/${code}`} />
		</div>
	</Col>
);

AvatarComponentCard.propTypes = {
	type: PropTypes.string.isRequired,
	code: PropTypes.number.isRequired,
	gender: PropTypes.string.isRequired,
	isSelected: PropTypes.bool,
	updateAvatarConfig: PropTypes.func.isRequired,
};

export default AvatarComponentCard;
