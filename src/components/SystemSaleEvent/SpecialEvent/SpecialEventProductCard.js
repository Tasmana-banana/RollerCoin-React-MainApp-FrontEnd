import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import MinerRatingStar from "../../SingleComponents/MinerRatingStar";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import getPrefixPower from "../../../services/getPrefixPower";
import { ITEM_TYPE } from "../../../constants/Game/itemTypes";
import { BLOCK_TYPES } from "../../../constants/SystemSaleEvent";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";

import "../../../assets/scss/SystemSaleEvent/SpecialEventProductCard.scss";

import closeIcon from "../../../assets/img/system_sale_event/icon/close_icon.svg";

const SpecialEventProductCard = ({ item, itemType, handleControlToBurn, blockType, isMaxSlotsFilled }) => {
	const { t } = useTranslation("SystemSaleEvent");
	const language = useSelector((state) => state.game.language);
	const typeImgConfig = {
		[ITEM_TYPE.MINER]: {
			img: `${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=1.1.3`,
			width: 102,
			height: 80,
		},
	};
	const currentCurrencyConfig = getCurrencyConfig(item?.reward?.currency || "ECOIN");
	const isBurningItem = blockType === BLOCK_TYPES.PRODUCTS && item.burning;
	const isMergeMiner = itemType === ITEM_TYPE.MINER && [MINERS_TYPES.MERGE, MINERS_TYPES.OLD_MERGE].includes(item.crafting_type);
	const isItemNotForBurn = !item?.reward;
	const isNotAddToBurnItem = isBurningItem || isItemNotForBurn;
	return (
		<Col xs={6} lg={4} className="special-products-item">
			<div
				className={`special-products-card ${isBurningItem ? "burning-item" : ""} ${isMaxSlotsFilled && !isBurningItem ? "max-slots-filled" : ""}`}
				onClick={() => (isNotAddToBurnItem ? null : handleControlToBurn(item))}
			>
				{isMaxSlotsFilled && !isBurningItem && (
					<div className="special-tooltip-info">
						<span className="special-tooltip-text">{t("specialEventProducts.maxSlotsFilled")}</span>
					</div>
				)}

				<div className="special-reward-block">
					{currentCurrencyConfig && <img className="special-reward-currency" src={`/static/img/wallet/${currentCurrencyConfig.img}.svg?v=1.13`} width={16} height={17} alt="Currency icon" />}
					<span className="special-reward-count">{decimalAdjust(item?.reward?.amount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision)}</span>
				</div>
				{blockType === BLOCK_TYPES.BURN && (
					<div className="special-product-close-block">
						<img className="special-products-close" src={closeIcon} alt="Close icon" />
					</div>
				)}
				<div className="special-product-image-wrapper">
					{isMergeMiner && !!item.level && item.crafting_type === MINERS_TYPES.MERGE && (
						<img
							className={`collection-product-level-img-size-${item.width || 2}`}
							src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
							width={22}
							height={16}
							alt={item.level}
						/>
					)}
					{isMergeMiner && !!item.level && item.crafting_type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar className={`rating-img-size-${item.width || 2}`} />}
					<img
						className="special-product-image"
						src={typeImgConfig[itemType].img}
						width={typeImgConfig[itemType].width}
						height={typeImgConfig[itemType].height}
						alt="Special event items image"
					/>
				</div>
				<h3 className="special-product-name">{item.title[language]}</h3>
				{itemType === ITEM_TYPE.MINER && (
					<div className="special-power-block">
						<span className="special-power-count">{`${getPrefixPower(item.power).power} ${getPrefixPower(item.power).hashDetail}`}</span>
						<span className="special-bonus-count">+{item.power_percent / 100}%</span>
					</div>
				)}
			</div>
		</Col>
	);
};

SpecialEventProductCard.propTypes = {
	item: PropTypes.object.isRequired,
	itemType: PropTypes.string.isRequired,
	handleControlToBurn: PropTypes.func.isRequired,
	blockType: PropTypes.string.isRequired,
	isMaxSlotsFilled: PropTypes.bool,
};

export default SpecialEventProductCard;
