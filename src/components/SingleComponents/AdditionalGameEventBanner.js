import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/SingleComponents/AdditionalGameEventBanner.scss";

const AdditionalGameEventBanner = () => {
	const language = useSelector((state) => state.game.language);
	return (
		<div className="additional-event-banner-container">
			<div className="button-wrapper">
				<Link to={`${getLanguagePrefix(language)}/brazil-independence-day-event`} className="tree-dimensional-button btn-gold w-100">
					<span className="btn-text">Celebrar</span>
				</Link>
			</div>
		</div>
	);
};

export default AdditionalGameEventBanner;
