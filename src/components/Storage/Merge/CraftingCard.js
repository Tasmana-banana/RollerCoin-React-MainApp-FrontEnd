import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CraftButton from "./CraftButton";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import getPrefixPower from "../../../services/getPrefixPower";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";

import "../../../assets/scss/Storage/Merge/CraftingCard.scss";

import arrowRightIcon from "../../../assets/img/storage/arrow_right_icon.svg";
import screwIcon from "../../../assets/img/storage/screw.svg";
import declineIcon from "../../../assets/img/storage/decline_icon.svg";
import successIcon from "../../../assets/img/storage/success_icon.svg";

const imgSrc = (type, id, imgVer) => {
	let src = "";
	switch (type) {
		case "miners":
			src = `${process.env.STATIC_URL}/static/img/market/miners/${id}.gif?v=${imgVer}`;
			break;
		case "mutation_components":
			src = `${process.env.STATIC_URL}/static/img/storage/mutation_components/${id}.png?v=1.0.1`;
			break;
		case "racks":
			src = `${process.env.STATIC_URL}/static/img/market/racks/${id}.png?v=1.0.1`;
			break;
		case "batteries":
			src = `${process.env.STATIC_URL}/static/img/market/batteries/${id}.png?v=1.0.1`;
			break;
		default:
			src = "";
	}
	return src;
};

