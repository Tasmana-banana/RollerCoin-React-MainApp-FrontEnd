import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/SingleComponents/MiniEventBanner.scss";

const MiniEventBanner = () => {
	const language = useSelector((state) => state.game.language);
	return (
		<div className="mini-event-banner-container">
			<div className="button-wrapper">
				<Link to={`${getLanguagePrefix(language)}/game/market/lootboxes`} className="tree-dimensional-button btn-gold w-100">
					<span className="btn-text">TO CONSTRUCTION SITE</span>
				</Link>
			</div>
		</div>
	);
};

export default MiniEventBanner;
