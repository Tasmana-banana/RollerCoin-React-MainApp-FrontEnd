import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";
import ItemRewardModal from "../SingleComponents/ItemRewardModal";
import MinerRatingStar from "../SingleComponents/MinerRatingStar";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import { ITEM_TYPES } from "../../constants/SpinEvent";
import rewardImageConstructor from "../../services/rewardImageConstructor";

const typeAdditionalStyles = {
	hat: { margin: "15px 0", transform: "scale(1.5)" },
	trophy: { margin: "15px 0", transform: "scale(1.5)" },
	miner: { transform: "scale(1)" },
	money: {},
	appearance: { width: "110%" },
	mutation_component: { paddingTop: "10px" },
	battery: { width: "90%" },
	power: { width: "100%" },
};

const columnSize = {
	2: {
		small: 6,
		big: 12,
	},
	3: {
		small: 4,
		big: 8,
	},
	4: {
		small: 3,
		big: 6,
	},
};

const RewardPuzzleCard = ({ reward, cols, viewMode = "rectangle" }) => {
	const [isViewReward, setIsViewReward] = useState(false);
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const isMiner = reward.item_type === ITEM_TYPES.MINER;
	const isMutationComponent = reward.item_type === ITEM_TYPES.MUTATION_COMPONENT;
	return (
		<Fragment>
			{viewMode === "rectangle" && (
				<Col xs={reward.cells === 1 ? columnSize[cols].small : columnSize[cols].big} className="reward-puzzle-card-wrapper">
					<div
						onClick={() => !reward.is_claimed && setIsViewReward(true)}
						className={`reward-puzzle-card-container ${reward.is_claimed ? "opened-card" : "closed-card"} ${reward.cells === 2 ? "golden-border" : ""}`}
					>
						<div className={`card-content ${reward.cells === 2 ? "golden-cell" : ""}`}>
							<Fragment>
								<div className={`reward-img-block ${isMiner ? ITEM_TYPES.MINER : ""}`}>
									{!!reward.item_info.level && reward.item_info.type === MINERS_TYPES.MERGE && (
										<img
											className={`collection-product-level-img-size-${reward.item_info.width || 2}`}
											src={`/static/img${RARITY_DATA_BY_LEVEL[reward.item_info.level || 0].icon}`}
											width={22}
											height={16}
											alt={reward.item_info.level}
										/>
									)}
									{isMutationComponent && (
										<img
											className="reward-img"
											src={rewardImageConstructor(reward.item_type, reward)}
											style={typeAdditionalStyles[reward.item_type]}
											alt={reward.id}
											width={isMobile ? 48 : 64}
											height={isMobile ? 48 : 64}
										/>
									)}
									{!isMutationComponent && (
										<img className="reward-img" src={rewardImageConstructor(reward.item_type, reward)} style={typeAdditionalStyles[reward.item_type]} alt={reward.id} />
									)}
									{!!reward.item_info.level && reward.item_info.type === MINERS_TYPES.OLD_MERGE && (
										<MinerRatingStar itemSize={reward.item_info.width || 2} className="collection-product-level-img-size" />
									)}
								</div>
								<div className="reward-text-block">
									{(!isMobile || (isMobile && reward.cells > 1)) && (
										<p className="card-text" dangerouslySetInnerHTML={{ __html: reward.title_full[language] || reward.title_full.en }} />
									)}
									{isMobile && reward.cells === 1 && <p className="card-text" dangerouslySetInnerHTML={{ __html: reward.title_short[language] || reward.title_short.en }} />}
								</div>
							</Fragment>
						</div>
					</div>
				</Col>
			)}
			{isViewReward && reward && (
				<ItemRewardModal
					reward={reward}
					isViewReward={isViewReward}
					toggleViewReward={() => setIsViewReward(!isViewReward)}
					imgUrl={rewardImageConstructor(reward.item_type, reward)}
					eventType={"spin_event"}
				/>
			)}
		</Fragment>
	);
};

RewardPuzzleCard.propTypes = {
	reward: PropTypes.object.isRequired,
	cols: PropTypes.number.isRequired,
	cellsCount: PropTypes.number,
	viewMode: PropTypes.string,
};

export default RewardPuzzleCard;
