import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Container, Row, Col, Progress } from "reactstrap";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import QuantityInput from "../../../components/SingleComponents/QuantityInput";
import BonusBoxModal from "../../../components/Market/BonusBoxModal";
import MinerRatingStar from "../../../components/SingleComponents/MinerRatingStar";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import fetchWithToken from "../../../services/fetchWithToken";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import threeDigitDivisor from "../../../services/threeDigitDivisor";
import progressionEventRewardToast from "../../../services/progressionEventRewardToast";
import progressionEventTaskToast from "../../../services/progressionEventTaskToast";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";

import "../../../assets/scss/Landings/LandingSaleEvent.scss";
import "../../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";
import "../../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";
import cartIcon from "../../../assets/img/cart.svg";
import cartDisabledIcon from "../../../assets/img/cart_disabled.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
	wsNode: state.webSocket.wsNode,
});

class LandingSaleEvent extends Component {
	static propTypes = {
		balance: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			eventID: "",
			title: { en: "", cn: "" },
			description: { en: "", cn: "" },
			imagesUrl: {
				top_banner: "",
				pedestal_img: "",
				item_img: "",
			},
			item: {
				id: "",
				type: "",
				title: { en: "", cn: "" },
				price: 0,
				currency: "RLT",
				limit: 0,
				limitPerUser: 0,
				countUserPurchased: 0,
				power: 0,
				width: 1,
			},
			isOpenPresentationModal: false,
			boxContent: {
				amount: 0,
				baseColor: "ffffff",
				itemId: null,
				lootBoxId: null,
				type: null,
				name: null,
				power: 0,
			},
			itemsSold: 0,
			progress: 0,
			quantity: 1,
			maxQuantity: 0,
			leftPurchase: 0,
			isLoading: true,
			isProcessed: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	static renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt="status icon" />
			<span>{text}</span>
		</div>
	);

	static getAmountByType = (data) => {
		const { type, amount } = data;
		const isMoney = ["RLT", "RST"].includes(type);
		if (isMoney) {
			const currencyConfig = getCurrencyConfig(type);
			return decimalAdjust(amount / currencyConfig.toSmall, 2);
		}
		return amount;
	};

	async componentDidMount() {
		this.initialization();
	}

	initialization = async () => {
		const { wsNode } = this.props;
		await this.getEventConfig();
		if (wsNode && !wsNode.listenersMessage.landingSaleUpdate) {
			wsNode.setListenersMessage({ landingSaleUpdate: this.onWSNodeMessage });
		}
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { item, itemsSold } = this.state;
		if (this.props.balance[item.currency.toLowerCase()] !== prevProps.balance[item.currency.toLowerCase()] || prevState.itemsSold !== itemsSold) {
			this.calculateMaxQuantityAndProgress();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("landingSaleUpdate");
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
			case "landing_sale_event_updated":
				this.updateOnWS(value);
				break;
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			case "pe_user_task_update":
				if (!value.event_type || value.event_type === "default") {
					progressionEventTaskToast(value);
				}
				break;
			default:
				break;
		}
	};

	updateOnWS = (data) => {
		const { items_sold: itemsSold } = data;
		this.setState({ itemsSold });
	};

	calculateMaxQuantityAndProgress = (updatedItem) => {
		const { item, itemsSold } = this.state;
		const currentItem = updatedItem || item;
		let maxQuantity = 0;
		let progress = 0;
		let leftPurchase = 0;
		let limitPerUser = ["trophy", "hat", "appearance"].includes(item.type) ? 1 : currentItem.limitPerUser;

		if (currentItem.limit && limitPerUser) {
			maxQuantity = Math.min(currentItem.limit - itemsSold, limitPerUser - currentItem.countUserPurchased);
			leftPurchase = Math.min(currentItem.limit - itemsSold, limitPerUser - currentItem.countUserPurchased);
			progress = ((leftPurchase / limitPerUser) * 100).toFixed(2);
		}
		if (!currentItem.limit && limitPerUser) {
			maxQuantity = limitPerUser - currentItem.countUserPurchased;
			leftPurchase = limitPerUser - currentItem.countUserPurchased;
			progress = ((leftPurchase / limitPerUser) * 100).toFixed(2);
		}
		if (currentItem.limit && !limitPerUser) {
			maxQuantity = currentItem.limit - itemsSold;
			leftPurchase = currentItem.limit - itemsSold;
			progress = ((leftPurchase / currentItem.limit) * 100).toFixed(2);
		}
		if (maxQuantity < 0) {
			maxQuantity = 0;
		}
		if (!currentItem.limit && !limitPerUser) {
			maxQuantity = 99;
		}

		if (maxQuantity && ["loot_box", "trophy", "hat", "appearance"].includes(item.type)) {
			maxQuantity = 1;
		}
		this.setState({
			maxQuantity,
			leftPurchase,
			progress,
			item: { ...currentItem, limitPerUser },
		});
	};

