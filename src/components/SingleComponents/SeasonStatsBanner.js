import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Progress, Row, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import RollerButton from "./RollerButton";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import { history } from "../../reducers";

import "../../assets/scss/SingleComponents/SeasonStatsBanner.scss";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import arrowIcon from "../../assets/img/icon/arrow_right_doge.svg";
import lockIcon from "../../assets/img/seasonPass/icon/yellow_lock.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

const getImgUrl = (reward) => {
	const typeImgConfig = {
		power: "/static/img/seasonPass/reward_power.png?v=1.0.3",
		money_RLT: "/static/img/seasonPass/reward_money.png?v=1.0.3",
		money_RST: "/static/img/seasonPass/reward_RST.png?v=1.0.4",
		miner: `${process.env.STATIC_URL}/static/img/market/miners/${reward.product.filename}.gif?v=1.0.0`,
		rack: `${process.env.STATIC_URL}/static/img/market/racks/${reward.product._id}.png?v=1.0.3`,
		trophy: `${process.env.STATIC_URL}/static/img/game/room/trophies/${reward.product.file_name}.png?v=1.0.3`,
		mutation_component: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${reward.product._id}.png?v=1.0.3`,
		hat: `${process.env.STATIC_URL}/static/img/market/hats/${reward.product._id}.png?v=1.0.3`,
		battery: `${process.env.STATIC_URL}/static/img/market/batteries/${reward.product._id}.png?v=1.0.3`,
		appearance: `${process.env.STATIC_URL}/static/img/market/appearances/${reward.product._id}.png?v=1.0.2`,
	};
	return typeImgConfig[reward.type];
};

class SeasonStatsBanner extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		statsBannerData: PropTypes.object.isRequired,
		banner: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			rewards: null,
			season: null,
			userStats: null,
			isViewBtnPulse: false,
			timeLeftSeconds: 0,
			isLoading: true,
		};
		this.MS_TO_DAYS = 86400000;
	}

	parseData = () => {
		const { rewards, season, userStats } = this.props.statsBannerData;

		const normalizeRewards = rewards.map((reward) => {
			if (reward.type === "power") {
				reward.ttl_time = Math.round(reward.ttl_time / this.MS_TO_DAYS);
				reward.amount = threeDigitDivisor(reward.amount);
			}
			if (reward.type === "money") {
				const currencyConfig = getCurrencyConfig("RLT");
				reward.amount = decimalAdjust(reward.amount / currencyConfig.toSmall, currencyConfig.precision);
			}
			if (reward.type === "miner") {
				reward.product.power = threeDigitDivisor(reward.product.power);
			}
			if (reward.type === "money") {
				reward.type = `${reward.type}_${reward.currency}`;
			}
			const newTitle = { en: reward.title.en, cn: reward.title.cn };
			const newDescription = { en: reward.description.en, cn: reward.description.cn };
			Object.keys(reward.additional_data).forEach((key) => {
				const insertText = reward.additional_data[key].split(".").reduce((acc, val) => acc[val], reward);
				newTitle.en = newTitle.en.replace(key, insertText);
				newTitle.cn = newTitle.cn.replace(key, insertText);
				newDescription.en = newDescription.en.replace(key, insertText);
				newDescription.cn = newDescription.cn.replace(key, insertText);
			});
			return { ...reward, title: newTitle, description: newDescription };
		});

		this.setState({
			rewards: normalizeRewards.sort((a, b) => b.pass_level - a.pass_level),
			season,
			userStats,
			isLoading: false,
		});
	};

	toggleViewBtnPulse = () => {
		let isAfterDay = true;
		const seasonViewDate = localStorage.getItem("season_view_date");
		if (seasonViewDate) {
			isAfterDay = !!dayjs(seasonViewDate).diff(dayjs(), "day");
		}
		if (isAfterDay) {
			this.setState({
				isViewBtnPulse: true,
			});
			localStorage.setItem("season_view_date", dayjs().toString());
		}
	};

	componentDidMount() {
		this.toggleViewBtnPulse();
	}

	componentDidUpdate(prevProps) {
		const { statsBannerData } = this.props;
		if (!statsBannerData.isLoading && prevProps.statsBannerData.isLoading !== statsBannerData.isLoading) {
			if (statsBannerData.userStats) {
				return this.parseData();
			}
			this.setState({
				isLoading: false,
			});
		}
	}

	render() {
		const { language, t, isMobile, statsBannerData, banner } = this.props;
		const { rewards, season, userStats, isLoading, isViewBtnPulse } = this.state;
		const isGoldPass = statsBannerData.userSeasonPassLevel === 2;
		return (
			<Fragment>
				{!isLoading && rewards && !!rewards.length && (
					<div className="season-banner-container banner-card" onClick={() => history.push(`${getLanguagePrefix(language)}/game/market/season-pass`)}>
						<div className="user-stats-wrapper">
							<div className={`user-stats-progress-block`}>
								<div className="d-flex justify-content-between">
									<p className="user-level">
										{season.title[language]}:{" "}
										<span className="user-level-text">
											{t("level")} {userStats.user_level}
										</span>
									</p>
									<p className="user-xp">
										XP: {userStats.xp} / {season.level_step}
									</p>
								</div>
								<div className="user-stats-progress-bar">
									<Progress value={(userStats.xp / season.level_step) * 100} className="user-progress-bar" />
								</div>
							</div>
							<div className={`user-stats-btn-block ${isViewBtnPulse ? "pulsated" : ""}`}>
								<RollerButton className="user-stats-btn" icon={arrowIcon} color="cyan" size="smallest" />
							</div>
						</div>
						<div className="season-banner-reward-wrapper">
							<Row className="season-banner-reward-row">
								{!!rewards.length &&
									rewards.map((reward) => {
										const isGoldReward = reward.pass_level === 2;
										return (
											<Col key={reward.id} className="season-banner-reward">
												<div className={`season-banner-card ${isGoldReward ? "gold" : ""}`}>
													{!isGoldPass && isGoldReward && (
														<div className="sticker-block lock">
															<img src={lockIcon} alt="Lock icon" />
														</div>
													)}
													<div className="reward-img-block">
														<img className="reward-img" src={getImgUrl(reward)} alt={reward.id} />
													</div>
												</div>
											</Col>
										);
									})}
							</Row>
						</div>
					</div>
				)}
				{!isLoading && !rewards && (
					<div className="banner-card">
						<Link to={`${getLanguagePrefix(language)}${banner.url}`}>
							<img
								width={299}
								height={119}
								src={
									isMobile
										? `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.mobile}`
										: `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.desktop}`
								}
								alt="default"
								className="w-100 main-banner-card-img default-left-banner"
							/>
						</Link>
					</div>
				)}
				{!isLoading && statsBannerData.isMaxXp && !isMobile && rewards && !!rewards.length && !isGoldPass && (
					<div
						className="season-empty-banner-container banner-card"
						style={{ background: `url("${process.env.STATIC_URL}/static/img/seasons/${statsBannerData.season.id}/stats_banner_placeholder.gif") center center / cover no-repeat` }}
						onClick={() => history.push(`${getLanguagePrefix(language)}/game/market/season-pass`)}
					>
						<h3 className="season-empty-banner-title">TO CLAIM MORE REWARDS</h3>
						<RollerButton className="season-empty-btn" color="gold" text="Activate GOLD pass" />
					</div>
				)}
				{isLoading && !isMobile && (
					<div className="season-banner-preloader">
						<img src={loaderImg} height={63} width={63} alt="Loading..." />
					</div>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("Banner")(connect(mapStateToProps, null)(SeasonStatsBanner));
