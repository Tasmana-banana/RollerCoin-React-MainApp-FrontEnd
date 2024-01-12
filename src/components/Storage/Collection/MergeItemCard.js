import React, { Fragment } from "react";
import { Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import MinerRatingStar from "../../SingleComponents/MinerRatingStar";
import { RARITY_DATA_BY_LEVEL, RARITY_GROUP_BY_LEVEL, MINERS_TYPES } from "../../../constants/Storage";
import CraftTable from "../CraftTable";
import getPrefixPower from "../../../services/getPrefixPower";

import arrowDownIcon from "../../../assets/img/icon/angle_down.svg";
import arrowUpIcon from "../../../assets/img/icon/angle_up.svg";

import "../../../assets/scss/Storage/Collection/MergeItemCard.scss";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

const MergeItemCard = ({ item, activeCardID, toggleActiveCard }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	return (
		<Col xs={12} lg={4} key={item.id} className={`collection-card-container ${item.id === activeCardID ? "active" : ""} ${item.is_user_received_bonus ? "" : "shaded"}`}>
			<div className={`collection-main-wrapper`}>
				<div className="collection-product-image-wrapper">
					<p className="collection-percent-bonus">
						{t("collection.bonusPower")} <span className="collection-bonus-amount">+{item.bonus_power / 100}%</span>
					</p>
					<div className="collection-product-item-image-wrapper">
						{!!item.level && item.type === MINERS_TYPES.MERGE && (
							<img
								className={`collection-product-level-img-size-${item.width || 2}`}
								src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
								width={22}
								height={16}
								alt={item.level}
							/>
						)}
						<LazyLoadImage
							alt={item.miner_id}
							height={126}
							width={100}
							src={`${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${item.img_ver}`}
							threshold={100}
							className="collection-product-image"
						/>
						{!!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />}
					</div>
				</div>
				<div className="collection-product-info">
					<p className="collection-product-name" style={{ color: RARITY_GROUP_BY_LEVEL[item.level || 1].hexColor }}>
						{item.name[language] || item.name.en}
					</p>
					<div className="collection-product-status-of-sell">
						{item.is_can_be_sold_on_mp ? <p className="text positive">{t("inventory.canBeSold")}</p> : <p className="text negative">{t("inventory.cantBeSold")}</p>}
					</div>
					<div className="collection-product-power">
						<p className="power-title">{t("collection.power")}</p>
						<p className="power-value">
							{getPrefixPower(item.power).power} {getPrefixPower(item.power).hashDetail}
						</p>
					</div>
					<div className="collection-product-supply">
						<p className="supply-title">{t("collection.supply")}</p>
						<p className="supply-value">{item.supply}</p>
					</div>
				</div>
			</div>
			<div className={`collection-description-wrapper ${item.id === activeCardID ? "opened" : ""}`}>
				<div className="collection-description-switcher" hidden={item.id === activeCardID} onClick={() => toggleActiveCard(item.id)}>
					<p className="collection-description-switcher-text">{t("collection.details")}</p>
					<LazyLoad offset={100}>
						<img className="image" src={arrowDownIcon} alt="open" />
					</LazyLoad>
				</div>
				<div className="collection-description-block" hidden={item.id !== activeCardID}>
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
						{!!item.craft_items.length && <CraftTable item={item.craft_items} />}
					</div>
					<div className="collection-description-switcher" onClick={() => toggleActiveCard()}>
						<p className="collection-description-switcher-text">{t("collection.hide")}</p>
						<LazyLoad offset={100}>
							<img className="image" src={arrowUpIcon} alt="hide" />
						</LazyLoad>
					</div>
				</div>
			</div>
		</Col>
	);
};

MergeItemCard.propTypes = {
	item: PropTypes.object.isRequired,
	toggleActiveCard: PropTypes.func.isRequired,
	activeCardID: PropTypes.string.isRequired,
};

export default MergeItemCard;
