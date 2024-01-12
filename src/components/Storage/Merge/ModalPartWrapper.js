import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import cartIcon from "../../../assets/img/cart_white.svg";
import marketplaceIcon from "../../../assets/img/icon/marketplace_icon.svg";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import decimalAdjust from "../../../services/decimalAdjust";
import fetchWithToken from "../../../services/fetchWithToken";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";

import successIcon from "../../../assets/img/storage/success_icon.svg";
import errorNotice from "../../../assets/img/icon/error_notice.svg";
import cartSuccessIcon from "../../../assets/img/icon/cart_successfully_notice.svg";
import moveToInventory from "../../../assets/img/storage/inventory/moveToInventory.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	balance: state.game.balance,
});

const imagesConfig = {
	miners: {
		path: `${process.env.STATIC_URL}/static/img/market/miners/`,
		ending: ".gif?v=1.0.0",
	},
	racks: {
		path: `${process.env.STATIC_URL}/static/img/market/racks/`,
		ending: ".png?v=1.0.3",
	},
};
const PRICE_DIGITS_AMOUNT = 3;

class ModalPartWrapper extends Component {
	static propTypes = {
		componentPriceData: PropTypes.object.isRequired,
		component: PropTypes.object.isRequired,
		rltCurrencyConfig: PropTypes.object.isRequired,
		afterPurchaseRefresh: PropTypes.func.isRequired,
		marketProductsTypes: PropTypes.object.isRequired,
		buyConfirmationHandler: PropTypes.func.isRequired,
		buyConfirmationID: PropTypes.string.isRequired,
		language: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		history: PropTypes.object.isRequired,
		marketplaceAmount: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isProcessing: false,
			shortageQuantity: 0,
			holdUserCount: 0,
			price: 0,
			totalSum: 0,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
	}

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	componentDidMount() {
		const { component, componentPriceData } = this.props;
		const price = componentPriceData.discountPrice ? componentPriceData.discountPrice : componentPriceData.price;
		const holdUserCount = !component.user_items ? 0 : component.user_items.filter((item) => !item.is_in_inventory).length;
		this.setState({
			price,
			holdUserCount,
		});
		if (component.count > component.user_count && componentPriceData.isPurchaseAvailable) {
			const shortageQuantity = component.count - component.user_count;
			this.setState({
				shortageQuantity,
				totalSum: shortageQuantity * price,
			});
		}
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	buyProduct = async () => {
		const { component, afterPurchaseRefresh, marketProductsTypes, buyConfirmationHandler, t } = this.props;
		const { shortageQuantity } = this.state;
		this.createSignalAndController();
		this.setState({ isProcessing: true });
		try {
			const json = await fetchWithToken(`/api/market/buy-product`, {
				method: "POST",
				body: JSON.stringify({
					id: component.item_id,
					qty: shortageQuantity,
					type: marketProductsTypes[component.type],
					is_promo: false,
					is_season_store_purchase: false,
					is_sales_purchase: false,
				}),
				signal: this.signal,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("merge.messages.failedPurchase"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			toast(this.constructor.renderToast(t("merge.messages.successPurchase"), cartSuccessIcon), this.toastDefaultConfig);
			buyConfirmationHandler();
			await afterPurchaseRefresh();
		} catch (e) {
			buyConfirmationHandler();
			console.error(e);
		} finally {
			this.setState({
				isProcessing: false,
			});
		}
	};

	moveMinerToInventory = async (minerID) => {
		this.createSignalAndController();
		const json = await fetchWithToken(`/api/game/move-miner-to-inventory`, {
			method: "POST",
			body: JSON.stringify({ miner_id: minerID }),
			signal: this.signal,
		});
		if (!json.success) {
			throw new Error(json.error);
		}
	};

	moveMinersToInventory = async () => {
		const { t, afterPurchaseRefresh, component } = this.props;
		const { user_items: userItems, user_count: userAmount, count: requiredCount } = component;
		try {
			const requiredItemsCount = requiredCount - userAmount;
			if (requiredItemsCount <= 0) {
				return true;
			}
			const availableItems = userItems.filter((item) => !item.is_in_inventory).map((item) => item.id);
			const minersShouldBeUnmounted = availableItems.slice(0, requiredItemsCount);
			this.setState({ isProcessing: true });
			for (let i = 0; i < minersShouldBeUnmounted.length; i += 1) {
				// eslint-disable-next-line no-await-in-loop
				await this.moveMinerToInventory(minersShouldBeUnmounted[i]);
			}
			await afterPurchaseRefresh();
			this.setState({ isProcessing: false });
		} catch (e) {
			console.error(e);
			toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
			this.setState({ isProcessing: false });
		}
	};

	render() {
		const { componentPriceData, component, rltCurrencyConfig, buyConfirmationHandler, buyConfirmationID, t, language, balance, history, marketplaceAmount } = this.props;
		const { isProcessing, holdUserCount, totalSum } = this.state;
		const isShortage = component.count > component.user_count;
		const rarityData = RARITY_DATA_BY_LEVEL[component.level || 0];
		const marketplaceAvailableData = marketplaceAmount.find((item) => item.itemId === component._id);

		return (
			<Fragment key={component.item_id}>
				{["miners", "racks"].includes(component.type) && (
					<div className={`required-main-container ${isShortage && !holdUserCount ? "not-available" : ""} ${holdUserCount && isShortage ? "user-hold" : ""}`}>
						<div className="required-main-wrapper">
							<div className="required-item-img">
								<img
									className="product-image"
									src={`${imagesConfig[component.type].path}${component.type === "miners" ? component.filename : component.item_id}${imagesConfig[component.type].ending}`}
									width={126}
									height={100}
									alt={component.item_id}
								/>
								{!isShortage && <img className="success-icon" src={isShortage ? "" : successIcon} width={24} height={24} alt="icon" />}
							</div>
							<div className="required-item-description">
								<p className="item-title">
									<span className="item-title-rarity" style={{ color: rarityData.color }}>
										{rarityData.title}
									</span>
									<span>{component.name ? component.name[language] || component.name.en : ""}</span>
								</p>
								<p className="item-quantity">
									<span className="item-user-quantity">{component.user_count}</span>/{component.count}
								</p>
								{isShortage && componentPriceData.isPurchaseAvailable && (
									<Fragment>
										<p className="item-price">
											<span>{t("merge.price")}: </span>
											<span className="item-price-value">{decimalAdjust(totalSum / rltCurrencyConfig.toSmall, PRICE_DIGITS_AMOUNT)} RLT</span>
										</p>
										<div className="product-buy-button-wrapper w-100">
											<button
												type="button"
												className="tree-dimensional-button btn-default w-100"
												onClick={() => buyConfirmationHandler(component.item_id)}
												disabled={balance.rlt < totalSum}
												hidden={buyConfirmationID === component.item_id}
											>
												<span className="with-horizontal-image flex-lg-row button-text-wrapper">
													<img src={cartIcon} height={23} width={24} alt="cart" />
													{component.type === "miners" && <span className="btn-text">{t("merge.buyMiner")}</span>}
													{component.type === "racks" && <span className="btn-text">{t("merge.buyRack")}</span>}
												</span>
											</button>
											<div className="confirmation-wrapper" hidden={buyConfirmationID !== component.item_id}>
												<div className="confirmation-buttons">
													<button type="button" className="tree-dimensional-button btn-cyan" disabled={isProcessing} onClick={this.buyProduct}>
														<span className="btn-text">{t("merge.yes")}</span>
													</button>
													<button type="button" className="tree-dimensional-button btn-red" disabled={isProcessing} onClick={buyConfirmationHandler}>
														<span className="btn-text">{t("merge.no")}</span>
													</button>
												</div>
											</div>
										</div>
									</Fragment>
								)}
								{isShortage && marketplaceAvailableData && !componentPriceData.isPurchaseAvailable && (
									<Fragment>
										<p className="item-price">
											<span>{t("merge.priceFrom")}: </span>
											<span className="item-price-value">{decimalAdjust(marketplaceAvailableData.price / rltCurrencyConfig.toSmall, PRICE_DIGITS_AMOUNT)} RLT</span>
										</p>
										<div className="product-buy-button-wrapper w-100">
											<button
												type="button"
												className="tree-dimensional-button btn-default w-100"
												onClick={() => history.push(`${getLanguagePrefix(language)}/marketplace/buy/${marketplaceAvailableData.itemType}/${marketplaceAvailableData.itemId}`)}
												disabled={balance.rlt < marketplaceAvailableData.price}
												hidden={buyConfirmationID === component.item_id}
											>
												<span className="with-horizontal-image flex-lg-row button-text-wrapper">
													<img src={marketplaceIcon} height={23} width={24} alt="cart" />
													{component.type === "miners" && <span className="btn-text">{t("merge.buyMiner")}</span>}
													{component.type === "racks" && <span className="btn-text">{t("merge.buyRack")}</span>}
												</span>
											</button>
											<div className="confirmation-wrapper" hidden={buyConfirmationID !== component.item_id}>
												<div className="confirmation-buttons">
													<button type="button" className="tree-dimensional-button btn-cyan" disabled={isProcessing} onClick={this.buyProduct}>
														<span className="btn-text">{t("merge.yes")}</span>
													</button>
													<button type="button" className="tree-dimensional-button btn-red" disabled={isProcessing} onClick={buyConfirmationHandler}>
														<span className="btn-text">{t("merge.no")}</span>
													</button>
												</div>
											</div>
										</div>
									</Fragment>
								)}
								{isShortage && !marketplaceAvailableData && !componentPriceData.isPurchaseAvailable && (
									<div className="sold-out-plug">
										<p>{t("merge.soldOut")}</p>
									</div>
								)}
							</div>
						</div>
						{isShortage && !marketplaceAvailableData && !componentPriceData.isPurchaseAvailable && !holdUserCount && (
							<div className="required-main-get-wrapper">
								<p className="required-main-get-title">{t("merge.howGet")}:</p>
								<p className="required-main-get-text">{component.description ? component.description[language] || component.description.en : ""}</p>
							</div>
						)}
						{isShortage && !!holdUserCount && (
							<div className="required-main-get-wrapper">
								<p className="required-main-get-text">
									<span>{t("merge.youGot")} </span>
									<b className="cyan-text">{holdUserCount}</b>
									<span> {t("merge.arePlaced")}</span>
								</p>
								<div className="move-to-inventory-btn-container">
									<button className="tree-dimensional-button btn-default w-100" onClick={this.moveMinersToInventory} disabled={isProcessing}>
										<span className="with-horizontal-image">
											<span className="btn-icon">
												<img src={moveToInventory} width={24} height={24} alt="moveToInventory" />
											</span>
											<span className="btn-text">{t("merge.moveToInventory")}</span>
										</span>
									</button>
								</div>
							</div>
						)}
					</div>
				)}
				{component.type === "mutation_components" && (
					<div className={`required-part-wrapper ${isShortage ? "not-available" : ""}`}>
						<div className="required-item-img">
							<img
								className="product-image"
								src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${component.item_id}.png?v=1.0.1`}
								width={48}
								height={48}
								alt={component.item_id}
							/>
							{!isShortage && <img className="success-icon" src={isShortage ? "" : successIcon} width={16} height={16} alt="icon" />}
						</div>
						{buyConfirmationID !== component.item_id && (
							<div className="required-item-description">
								<p className="item-title">
									<span className="item-title-rarity" style={{ color: rarityData.color }}>
										{rarityData.title}
									</span>
									<span>{component.name[language] || component.name.en}</span>
								</p>
								<p className="item-quantity">
									<span className="item-user-quantity">{component.user_count}</span>/{component.count}
								</p>

								{isShortage && marketplaceAvailableData && (
									<Fragment>
										<p className="item-price">
											<span>{t("merge.priceFrom")}: </span>
											<span className="item-price-value">{decimalAdjust(marketplaceAvailableData.price / rltCurrencyConfig.toSmall, PRICE_DIGITS_AMOUNT)} RLT</span>
										</p>
										<div className="product-buy-button-wrapper">
											<button
												type="button"
												className="tree-dimensional-button btn-default"
												onClick={() => history.push(`${getLanguagePrefix(language)}/marketplace/buy/mutation_component/${component._id}`)}
											>
												<span className="button-image-wrapper">
													<img src={marketplaceIcon} height={24} width={24} alt="marketplace" />
												</span>
											</button>
										</div>
									</Fragment>
								)}
								{isShortage && !marketplaceAvailableData && (
									<div className="product-buy-button-wrapper">
										<span className="sold-out-plug">{t("merge.soldOut")}</span>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(withRouter(ModalPartWrapper)));
