import React, { Fragment } from "react";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import RollerButton from "../SingleComponents/RollerButton";
import MinerRatingStar from "../SingleComponents/MinerRatingStar";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import { ITEM_TYPE } from "../../constants/Marketplace";

import "../../assets/scss/Marketplace/MinersAndRacksTab.scss";
import "../../assets/scss/Marketplace/SellItemCard.scss";

import sellIcon from "../../assets/img/marketplace/sell_button_icon.svg";
import ArrowBonusUp from "../../assets/img/icon/arrow_bonus.svg";

const ImageSourceBuilder = {
	[ITEM_TYPE.MINER]: (id, imgVer) => `${process.env.STATIC_URL}/static/img/market/miners/${id}.gif?v=${imgVer}`,
	[ITEM_TYPE.RACK]: (id) => `${process.env.STATIC_URL}/static/img/market/racks/${id}.png?v=1.0.3`,
	[ITEM_TYPE.PART]: (id) => `${process.env.STATIC_URL}/static/img/storage/mutation_components/${id}.png?v=1.0.1`,
	[ITEM_TYPE.BATTERY]: (id) => `${process.env.STATIC_URL}/static/img/market/batteries/${id}.png?v=1.0.1`,
};

const SellItemCard = ({ item }) => {
	const { t } = useTranslation("Marketplace");
	const language = useSelector((state) => state.game.language);
	const isMergeMiner = item.itemType === ITEM_TYPE.MINER && [MINERS_TYPES.MERGE, MINERS_TYPES.OLD_MERGE].includes(item.type);
	const itemImg = ImageSourceBuilder[item.itemType](item.itemType === "miner" ? item.filename : item._id, new Date(item.last_update).getTime() || 1);
	const imageSize = item.itemType === ITEM_TYPE.PART ? { width: 64, height: 64 } : { width: 126, height: 100 };

	const history = useHistory();

	const onClickInternal = () => {
		const newRoute = `${getLanguagePrefix(language)}/marketplace/sell/${item.itemType}/${item._id}`;
		history.push(newRoute);
	};

	return (
		<Col xs={12} lg={4} key={item._id} className={`miners-racks-card-container ${item.itemType}`}>
			<div className="card-wrapper">
				<div className="card-image-block">
					<div className="card-image-wrapper">
						{isMergeMiner && !!item.level && item.type === MINERS_TYPES.MERGE && (
							<img
								className={`collection-product-level-img-size-${item.width || 2}`}
								src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
								width={22}
								height={16}
								alt={item.level}
							/>
						)}
						<LazyLoadImage alt={item._id} height={imageSize.height} width={imageSize.width} src={itemImg} threshold={100} className="collection-product-image" />
						{isMergeMiner && !!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar className={`rating-img-size-${item.width || 2}`} />}
					</div>
				</div>
				<div className="card-info-block">
					<div className="item-name">
						{item.itemType === ITEM_TYPE.PART && (
							<p className="name-title" style={{ color: `#${item.rarityGroup.baseHexColor}`, paddingBottom: "5px" }}>
								{item.rarityGroup.title[language] || item.rarityGroup.title.en}
							</p>
						)}
						{item.type === MINERS_TYPES.MERGE && <span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>}
						<p className="name-title">{item.name[language] || item.name.en}</p>
					</div>
					{![ITEM_TYPE.PART, ITEM_TYPE.BATTERY].includes(item.itemType) && (
						<div className="item-info-wrapper">
							<p className="size-title">{t("sell.size")}</p>
							<p className="size-value">
								{item.itemType === ITEM_TYPE.MINER ? item.width : item.capacity} {t("sell.cells")}
							</p>
						</div>
					)}
					{item.itemType === ITEM_TYPE.MINER && (
						<Fragment>
							<div className="item-info-wrapper">
								<p className="power-title">{t("sell.power")}</p>
								<p className="power-value">
									{getPrefixPower(item.power).power} {getPrefixPower(item.power).hashDetail}
								</p>
							</div>
							<div className="item-info-wrapper">
								<p className="bonus-power-title">{t("sell.bonus")}</p>
								<p className="bonus-power-value">{item.bonus.power_percent / 100} %</p>
							</div>
						</Fragment>
					)}
					{item.itemType === ITEM_TYPE.RACK && !!item.percent && (
						<div className="item-info-wrapper">
							<p className="bonus-power-title">{t("sell.bonus")}</p>
							<div className="bonus-value">
								<div className="power-icon">
									<img src={ArrowBonusUp} alt="Arrow bonus" />
								</div>
								<span>{`+${item.percent / 100}%`}</span>
							</div>
						</div>
					)}
					<div className="item-info-wrapper">
						<p>{t("sell.quantity")}</p>
						<p className="quantity-value">{item.quantity}</p>
					</div>
				</div>
			</div>
			<div className="card-footer">
				{item.itemType === ITEM_TYPE.MINER && (
					<div className="sell-status-of-sell">
						{item.is_can_be_sold_on_mp ? <p className="text positive">{t("sell.canBeSold")}</p> : <p className="text negative">{t("sell.cantBeSold")}</p>}
					</div>
				)}
				<RollerButton
					disabled={item.itemType === ITEM_TYPE.MINER && item.is_can_be_sold_on_mp === false}
					className="sell-button"
					text={t("sell.btnSell").concat(" ", t(`sell.${item.sellName}`))}
					color="cyan"
					action={onClickInternal}
					icon={sellIcon}
					width={100}
				/>
			</div>
		</Col>
	);
};

SellItemCard.propTypes = {
	item: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired,
};

export default SellItemCard;
