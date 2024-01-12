import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import SimpleBar from "simplebar-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import LazyLoad from "react-lazyload";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import onErrorLoadAvatar from "../../../services/onErrorLoadAvatar";
import decimalAdjust from "../../../services/decimalAdjust";
import leaderboardDefaultDataConstructor from "../../../services/leaderboardDefaultDataConstructor";
import numberToString from "../../../services/numberToString";
import addSpaceToNumber from "../../../services/addSpaceToNumber";

import "simplebar-react/dist/simplebar.min.css";
import defaultUserAvatar from "../../../assets/img/offerwall/leaderboard/default_user.svg";

const RankTable = ({ leaderBoardUsers, history, language, currencyConfig, poolReward }) => {
	const uid = useSelector((state) => state.user.uid);
	const { t } = useTranslation("Offerwall");
	const avatarVersion = useSelector((state) => state.user.avatarVersion);
	const [workArray, setWorkArray] = useState([]);

	useEffect(() => {
		if (leaderBoardUsers.items.length < 4) {
			const workArrayWithDefaultUser = [...leaderBoardUsers.items];
			for (let i = 0; i < 7; i++) {
				leaderboardDefaultDataConstructor({ workArrayWithDefaultUser, poolReward, type: "rankTable", index: i + 4 });
			}
			setWorkArray(workArrayWithDefaultUser.slice(3, leaderBoardUsers.items.length));
		} else {
			setWorkArray(leaderBoardUsers.items.slice(3, leaderBoardUsers.items.length));
		}
	}, [leaderBoardUsers.items]);
	const goToProfile = (userLink) => {
		if (userLink) {
			history.push(`${getLanguagePrefix(language)}/p/${userLink}`);
		}
	};

	return (
		!!workArray.length && (
			<Fragment>
				<div className="rank-table-header">
					<div className="users-position">{t("leaderboardCompetition.place")}</div>
					<div className="users-info">{t("leaderboardCompetition.player")}</div>
					<div className="users-tasks">{t("leaderboardCompetition.offers")}</div>
					<div className="users-points">{t("leaderboardCompetition.points")}</div>
					<div className="users-prize">{t("leaderboardCompetition.prize")}</div>
				</div>
				<SimpleBar className="rank-simplebar" style={{ maxHeight: 610 }} autoHide={false}>
					<div className="rank-table with-scroll">
						{workArray.map((user, i) => (
							<div key={i} className={`rank-item cursor-pointer ${uid === user.user_id ? "currentUser" : ""}`} onClick={() => goToProfile(user.public_profile_link)}>
								<div className="td-block user-position-block">
									<span className="user-position">{user.position}</span>
								</div>

								<div className="td-block user-info-block">
									<div className="user-img-container user-rank-img">
										<div className={user.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
											<img
												src={user.user_id ? `${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/120/${user.user_id}.png?v=${avatarVersion}` : defaultUserAvatar}
												alt="ico"
												width="48"
												height="48"
												className="avatar-icon"
												onError={onErrorLoadAvatar}
											/>
										</div>
									</div>
									<p className="user-name-text">{user.full_name}</p>
								</div>
								<div className="td-block contest-tasks-block">
									<p className="text-tasks">{user.count_completed_tasks ? `x${user.count_completed_tasks}` : ""}</p>
								</div>
								<div className="td-block contest-points-block">
									<p className="text-points">{user.count_points ? numberToString(user.count_points) : ""}</p>
								</div>
								<div className="td-block prize-block">
									<div className="prize-icon-block">
										<img className="prize-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={24} height={24} alt="Currency icon" />
									</div>
									<div className="prize-text">
										<span>{user?.reward?.amount ? addSpaceToNumber(decimalAdjust(user.reward.amount / currencyConfig.toSmall, currencyConfig.precision)) : 0}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</SimpleBar>

				{!!leaderBoardUsers.currentUser.position && (
					<div className="rank-table current-user">
						<div className="rank-item currentUser">
							<div className="td-block user-position-block">
								<span className="user-position">{leaderBoardUsers.currentUser.position}</span>
							</div>

							<div className="td-block user-info-block">
								<div className="user-img-container user-rank-img">
									<div className={leaderBoardUsers.currentUser.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
										<LazyLoad offset={100}>
											<img
												src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/48/${leaderBoardUsers.currentUser.user_id}.png?v=1.1.1`}
												alt="ico"
												width="48"
												height="48"
												className="avatar-icon"
												onError={onErrorLoadAvatar}
											/>
										</LazyLoad>
									</div>
								</div>
								<p className="user-name-text">{leaderBoardUsers.currentUser.full_name}</p>
							</div>
							<div className="td-block contest-tasks-block">
								<p className="text-tasks">x{leaderBoardUsers.currentUser.count_completed_tasks}</p>
							</div>
							<div className="td-block contest-points-block">
								<p className="text-points">{leaderBoardUsers.currentUser.count_points ? numberToString(leaderBoardUsers.currentUser.count_points) : ""}</p>
							</div>
							<div className="td-block prize-block">
								<div className="prize-icon-block">
									<img className="prize-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={24} height={24} alt="Currency icon" />
								</div>
								<div className="prize-text">
									<span>{addSpaceToNumber(decimalAdjust(leaderBoardUsers.currentUser.reward.amount / currencyConfig.toSmall, currencyConfig.precision))}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</Fragment>
		)
	);
};

RankTable.propTypes = {
	leaderBoardUsers: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	currencyConfig: PropTypes.object.isRequired,
	poolReward: PropTypes.object.isRequired,
};
export default RankTable;
