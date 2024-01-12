import React from "react";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ITEM_TYPE } from "../../../constants/Marketplace";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import MinerRatingStar from "../../SingleComponents/MinerRatingStar";
import RollerButton from "../../SingleComponents/RollerButton";
import threeDigitDivisor from "../../../services/threeDigitDivisor";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../helpers/getCurrencyConfig";

import "../../../assets/scss/Marketplace/OrdersItemCard.scss";

import deleteIcon from "../../../assets/img/marketplace/orders/delete_icon.svg";
import sellIcon from "../../../assets/img/marketplace/orders/sell_icon.svg";
import cartIcon from "../../../assets/img/marketplace/buy_icon.svg";

const ImageSourceBuilder = (type, id, imgVer) => {
	let img = "";
	switch (type) {
		case "miner": {
			img = `${process.env.STATIC_URL}/static/img/market/miners/${id}.gif?v=${imgVer}`;
			break;
		}
		case "rack": {
			img = `${process.env.STATIC_URL}/static/img/market/racks/${id}.png?v=1.0.3`;
			break;
		}
		case "mutation_component": {
			img = `${process.env.STATIC_URL}/static/img/storage/mutation_components/${id}.png?v=1.0.3`;
			break;
		}
		case "battery": {
			img = `${process.env.STATIC_URL}/static/img/market/batteries/${id}.png?v=1.0.3`;
			break;
		}
		default:
			break;
	}
	return img;
};

const cardBuilder = (activeTab) => {
	let btn = {};

	switch (activeTab) {
		case ITEM_TYPE.SALES_HISTORY: {
			btn = {
				imgSrc: sellIcon,
				text: "orders.cardSold",
			};
			break;
		}

		case ITEM_TYPE.MARKET_HISTORY: {
			btn = {
				imgSrc: cartIcon,
				text: "orders.cardPurchase",
			};
			break;
		}
		default:
			break;
	}

	return btn;
};

const OrdersItemCard = ({ item, activeTab, openDeleteModalHandler, openEditModalHandler }) => {
	const { t } = useTranslation("Marketplace");
	const language = useSelector((state) => state.game.language);
	const currentCurrencyConfig = getCurrencyConfig("RLT");

	const itemImg = ImageSourceBuilder(item.itemType, item.itemType === "miner" ? item.filename : item.itemId, item.imgVer);
	const imageSize = item.itemType === ITEM_TYPE.PART ? { width: 64, height: 64 } : { width: 126, height: 100 };

	return (
		<Col xs={12} lg={12} key={item.itemId} className={`miners-racks-card-container`}>
			<div className="card-wrapper">
				<div className="card-image-block">
					<div className="card-image-wrapper">
						{!!item.level && item.type === MINERS_TYPES.MERGE && (
							<img
								className={`collection-product-level-img-size-${item.width || 2}`}
								src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
								width={22}
								height={16}
								alt={item.level}
							/>
						)}
						<LazyLoadImage alt={item._id} height={imageSize.height} width={imageSize.width} src={itemImg} threshold={100} className="collection-product-image" />
						{!!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />}
					</div>
				</div>
				<div className="card-info-block">
					<div className="item-name">
						<p className="name-title">
							{!!item.level && item.type === MINERS_TYPES.MERGE && (
								<span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>
							)}
							{item.rarityGroup?.title && (
								<span className="rarity-title" style={{ color: `#${item.rarityGroup?.baseHexColor ? item.rarityGroup.baseHexColor : "ffffff"}` }}>
									{item.rarityGroup.title[language] || item.rarityGroup.title.en}{" "}
								</span>
							)}
							{item.name[language] || item.name.en}
						</p>
					</div>

					<ul className="orders-info-wrapper">
						<li className="details">
							<span className="details-name">{t("orders.unit")}</span>
							<span className="details-value price">
								{threeDigitDivisor(decimalAdjust(item.pricePerItem / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT
							</span>
						</li>
						<li className="details">
							{activeTab === ITEM_TYPE.ACTIVE && (
								<>
									<span className="details-name">{t("orders.sold")}</span>
									<span className="details-value">{item.soldCount}</span>
									<span className="detals-name">{t("orders.of")}</span>
									<span className="details-value">{item.quantity}</span>
								</>
							)}

							{activeTab !== ITEM_TYPE.ACTIVE && (
								<>
									<span className="details-name">{t("orders.quantity")}</span>
									<span className="details-value quantity">{item.quantity}</span>
								</>
							)}
						</li>
						<li className="details">
							<span className="details-name">{t("orders.listen")}</span>
							<span className="details-value">{dayjs(item.date).utc().format("MM.DD.YYYY")}</span>
						</li>
					</ul>
				</div>
				<div className="total-block">
					<p className="total-price">
						total{" "}
						<span className="price">
							{threeDigitDivisor(decimalAdjust((item.pricePerItem * item.quantity) / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision), "space")} RLT
						</span>
					</p>

					<div className="button-block">
						{activeTab === ITEM_TYPE.ACTIVE && (
							<>
								<RollerButton
									className="edit-button orders-button"
									color="cyan"
									text={t("orders.btnEdit")}
									action={() =>
										openEditModalHandler(
											item.orderId,
											item.name[language] || item.name.en,
											itemImg,
											decimalAdjust(item.pricePerItem / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision),
											item.quantity,
											item.itemType,
											item.itemId,
											item.exchangeCurrency,
											{ level: item?.level, type: item?.type, width: item?.width }
										)
									}
								/>
								<RollerButton className="delete-button orders-button" icon={deleteIcon} action={() => openDeleteModalHandler(item.orderId, item.itemType)} />
							</>
						)}
						{activeTab !== ITEM_TYPE.ACTIVE && (
							<div className="sold">
								<img className="sold-icon" src={cardBuilder(activeTab).imgSrc} alt={t(cardBuilder(activeTab).text)} />
								<span className="sold-text">{t(cardBuilder(activeTab).text)}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</Col>
	);
};

OrdersItemCard.propTypes = {
	item: PropTypes.object.isRequired,
	openEditModalHandler: PropTypes.func.isRequired,
	openDeleteModalHandler: PropTypes.func.isRequired,
	activeTab: PropTypes.string.isRequired,
};

export default OrdersItemCard;
