import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { ModalBody, Modal, Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import qs from "qs";
import fetchWithToken from "../../../services/fetchWithToken";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import parseCraftingPricesData from "../../../services/parseCraftingPricesData";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import ModalPartWrapper from "./ModalPartWrapper";
import CraftButton from "./CraftButton";

import "../../../assets/scss/Storage/Merge/CraftingModal.scss";

import closeIcon from "../../../assets/img/header/close_menu.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";
import errorNotice from "../../../assets/img/icon/error_notice.svg";
import arrowRightIcon from "../../../assets/img/storage/arrow_right_icon.svg";
import getPrefixPower from "../../../services/getPrefixPower";

const marketProductsTypes = {
	miners: "miner",
	racks: "rack",
	mutation_components: "mutation_component",
};

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	balance: state.game.balance,
	wsNode: state.webSocket.wsNode,
});

class CraftingModal extends Component {
	static propTypes = {
		isShowComponentsModal: PropTypes.bool.isRequired,
		recipeID: PropTypes.string.isRequired,
		refreshMainData: PropTypes.func.isRequired,
		toggleShowComponentsModal: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			recipe: null,
			itemsPrices: {},
			resultLevelConfig: RARITY_DATA_BY_LEVEL[0],
			prevMinerConfig: RARITY_DATA_BY_LEVEL[0],
			currencyConfig: getCurrencyConfig("RLT"),
			allPartsAvailableToBuy: false,
			buyConfirmationID: "",
			isLoading: true,
			isProcessing: false,
			marketplaceAmount: [],
		};
		this.controllers = {};
		this.signals = {};
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

	componentDidMount() {
		const { wsNode } = this.props;
		this.initialization();
		if (wsNode && !wsNode.listenersMessage.soldUpdates) {
			wsNode.setListenersMessage({ soldUpdates: this.onWSNodeMessage });
		}
	}

	afterPurchaseRefresh = async () => {
		const { refreshMainData } = this.props;
		await this.initialization();
		await refreshMainData();
	};

	buyConfirmationHandler = (id) => {
		this.setState({
			buyConfirmationID: id || "",
		});
	};

