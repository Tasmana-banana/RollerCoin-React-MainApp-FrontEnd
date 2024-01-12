import React, { Component, Fragment } from "react";
import { Button, Col, Input, InputGroup, InputGroupAddon, Progress } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import validator from "validator";
import * as actionsGame from "../../actions/game";
import decimalAdjust from "../../services/decimalAdjust";
import { progressValue, progressCount } from "../../services/market/marketDailyOfferProgress";

import limitedIcon from "../../assets/img/market/limited_icon.svg";
import cartIcon from "../../assets/img/cart.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	replenishmentModalStats: state.game.replenishmentModalStats,
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
	currencies: state.wallet.rollerCurrencies,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setReplenishmentModalStats: (state) => dispatch(actionsGame.setReplenishmentModalStats(state)),
});

class MarketDailyOfferProductCard extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		balance: PropTypes.number.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		buyAction: PropTypes.func.isRequired,
		isAvailableProduct: PropTypes.bool.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		currencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			quantity: 1,
			sum: 0,
			oldSum: 0,
			isBuyProcessing: false,
			isMaxQtyDisabled: false,
		};
	}

	componentDidMount() {
		const { item } = this.props;
		this.setState({
			sum: item.price,
			oldSum: item.normalPrice,
		});
	}

	getCurrencyConfig = (currency) => this.props.currencies.find((cfg) => cfg.balanceKey === currency);

	calculateMaxQty = (value = 1) => {
		const { item } = this.props;
		let productMaxEnough = 99;
		if (item.limit && !item.limitPerUser) {
			productMaxEnough = item.limit - item.sold;
		}
		if (item.limitPerUser && !item.limit) {
			productMaxEnough = item.limitPerUser - item.purchasedUserCount;
		}
		if (item.limit && item.limitPerUser && item.limit - item.sold >= item.limitPerUser - item.purchasedUserCount) {
			productMaxEnough = item.limitPerUser - item.purchasedUserCount;
		}
		if (item.limit && item.limitPerUser && item.limit - item.sold < item.limitPerUser - item.purchasedUserCount) {
			productMaxEnough = item.limit - item.sold;
		}
		const currentQuantity = Math.min(value, productMaxEnough);
		this.setState({
			isMaxQtyDisabled: +currentQuantity + 1 > productMaxEnough,
		});
		return currentQuantity || 1;
	};

	handleQuantityChange = (value) => {
		const { item } = this.props;
		const minMax = { min: 1, max: 99 };
		if (validator.isInt(value.toString(), minMax) || value === "") {
			const currentQuantity = value ? this.calculateMaxQty(value) : "";
			this.setState({
				quantity: currentQuantity,
				sum: currentQuantity === "" ? item.price : currentQuantity * item.price,
				oldSum: currentQuantity === "" ? item.normalPrice : currentQuantity * item.normalPrice,
			});
		}
	};

	toggleBuyConfirmation = (e, productID) => {
		const { activeProductId, toggleActiveProduct, balance, item } = this.props;
		const { sum } = this.state;
		if (activeProductId) {
			toggleActiveProduct();
			return true;
		}
		const currency = this.getCurrencyConfig(item.currency);
		if (balance[currency.code] < sum) {
			return this.openReplenishmentModal();
		}
		toggleActiveProduct(productID);
	};

	buyProduct = async (item) => {
		const { buyAction } = this.props;
		const { quantity } = this.state;
		this.setState({
			isBuyProcessing: true,
		});
		await buyAction({ ...item, qty: quantity }, true);
		this.setState({
			isBuyProcessing: false,
			quantity: 1,
			sum: item.price,
			oldSum: item.normalPrice,
		});
	};

	inBlurHandler = () => {
		const { quantity } = this.state;
		this.setState({ quantity: quantity || 1 });
	};

	openReplenishmentModal = () => {
		const { item, replenishmentModalStats, setReplenishmentModalStats, language } = this.props;
		const { quantity, sum } = this.state;
		setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: item.name[language] || item.name.en, quantity, price: sum });
	};

	render() {
		const { item, isAvailableProduct, activeProductId, language, balance, t } = this.props;
		const { isBuyProcessing, quantity, sum, oldSum, isMaxQtyDisabled } = this.state;
		const currency = this.getCurrencyConfig(item.currency);
		const isLimit = !!item.limit;
		const isUserLimit = !!item.limitPerUser;
		const isProgressAvaible = isLimit || isUserLimit;

		return (
			<Fragment>
				<Col xs={12} lg={4} key={item.id} className="sales-product-container">
					<div className={`sales-product ${isAvailableProduct ? "" : "disable-sales-product"}`}>
						{item.type === "miner" && (
							<div className="sales-product-title-wrapper">
								<p className="sales-product-title">{item.name[language] || item.name.en}</p>
								<p className="sales-product-power">{`${item.power} Gh/s`}</p>
								<div className="sales-product-status-of-sell">
									{item.canBeSold ? <p className="text positive">{t("market.canBeSold")}</p> : <p className="text negative">{t("market.cantBeSold")}</p>}
								</div>
							</div>
						)}
						{item.type === "rack" && (
							<div className="sales-product-title-wrapper">
								<p className="sales-product-title">{item.name[language] || item.name.en}</p>
								<p className="sales-product-power">
									{item.width * item.height} {t("market.cells")}
								</p>
							</div>
						)}
						{item.type === "appearance" && (
							<div className="sales-product-title-wrapper">
								<p className="sales-product-title">{item.name[language] || item.name.en}</p>
								<p className="sales-product-power">Skin</p>
							</div>
						)}
						<div className={`sales-product-image-wrapper ${item.type === "appearance" ? "appearance" : ""}`}>
							<LazyLoad offset={100}>
								{item.type === "miner" && (
									<img
										className="sales-product-image"
										src={`${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=1.0.0`}
										alt={item.id}
										width="128"
										height="100"
									/>
								)}
								{item.type === "rack" && (
									<img className="sales-product-image" src={`${process.env.STATIC_URL}/static/img/market/racks/${item.id}.png?v=1.0.3`} alt={item.id} width="128" height="100" />
								)}
								{item.type === "appearance" && (
									<img
										className="sales-product-image"
										src={`${process.env.STATIC_URL}/static/img/market/appearances/sales/${item.id}.png?v=1.0.2`}
										alt={item.id}
										width="250"
										height="208"
									/>
								)}
							</LazyLoad>
							{!!item.displayedPercent && item.tag === "percent" && (
								<div className="noticeable-description red">
									<p className="noticeable-description-text">{`-${item.displayedPercent}%`}</p>
								</div>
							)}
							{item.tag === "limited" && (
								<div className="noticeable-description cyan">
									<div className="noticeable-description-img">
										<LazyLoad offset={100}>
											<img src={limitedIcon} alt="limited" />
										</LazyLoad>
									</div>
									<p className="noticeable-description-text">{t("market.limited")}</p>
								</div>
							)}
						</div>

						<div className="sales-progress-block">
							<Progress value={isAvailableProduct && progressValue(item)} className={`sales-progress-bar ${!isProgressAvaible ? "unlimited" : ""}`} />
							{isProgressAvaible && <p className="sales-progress-text">{t("market.left", progressCount(item))}</p>}
							{!isProgressAvaible && <p className="sales-progress-text">{t("market.unlimited")}</p>}
						</div>
						<div className="sales-qty">
							<p className="sales-qty-text">{t(`market.quantity`)}:</p>
							<InputGroup className="change-quantity-inputs">
								<InputGroupAddon addonType="prepend">
									<Button
										type="button"
										className="tree-dimensional-button btn-default small-btn"
										disabled={quantity <= 1 || item.id === activeProductId || !isAvailableProduct || item.type === "appearance"}
										onClick={() => this.handleQuantityChange(quantity - 1)}
									>
										<span className="change-quantity-text">-</span>
									</Button>
								</InputGroupAddon>
								<Input
									value={isAvailableProduct ? quantity : 0}
									className="quantity-input"
									disabled={item.id === activeProductId || !isAvailableProduct || item.type === "appearance"}
									onClick={(e) => {
										e.target.select();
									}}
									onBlur={() => this.inBlurHandler()}
									onChange={(e) => (item.currency !== "RLT" && balance[currency.code] < sum ? null : this.handleQuantityChange(e.target.value))}
								/>
								<InputGroupAddon addonType="append">
									<Button
										type="button"
										className="tree-dimensional-button btn-default small-btn"
										disabled={
											isMaxQtyDisabled ||
											item.id === activeProductId ||
											!isAvailableProduct ||
											item.type === "appearance" ||
											(item.currency !== "RLT" && balance[currency.code] < sum)
										}
										onClick={() => this.handleQuantityChange(+quantity + 1)}
									>
										<span className="change-quantity-text">+</span>
									</Button>
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div className="sales-price-sum">
							<p className="sales-price-text">{t(`market.price`)}</p>
							{isAvailableProduct && item.currency === item.productCurrency && oldSum > sum && (
								<p className="sales-price-old">{decimalAdjust(oldSum / currency.toSmall, currency.precision).toFixed(2)}</p>
							)}
							<p className="sales-price-new">
								<span>
									{isAvailableProduct ? decimalAdjust(sum / currency.toSmall, currency.marketPrecision) : 0} {currency.name}
								</span>
							</p>
						</div>
						<div className={`sales-buy-button ${item.id === activeProductId ? "fade" : ""} ${isAvailableProduct ? "" : "disabled"}`}>
							<button
								type="button"
								className="tree-dimensional-button btn-gold w-100"
								disabled={isBuyProcessing || !isAvailableProduct || (item.type === "appearance" && item.userHas) || (item.currency !== "RLT" && balance[currency.code] < sum)}
								onClick={(e) => this.toggleBuyConfirmation(e, item.id)}
							>
								{!!isAvailableProduct && !(item.type === "appearance" && item.userHas) && (
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={cartIcon} alt="cart" />
										{item.type === "miner" && (item.currency === "RLT" || balance[currency.code] >= sum) && <span className="btn-text">{t("market.buyMiner")}</span>}
										{item.type === "rack" && (item.currency === "RLT" || balance[currency.code] >= sum) && <span className="btn-text">{t("market.buyRack")}</span>}
										{item.type === "appearance" && (item.currency === "RLT" || balance[currency.code] >= sum) && <span className="btn-text">{t("market.buySkin")}</span>}
										{item.currency !== "RLT" && balance[currency.code] < sum && <span className="btn-text">{t("market.notEnough")}</span>}
									</span>
								)}
								{!isAvailableProduct && (
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={`/static/img/cart_disabled.svg`} alt="out of stock" />
										<span className="btn-text">{t("market.soldOut")}</span>
									</span>
								)}
								{!!isAvailableProduct && item.type === "appearance" && item.userHas && (
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={`/static/img/cart_disabled.svg`} alt="out of stock" />
										<span className="btn-text">{t("market.purchased")}</span>
									</span>
								)}
							</button>
						</div>
						<div className={`sales-confirmation-wrapper ${item.id === activeProductId ? "recover" : ""}`}>
							<p className="confirmation-title">{t("market.buyIt")}</p>
							{item.id === activeProductId && (
								<div className="confirmation-buttons">
									<button
										type="button"
										className="tree-dimensional-button btn-cyan"
										onClick={() => {
											this.buyProduct(item);
										}}
									>
										<span className="btn-text">{t("market.yes")}</span>
									</button>
									<button type="button" className="tree-dimensional-button btn-red" onClick={(e) => this.toggleBuyConfirmation(e)}>
										<span className="btn-text">{t("market.no")}</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</Col>
			</Fragment>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketDailyOfferProductCard));