const CraftingCard = ({ item, toggleShowComponentsModal, refreshMainData, craftConfirmationHandler, craftConfirmationID }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	const balance = useSelector((state) => state.game.balance);
	const resultLevelConfig = RARITY_DATA_BY_LEVEL[item.result?.level || 0];
	const prevMinerConfig = RARITY_DATA_BY_LEVEL[item.previous_miner_info?.level || 0];
	const currency = getCurrencyConfig(item.currency);
	return (
		<Col xs={12} lg={4} key={item.id} className="merge-card-container">
			<div className={`card-wrapper ${craftConfirmationID === item.id ? "confirmation" : ""}`}>
				<p className="item-title" style={{ color: resultLevelConfig.color }}>
					{resultLevelConfig.title}
				</p>
				<p className="item-title">{item.result.name[language] || item.result.name.en}</p>
				<div className="result-image-wrapper">
					<LazyLoadImage
						alt={item.result._id}
						height={150}
						width={189}
						src={imgSrc(item.type, item.type === "miners" ? item.result.filename : item.result._id, item.result.img_ver)}
						threshold={100}
						className="product-image"
						style={{ filter: `drop-shadow(0 0 8px #ffdc00)`, opacity: !item.required_items_available ? "0.3" : "1" }}
					/>
				</div>
				<div className="item-description">
					<div className="item-characteristic">
						<p>{t("merge.level")}</p>
						<div className="item-level-wrapper">
							<img className="item-level-img" src={`/static/img${prevMinerConfig.icon}`} width={22} height={16} alt={`level ${prevMinerConfig.level || 0}`} />
							<img className="right-arrow-img" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
							<img className="item-level-img" src={`/static/img${resultLevelConfig.icon}`} width={22} height={16} alt={`level ${item.result?.level || 0}`} />
						</div>
					</div>
					<div className="item-characteristic">
						<p>{t("merge.power")}</p>
						<div className="item-level-wrapper">
							{item.previous_miner_info && (
								<Fragment>
									<span>
										{getPrefixPower(item.previous_miner_info.power).power} {getPrefixPower(item.previous_miner_info.power).hashDetail}
									</span>
									<img className="right-arrow-img upper" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
								</Fragment>
							)}
							<span className="accent-text">
								{getPrefixPower(item.result.power).power} {getPrefixPower(item.result.power).hashDetail}
							</span>
						</div>
					</div>
					<div className="item-characteristic">
						<p>{t("merge.bonus")}</p>
						<div className="item-level-wrapper">
							{item.previous_miner_info && (
								<Fragment>
									<span>{`${item.previous_miner_info.bonus_power / 100}%`}</span>
									<img className="right-arrow-img upper" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
								</Fragment>
							)}
							<span className="accent-text">{`${item.result.bonus_power / 100}%`}</span>
						</div>
					</div>
				</div>
				<div className="card-footer-wrapper">
					<div className="condition-wrapper">
						<div className="condition-icon-wrapper">
							<img className="condition-icon" src={item.required_items_available ? successIcon : declineIcon} width={16} height={16} alt="icon" />
						</div>
						<p className="condition-text">{t("merge.components")}:</p>
					</div>
					<Row noGutters className="components-list">
						{item.required_items.map((component) => (
							<Col xs={6} key={component.item_id} className="component-list-col">
								<div className="component-list-item">
									{component.type === "miners" && (
										<img className="component-item-level-img" src={`/static/img${RARITY_DATA_BY_LEVEL[component.level || 0].icon}`} width={22} height={16} alt={component.level} />
									)}
									<LazyLoadImage
										alt={component.item_id}
										height={component.type === "miners" ? 50 : 32}
										width={component.type === "miners" ? 63 : 32}
										src={imgSrc(component.type, component.type === "miners" ? component.filename : component.item_id, component.img_ver)}
										threshold={100}
										className="component-img"
										style={{ opacity: component.count > component.user_count ? "0.3" : "1" }}
									/>
									<p className="component-count-wrapper">
										<span className={`component-count ${component.user_count < component.count ? "red" : "green"}`}>{component.user_count}</span>
										<span className="component-count">/{component.count}</span>
									</p>
								</div>
							</Col>
						))}
					</Row>
					<div className="price-wrapper">
						<p className="price-text">{t("merge.price")}</p>
						<p className={`price-value ${balance.rlt < item.price ? "not-enough" : ""}`}>
							{decimalAdjust(item.price / currency.toSmall, 4)} {item.currency}
						</p>
					</div>
					{item.required_items_available && balance.rlt >= item.price && (
						<div className="buttons-wrapper">
							<CraftButton
								currentCraftingID={item.id}
								requiredItemsAvailable={item.required_items_available}
								requiredItems={item.required_items}
								refreshMainData={refreshMainData}
								craftConfirmationHandler={craftConfirmationHandler}
								craftConfirmation={craftConfirmationID === item.id}
							/>
							{craftConfirmationID !== item.id && (
								<button
									type="button"
									className="small-view-btn tree-dimensional-button btn-default"
									onClick={() => {
										toggleShowComponentsModal(item.id);
									}}
								>
									<span className="detail-btn">
										<img src={screwIcon} width={24} height={24} alt="details" />
									</span>
								</button>
							)}
						</div>
					)}
					{!item.required_items_available && (
						<div className="buttons-wrapper">
							<button type="button" className="view-btn tree-dimensional-button btn-default w-100" onClick={() => toggleShowComponentsModal(item.id)}>
								<span className="with-horizontal-image">
									<div className="btn-icon">
										<img src={screwIcon} width={24} height={25} alt="details" />
									</div>
									<span>{t("merge.view")}</span>
								</span>
							</button>
						</div>
					)}
					{balance.rlt < item.price && item.required_items_available && (
						<div className="buttons-wrapper">
							<button type="button" className="view-btn tree-dimensional-button btn-default w-100" onClick={() => toggleShowComponentsModal(item.id)}>
								<span className="with-horizontal-image">
									<div className="btn-icon">
										<img src={screwIcon} width={24} height={25} alt="details" />
									</div>
									<span>{t("merge.view")}</span>
								</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</Col>
	);
};

CraftingCard.propTypes = {
	item: PropTypes.object.isRequired,
	toggleShowComponentsModal: PropTypes.func.isRequired,
	refreshMainData: PropTypes.func.isRequired,
	craftConfirmationID: PropTypes.string.isRequired,
	craftConfirmationHandler: PropTypes.func.isRequired,
};

export default CraftingCard;
