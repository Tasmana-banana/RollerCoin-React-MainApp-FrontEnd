import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ComponentCard = ({ gender, type, code, isSelected, updateAvatarConfig }) => {
	const onClickHandler = () => updateAvatarConfig({ [type]: code });
	return (
		<Col xs="4" lg="2">
			<div className={`img-for-select ${isSelected ? "selected-item" : ""}`} onClick={onClickHandler}>
				<LazyLoadImage
					wrapperClassName="d-block w-auto"
					width={82}
					height={82}
					src={`${process.env.AVATARS_STATIC_URL}/static/images/components/${gender}/${type}/${code}.png`}
					alt={`${type}/${code}`}
					threshold={100}
					className="component-img"
				/>
			</div>
		</Col>
	);
};

ComponentCard.propTypes = {
	gender: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	code: PropTypes.number.isRequired,
	isSelected: PropTypes.bool.isRequired,
	updateAvatarConfig: PropTypes.func.isRequired,
};

export default ComponentCard;
