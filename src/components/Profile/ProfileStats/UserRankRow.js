import React from "react";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRandName } from "../../Leaderboard/helpers";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import getPrefixPower from "../../../services/getPrefixPower";

const UserRankRow = ({ user, isCurrentUser, avatarVersion, onImageError }) => {
	const history = useHistory();
	const language = useSelector((state) => state.game.language);

	const changePower = getPrefixPower(user.power_change);
	const powerInfo = getPrefixPower(user.power);

	let powerChangeClassName = "";
	if (user.power_change_percent > 0) {
		powerChangeClassName = "success-text";
	} else if (user.power_change_percent < 0) {
		powerChangeClassName = "danger-text";
	}

	const goToProfile = () => {
		if (user.public_profile_link) {
			history.push(`${getLanguagePrefix(language)}/p/${user.public_profile_link}`);
		}
	};

	return (
		<Row noGutters={true} className={`user-stats-row-container ${isCurrentUser ? "current-user" : ""}`} onClick={goToProfile}>
			<Col xs={3} lg={2}>
				<div className="rank-position d-flex align-items-center justify-content-end h-100">
					<div className="rank-number m-auto">
						<p className="rank-number-text">{user.position}</p>
					</div>
					<div className="change-rank-position flex-column d-none d-lg-flex text-center">
						{user.rank_change > 0 && <span className="arrow arrow-small arrow-success m-auto" />}
						<span className="text-change-position">{Math.abs(user.rank_change)}</span>
						{user.rank_change < 0 && <span className="arrow arrow-small arrow-danger m-auto" />}
					</div>
				</div>
			</Col>
			<Col xs={6} lg={5}>
				<div className="rank-info separate-line d-flex align-items-center justify-content-start">
					<div className="user-img-container big mr-1">
						<div className={user.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
							<LazyLoad offset={100}>
								<img
									src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/48/${user.id}.png?v=${avatarVersion}`}
									alt="user-top"
									width="48"
									height="48"
									className="avatar-icon"
									onError={onImageError}
								/>
							</LazyLoad>
						</div>
					</div>
					<p className="user-name-text">{user.fullname || getRandName()}</p>
				</div>
			</Col>
			<Col xs={3} lg={2}>
				<div className="user-power separate-line h-100 d-flex justify-content-center align-items-center">
					<p className="text-power">{`${powerInfo.power} ${powerInfo.hashDetail}`}</p>
				</div>
			</Col>
			<Col xs={0} lg={3}>
				<div className="change-rank-power separate-line h-100 align-items-center justify-content-around d-none d-lg-flex">
					<div className="rank-percent d-flex h-100 flex- align-items-center">
						{user.power_change_percent > 0 && <span className="arrow arrow-big arrow-success" />}
						{user.power_change_percent < 0 && <span className="arrow arrow-big arrow-danger" />}
						<span className={`text-change-power-percent ${powerChangeClassName}`}>{Math.abs(user.power_change_percent)} %</span>
					</div>
					<div className="text-change-power h-100 d-flex align-items-center">
						{user.power_change >= 0 ? "+" : ""}
						{`${changePower.power} ${changePower.hashDetail}`}
					</div>
				</div>
			</Col>
		</Row>
	);
};

UserRankRow.propTypes = {
	user: PropTypes.object.isRequired,
	isCurrentUser: PropTypes.bool.isRequired,
	avatarVersion: PropTypes.string.isRequired,
	onImageError: PropTypes.func.isRequired,
};

export default UserRankRow;
