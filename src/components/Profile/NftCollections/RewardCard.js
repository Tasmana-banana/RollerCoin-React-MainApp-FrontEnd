import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import decimalAdjust from "../../../services/decimalAdjust";

import "../../../assets/scss/Profile/RewardCard.scss";
import rewardPowerImg from "../../../assets/img/seasonPass/reward_power.png";
import rewardMoneyImg from "../../../assets/img/seasonPass/reward_money.png";
import checkIcon from "../../../assets/img/profile/nft/check_icon.svg";

const MS_TO_DAYS = 86400000;

const RewardCard = ({ reward }) => {
	const { t } = useTranslation("Profile");
	const language = useSelector((state) => state.game.language);
	return (
		<Col xs={6} lg={4} key={reward.key}>
			<div className={`reward-card ${reward.is_reward_received ? "received" : ""}`}>
				{reward.is_reward_received && <img className="reward-receiver-icon" src={checkIcon} height={48} width={48} alt="received" />}
				{reward.type === "miner" && (
					<Fragment>
						<p className="reward-name">{reward.item_name[language] || reward.item_name}</p>
						<LazyLoadImage
							className="reward-img"
							alt="reward"
							src={`${process.env.STATIC_URL}/static/img/market/miners/${reward.filename}.gif?v=1.0.0`}
							height={100}
							width={126}
							threshold={200}
						/>
						<p className="reward-description">{reward.item_power.toLocaleString("de-DE")} Gh/s</p>
					</Fragment>
				)}
				{reward.type === "percent_power" && (
					<Fragment>
						<p className="reward-name">{t("nft-collection.bonusPower")}</p>
						<LazyLoadImage className="reward-img" alt="reward" src={rewardPowerImg} height={100} width={126} threshold={200} />
						<p className="reward-description">
							{reward.amount / 100}% {reward.ttl_time / MS_TO_DAYS >= 1 && `(${Math.round(reward.ttl_time / MS_TO_DAYS)} ${reward.ttl_time / MS_TO_DAYS > 1 ? "days" : "day"})`}
						</p>
					</Fragment>
				)}
				{reward.type === "power" && (
					<Fragment>
						<p className="reward-name">{t("nft-collection.bonusPower")}</p>
						<LazyLoadImage className="reward-img" alt="reward" src={rewardPowerImg} height={100} width={126} threshold={200} />
						<p className="reward-description">
							{reward.amount.toLocaleString("de-DE")} Gh/s{" "}
							{reward.ttl_time / MS_TO_DAYS >= 1 && `(${Math.round(reward.ttl_time / MS_TO_DAYS)} ${reward.ttl_time / MS_TO_DAYS > 1 ? "days" : "day"})`}
						</p>
					</Fragment>
				)}
				{reward.type === "money" && (
					<Fragment>
						<p className="reward-name">{t("nft-collection.rollertoken")}</p>
						<LazyLoadImage className="reward-img" alt="reward" src={rewardMoneyImg} height={100} width={126} threshold={200} />
						<p className="reward-description">{decimalAdjust(reward.amount / 1000000, 0)} RLT</p>
					</Fragment>
				)}
			</div>
		</Col>
	);
};

RewardCard.propTypes = {
	reward: PropTypes.object.isRequired,
};

export default RewardCard;
