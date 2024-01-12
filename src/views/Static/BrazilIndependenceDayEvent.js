import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Container, Row, Col, Progress, Button, InputGroupAddon, InputGroup, Input } from "reactstrap";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import validator from "validator";
import WSocket from "../../services/connectClass";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import fetchWithToken from "../../services/fetchWithToken";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import getPrefixPower from "../../services/getPrefixPower";

import "../../assets/scss/Static/BrazilIndependenceDayEvent.scss";
import headerDesktop from "../../assets/img/singleComponents/brazil_header_desktop.png";
import pedestalDesktop from "../../assets/img/singleComponents/pedestal_brazil_desktop.png";
import loaderImg from "../../assets/img/loader_sandglass.gif";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
});

class BrazilIndependenceDayEvent extends Component {
	static propTypes = {
		balance: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		wsReact: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			eventID: "",
			title: { en: "", cn: "" },
			description: { en: "", cn: "" },
			mainPrize: {
				type: "",
				_id: "",
				name: { en: "", cn: "" },
				width: 2,
				power: 0,
				count_for_sale: 0,
				count_sold: 0,
				limit_per_user: 0,
			},
			alreadyPurchased: 0,
			progress: 0,
			quantity: 1,
			additionalPrizes: [],
			isLoading: false,
			isLoadingConfig: true,
		};
		this.rltConfig = getCurrencyConfig("RLT");
		this.controllers = {};
		this.signals = {};
		const scheme = window.location.protocol === "https:" ? "wss" : "ws";
		this.wsNode = new WSocket(`${scheme}://${window.location.host}`);
		this.wsNode.setListenersMessage({ brazil_independence_day: this.onWSNodeMessage });
		if (this.wsNode.wsState !== 2 && this.wsNode.wsState !== 3) {
			this.wsNode.connect();
		}
	}

	async componentDidMount() {
		await this.getEventConfig();
	}

	componentWillUnmount() {
		this.wsNode.removeListenersMessage("brazil_independence_day");
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	static renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt="block_mined" />
			<span>{text}</span>
		</div>
	);

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
			case "event_miner_updated":
				this.updateOnWS(value);
				break;
			default:
				break;
		}
	};

	updateOnWS = (data) => {
		const { count_sold: countSold, count_for_sale: countForSale } = data;
		this.setState({
			progress: (100 - (countSold / countForSale) * 100).toFixed(2),
			mainPrize: {
				...this.state.mainPrize,
				count_sold: countSold,
				count_for_sale: countForSale,
			},
		});
	};

	handleQuantityChange = (e, value) => {
		e.stopPropagation();
		const { balance } = this.props;
		const { mainPrize, alreadyPurchased } = this.state;
		const maxQuantityByBalance = Math.floor(balance.rlt / mainPrize.price);
		const limit = mainPrize.limit_per_user - alreadyPurchased;
		const maxQuantity = maxQuantityByBalance > limit ? limit : maxQuantityByBalance;
		if (maxQuantity === 0 || limit === 0 || +value > mainPrize.count_for_sale - mainPrize.count_sold) {
			return false;
		}
		if (validator.isInt(value.toString(), { min: 1, max: 100 }) || value === "") {
			this.setState({
				quantity: value < maxQuantity ? +value : maxQuantity,
			});
		}
	};

	toggleButtons = () => {
		const { isBuyConfirmationOpen } = this.state;
		this.setState({ isBuyConfirmationOpen: !isBuyConfirmationOpen });
	};

	buyItem = async () => {
		const { isMobile, wsReact } = this.props;
		const { eventID, quantity, alreadyPurchased } = this.state;
		this.createSignalAndController("buyItem");
		try {
			this.setState({ isLoading: true, isBuyConfirmationOpen: false });
			const json = await fetchWithToken("/api/game/collect-additional-game-event-prize", {
				method: "POST",
				body: JSON.stringify({ event_id: eventID, quantity }),
				signal: this.signals.buyItem,
			});
			this.setState({ isLoading: false });
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
			toast(this.constructor.renderToast("Prizes collected!", "success_notice"), {
				position: `${isMobile ? "bottom-left" : "top-left"}`,
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			this.setState({
				quantity: 1,
				alreadyPurchased: alreadyPurchased + quantity,
			});
			wsReact.send(
				JSON.stringify({
					cmd: "balance_request",
				})
			);
		} catch (e) {
			console.error(e);
		}
	};

	getEventConfig = async () => {
		const { history, language } = this.props;
		try {
			this.createSignalAndController("getEventConfig");
			this.setState({ isLoadingConfig: true });
			const json = await fetchWithToken("/api/game/additional-game-event-config", {
				method: "GET",
				signal: this.signals.getEventConfig,
			});
			if (!json.success || !json.data) {
				return history.push(`${getLanguagePrefix(language)}/game`);
			}
			const { _id: eventID, title, description, prize_items: prizes, already_purchased: alreadyPurchased } = json.data;
			const mainPrize = prizes.find((item) => item.type === "miner");
			const additionalPrizes = prizes.filter((item) => item.type !== "miner");
			this.setState({
				progress: (100 - (mainPrize.count_sold / mainPrize.count_for_sale) * 100).toFixed(2),
				eventID,
				title,
				description,
				mainPrize,
				additionalPrizes,
				alreadyPurchased,
				isLoadingConfig: false,
			});
		} catch (e) {
			console.error(e);
		}
	};

	static getImgPath = (item) => {
		const TYPE_IMG_CONFIG = {
			miner: `/static/img/market/miners/${item._id}.gif?v=1.0.3`,
			hat: `/static/img/market/hats/${item._id}.png?v=1.0.0`,
		};
		return TYPE_IMG_CONFIG[item.type];
	};

	render() {
		const { isMobile, language, balance, t } = this.props;
		const { isBuyConfirmationOpen, description, mainPrize, additionalPrizes, isLoading, isLoadingConfig, progress, quantity, alreadyPurchased } = this.state;
		const { hashDetail, power } = getPrefixPower(mainPrize.power);
		const sum = quantity * mainPrize.price;
		const normalizedPrice = decimalAdjust(Math.max(mainPrize.price, sum) / this.rltConfig.toSmall, 2);
		return (
			<div className="event-container">
				<div className="event-title">{!isMobile && <img className="event-title-background" src={headerDesktop} width="1440" height="256" alt="title" />}</div>
				<div className="gradient">
					{!!isLoadingConfig && (
						<div className="table-loader">
							<div>
								<img src={loaderImg} height={63} width={63} alt="Loading..." />
							</div>
						</div>
					)}
					{!isLoadingConfig && (
						<Container>
							<Row>
								<Col xs={12} lg={{ size: 6, offset: 3 }}>
									<div className="pedestal-container">
										<div className="main-prize-container">
											<img className="main-prize-img" src={BrazilIndependenceDayEvent.getImgPath(mainPrize)} width="126" height="100" alt="main prize" />
										</div>
										<img src={pedestalDesktop} alt="pedestal" />
									</div>
									<div className="progress-container">
										<Progress value={progress} className="progress-block" />
										<p className={`progress-number ${language}`}>
											{mainPrize.count_for_sale - mainPrize.count_sold} / {mainPrize.count_for_sale} Left
										</p>
									</div>
								</Col>
								<Col xs={12} lg={{ size: 6, offset: 3 }}>
									<div className="event-info-container">
										<div className="event-description-wrapper">
											<div className="event-prize-info">
												<p className="prize-name">{mainPrize.name[language] || mainPrize.name.en}</p>
												<p className="prize-info">
													<span className="light-green-color">Cell(s):</span> {mainPrize.width} / <span className="light-green-color">Power:</span> {power} {hashDetail}
												</p>
											</div>
											<div className="event-inner-description" dangerouslySetInnerHTML={{ __html: description[language] || description.en }} />
											<div className="additional-prizes-wrapper">
												{additionalPrizes.map((item) => (
													<img key={item._id} className="additional-prize-img" src={BrazilIndependenceDayEvent.getImgPath(item)} alt={item.type} width="66" height="24" />
												))}
											</div>
											<p className="event-description">
												And the gifts are not over yet! A free <span className="bolded-text">{additionalPrizes[0].title[language] || additionalPrizes[0].title.en}</span> is
												waiting for every <span className="bolded-text">{mainPrize.name[language] || mainPrize.name.en}</span> owner, so the true holiday vibes will stay with
												you for the whole year!
											</p>
											<p className="event-description bolded-text">Come on, and join the Brazil Independence Day celebration!👇</p>
										</div>
										<div className="change-quantity-wrapper">
											<InputGroup className="change-quantity-inputs">
												<InputGroupAddon addonType="prepend">
													<Button
														type="button"
														className={`tree-dimensional-button btn-default small-btn ${isBuyConfirmationOpen ? "not-active" : ""}`}
														disabled={+quantity - 1 === 0}
														onClick={(e) => {
															this.handleQuantityChange(e, +quantity - 1);
														}}
													>
														<span className="change-quantity-text">-</span>
													</Button>
												</InputGroupAddon>
												<Input
													value={quantity}
													className="quantity-input"
													disabled={isBuyConfirmationOpen}
													onClick={(e) => {
														e.stopPropagation();
														e.target.select();
													}}
													onChange={(e) => {
														this.handleQuantityChange(e, e.target.value);
													}}
												/>
												<InputGroupAddon addonType="append">
													<Button
														type="button"
														className={`tree-dimensional-button btn-default small-btn ${isBuyConfirmationOpen ? "not-active" : ""}`}
														disabled={
															+quantity + 1 > mainPrize.limit_per_user - alreadyPurchased ||
															+quantity + 1 > mainPrize.count_for_sale - mainPrize.count_sold ||
															quantity === Math.floor(balance.rlt / mainPrize.price) ||
															!Math.floor(balance.rlt / mainPrize.price)
														}
														onClick={(e) => {
															this.handleQuantityChange(e, +quantity + 1);
														}}
													>
														<span className="change-quantity-text">+</span>
													</Button>
												</InputGroupAddon>
											</InputGroup>
											<div className="total-price">
												<p>
													<span className="product-price-title">Price: </span>
													<span>{normalizedPrice} RLT</span>
												</p>
											</div>
										</div>
										<div className="limit-text-wrapper">
											<p className="limit-text">*You can buy only {mainPrize.limit_per_user} miners on your account</p>
										</div>
										<div className="miner-buy-button">
											{!isBuyConfirmationOpen && (
												<button
													type="button"
													className="tree-dimensional-button btn-cyan w-100"
													disabled={
														balance.rlt < sum ||
														isLoading ||
														mainPrize.count_for_sale === mainPrize.count_sold ||
														!quantity ||
														mainPrize.limit_per_user === alreadyPurchased
													}
													onClick={this.toggleButtons}
												>
													<span className="with-horizontal-image flex-lg-row button-text-wrapper">
														<img src={`/static/img/${balance.rlt < sum ? "cart" : "cart_disabled"}.svg`} width="19" height="19" alt="cart" />
														<span className="btn-text">{balance.rlt >= sum ? "Buy miner" : t("market.notEnough")}</span>
													</span>
												</button>
											)}
											{isBuyConfirmationOpen && (
												<div className="action-buttons">
													<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={this.buyItem}>
														<span className="btn-text">{t("market.yes")}</span>
													</button>
													<button type="button" className="tree-dimensional-button btn-danger w-100" onClick={this.toggleButtons}>
														<span className="btn-text">{t("market.no")}</span>
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
		);
	}
}

export default withRouter(withTranslation("Game")(connect(mapStateToProps, null)(BrazilIndependenceDayEvent)));
