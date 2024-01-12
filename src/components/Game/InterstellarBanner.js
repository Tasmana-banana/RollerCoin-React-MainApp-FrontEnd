import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Game/EventBanner.scss";

import banner from "../../assets/img/eventBanners/interstellar_banner_new_v2.png";

const InterstellarBanner = () => {
	const language = useSelector((state) => state.game.language);

	return (
		<div className="static-event-banner-container with-bottom-margin">
			<Link to={`${getLanguagePrefix(language)}/game/market/crafting-offer`}>
				<LazyLoadImage width={390} height={114} src={banner} alt="avatar" threshold={100} className="banner-image" />
			</Link>
		</div>
	);
};

export default InterstellarBanner;
