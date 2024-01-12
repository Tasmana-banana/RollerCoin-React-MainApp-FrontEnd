import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BANNER_TYPES } from "../../../constants/Game/bannerTypes";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import fetchWithToken from "../../../services/fetchWithToken";
import ProgressionEvent from "../../ProgressionEvent/ProgressionEvent";
import EventTimer from "../../SingleComponents/EventTimer";
import SeasonStatsBanner from "../../SingleComponents/SeasonStatsBanner";
import PersonalLinkBanner from "./PersonalLinkBanner";

const bannerWithLink = [BANNER_TYPES.CUSTOM, BANNER_TYPES.LANDING_SALE];

const getSize = (cells) => ({
	xs: 9,
	lg: cells === 2 ? 6 : 4,
	xl: cells === 2 ? 6 : 3,
});

const MainBannerCard = ({ banner, wsReact }) => {
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const [statsBannerData, setStatsBannerData] = useState({
		reward: null,
		season: null,
		userStats: null,
		isLoading: true,
		userSeasonPassLevel: 1,
		isMaxXp: false,
	});
	const controllers = {};
	const signals = {};

	useEffect(async () => {
		if (banner.type === BANNER_TYPES.SEASON) {
			await getStatsBannerData();
		}
	}, [banner.type]);

	useEffect(() => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getStatsBannerData = async () => {
		createSignalAndController("getStatsBannerData");
		try {
			const json = await fetchWithToken("/api/season/event-user-stats?info=banner", {
				method: "GET",
				signal: signals.getStatsBannerData,
			});
			if (!json.success || !json.data.season || !json.data.rewards || !json.data.rewards.length || !json.data.user_stats) {
				return setStatsBannerData({
					statsBannerData: {
						...statsBannerData,
						isLoading: false,
					},
				});
			}
			setStatsBannerData({
				season: json.data.season,
				rewards: json.data.rewards,
				userStats: json.data.user_stats,
				isLoading: false,
				userSeasonPassLevel: json.data.user_season_pass_level,
				isMaxXp: json.data.is_max_xp,
			});
		} catch (e) {
			console.error(e);
		}
	};

	const cardComponentConstructor = () => {
		if (banner.url && banner.url.includes("rollercoin.com")) {
			return (
				<a href={`${banner.url}`} target="_blank" rel="noreferrer">
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
			);
		}
		if (banner.url && !banner.url.includes("rollercoin.com")) {
			return (
				<Link to={`${getLanguagePrefix(language)}${banner.url}`}>
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
				</Link>
			);
		}
		if (!banner?.url) {
			return (
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
			);
		}
	};

	const isBannerWithLink = bannerWithLink.includes(banner.type);
	return (
		<Fragment>
			<Col xs={getSize(banner.cells).xs} lg={getSize(banner.cells).lg} xl={getSize(banner.cells).xl}>
				{banner.type === BANNER_TYPES.SEASON && <SeasonStatsBanner statsBannerData={statsBannerData} banner={banner} />}
				{banner.type === BANNER_TYPES.PROGRESSION_EVENT && <ProgressionEvent wsReact={wsReact} isBannerLine={true} banner={banner} />}
				{banner.type === BANNER_TYPES.PERSONAL_LINK && <PersonalLinkBanner banner={banner} />}
				{isBannerWithLink && (
					<div className="banner-card">
						{banner.is_timer && (
							<div className="banner-timer-block">
								<EventTimer toDate={banner.end_date} minWidth={232} timerText="ENDS" />
							</div>
						)}
						{cardComponentConstructor()}
					</div>
				)}
			</Col>
		</Fragment>
	);
};

MainBannerCard.propTypes = {
	banner: PropTypes.object.isRequired,
	wsReact: PropTypes.object.isRequired,
};

export default MainBannerCard;
