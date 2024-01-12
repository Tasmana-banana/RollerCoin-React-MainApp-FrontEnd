import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Container, Row, Col, Progress, InputGroupAddon, InputGroup, Button, Input } from "reactstrap";
import validator from "validator";
import { toast } from "react-toastify";
import WSocket from "../../services/connectClass";
import * as actionsGame from "../../actions/game";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Static/EasterEvent.scss";
import easterHeaderDesktop from "../../assets/img/singleComponents/easter_header_desktop.png";
import easterHeaderTitle from "../../assets/img/singleComponents/easter_header_title.png";
import pedestalDesktop from "../../assets/img/singleComponents/pedestal_desktop.png";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	replenishmentModalStats: state.game.replenishmentModalStats,
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setReplenishmentModalStats: (state) => dispatch(actionsGame.setReplenishmentModalStats(state)),
});

class EasterEvent extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		wsReact: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			quantity: 1,
			isBuyConfirmationOpen: false,
			currentSum: 0,
			minerPrice: 0,
			name: {
				en: "",
				cn: "",
			},
			minerId: "625410ae42a0cd1b7d9c67e0",
			currency: "",
			power: 0,
			width: 2,
			countForSale: 0,
			countSold: 0,
			limitPerUser: 0,
			alreadyPurchased: 0,
			isLoading: false,
		};
		this.controllers = {};
		this.signals = {};
		const scheme = window.location.protocol === "https:" ? "wss" : "ws";
		this.wsNode = new WSocket(`${scheme}://${window.location.host}`);
		this.wsNode.setListenersMessage({ saintPatrickEvent: this.onWSNodeMessage });
		if (this.wsNode.wsState !== 2 && this.wsNode.wsState !== 3) {
			this.wsNode.connect();
		}
	}

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
		this.setState({ progress: Math.round(100 - (countSold / countForSale) * 100), countForSale, countSold });
	};

	componentDidMount() {
		this.getEventConfig();
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		this.wsNode.removeListenersMessage("easterEvent");
		this.wsNode.destroyConnect();
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	handleQuantityChange = (e, value) => {
		e.stopPropagation();
		const { minerPrice, limitPerUser, alreadyPurchased, countForSale, countSold } = this.state;
		const limit = Math.min(limitPerUser - alreadyPurchased, countForSale - countSold);
		if (validator.isInt(value.toString(), { min: 1, max: +limit }) || value === "") {
			this.setState({
				quantity: value < limit ? +value : limit,
				currentSum: value < limit ? +value * minerPrice : limit * minerPrice,
			});
		}
	};

	buyItem = async () => {
		const { balance } = this.props;
		const { quantity, minerId, currentSum, alreadyPurchased, minerPrice } = this.state;
		if (balance.rlt < currentSum) {
			this.toggleButtons();
			return this.openReplenishmentModal();
		}
		try {
			this.createSignalAndController("buyItem");
			this.toggleButtons();
			this.setState({ isLoading: true });
			const json = await fetchWithToken("/api/market/buy-product", {
				method: "POST",
				body: JSON.stringify({
					id: minerId,
					qty: quantity,
					type: "miner",
					is_promo: false,
					is_season_store_purchase: false,
					is_sales_purchase: false,
				}),
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
			toast(this.constructor.renderToast("Successful purchase", "success_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			this.setState({ alreadyPurchased: alreadyPurchased + quantity, quantity: 1, currentSum: minerPrice });
			this.refreshBalance();
		} catch (e) {
			console.error(e);
		}
	};

	openReplenishmentModal = () => {
		const { replenishmentModalStats, setReplenishmentModalStats, language } = this.props;
		const { name, quantity, currentSum } = this.state;
		setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: name[language] || name.en, quantity, price: currentSum });
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt="block_mined" />
				<span>{text}</span>
			</div>
		);
	}

	getEventConfig = async () => {
		try {
			this.createSignalAndController("getEventConfig");
			const json = await fetchWithToken("/api/game/easter-event-config", {
				method: "GET",
				signal: this.signals.getEventConfig,
			});
			if (!json.success) {
				return false;
			}
			const {
				currency,
				power,
				price,
				width,
				count_for_sale: countForSale,
				count_sold: countSold,
				limit_per_user: limitPerUser,
				already_purchased: alreadyPurchased,
				name,
				_id: minerId,
			} = json.data;
			this.setState({
				progress: Math.round(100 - (countSold / countForSale) * 100),
				minerPrice: price,
				name,
				currency,
				power,
				width,
				countForSale,
				countSold,
				limitPerUser,
				alreadyPurchased,
				minerId,
				currentSum: price,
			});
		} catch (e) {
			console.error(e);
		}
	};

	toggleButtons = () => {
		const { isBuyConfirmationOpen } = this.state;
		this.setState({ isBuyConfirmationOpen: !isBuyConfirmationOpen });
	};

	refreshBalance = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	render() {
		const { isMobile, language } = this.props;
		const { progress, name, minerId, quantity, isBuyConfirmationOpen, currentSum, power, width, countForSale, countSold, limitPerUser, alreadyPurchased, isLoading } = this.state;
		return (
			<div className="event-container">
				<div className="event-title">
					{!isMobile && <img className="event-title-background" src={easterHeaderDesktop} width="1440" height="256" alt="title" />}
					{isMobile && <img className="event-title-text-img" src={easterHeaderTitle} width="296" height="98" alt="title" />}
				</div>
				<div className="gradient">
					<Container>
						<Row>
							<Col xs={12} lg={{ size: 6, offset: 3 }}>
								<div className="pedestal-container">
									<img src={pedestalDesktop} alt="pedestal" />
									<div className="main-miner-container">
										<img className="main-miner-img" src={`/static/img/market/miners/${minerId}.gif?v=1.0.3`} alt="miner" />
									</div>
								</div>
								<div className="progress-container">
									<Progress value={progress} className="progress-block" />
									<p className="progress-number">
										{countForSale - countSold > 0 ? countForSale - countSold : 0} / {countForSale} Left
									</p>
								</div>
							</Col>
							<Col xs={12} lg={{ size: 6, offset: 3 }}>
								<div className="event-info-container">
									<p className="miner-title">{name[language] || name.en}</p>
									<div className="miner-description">
										<p className="miner-characters">
											<span className="accent-color">Cells: </span> {width} / <span className="accent-color">Power: </span>{" "}
											{power.toString().replace(/(?=\B(?:\d{3})+(?!\d))/g, ".")} Gh/s
										</p>
										<p className="miner-description-margin">
											Easter is just around the corner! Join the celebration of <span className="bolded-text gold-color">Easter Basket Hunt</span> with the new wonderful{" "}
											<span className="bolded-text">Easter Basket Hunt</span>
										</p>
										<p className="miner-description-margin">
											<span className="bolded-text">{name[language] || name.en}</span> ({power.toString().replace(/(?=\B(?:\d{3})+(?!\d))/g, ".")} Gh/s) stock is limited to{" "}
											<span className="bolded-text">only {countForSale} pieces for the whole game!</span> You can purchase up to{" "}
											<span className="bolded-text">{limitPerUser}</span> miners to <span className="bolded-text">1 person.</span>
										</p>
										<p className="miner-description">
											<span className="bolded-text">{name[language] || name.en}</span> will be sellable on the Marketplace coming in following Seasons. Additionally, it will give
											you a <span className="bolded-text accent-color">+3% Collection Bonus!</span>
										</p>
									</div>
									<div className="change-quantity-wrapper">
										<InputGroup className="change-quantity-inputs">
											<InputGroupAddon addonType="prepend">
												<Button
													type="button"
													className={`tree-dimensional-button btn-default small-btn ${isBuyConfirmationOpen ? "not-active" : ""}`}
													onClick={(e) => {
														this.handleQuantityChange(e, +quantity - 1);
													}}
													disabled={quantity <= 1}
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
													onClick={(e) => {
														this.handleQuantityChange(e, +quantity + 1);
													}}
													disabled={countForSale <= countSold + quantity || limitPerUser <= alreadyPurchased + quantity}
												>
													<span className="change-quantity-text">+</span>
												</Button>
											</InputGroupAddon>
										</InputGroup>
										<div className="total-price">
											<p>
												<span className="product-price-title">Price: </span>
												<span>{currentSum / 1000000} RLT</span>
											</p>
										</div>
									</div>
									<div className="limit-text-wrapper">
										<p className="limit-text">*You can purchase up to {limitPerUser} miners on your account</p>
									</div>
									<div className="separate-line" />
									<div className="miner-buy-button">
										{!isBuyConfirmationOpen && (
											<button
												type="button"
												className="tree-dimensional-button btn-cyan w-100"
												onClick={this.toggleButtons}
												disabled={isLoading || countForSale < countSold + quantity || limitPerUser < alreadyPurchased + quantity || !quantity}
											>
												<span className="with-horizontal-image flex-lg-row button-text-wrapper">
													<img src={`/static/img/cart.svg`} alt="cart" />
													<span className="btn-text">Buy miner</span>
												</span>
											</button>
										)}
										{isBuyConfirmationOpen && (
											<div className="action-buttons">
												<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={this.buyItem}>
													<span className="btn-text">Yes</span>
												</button>
												<button type="button" className="tree-dimensional-button btn-danger w-100" onClick={this.toggleButtons}>
													<span className="btn-text">No</span>
												</button>
											</div>
										)}
									</div>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(EasterEvent);
