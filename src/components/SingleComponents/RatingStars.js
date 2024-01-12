import React from "react";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/RatingStars.scss";
import starImg from "../../assets/img/storage/star.svg";

const RatingStars = ({ level, className }) => (
	<div className="rating-star-wrapper">
		{Array(5)
			.fill(0)
			.map((_, index) => (
				<div key={index} className="star-wrapper">
					<img className={`star ${index >= level ? "extinct" : ""} ${className || ""}`} src={starImg} alt="Rating star" />
				</div>
			))}
	</div>
);

RatingStars.propTypes = {
	level: PropTypes.number.isRequired,
	className: PropTypes.string,
};

export default RatingStars;
