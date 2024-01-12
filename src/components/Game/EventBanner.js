import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Game/EventBanner.scss";

import banner from "../../assets/img/eventBanners/moto_gang_club.png";

const EventBanner = () => {
	const language = useSelector((state) => state.game.language);
	return (
		<div className="static-event-banner-container">
			<Link to={`${getLanguagePrefix(language)}/game/market/crafting-offer`}>
				<LazyLoadImage width={390} height={114} src={banner} alt="roller-event" threshold={100} className="banner-image" />
			</Link>
		</div>
	);
};

export default EventBanner;
