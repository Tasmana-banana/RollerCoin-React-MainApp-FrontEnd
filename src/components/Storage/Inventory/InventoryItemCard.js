import React, { Fragment } from "react";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CraftTable from "../CraftTable";
import MinerRatingStar from "../../SingleComponents/MinerRatingStar";
import { ITEM_TYPES, MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import getPrefixPower from "../../../services/getPrefixPower";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import arrowDownIcon from "../../../assets/img/icon/angle_down.svg";
import arrowUpIcon from "../../../assets/img/icon/angle_up.svg";
import ArrowBonusUp from "../../../assets/img/icon/arrow_bonus.svg";

const InventoryItemCard = ({ item, toggleActiveCard, activeCardID }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);

	const isMergeMiner = item.type === ITEM_TYPES.MINER && [MINERS_TYPES.MERGE, MINERS_TYPES.OLD_MERGE].includes(item.miner_type);
	const itemImg =
		item.type === ITEM_TYPES.MINER
			? `${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${item.img_ver}`
			: `${process.env.STATIC_URL}/static/img/market/racks/${item.id}.png?v=1.0.3`;

	return (
		<Col xs={12} lg={4} key={item.id} className={`miners-racks-card-container ${item.id === activeCardID ? "active" : ""} `}>
			<div className="card-wrapper">
				<div className="card-image-block">
					<div className="card-image-wrapper">
						{isMergeMiner && !!item.level && item.miner_type === MINERS_TYPES.MERGE && (
							<img
								className={`collection-product-level-img-size-${item.size || 2}`}
								src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
								width={22}
								height={16}
								alt={item.level}
							/>
						)}
						<LazyLoadImage alt={item.miner_id} height={126} width={100} src={itemImg} threshold={100} className="collection-product-image" />
						{isMergeMiner && !!item.level && item.miner_type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.size || 2} className="rating-img-size" />}
					</div>
				</div>
				<div className="card-info-block">
					<div className="item-name">
						<p className="name-title">{item.name[language] || item.name.en}</p>
					</div>
					<div className="item-info-wrapper">
						<p className="size-title">{t("inventory.size")}:</p>
						<p className="size-value">
							{item.size} {t("inventory.cells")}
						</p>
					</div>
					{item.type === ITEM_TYPES.MINER && (
						<Fragment>
							<div className="item-info-wrapper">
								<p className="power-title">{t("inventory.power")}</p>
								<p className="power-value">
									{getPrefixPower(item.power).power} {getPrefixPower(item.power).hashDetail}
								</p>
							</div>
							<div className="item-info-wrapper">
								<p className="bonus-power-title">{t("inventory.bonus")}</p>
								<p className="bonus-power-value">{item.bonus_power / 100} %</p>
							</div>

							<div className="item-info-wrapper">
								<p className="quantity-title">{t("inventory.quantity")}</p>
								<p className="quantity-value">{item.quantity}</p>
							</div>
						</Fragment>
					)}
					{item.type === ITEM_TYPES.RACK && (
						<Fragment>
							{!!item.percent && (
								<div className="item-info-wrapper">
									<p className="bonus-title">{t("inventory.bonus")}:</p>
									<div className="bonus-value">
										<div className="power-icon">
											<img src={ArrowBonusUp} alt="Arrow bonus" />
										</div>
										<span>{`+${item.percent / 100}%`}</span>
									</div>
								</div>
							)}
							<div className="item-info-wrapper">
								<p className="quantity-title-rack">{t("inventory.quantity")}</p>
								<p className="quantity-value">{item.quantity}</p>
							</div>
						</Fragment>
					)}
				</div>
			</div>
			<div className="additional-description-wrapper">
				<div className="status-of-sell-block">
					{item.type === ITEM_TYPES.MINER && (
						<Fragment>
							{item.is_can_be_sold_on_mp && <p className="text positive">{t("inventory.canBeSold")}</p>}
							{!item.is_can_be_sold_on_mp && <p className="text negative">{t("inventory.cantBeSold")}</p>}
						</Fragment>
					)}
					{item.type !== ITEM_TYPES.MINER && <p className="text positive">{t("inventory.canBeSold")}</p>}
				</div>
			</div>
			<div className={`inventory-description-wrapper ${item.id === activeCardID ? "opened" : ""}`}>
				<div className="inventory-description-switcher" hidden={item.id === activeCardID} onClick={() => toggleActiveCard(item.id)}>
					<p className="inventory-description-switcher-text">{item.type === ITEM_TYPES.MINER ? t("inventory.minerDetails") : t("inventory.rackDetails")}</p>
					<img className="image" src={arrowDownIcon} alt="open" width="17" height="9" />
				</div>
				<div className="inventory-description-block" hidden={item.id !== activeCardID}>
					<div className="description-wrapper">
						<p className="description-text">
							{item.description[language] || item.description.en}
							{!!item.created_by_title && !!item.created_by_title.text && (
								<Fragment>
									{" "}
									{!item.created_by_title.link && <span>{item.created_by_title.text}</span>}
									{!!item.created_by_title.link && (
										<Link to={`${getLanguagePrefix(language)}${item.created_by_title.link}`}>
											<span>{item.created_by_title.text}</span>
										</Link>
									)}
								</Fragment>
							)}
						</p>
						{isMergeMiner && item.craft_items && <CraftTable item={item.craft_items} />}
					</div>
					<div className="inventory-description-switcher" onClick={toggleActiveCard}>
						<p className="inventory-description-switcher-text">{t("inventory.hide")}</p>
						<img className="image" src={arrowUpIcon} alt="hide" width="17" height="9" />
					</div>
				</div>
			</div>
		</Col>
	);
};

InventoryItemCard.propTypes = {
	item: PropTypes.object.isRequired,
	toggleActiveCard: PropTypes.func.isRequired,
	activeCardID: PropTypes.string.isRequired,
};

export default InventoryItemCard;
