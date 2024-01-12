import React, { Component } from "react";
import { Button, Col, Input, InputGroup, InputGroupAddon, Progress, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import * as actionsGame from "../../actions/game";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";

import "../../assets/scss/Market/MarketPartCard.scss";

import cartIcon from "../../assets/img/cart.svg";
import cartDisabledIcon from "../../assets/img/cart_disabled.svg";

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

const PRICE_DIGITS_AMOUNT = 3;

class MarketPartCard extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		balance: PropTypes.number.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		wsReact: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			quantity: 1,
			sum: 0,
			currency: {},
			isMaxQtyDisabled: false,
			isProcessing: false,
		};
	}

	componentDidMount() {
		const { item } = this.props;
		this.setState({
			sum: item.price,
		});
	}

	handleQuantityChange = (value) => {
		const { item } = this.props;
		const availableItemsAmount = item.limit - item.sold > 0 ? item.limit - item.sold : 0;
		const maxAmount = Math.min(999, availableItemsAmount);
		const minAmount = 1;
		if (value >= minAmount || value === "") {
			const correctedValue = Math.min(maxAmount, +value);
			this.setState({
				quantity: correctedValue,
				sum: correctedValue * item.price,
				isMaxQtyDisabled: maxAmount <= correctedValue,
			});
		}
	};

	inBlurHandler = () => {
		const { quantity } = this.state;
		if (!quantity) {
			this.handleQuantityChange(1);
		}
	};

	buyActionHandler = async (e) => {
		e.stopPropagation();
		const { item, buyAction, balance } = this.props;
		const { quantity, sum } = this.state;
		const currency = getCurrencyConfig(item.currency);
		if (balance[currency.code] < sum) {
			return this.openReplenishmentModal();
		}
		this.setState({ isProcessing: true });
		await buyAction({ id: item.id, type: "mutation_component", qty: quantity });
		this.handleQuantityChange(1);
		this.setState({ isProcessing: false });
	};

	openReplenishmentModal = () => {
		const { item, replenishmentModalStats, setReplenishmentModalStats, language } = this.props;
		const { quantity, sum } = this.state;
		setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: item.name[language] || item.name.en, quantity, price: sum });
	};

	render() {
		const { item, activeProductId, toggleActiveProduct, language, t, balance } = this.props;
		const { quantity, sum, isMaxQtyDisabled, isProcessing } = this.state;
		const currency = getCurrencyConfig(item.currency);
		const isAvailableProduct = !item.isOutOfStock && item.sold < item.limit;
		return (
			<Col xs={12} lg={4} key={item.id} className={`market-part-card ${item.id === activeProductId ? "active" : ""} ${isAvailableProduct ? "" : "out-of-stock"}`}>
				<Row noGutters className="part-info-container">
					<div className="main-info-wrapper">
						<div className="product-image-wrapper">
							<LazyLoad offset={100}>
								<img
									style={{ filter: `drop-shadow(0 0 4px #${item.rarityColor}` }}
									src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${item.id}.png?v=1.0.1`}
									width="64"
									height="64"
									alt={item.id}
								/>
							</LazyLoad>
						</div>
						<div className="product-description-container">
							<p className="product-rarity" style={{ color: `#${item.rarityColor}` }}>
								{item.rarityTitle[language] || item.rarityTitle.en}
							</p>
							<p className="product-name">{item.name[language] || item.name.en}</p>
							<div className="product-price-wrapper">
								<span className="product-price-title">{item.isOutOfStock ? "" : t("market.price")}</span>
								{!item.isOutOfStock && (
									<p className={`product-price-value ${item.discount ? "success-text" : ""}`}>
										{decimalAdjust(item.price / currency.toSmall, PRICE_DIGITS_AMOUNT)} {currency.name}
									</p>
								)}
							</div>
						</div>
					</div>
					<div className="parts-progress-block">
						<Progress value={isAvailableProduct ? Math.round(((item.limit - item.sold) / item.limit) * 100) : 0} className="parts-progress-bar" />
						<p className="parts-progress-text">
							{isAvailableProduct &&
								t("market.leftLootBox", {
									itemLimit: item.limit,
									itemSold: item.limit - item.sold,
								})}
							{!isAvailableProduct && t("market.soldOut")}
						</p>
					</div>
					<div className="change-quantity-wrapper">
						<InputGroup className="change-quantity-inputs">
							<InputGroupAddon addonType="prepend">
								<Button
									type="button"
									className={`tree-dimensional-button small-btn ${quantity <= 1 || item.id === activeProductId ? "disabled" : ""}`}
									disabled={quantity <= 1 || item.id === activeProductId || !isAvailableProduct}
									onClick={() => this.handleQuantityChange(+quantity - 1)}
								>
									<span className="change-quantity-text">-</span>
								</Button>
							</InputGroupAddon>
							<Input
								value={quantity}
								className="quantity-input"
								disabled={!isAvailableProduct}
								onClick={(e) => {
									e.target.select();
								}}
								onChange={(e) => this.handleQuantityChange(e.target.value)}
								onBlur={this.inBlurHandler}
							/>
							<InputGroupAddon addonType="append">
								<Button
									type="button"
									className={`tree-dimensional-button small-btn ${isMaxQtyDisabled || item.id === activeProductId ? "disabled" : ""}`}
									disabled={isMaxQtyDisabled || item.id === activeProductId || !isAvailableProduct}
									onClick={() => this.handleQuantityChange(+quantity + 1)}
								>
									<span className={`change-quantity-text`}>+</span>
								</Button>
							</InputGroupAddon>
						</InputGroup>
						<div className="total-price-wrapper">
							<p className="product-price-title">{t("market.price")} </p>
							<p>
								{decimalAdjust(sum / currency.toSmall, PRICE_DIGITS_AMOUNT)} {currency.name}
							</p>
						</div>
					</div>
					<div className="product-buy-wrapper">
						<button
							type="button"
							className={`product-buy-button tree-dimensional-button btn-cyan w-100 ${item.id === activeProductId ? "hidden" : ""}`}
							onClick={() => {
								toggleActiveProduct(item.id);
							}}
							disabled={!quantity || (item.currency !== "RLT" && balance[currency.code] < sum) || !isAvailableProduct}
						>
							<span className="with-horizontal-image flex-lg-row button-text-wrapper">
								<img src={item.currency !== "RLT" && balance[currency.code] < item.price ? cartDisabledIcon : cartIcon} alt="cart" />
								<span className="btn-text">
									{t("market.buy")} {item.name[language] || item.name.en}
								</span>
								{item.currency !== "RLT" && balance[currency.code] < sum && <span className="btn-text">{t("market.notEnough")}</span>}
							</span>
						</button>
						<div className={`confirmation-wrapper ${item.id === activeProductId ? "" : "hidden"}`}>
							<p className="confirmation-title">{t("market.youSure")}</p>
							<div className="confirmation-buttons w-100">
								<button type="button" className="tree-dimensional-button btn-cyan" disabled={isProcessing} onClick={(e) => this.buyActionHandler(e)}>
									<span className="btn-text">{t("market.yes")}</span>
								</button>
								<button
									type="button"
									className="tree-dimensional-button btn-red"
									disabled={isProcessing}
									onClick={() => {
										toggleActiveProduct(item.id);
									}}
								>
									<span className="btn-text">{t("market.discard")}</span>
								</button>
							</div>
						</div>
					</div>
				</Row>
			</Col>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketPartCard));
