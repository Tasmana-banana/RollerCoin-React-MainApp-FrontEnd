import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import MinerRatingStar from "../SingleComponents/MinerRatingStar";
import decimalAdjust from "../../services/decimalAdjust";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import getCurrencyConfig from "./helpers/getCurrencyConfig";
import getPrefixPower from "../../services/getPrefixPower";

import "../../assets/scss/Marketplace/BuyItemCard.scss";

const MINER_TYPE = "miner";
const RACK_TYPE = "rack";

const BuyItemCard = ({ item }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Marketplace");
	const currentCurrencyConfig = getCurrencyConfig("RLT");

	const typeImgConfig = {
		miner: {
			img: `${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${item.img_ver}`,
			width: 126,
			height: 100,
		},
		rack: {
			img: `${process.env.STATIC_URL}/static/img/market/racks/${item.itemId}.png?v=1.0.3`,
			width: 126,
			height: 100,
		},
		mutation_component: {
			img: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${item.itemId}.png?v=1.0.1`,
			width: 64,
			height: 64,
		},
		battery: {
			img: `${process.env.STATIC_URL}/static/img/market/batteries/${item.itemId}.png?v=1.0.3`,
			width: 124,
			height: 100,
		},
	};

	const prefixPowerToString = useMemo(() => {
		if (!item.power) {
			return "";
		}
		const { hashDetail, power } = getPrefixPower(item.power);

		return `${power} ${hashDetail}`;
	}, [item.power]);

	return (
		<Link to={`${getLanguagePrefix(language)}/marketplace/buy/${item.itemType}/${item.itemId}`} className="marketplace-buy-item-card">
			<div className="item-info-wrapper">
				<div className="item-img-wrapper">
					{!!item.level && item.type === MINERS_TYPES.MERGE && (
						<img
							className={`collection-product-level-img-size-${item.width || 2}`}
							src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
							width={22}
							height={16}
							alt={item.level}
						/>
					)}
					<LazyLoadImage width={typeImgConfig[item.itemType].width} height={typeImgConfig[item.itemType].height} src={typeImgConfig[item.itemType].img} alt="product" threshold={100} />
					{!!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />}
				</div>
				{!isMobile && (
					<div className="item-text-wrapper">
						<p className="item-title">
							{item.type === MINERS_TYPES.MERGE && <span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>}
							{item.rarityGroup?.title && (
								<span className="rarity-title" style={{ color: `#${item.rarityGroup?.baseHexColor ? item.rarityGroup.baseHexColor : "ffffff"}` }}>
									{item.rarityGroup.title[language] || item.rarityGroup.title.en}{" "}
								</span>
							)}
							{item.name[language] || item.name.en}
						</p>
						{item.itemType === MINER_TYPE && (
							<p className="item-addition">
								<span className="item-addition-power">{prefixPowerToString}</span>
								{item.power && !Number.isNaN(Number(item.bonus.power_percent)) ? <> | </> : null}
								{!Number.isNaN(Number(item.bonus.power_percent)) ? <span className="item-addition-bonus">{item.bonus.power_percent / 100}%</span> : null}
							</p>
						)}
						{item.itemType === RACK_TYPE && (
							<p className="item-addition">{!Number.isNaN(Number(item.rack_percent)) ? <span className="item-addition-bonus">{item.rack_percent / 100}%</span> : null}</p>
						)}
						<p className="item-quantity">
							{t("buy.quantity")}: <span className="item-quantity-amount">{threeDigitDivisor(item.count, "space")}</span>
						</p>
					</div>
				)}
				{isMobile && (
					<div className="item-text-wrapper">
						<p className="item-title">
							{item.type === MINERS_TYPES.MERGE && <span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>}
							{item.rarityGroup?.title && (
								<span className="rarity-title" style={{ color: `#${item.rarityGroup?.baseHexColor ? item.rarityGroup.baseHexColor : "ffffff"}` }}>
									{item.rarityGroup.title[language] || item.rarityGroup.title.en}{" "}
								</span>
							)}
							{item.name[language] || item.name.en}
						</p>
						{item.itemType === MINER_TYPE && (
							<p className="item-addition">
								<span className="item-addition-power">{prefixPowerToString}</span>
								{item.power && !Number.isNaN(Number(item.bonus.power_percent)) ? <> | </> : null}
								{!Number.isNaN(Number(item.bonus.power_percent)) ? <span className="item-addition-bonus">{item.bonus.power_percent / 100}%</span> : null}
							</p>
						)}
						{item.itemType === RACK_TYPE && (
							<p className="item-addition">{!Number.isNaN(Number(item.rack_percent)) ? <span className="item-addition-bonus">{item.rack_percent / 100}%</span> : null}</p>
						)}
						<p className="item-quantity">
							{t("buy.quantity")}: <span className="item-quantity-amount">{threeDigitDivisor(item.count, "space")}</span>
						</p>
						<p className="item-price-label">
							{t("main.from")}
							{isMobile && ": "}
							<span className="item-price">{threeDigitDivisor(decimalAdjust(item.price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT</span>
						</p>
					</div>
				)}
			</div>
			{!isMobile && (
				<div className="item-price-wrapper">
					<p className="item-price-label">{t("main.from")}</p>
					<p className="item-price">{threeDigitDivisor(decimalAdjust(item.price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT</p>
				</div>
			)}
		</Link>
	);
};

BuyItemCard.propTypes = {
	item: PropTypes.object.isRequired,
};

export default BuyItemCard;
