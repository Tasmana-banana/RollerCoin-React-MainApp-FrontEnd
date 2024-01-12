import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import msecToDays from "../../services/msecToDays";

import "../../assets/scss/SingleComponents/SeasonRewardModal.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import cartIcon from "../../assets/img/cart.svg";

const modalConfig = {
	system_sale_event: {
		key: "item",
		type: "type",
	},
	season: {
		key: "product",
		type: "type",
	},
	spin_event: {
		key: "item_info",
		type: "item_type",
	},
};

const ItemRewardModal = ({ reward, isViewReward, toggleViewReward, imgUrl, eventType, isShowBuyButton = false }) => {
	const { t } = useTranslation("Game");
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const isGoldTag = reward.reward_tags && reward.reward_tags.some((tag) => tag.en === "exclusive");
	const imgScaleConfig = {
		miner: { transform: "scale(1.5)" },
		hat: { transform: "scale(2)" },
	};
	const itemKey = modalConfig[eventType].key;
	const itemType = modalConfig[eventType].type;
	const isAppearance = reward[itemType] === "appearance";

	return (
		<Modal isOpen={isViewReward} toggle={toggleViewReward} returnFocusAfterClose={false} centered className="season-reward-modal">
			{isAppearance && (
				<ModalBody className="reward-simplified-modal-body">
					<p className="reward-simplified-modal-title-text">{reward.title?.[language] ?? reward.title.en}</p>
					<img src={`${process.env.STATIC_URL}/static/img/market/appearances/large/${reward[itemKey]._id}.png?v=1.0.2`} alt={reward[itemType]} />
				</ModalBody>
			)}
			{!isAppearance && (
				<ModalBody className="reward-modal-body">
					<div className="reward-modal-left-side">
						{isMobile && (
							<div className={`reward-modal-title ${isGoldTag ? "gold-title" : ""}`}>
								<p>{reward[itemKey].name?.[language] ?? reward[itemKey]?.name?.en ?? reward.title.en}</p>
							</div>
						)}
						<div className="reward-modal-img-wrapper">
							<img className="reward-modal-img" src={imgUrl} alt={reward[itemType]} style={imgScaleConfig[reward[itemType]] || {}} />
						</div>
						{!isMobile && reward[itemKey]?.is_not_for_sale === false && reward[itemKey]?.is_out_of_stock === false && (
							<div className="buy-btn-wrapper">
								<Link to={`${getLanguagePrefix(language)}/game/market/miners`} className="tree-dimensional-button btn-cyan w-100">
									<span className="with-horizontal-image flex-row button-text-wrapper">
										<img className="btn-icon" src={cartIcon} alt="cart" />
										<span className="btn-text">BUY IN STORE</span>
									</span>
								</Link>
								в
							</div>
						)}
					</div>
					<div className="reward-modal-right-side">
						{!isMobile && (
							<div className={`reward-modal-title with-divider ${isGoldTag ? "gold-title" : ""}`}>
								<p>{reward[itemKey]?.name?.[language] ?? reward[itemKey]?.name?.en ?? reward.title.en}</p>
							</div>
						)}
						{(reward[itemType] === "miner" || reward[itemType] === "rack") && (
							<div className="reward-modal-power with-divider">
								<p>Status:</p>
								<p>{reward[itemKey]?.is_can_be_sold_on_mp ? t("market.canBeSold") : t("market.cantBeSold")}</p>
							</div>
						)}
						{reward[itemKey]?.width && (
							<div className="reward-modal-size with-divider">
								<p>Size:</p>
								<p>
									{reward[itemKey].width} {reward[itemKey].width === 1 ? "Cell" : "Cells"}
								</p>
							</div>
						)}
						{reward[itemKey]?.power && (
							<div className="reward-modal-power with-divider">
								<p>Power:</p>
								<p>{reward[itemKey].power} Gh/s</p>
							</div>
						)}
						{reward[itemKey]?.ttl_time && (
							<div className="reward-modal-power with-divider">
								<p>Time:</p>
								<p>{msecToDays(reward[itemKey].ttl_time)} Days</p>
							</div>
						)}
						{reward[itemKey]?.quantity && (
							<div className="reward-modal-power with-divider">
								<p>Quantity:</p>
								<p>{reward[itemKey].quantity}</p>
							</div>
						)}
						{reward[itemKey]?.rarity_group_name && (
							<div className="reward-modal-power with-divider">
								<p>Rarity:</p>
								<p style={{ color: `#${reward[itemKey].rarity_color_hex}` }}>{reward[itemKey]?.rarity_group_name[language] || reward[itemKey]?.rarity_group_name.en}</p>
							</div>
						)}
						{reward[itemKey]?.description && (
							<div className="reward-modal-description">
								<p>{reward[itemKey]?.description?.[language] ?? reward[itemKey]?.description?.en ?? ""}</p>
							</div>
						)}
						{isShowBuyButton && isMobile && reward[itemKey]?.is_not_for_sale === false && reward[itemKey]?.is_out_of_stock === false && (
							<div className="buy-btn-wrapper">
								<Link to={`${getLanguagePrefix(language)}/game/market/miners`} className="tree-dimensional-button btn-cyan w-100">
									<span className="with-horizontal-image flex-row button-text-wrapper">
										<img className="btn-icon" src={cartIcon} alt="cart" />
										<span className="btn-text">BUY IN STORE</span>
									</span>
								</Link>
							</div>
						)}
					</div>
				</ModalBody>
			)}
			<button className="tree-dimensional-button close-menu-btn btn-default reward-modal-close" onClick={toggleViewReward}>
				<span>
					<img src={closeIcon} alt="close_modal" />
				</span>
			</button>
		</Modal>
	);
};

ItemRewardModal.propTypes = {
	reward: PropTypes.object.isRequired,
	isViewReward: PropTypes.bool.isRequired,
	toggleViewReward: PropTypes.func.isRequired,
	imgUrl: PropTypes.string.isRequired,
	eventType: PropTypes.oneOf(["system_sale_event", "season", "spin_event"]).isRequired,
	isShowBuyButton: PropTypes.bool,
};

export default ItemRewardModal;