	handleQuantityChange = (value) => {
		this.setState({ quantity: value });
	};

	toggleButtons = () => {
		const { isBuyConfirmationOpen } = this.state;
		this.setState({ isBuyConfirmationOpen: !isBuyConfirmationOpen });
	};

	buyItem = async () => {
		const { isMobile, wsReact, t } = this.props;
		const { eventID, item, quantity } = this.state;
		this.createSignalAndController("buyItem");
		try {
			this.setState({ isProcessed: true, isBuyConfirmationOpen: false });
			const json = await fetchWithToken("/api/game/buy-item", {
				method: "POST",
				body: JSON.stringify({ eventID, itemID: item.id, itemType: item.type, qty: quantity }),
				signal: this.signals.buyItem,
			});
			if (!json.success) {
				const errorText = json.error ? json.error : "Error";
				toast(this.constructor.renderToast(errorText, "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
				return false;
			}
			toast(this.constructor.renderToast(t("main.buySuccess"), "success_notice"), {
				position: `${isMobile ? "bottom-left" : "top-left"}`,
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			const updatedItem = { ...item, countUserPurchased: item.countUserPurchased + quantity };
			this.setState({
				quantity: 1,
				item: updatedItem,
			});
			if (json.data.item_type === "loot_box") {
				const amountPrecision = this.constructor.getAmountByType(json.data);
				this.setState({
					isOpenPresentationModal: true,
					boxContent: {
						amount: amountPrecision,
						baseColor: json.data.base_color_hex,
						itemId: json.data.item_id,
						lootBoxId: json.data.loot_box_id,
						type: json.data.type,
						name: json.data.name,
						power: json.data.power || 0,
						filename: json.data.filename || "",
					},
				});
			}
			wsReact.send(
				JSON.stringify({
					cmd: "balance_request",
				})
			);
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isProcessed: false });
		}
	};

	getEventConfig = async () => {
		const { history, language } = this.props;
		try {
			this.createSignalAndController("getEventConfig");
			this.setState({ isLoading: true });
			const json = await fetchWithToken("/api/game/landing-data", {
				method: "GET",
				signal: this.signals.getEventConfig,
			});
			if (!json.success || !json.data) {
				return history.push(`${getLanguagePrefix(language)}/404`);
			}
			const { eventID, title, description, imagesUrl, item } = json.data;
			this.setState({
				eventID,
				title,
				description,
				imagesUrl,
				item,
				itemsSold: item.itemsSold,
				isLoading: false,
			});
			this.calculateMaxQuantityAndProgress(item);
		} catch (e) {
			console.error(e);
		}
	};

	closeModal = () => this.setState({ isOpenPresentationModal: false });

	render() {
		const { isMobile, language, t } = this.props;
		const { title, description, imagesUrl, item, leftPurchase, isBuyConfirmationOpen, isLoading, isProcessed, progress, quantity, maxQuantity, isOpenPresentationModal, boxContent } = this.state;
		const currentCurrencyConfig = getCurrencyConfig(item.currency);
		const maxQuantityByBalance = Math.floor(this.props.balance[currentCurrencyConfig.code] / (item.price / currentCurrencyConfig.divider));
		const price = decimalAdjust((item.price * quantity) / currentCurrencyConfig.toSmall / currentCurrencyConfig.divider, currentCurrencyConfig.precision);

		return (
			<Fragment>
				{isOpenPresentationModal && <BonusBoxModal isOpen={isOpenPresentationModal} closeModal={this.closeModal} boxContent={boxContent} language={language} />}
				<div className="event-container">
					<div className="event-top-banner-wrapper">
						{!!imagesUrl.top_banner && (
							<img className="event-top-banner" src={`${process.env.STATIC_URL}${imagesUrl.top_banner}`} width={isMobile ? 992 : 1440} height={isMobile ? 176 : 256} alt="top banner" />
						)}
					</div>
					<div className="gradient">
						{isLoading && (
							<div className="table-loader">
								<div>
									<img src={loaderImg} height={126} width={126} alt="Loading..." />
								</div>
							</div>
						)}
						{!isLoading && (
							<Container>
								<Row>
									<Col xs={12} lg={{ size: 6, offset: 3 }}>
										<div className="pedestal-container">
											<div className="main-item-container">
												{!!item.level && item.miner_type === MINERS_TYPES.MERGE && (
													<img
														className={`collection-product-level-img-size-${item.width || 2}`}
														src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
														width={16}
														height={13}
														alt={item.level}
													/>
												)}
												<img className={`main-item-img ${item.type}`} src={`${process.env.STATIC_URL}${imagesUrl.item_img}?v=1.0.1`} width="126" height="100" alt="main item" />
												{!!item.level && item.miner_type === MINERS_TYPES.OLD_MERGE && (
													<MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />
												)}
											</div>
											{!!imagesUrl.pedestal_img && <img src={`${process.env.STATIC_URL}${imagesUrl.pedestal_img}`} alt="pedestal" />}
										</div>
										<div className="progress-container">
											<Progress value={progress} className="progress-block" />
											<p className={`progress-number ${language}`}>
												{!!item.limit && !!item.limitPerUser && (
													<Fragment>
														{leftPurchase} / {item.limitPerUser} {t("left")}
													</Fragment>
												)}
												{!!item.limit && !item.limitPerUser && (
													<Fragment>
														{leftPurchase} / {item.limit} {t("left")}
													</Fragment>
												)}
												{!item.limit && !!item.limitPerUser && (
													<Fragment>
														{leftPurchase} / {item.limitPerUser} {t("left")}
													</Fragment>
												)}
												{!item.limit && !item.limitPerUser && t("unlimited")}
											</p>
										</div>
									</Col>
									<Col xs={12} lg={{ size: 6, offset: 3 }}>
										<div className="event-info-container">
											<div className="event-description-wrapper">
												<div className="event-item-info">
													<p className="item-name">{item.title[language] || item.title.en}</p>
													{item.type === "miner" && (
														<p className="item-info">
															<span className="accent-color">{t("cells")}</span> {item.width} / <span className="light-green-color">{t("power")}</span>
															{threeDigitDivisor(item.power, "dot")} Gh/s
														</p>
													)}
												</div>
												<div className="event-inner-title" dangerouslySetInnerHTML={{ __html: title[language] || title.en }} />
												<div className="event-inner-description" dangerouslySetInnerHTML={{ __html: description[language] || description.en }} />
											</div>
											<div className="change-quantity-wrapper">
												<QuantityInput className="input-quantity" value={quantity} min={1} max={maxQuantity} width={110} handler={this.handleQuantityChange} />
												<div className="total-price">
													<p>
														<span className="product-price-title">{t("price")}</span>
														<span>
															{price} {currentCurrencyConfig.name}
														</span>
													</p>
												</div>
											</div>
											{!!item.limitPerUser && (
												<div className="limit-text-wrapper">
													<p className="limit-text">
														{t("main.canBuy")} {item.limitPerUser} {t(`landingSaleEvent.${item.type}`)} {t("main.onYourAccount")}
													</p>
												</div>
											)}
											<div className="miner-buy-button">
												{!isBuyConfirmationOpen && (
													<button
														type="button"
														className="tree-dimensional-button btn-cyan w-100"
														disabled={!maxQuantity || !quantity || isProcessed || !maxQuantityByBalance}
														onClick={this.toggleButtons}
													>
														<span className="with-horizontal-image flex-lg-row button-text-wrapper">
															<img src={maxQuantity ? cartIcon : cartDisabledIcon} width="19" height="19" alt="cart" />
															{!!maxQuantityByBalance && (
																<span className="btn-text">{maxQuantity ? `${t("main.buy")} ${t(`landingSaleEvent.${item.type}`)}` : `${t("main.soldOut")}`}</span>
															)}
															{!maxQuantityByBalance && <span className="btn-text">{maxQuantity ? `${t("main.notEnough")}` : `${t("main.soldOut")}`}</span>}
														</span>
													</button>
												)}
												{isBuyConfirmationOpen && (
													<div className="action-buttons">
														<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled={isProcessed} onClick={this.buyItem}>
															<span className="btn-text">{t("main.yes")}</span>
														</button>
														<button type="button" className="tree-dimensional-button btn-danger w-100" disabled={isProcessed} onClick={this.toggleButtons}>
															<span className="btn-text">{t("main.no")}</span>
														</button>
													</div>
												)}
											</div>
										</div>
									</Col>
								</Row>
							</Container>
						)}
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withRouter(withTranslation("Landings")(connect(mapStateToProps, null)(LandingSaleEvent)));
