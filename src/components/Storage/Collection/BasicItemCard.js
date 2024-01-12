import React, { Fragment } from "react";
import { Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getPrefixPower from "../../../services/getPrefixPower";

import arrowDownIcon from "../../../assets/img/icon/angle_down.svg";
import arrowUpIcon from "../../../assets/img/icon/angle_up.svg";

import "../../../assets/scss/Storage/Collection/BasicItemCard.scss";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

const BasicItemCard = ({ item, activeCardID, toggleActiveCard }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	return (
		<Col xs={12} lg={4} key={item.miner_id} className={`collection-card-container ${item.miner_id === activeCardID ? "active" : ""} ${item.is_user_received_bonus ? "" : "shaded"}`}>
			<div className={`collection-main-wrapper`}>
				<div className="collection-product-image-wrapper">
					<p className="collection-percent-bonus">
						{t("collection.bonusPower")} <span className="collection-bonus-amount">+{item.bonus_power / 100}%</span>
					</p>
					<LazyLoad offset={100}>
						<img
							className="collection-product-image"
							src={`${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${item.img_ver}`}
							width="126"
							height="100"
							alt={item.miner_id}
						/>
					</LazyLoad>
				</div>
				<div className="collection-product-info">
					<p className="collection-product-name">{item.name[language] || item.name.en}</p>
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
			<div className={`collection-description-wrapper ${item.miner_id === activeCardID ? "opened" : ""}`}>
				<div className="collection-description-switcher" hidden={item.miner_id === activeCardID} onClick={() => toggleActiveCard(item.miner_id)}>
					<p className="collection-description-switcher-text">{t("collection.details")}</p>
					<LazyLoad offset={100}>
						<img className="image" src={arrowDownIcon} alt="open" />
					</LazyLoad>
				</div>
				<div className="collection-description-block" hidden={item.miner_id !== activeCardID}>
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
						<p className="how-to-get-text">
							{t("collection.howToGet")}
							{item.collection_description[language] || item.collection_description.en}
						</p>
					</div>
					<div className="collection-description-switcher" onClick={toggleActiveCard}>
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

BasicItemCard.propTypes = {
	item: PropTypes.object.isRequired,
	toggleActiveCard: PropTypes.func.isRequired,
	activeCardID: PropTypes.string.isRequired,
};

export default BasicItemCard;
