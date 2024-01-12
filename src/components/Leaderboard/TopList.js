/* eslint-disable no-nested-ternary */
import React from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import Chart from "./Chart";
import getPrefixPower from "../../services/getPrefixPower";
import { getDataChangePower, getRandName } from "./helpers";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import onErrorLoadAvatar from "../../services/onErrorLoadAvatar";

import cupGray from "../../assets/img/rank/cup_gray.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	avatarVersion: state.user.avatarVersion,
	uid: state.user.uid,
	language: state.game.language,
});

const topOptions = [
	{
		order: 2,
		classPrefix: "gold",
	},
	{
		order: 1,
		classPrefix: "silver",
	},
	{
		order: 3,
		classPrefix: "bronze",
	},
];
const TopList = ({ leaderBoardUsers, history, language, uid, avatarVersion, t }) => {
	const goToProfile = (userLink) => {
		if (userLink) {
			history.push(`${getLanguagePrefix(language)}/p/${userLink}`);
		}
	};
	return (
		<div className="first-three-positions mgb-16">
			<Row noGutters={true} className="align-items-end no-gutters">
				{leaderBoardUsers.slice(0, 3).map((user, i) => {
					const userPowerChange = getDataChangePower(user.power_history, user.power);
					const changePowerPrefix = getPrefixPower(userPowerChange);
					const powerInfo = getPrefixPower(user.power);
					return (
						<Col xs="12" lg="4" className={`${uid === user.userid ? "currentUser" : ""} top-position-block order-${topOptions[i].order} ${topOptions[i].classPrefix}-position`} key={i}>
							<div className="top-block light-gray-bg">
								<div className="header-top-users">
									<div className="reward-top-users-container">
										<LazyLoad offset={100}>
											<img src={`/static/img/rank/cup${i + 1}.svg`} alt={`cup${i + 1}`} />
										</LazyLoad>
									</div>
									<p className="position-top-users-text">Top {i + 1}</p>
									<p className="change-position">
										{user.rank_change > 0 && <span className="arrow arrow-small arrow-success" />}
										<span className="text-change-position">{Math.abs(user.rank_change)}</span>
										{user.rank_change < 0 && <span className="arrow arrow-small arrow-danger" />}
									</p>
									<div className="reward-small-container">
										<LazyLoad offset={100}>
											<img src={cupGray} alt="cup_gray" /> x 1
										</LazyLoad>
									</div>
								</div>
								<div className="body-top-users">
									<div className="user-info-top cursor-pointer" onClick={() => goToProfile(user.public_profile_link)}>
										<div className={`user-img-container user-img-top container-border-${topOptions[i].classPrefix}`}>
											<div className={user.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
												<LazyLoad offset={100}>
													<img
														src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/48/${user.userid}.png?v=${avatarVersion}`}
														alt="ico"
														width="48"
														height="48"
														className="avatar-icon"
														onError={onErrorLoadAvatar}
													/>
												</LazyLoad>
											</div>
										</div>
										<p className="user-name-text-top">{user.fullname || getRandName()}</p>
									</div>
									<div className="power-info-top">
										<div className="left-block">
											<p>{t("currentPower")}</p>
											<p className="text-power">{`${powerInfo.power} ${powerInfo.hashDetail}`}</p>
										</div>
										<div className="right-top">
											<p>{t("changePerDay")}</p>
											<p className="change-power">
												{userPowerChange > 0 && <span className="arrow arrow-big arrow-success" />}
												{userPowerChange < 0 && <span className="arrow arrow-big arrow-danger" />}
												<span className={`text-change-power-percent ${userPowerChange > 0 ? "success-text" : userPowerChange < 0 ? "danger-text" : ""}`}>
													{user.power_change_percent} %
												</span>
												<span className="text-change-power">
													{userPowerChange >= 0 ? "+" : ""}
													{`${changePowerPrefix.power} ${changePowerPrefix.hashDetail}`}
												</span>
											</p>
										</div>
									</div>
									<div className="chart-power-top">
										<p className="mgb-8">{t("weeklyChart")}</p>
										<div className="chart-container">
											<Chart data={user.power_history} />
										</div>
									</div>
								</div>
							</div>
							<div className="wrapper-top">
								<div />
								<div />
								<div />
								<div />
								<div />
							</div>
							<div className="bottom-block dark-gray-bg">
								<p className="mg-0">
									Top
									<br />
									<span className="position-number">{i + 1}</span>
								</p>
							</div>
						</Col>
					);
				})}
			</Row>
		</div>
	);
};

TopList.propTypes = {
	uid: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
	leaderBoardUsers: PropTypes.array.isRequired,
	history: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
export default withTranslation("Rank")(withRouter(connect(mapStateToProps, null)(TopList)));