	initialization = async () => {
		this.setState({ isLoading: true });
		const [newRecipe, newItemsPrices] = await Promise.all([this.fetchDetail(), this.fetchPrices()]);
		this.parseData(newRecipe, newItemsPrices);
	};

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("soldUpdates");
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "mutation_component_updated":
				this.updateItemSold(value);
				break;
			case "discount_sold_updated":
				this.updateItemDiscount(value);
				break;
			default:
				break;
		}
	};

	updateItemSold = (data) => {
		const { recipe, itemsPrices } = this.state;
		const currentItemName = Object.keys(itemsPrices).find((key) => itemsPrices[key].limit && itemsPrices[key].id === data.item_id && itemsPrices[key].sold < data.left_for_sale);
		if (currentItemName) {
			const updatedItemsPrices = { ...itemsPrices, [currentItemName]: { ...itemsPrices[currentItemName], sold: data.left_for_sale } };
			this.parseData(recipe, updatedItemsPrices);
		}
	};

	updateItemDiscount = (data) => {
		const { recipe, itemsPrices } = this.state;
		const currentItemName = Object.keys(itemsPrices).find(
			(key) => itemsPrices[key].discountID && itemsPrices[key].discountID === data.discount_id && itemsPrices[key].discountSold < data.left_for_sale
		);
		if (currentItemName) {
			const updatedItemsPrices = { ...itemsPrices, [currentItemName]: { ...itemsPrices[currentItemName], discountSold: data.left_for_sale } };
			this.parseData(recipe, updatedItemsPrices);
		}
	};

	fetchDetail = async () => {
		const { t, recipeID } = this.props;
		const apiUrl = `/api/storage/crafting-item?id=${recipeID}`;
		this.createSignalAndController("fetchDetail");
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.fetchDetail,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			const notAvailableProductsIds = [];
			json.data.required_items.forEach((item) => {
				if (item.user_count < item.count) {
					notAvailableProductsIds.push({ itemId: item._id, itemType: marketProductsTypes[item.type] });
				}
			});

			if (notAvailableProductsIds.length) {
				await this.getAmountMarketplaceProduct(notAvailableProductsIds);
			}
			this.setState({
				recipe: json.data,
				resultLevelConfig: RARITY_DATA_BY_LEVEL[json.data.result?.level || 0],
				prevMinerConfig: RARITY_DATA_BY_LEVEL[json.data.previous_miner_info?.level || 0],
				currencyConfig: getCurrencyConfig(json.data.currency),
			});
			return json.data;
		} catch (e) {
			console.error(e);
		}
	};

	getAmountMarketplaceProduct = async (arr) => {
		const { t } = this.props;
		const queryString = qs.stringify(arr);
		const apiUrl = `/api/storage/get-marketplace-items?${queryString}`;
		this.createSignalAndController("getAmountMarketplaceProduct");

		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.getAmountMarketplaceProduct,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			this.setState({
				marketplaceAmount: json.data,
			});
			return json.data;
		} catch (e) {
			console.error(e);
		}
	};

	fetchPrices = async () => {
		const { t, recipeID } = this.props;
		const apiUrl = `/api/storage/crafting-item-prices?id=${recipeID}`;
		this.createSignalAndController("fetchPrices");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.fetchPrices,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			const parsedData = json.data.reduce((acc, val) => {
				const { id, name, level, type, price, limit, sold, is_purchase_available: isPurchaseAvailable } = val;
				const fieldName = `${type}${id}`;
				acc[fieldName] = {
					id,
					name,
					level,
					price,
					limit,
					sold,
					isPurchaseAvailable,
				};
				if (val.discount_id) {
					const { discount_id: discountID, discount_price: discountPrice, discount_limit: discountLimit, discount_sold: discountSold } = val;
					acc[fieldName] = { ...acc[fieldName], discountID, discountPrice, discountLimit, discountSold };
				}
				return acc;
			}, {});
			return parsedData;
		} catch (e) {
			console.error(e);
		}
	};

	parseData = (recipe, prices) => {
		const { t, toggleShowComponentsModal } = this.props;
		if (!recipe || !Object.keys(recipe).length || !prices || !Object.keys(prices).length) {
			toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
			return toggleShowComponentsModal("");
		}
		const result = parseCraftingPricesData(recipe.required_items, prices);
		if (!result) {
			toast(this.constructor.renderToast(t("merge.messages.error"), errorNotice), this.toastDefaultConfig);
			return toggleShowComponentsModal("");
		}
		this.setState({
			...result,
			isLoading: false,
		});
	};

	render() {
		const { t, isMobile, balance, language, isShowComponentsModal, toggleShowComponentsModal } = this.props;
		const { recipe, itemsPrices, resultLevelConfig, prevMinerConfig, currencyConfig, buyConfirmationID, isLoading, marketplaceAmount } = this.state;
		const rltCurrencyConfig = getCurrencyConfig("RLT");
		return (
			<Modal size="lg" isOpen={!!isShowComponentsModal} toggle={() => toggleShowComponentsModal("")} centered className="crafting-modal">
				<ModalBody className="crafting-modal-body">
					<button className="tree-dimensional-button close-menu-btn btn-default crafting-modal-close-btn" onClick={() => toggleShowComponentsModal("")}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
						</span>
					</button>
					{!isLoading && (
						<Row className="crafting-list-wrapper">
							<Col xs={12} lg={6} className="result-item-description">
								<div className="result-item-title-wrapper">
									<p className="item-title-rarity" style={{ color: resultLevelConfig.color }}>
										{resultLevelConfig.title}
									</p>
									<p className="item-title">{recipe.result.name[language] || recipe.result.name.en}</p>
								</div>
								<div className="result-image-wrapper">
									<LazyLoadImage
										alt={recipe.result._id}
										height={isMobile ? 150 : 200}
										width={isMobile ? 189 : 252}
										src={`${process.env.STATIC_URL}/static/img/market/miners/${recipe.result.filename}.gif?v=1.0.0`}
										threshold={100}
										className="product-image"
										style={{ filter: `drop-shadow(0 0 8px #ffdc00)` }}
									/>
								</div>
								<div className="result-item-info">
									<div className="item-characteristic">
										<p>{t("merge.level")}</p>
										<div className="item-level-wrapper">
											<img className="item-level-img" src={`/static/img${prevMinerConfig.icon}`} width={22} height={16} alt={`level ${recipe.previous_miner_info.level || 0}`} />
											<img className="right-arrow-img" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
											<img className="item-level-img" src={`/static/img${resultLevelConfig.icon}`} width={22} height={16} alt={`level ${recipe.result?.level || 0}`} />
										</div>
									</div>
									<div className="item-characteristic">
										<p>{t("merge.power")}</p>
										<div className="item-level-wrapper">
											{recipe.previous_miner_info && (
												<Fragment>
													<span>
														{getPrefixPower(recipe.previous_miner_info.power).power} {getPrefixPower(recipe.previous_miner_info.power).hashDetail}
													</span>
													<img className="right-arrow-img upper" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
												</Fragment>
											)}
											<span className="accent-text">
												{getPrefixPower(recipe.result.power).power} {getPrefixPower(recipe.result.power).hashDetail}
											</span>
										</div>
									</div>
									<div className="item-characteristic">
										<p>{t("merge.bonus")}</p>
										<div className="item-level-wrapper">
											{recipe.previous_miner_info && (
												<Fragment>
													<span>{`${recipe.previous_miner_info.bonus_power / 100}%`}</span>
													<img className="right-arrow-img upper" src={arrowRightIcon} width={16} height={12} alt="upgrade" />
												</Fragment>
											)}
											<span className="accent-text">{`${recipe.result.bonus_power / 100}%`}</span>
										</div>
									</div>
								</div>
								<div className="all-stuff-buy-wrapper">
									<div className="total-price-wrapper">
										<p className="total-price-title">{t("merge.price")}</p>
										<p className={`total-price ${balance.rlt < recipe.price ? "not-enough" : ""}`}>
											{decimalAdjust(recipe.price / currencyConfig.toSmall, 4)} {recipe.currency}
										</p>
									</div>
									<CraftButton
										currentCraftingID={recipe.id}
										requiredItems={recipe.required_items}
										requiredItemsAvailable={balance.rlt >= recipe.price ? recipe.required_items_available : false}
										refreshMainData={this.afterPurchaseRefresh}
									/>
								</div>
							</Col>
							<Col xs={12} lg={6} className="items-list">
								<p className="required-items-title">{t("merge.components")}:</p>
								<div className="required-items-list">
									{recipe.required_items.map((component) => {
										const fieldName = `${component.type}${component.item_id}`;
										return (
											<ModalPartWrapper
												key={fieldName}
												componentPriceData={itemsPrices[fieldName]}
												component={component}
												rltCurrencyConfig={rltCurrencyConfig}
												marketProductsTypes={marketProductsTypes}
												afterPurchaseRefresh={this.afterPurchaseRefresh}
												buyConfirmationHandler={this.buyConfirmationHandler}
												buyConfirmationID={buyConfirmationID}
												marketplaceAmount={marketplaceAmount}
											/>
										);
									})}
								</div>
							</Col>
						</Row>
					)}
					{isLoading && (
						<div className="storage-preloader">
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
						</div>
					)}
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(CraftingModal));
