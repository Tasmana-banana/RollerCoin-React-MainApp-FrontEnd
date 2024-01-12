import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import { ITEM_TYPE } from "../../constants/Marketplace";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import MinerRatingStar from "../SingleComponents/MinerRatingStar";

import "../../assets/scss/Marketplace/ItemInfo.scss";
import fileIcon from "../../assets/img/icon/file.svg";
import arrowTopIcon from "../../assets/img/game/arrow_top_cyan.svg";
import ArrowBonusUp from "../../assets/img/icon/arrow_bonus.svg";

const ItemInfo = ({ item, children }) => {
	const { t } = useTranslation("Marketplace");
	const language = useSelector((state) => state.game.language);
	const isMergeMiner = item.itemType === ITEM_TYPE.MINER && [MINERS_TYPES.MERGE, MINERS_TYPES.OLD_MERGE].includes(item.type);

	const typeImgConfig = {
		miner: {
			img: `${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${new Date(item.last_update).getTime() || 1}`,
			width: 189,
			height: 150,
		},
		rack: {
			img: `${process.env.STATIC_URL}/static/img/market/racks/${item._id}.png?v=1.0.3`,
			width: 189,
			height: 150,
		},
		mutation_component: {
			img: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${item._id}.png?v=1.0.1`,
			width: 96,
			height: 96,
		},
		battery: {
			img: `${process.env.STATIC_URL}/static/img/market/batteries/${item._id}.png?v=1.0.1`,
			width: 189,
			height: 150,
		},
	};

	return (
		<Fragment>
			<Col xs={12} lg={4} className="item-info-buy-wrapper">
				<div className="item-img-wrapper">
					{isMergeMiner && !!item.level && item.type === MINERS_TYPES.MERGE && (
						<img
							className={`collection-product-level-img-size-${item.width || 2}`}
							src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
							width={22}
							height={16}
							alt={item.level}
						/>
					)}
					<LazyLoadImage width={typeImgConfig[item.itemType].width} height={typeImgConfig[item.itemType].height} src={typeImgConfig[item.itemType].img} alt="product" threshold={100} />
					{isMergeMiner && !!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />}
				</div>
				{children}
			</Col>
			<Col xs={12} lg={4} className="item-info-characteristics-wrapper">
				<div className="characteristics-item-wrapper title">
					<div className="characteristics-title">
						<div className="characteristics-icon-wrapper">
							<img src={fileIcon} width={18} height={24} alt="info" />
						</div>
						<p className="characteristics-bold-text">{t("buy.char")}</p>
					</div>
				</div>
				{item.itemType === "miner" && (
					<Fragment>
						<div className="characteristics-item-wrapper">
							<p className="item-title">{t("buy.cell")}</p>
							<p className="item-value">{item.width}</p>
						</div>
						<div className="characteristics-item-wrapper">
							<p className="item-title">{t("buy.power")}</p>
							<p className="item-value">{threeDigitDivisor(item.power, "space")} Gh/s</p>
						</div>
						<div className="characteristics-item-wrapper">
							<p className="item-title">{t("buy.bonus")}</p>
							<div className="item-value cyan bold">
								<div className="icon-wrapper">
									<img src={arrowTopIcon} width={12} height={12} alt="arrow" />
								</div>
								<p>{item.bonus.power_percent / 100}%</p>
							</div>
						</div>
					</Fragment>
				)}
				{item.itemType === "rack" && (
					<div className="characteristics-item-wrapper">
						<p className="item-title">{t("buy.cell")}</p>
						<p className="item-value">{item.capacity}</p>
					</div>
				)}
				{item.itemType === "mutation_component" && (
					<div className="characteristics-item-wrapper">
						<p className="item-title">{t("buy.level")}</p>
						<p className="item-value bold" style={{ color: `#${item.rarityGroup?.baseHexColor || "ffffff"}` }}>
							{item.rarityGroup?.title[language] || item.rarityGroup?.title.en}
						</p>
					</div>
				)}
				{!!item.quantity && (
					<div className="characteristics-item-wrapper">
						<p className="item-title">{t("main.qty")}</p>
						<p className="item-value green bold">{item.quantity}</p>
					</div>
				)}

				{item.itemType === "rack" && !!item.percent && (
					<div className="characteristics-item-wrapper">
						<p className="item-title">{t("sell.bonus")}</p>
						<div className="item-value bonus-value">
							<div className="power-icon">
								<img src={ArrowBonusUp} width={14} height={14} alt="Arrow bonus" />
							</div>
							<span>{`+${item.percent / 100}%`}</span>
						</div>
					</div>
				)}
				<p className="characteristics-item-description">{item.description[language] || item.description.en}</p>
			</Col>
		</Fragment>
	);
};

ItemInfo.propTypes = {
	item: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default ItemInfo;
