import React, { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Row, Col } from "reactstrap";
import { REWARD_TYPES } from "../../constants/Game/Market";

import ItemRewardModal from "../SingleComponents/ItemRewardModal";

import checkIcon from "../../assets/img/seasonPass/icon/check_white.svg";
import lockIcon from "../../assets/img/seasonPass/icon/yellow_lock.svg";

const imageConstructor = (rewardType, reward) => {
	const typeImgConfig = {
		power: "/static/img/seasonPass/reward_power.png?v=1.0.1",
		money: `/static/img/seasonPass/reward_${reward.currency}.png?v=1.0.1`, //
		miner: `${process.env.STATIC_URL}/static/img/market/miners/${reward.product.filename}.gif?v=${reward.product.img_ver}`,
		rack: `${process.env.STATIC_URL}/static/img/market/racks/${reward.product._id}.png?v=1.0.3`,
		trophy: `${process.env.STATIC_URL}/static/img/game/room/trophies/${reward.product.file_name}.png?v=1.0.0`,
		mutation_component: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${reward.product._id}.png?v=1.0.1`,
		appearance: `${process.env.STATIC_URL}/static/img/market/appearances/${reward.product._id}.png?v=1.0.2`,
		hat: `${process.env.STATIC_URL}/static/img/market/hats/${reward.product._id}.png?v=1.0.0`,
		battery: `${process.env.STATIC_URL}/static/img/market/batteries/${reward.product._id}.png?v=1.0.0`,
	};
	return typeImgConfig[rewardType];
};

const EventReward = ({ reward, userLevel, isClaimedAllPassRewards, t, isClaimProcessing, postClaimRewards, seasonLevelPassBuyConfig }) => {
	const language = useSelector((state) => state.game.language);
	const [isViewReward, setIsViewReward] = useState(false);
	const [viewRewardItem, setViewRewardItem] = useState(null);

	const viewRewardTypes = ["miner", "hat", "appearance"];
	const toggleViewReward = (viewReward = null) => {
		setIsViewReward(!isViewReward);
		setViewRewardItem(viewReward);
	};

	const typeAdditionalStyles = {
		hat: { marginTop: "3px", transform: "scale(0.85)" },
		trophy: { margin: "15px 0", transform: "scale(1.2)" },
		miner: { width: "90px" },
		rack: { width: "90px" },
		money: { width: "90px" },
		power: { width: "90px" },
		appearance: { width: "110px" },
	};

	const isCurrentLevel = !isClaimedAllPassRewards && reward[REWARD_TYPES.FREE].required_level === userLevel;
	const isReadyToClaim = reward[REWARD_TYPES.FREE].is_ready_to_claim || reward[REWARD_TYPES.GOLD].is_ready_to_claim;

	return (
		<Row className={`event-shop-reward ${isCurrentLevel ? "current-level" : ""}`} id={`level_${reward[REWARD_TYPES.GOLD].required_level}`}>
			<Col xs={5} className={`reward-card-wrapper ${REWARD_TYPES.GOLD}`}>
				<div
					className={`reward-card ${isReadyToClaim ? "ready-claim" : ""}`}
					onClick={() => (viewRewardTypes.includes(reward[REWARD_TYPES.GOLD].type) ? toggleViewReward(reward[REWARD_TYPES.GOLD]) : null)}
				>
					{reward[REWARD_TYPES.GOLD].is_claimed && (
						<div className="sticker-block check">
							<img src={checkIcon} alt="check icon" />
						</div>
					)}
					{!seasonLevelPassBuyConfig && (
						<div className="sticker-block lock">
							<img src={lockIcon} alt="Lock icon" />
						</div>
					)}
					<div className="reward-description">
						<p>{reward[REWARD_TYPES.GOLD].description[language] || reward[REWARD_TYPES.GOLD].description?.en}</p>
					</div>
					<div className="reward-img-block">
						<img
							className="reward-img"
							src={imageConstructor(reward[REWARD_TYPES.GOLD].type, reward[REWARD_TYPES.GOLD])}
							style={typeAdditionalStyles[reward[REWARD_TYPES.GOLD].type] || {}}
							alt={reward[REWARD_TYPES.GOLD].id}
						/>
					</div>
					{!isClaimedAllPassRewards && reward[REWARD_TYPES.GOLD].is_ready_to_claim && (
						<button
							type="submit"
							className="reward-claim-btn"
							disabled={isClaimProcessing}
							onClick={(e) =>
								postClaimRewards(e, {
									rewardId: reward[REWARD_TYPES.GOLD].id,
									type: reward[REWARD_TYPES.GOLD].type,
									amount: reward[REWARD_TYPES.GOLD].amount,
									currency: reward[REWARD_TYPES.GOLD].currency,
									rewardType: [REWARD_TYPES.GOLD],
								})
							}
						>
							<span className="w-100 btn-padding">{t("eventPass.claim")}</span>
						</button>
					)}
				</div>
			</Col>

			<Col xs={2} className="reward-level-block">
				<p className={`reward-level ${isCurrentLevel ? "current-level" : ""}`}>{reward[REWARD_TYPES.FREE].required_level}</p>
			</Col>

			<Col xs={5} className={`reward-card-wrapper ${REWARD_TYPES.FREE}`}>
				<div
					className={`reward-card ${isReadyToClaim ? "ready-claim" : ""}`}
					onClick={() => (viewRewardTypes.includes(reward[REWARD_TYPES.FREE].type) ? toggleViewReward(reward[REWARD_TYPES.FREE]) : null)}
				>
					{reward[REWARD_TYPES.FREE].is_claimed && (
						<div className="sticker-block check">
							<img src={checkIcon} alt="check icon" />
						</div>
					)}
					<div className="reward-description">
						<p>{reward[REWARD_TYPES.FREE].description[language] || reward[REWARD_TYPES.FREE].description?.en}</p>
					</div>
					<div className="reward-img-block">
						<img
							className="reward-img"
							src={imageConstructor(reward[REWARD_TYPES.FREE].type, reward[REWARD_TYPES.FREE])}
							style={typeAdditionalStyles[reward[REWARD_TYPES.FREE].type] || {}}
							alt={reward[REWARD_TYPES.FREE].id}
						/>
					</div>
					{!isClaimedAllPassRewards && reward[REWARD_TYPES.FREE].is_ready_to_claim && (
						<button
							type="submit"
							className="reward-claim-btn"
							disabled={isClaimProcessing}
							onClick={(e) =>
								postClaimRewards(e, {
									rewardId: reward[REWARD_TYPES.FREE].id,
									type: reward[REWARD_TYPES.FREE].type,
									amount: reward[REWARD_TYPES.FREE].amount,
									currency: reward[REWARD_TYPES.FREE].currency,
									rewardType: [REWARD_TYPES.FREE],
								})
							}
						>
							<span className="w-100 btn-padding">{t("eventPass.claim")}</span>
						</button>
					)}
				</div>
			</Col>
			{isViewReward && viewRewardItem && (
				<ItemRewardModal
					reward={viewRewardItem}
					isViewReward={isViewReward}
					toggleViewReward={toggleViewReward}
					imgUrl={imageConstructor(viewRewardItem.type, viewRewardItem)}
					eventType="season"
					isShowBuyButton={true}
				/>
			)}
		</Row>
	);
};

EventReward.propTypes = {
	reward: PropTypes.object.isRequired,
	userLevel: PropTypes.number.isRequired,
	isClaimedAllPassRewards: PropTypes.bool.isRequired,
	t: PropTypes.func.isRequired,
	isClaimProcessing: PropTypes.bool.isRequired,
	postClaimRewards: PropTypes.func.isRequired,
	seasonLevelPassBuyConfig: PropTypes.object,
};

export default withTranslation("Game")(EventReward);
