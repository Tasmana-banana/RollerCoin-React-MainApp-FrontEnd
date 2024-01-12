import React from "react";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/RatingStars.scss";
import minerStarImg from "../../assets/img/storage/level_star.png";

const MinerRatingStar = ({ className, itemSize }) => (
	<div className={`rating-star-wrapper ${itemSize ? `${className}-${itemSize}` : className}`}>
		<div className={`star-wrapper`}>
			<img className="star" src={minerStarImg} alt="Rating star" />
		</div>
	</div>
);

MinerRatingStar.propTypes = {
	className: PropTypes.string,
	itemSize: PropTypes.number,
};

export default MinerRatingStar;
