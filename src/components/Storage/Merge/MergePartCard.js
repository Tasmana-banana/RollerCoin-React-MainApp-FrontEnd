import React, { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CraftButton from "./CraftButton";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import QuantityInput from "../../SingleComponents/QuantityInput";

import "../../../assets/scss/Storage/Merge/MergePartCard.scss";

import arrowRightIcon from "../../../assets/img/storage/arrow_right_icon.svg";
import declineIcon from "../../../assets/img/storage/decline_icon.svg";
import successIcon from "../../../assets/img/storage/success_icon.svg";

const MergePartCard = ({ item, refreshMainData }) => {
	const { t } = useTranslation("Storage");
	const language = useSelector((state) => state.game.language);
	const balance = useSelector((state) => state.game.balance);
	const [quantity, setQuantity] = useState(1);
	const [totalSum, setTotalSum] = useState(item.price);
	const [isItemsAvailable, setIsItemsAvailable] = useState(item.required_items_available);
	const [craftConfirmationID, setCraftConfirmationID] = useState("");
	const resultLevelConfig = RARITY_DATA_BY_LEVEL[item.result?.level || 0];
	const prevMinerConfig = RARITY_DATA_BY_LEVEL[item.previous_mutation_component_info?.level || 0];
	const currencyConfig = getCurrencyConfig(item.currency);

	const craftConfirmationHandler = (id) => {
		setCraftConfirmationID(id || "");
	};

	const quantityHandler = (value) => {
		setQuantity(value);
		setTotalSum(value * item.price);
		const isAvailable = item.required_items.every((reqItem) => reqItem.count * value <= reqItem.user_count);
		setIsItemsAvailable(isAvailable);
	};

	const refrashAllDataAfterCrafting = async () => {
		quantityHandler(1);
		await refreshMainData();
	};

	return (
		<Col xs={12} lg={4} className="merge-card-container">
			<div className={`part-card-wrapper ${craftConfirmationID === item.id ? "confirmation" : ""}`}>
				<div className="part-card-header">
					<div className="result-image-wrapper">
						<LazyLoadImage
							alt={item.result._id}
							height={64}
							width={64}
							src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${item.result._id}.png?v=1.0.1`}
							threshold={100}
							className="product-image"
							style={{ opacity: item.required_items_available ? "1" : "0.3" }}
						/>
					</div>
					<div className="item-description">
						<p className="item-title" style={{ color: resultLevelConfig.color }}>
							{resultLevelConfig.title}
						</p>
						<p className="item-title">{item.result.name[language] || item.result.name.en}</p>
						<div className="item-characteristic">
							<p>{t("merge.level")}</p>
							<div className="item-level-wrapper">
								<img className="item-level-img" src={`/static/img${prevMinerConfig.icon}`} width={22} height={16} alt={`level ${prevMinerConfig.level || 0}`} />
								<img className="right-arrow-img" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
								<img className="item-level-img" src={`/static/img${resultLevelConfig.icon}`} width={22} height={16} alt={`level ${item.result?.level || 0}`} />
							</div>
						</div>
					</div>
				</div>
				<div className="card-footer-wrapper">
					<div className="condition-wrapper">
						<div className="condition-icon-wrapper">
							<img className="condition-icon" src={isItemsAvailable ? successIcon : declineIcon} width={16} height={16} alt="icon" />
						</div>
						<p className="condition-text">{t("merge.components")}:</p>
					</div>
					<div className="component-items-list">
						{item.required_items.map((requiredPart) => (
							<div key={requiredPart.id} className="component-item">
								<LazyLoadImage
									alt={requiredPart.item_id}
									height={32}
									width={32}
									src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${requiredPart.item_id}.png?v=1.0.1`}
									threshold={100}
									className="component-img"
									style={{ opacity: requiredPart.user_count < requiredPart.count * quantity ? "0.3" : "1" }}
								/>
								<p className="component-count-wrapper">
									<span className={`component-count ${requiredPart.user_count < requiredPart.count * quantity ? "red" : "green"}`}>{requiredPart.user_count}</span>
									<span className="component-count">/{requiredPart.count * quantity}</span>
								</p>
							</div>
						))}
					</div>
					<div className="price-block">
						<QuantityInput value={quantity} min={1} max={99} width={100} handler={quantityHandler} />
						<div className="price-wrapper">
							<p className="price-text">{t("merge.price")}</p>
							<p className={`price-value ${balance.rlt < totalSum ? "not-enough" : ""}`}>
								{decimalAdjust(totalSum / currencyConfig.toSmall, 4)} {item.currency}
							</p>
						</div>
					</div>
					<div className="buttons-wrapper">
						<CraftButton
							currentCraftingID={item.id}
							currentCraftingQuantity={quantity}
							requiredItemsAvailable={isItemsAvailable && balance[currencyConfig.code] >= totalSum}
							requiredItems={item.required_items}
							refreshMainData={refrashAllDataAfterCrafting}
							craftConfirmationHandler={craftConfirmationHandler}
							craftConfirmation={craftConfirmationID === item.id}
						/>
					</div>
				</div>
			</div>
		</Col>
	);
};

MergePartCard.propTypes = {
	item: PropTypes.object.isRequired,
	refreshMainData: PropTypes.func.isRequired,
};

export default MergePartCard;
