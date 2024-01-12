import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import EventTimer from "../../SingleComponents/EventTimer";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

const PersonalLinkBanner = ({ banner }) => {
	const userLink = useSelector((state) => state.user.publicProfileLink);
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);

	return (
		<div className="banner-card">
			{banner.is_timer && (
				<div className="banner-timer-block">
					<EventTimer toDate={banner.end_date} minWidth={232} timerText="ENDS" />
				</div>
			)}
			<a href={`${getLanguagePrefix(language)}/p/${userLink}${banner.url}`}>
				<img
					src={
						isMobile
							? `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.mobile}`
							: `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.desktop}`
					}
					width={299}
					height={119}
					alt="banner img"
					className="w-100 main-banner-card-img"
				/>
			</a>
		</div>
	);
};

PersonalLinkBanner.propTypes = {
	banner: PropTypes.object.isRequired,
};

export default PersonalLinkBanner;
