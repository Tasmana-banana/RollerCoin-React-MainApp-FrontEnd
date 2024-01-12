import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Game/EventBanner.scss";

import banner from "../../assets/img/eventBanners/сryptogroove_claw.png";

const RightEventBanner = () => {
	const language = useSelector((state) => state.game.language);

	return (
		<div className="static-event-banner-container with-bottom-margin">
			<Link to={`${getLanguagePrefix(language)}/game/market/lootboxes`}>
				<LazyLoadImage width={390} height={114} src={banner} alt="banner" threshold={100} className="banner-image" />
			</Link>
		</div>
	);
};

export default RightEventBanner;
