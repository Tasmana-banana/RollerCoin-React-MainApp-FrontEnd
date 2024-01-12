/* eslint-disable no-nested-ternary */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import LazyLoad from "react-lazyload";
import Chart from "./Chart";
import getPrefixPower from "../../services/getPrefixPower";
import { getDataChangePower, getRandName } from "./helpers";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import onErrorLoadAvatar from "../../services/onErrorLoadAvatar";
import calcAge from "../../services/calcAge";

import cupGray from "../../assets/img/rank/cup_gray.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	uid: state.user.uid,
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
});

const RankTable = ({ start, leaderBoardUsers, history, language, uid, avatarVersion, t }) => {
	const workArray = !start ? leaderBoardUsers.slice(3, leaderBoardUsers.length) : leaderBoardUsers;
	const startIndex = !start ? 4 : 1;
	const goToProfile = (userLink) => {
		if (userLink) {
			history.push(`${getLanguagePrefix(language)}/p/${userLink}`);
		}
	};
	return (
		!!leaderBoardUsers.length && (
			<div className="table-responsive">
				<table className="table mgb-0">
					<thead className="users-table-header">
						<tr>
							<th>{t("place")}</th>
							<th>{t("player")}</th>
							<th>{t("currentPower")}</th>
							<th>{t("changePerDay")}</th>
							<th>{t("timeInGame")}</th>
							<th>{t("weeklyChart")}</th>
							<th>{t("rewards")}</th>
						</tr>
					</thead>
					<tbody className="users-table-body">
						{workArray.map((user, i) => {
							const userHistory = getDataChangePower(user.power_history, user.power);
							const changePower = getPrefixPower(userHistory);
							const powerInfo = getPrefixPower(user.power);
							return (
								<tr
									className={`${uid === user.userid ? "currentUser" : ""} cursor-pointer row-for-user-${i + startIndex + start}`}
									key={i}
									onClick={() => goToProfile(user.public_profile_link)}
								>
									<td>
										<div className="place-td">
											<div className="user-position">
												<p>{i + startIndex + start}</p>
											</div>
											<div className="change-position">
												{user.rank_change > 0 && <span className="arrow arrow-small arrow-success" />}
												<span className="text-change-position">{Math.abs(user.rank_change)}</span>
												{user.rank_change < 0 && <span className="arrow arrow-small arrow-danger" />}
											</div>
										</div>
									</td>
									<td>
										<div className="user-info-table">
											<div className="user-img-container user-rank-img">
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
											<p className="user-name-text">{user.fullname || getRandName()}</p>
										</div>
									</td>
									<td>
										<p className="text-power">{`${powerInfo.power} ${powerInfo.hashDetail}`}</p>
									</td>
									<td>
										<p className="change-power">
											<span className="table-rank-container-percent">
												{user.power_change_percent > 0 && <span className="arrow arrow-big arrow-success" />}
												{user.power_change_percent < 0 && <span className="arrow arrow-big arrow-danger" />}
												<span className={`text-change-power-percent ${user.power_change_percent > 0 ? "success-text" : user.power_change_percent < 0 ? "danger-text" : ""}`}>
													{user.power_change_percent} %
												</span>
											</span>
											<span className="text-change-power">
												{userHistory >= 0 ? "+" : ""}
												{`${changePower.power} ${changePower.hashDetail}`}
											</span>
										</p>
									</td>
									<td>
										<p className="time-in-game">{calcAge(user.register_since_time)}</p>
									</td>
									<td>
										<div className="chart-container chart-container-table-rank">
											<Chart data={user.power_history} />
										</div>
									</td>
									<td>
										<p className="rewards-table">
											<img src={cupGray} alt="cup_gray" /> x 0
										</p>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		)
	);
};
RankTable.propTypes = {
	start: PropTypes.number.isRequired,
	uid: PropTypes.string.isRequired,
	leaderBoardUsers: PropTypes.array.isRequired,
	history: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
export default withTranslation("Rank")(withRouter(connect(mapStateToProps, null)(RankTable)));
