import React, { Fragment, useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import onErrorLoadAvatar from "../../../services/onErrorLoadAvatar";
import decimalAdjust from "../../../services/decimalAdjust";
import leaderboardDefaultDataConstructor from "../../../services/leaderboardDefaultDataConstructor";
import numberToString from "../../../services/numberToString";
import addSpaceToNumber from "../../../services/addSpaceToNumber";

import leaderboardStand from "../../../assets/img/offerwall/leaderboard/leaderboard_stand.png";
import defaultUserAvatar from "../../../assets/img/offerwall/leaderboard/default_user.svg";

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
const TopList = ({ leaderBoardUsers, history, currencyConfig, poolReward }) => {
	const avatarVersion = useSelector((state) => state.user.avatarVersion);
	const uid = useSelector((state) => state.user.uid);
	const language = useSelector((state) => state.game.language);
	const [workArray, setWorkArray] = useState([]);

	useEffect(() => {
		if (leaderBoardUsers.length < 3) {
			const workArrayWithDefaultUser = leaderBoardUsers;
			for (let i = 0; (i = 3 - leaderBoardUsers.length); i++) {
				leaderboardDefaultDataConstructor({ workArrayWithDefaultUser, poolReward, type: "topList", index: i });
			}
			setWorkArray(workArrayWithDefaultUser);
		} else {
			setWorkArray(leaderBoardUsers.slice(0, 3));
		}
	}, [leaderBoardUsers]);
	const goToProfile = (userLink) => {
		if (userLink) {
			history.push(`${getLanguagePrefix(language)}/p/${userLink}`);
		}
	};
	return (
		<div className="first-three-positions mgb-16">
			<Row noGutters={true} className="align-items-end no-gutters">
				{workArray.map((user, i) => {
					return (
						<Fragment key={i}>
							<Col xs="4" className={`user-col order-${topOptions[i].order}`}>
								<div
									className={`top-users-block ${user.public_profile_link ? "cursor-pointer" : ""}`}
									onClick={() => (user.public_profile_link ? goToProfile(user.public_profile_link) : "")}
								>
									<div className={`user-container ${uid === user.user_id ? "currentUser" : ""} ${!user.user_id ? "default-user" : ""}`}>
										<div className={`user-img-container user-img-top container-border-${topOptions[i].classPrefix}`}>
											<div className={`${user.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"} ${!user.user_id ? "default-user" : ""}`}>
												<div>
													<img
														src={
															user.user_id ? `${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/120/${user.user_id}.png?v=${avatarVersion}` : defaultUserAvatar
														}
														alt="ico"
														className="avatar-icon"
														width={48}
														height={48}
														onError={onErrorLoadAvatar}
													/>
												</div>
											</div>
											<div className={`reward-top-user ${!user.user_id ? "default-user" : ""}`}>
												<div>
													<LazyLoadImage src={`/static/img/offerwall/leaderboard/crown_${topOptions[i].classPrefix}.png`} width={100} height={80} alt={`crown${i + 1}`} />
												</div>
											</div>
										</div>

										<p className="user-name">{user.full_name}</p>

										<div className="contest-block">
											{!!user.count_completed_tasks && (
												<div className="contest-tasks-block">
													<span className="contest-tasks-count">x{user.count_completed_tasks}</span>
												</div>
											)}
											{!!user.count_points && (
												<div className="contest-points-block">
													<span className="contest-points-count">{numberToString(user.count_points)}</span>
												</div>
											)}
											<div className={`contest-reward-block ${user.count_completed_tasks ? "" : "default-reward-block"}`}>
												<img className="contest-reward-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={16} height={16} alt="Currency icon" />
												<span className="contest-reward-count">
													{user?.reward?.amount ? addSpaceToNumber(decimalAdjust(user.reward.amount / currencyConfig.toSmall, currencyConfig.precision)) : 0}
												</span>
											</div>
										</div>
									</div>
								</div>
							</Col>
						</Fragment>
					);
				})}
			</Row>
			<div className="leadearboard-stand-block">
				<img src={leaderboardStand} alt="Leaderboard stand" width={830} height={150} />
			</div>
		</div>
	);
};

TopList.propTypes = {
	leaderBoardUsers: PropTypes.array.isRequired,
	history: PropTypes.object.isRequired,
	currencyConfig: PropTypes.object.isRequired,
	poolReward: PropTypes.array.isRequired,
};
export default TopList;
