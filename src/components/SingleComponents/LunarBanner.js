import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/SingleComponents/LunarBanner.scss";

const LunarBanner = () => {
	const language = useSelector((state) => state.game.language);
	return (
		<div className="lunar-banner-container">
			<div className="button-wrapper">
				<Link to={`${getLanguagePrefix(language)}/game/market/lootboxes`} className="tree-dimensional-button btn-gold w-100">
					<span className="btn-text">Grab the paddle</span>
				</Link>
			</div>
		</div>
	);
};

export default LunarBanner;
