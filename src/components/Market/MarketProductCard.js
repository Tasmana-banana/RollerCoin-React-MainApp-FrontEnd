import React, { Component, Fragment } from "react";
import { Button, Col, Input, InputGroup, InputGroupAddon, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as actionsGame from "../../actions/game";
import decimalAdjust from "../../services/decimalAdjust";
import ShowFullImage from "./ShowFullImage";
import magnifierIcon from "../../assets/img/icon/magnifier.svg";
import ArrowBonusUp from "../../assets/img/icon/arrow_bonus.svg";
import arrowDownIcon from "../../assets/img/faq/arrow_down.svg";
import arrowDownUp from "../../assets/img/faq/arrow_up.svg";
import cartIcon from "../../assets/img/cart.svg";
import cartDisabledIcon from "../../assets/img/cart_disabled.svg";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { ITEM_TYPE } from "../../constants/Marketplace";

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

class MarketProductCard extends Component {
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
		currencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			quantity: 1,
			sum: 0,
			buyConfirmation: false,
			currency: {},
			isShowImg: false,
			isMaxQtyDisabled: false,
			isOpenModal: false,
		};
	}

	componentDidMount() {
		const { item } = this.props;
		this.setState({
			sum: item.price,
		});
		if (item.limit && item.limit - item.sold === 1) {
			this.setState({
				isMaxQtyDisabled: true,
			});
		}
	}

	componentDidUpdate() {
		const { item } = this.props;
		const { isMaxQtyDisabled, quantity } = this.state;
		const maxLimitCount = item.limit && item.limit - item.sold;
		if (!item.limit && isMaxQtyDisabled) {
			this.setState({
				isMaxQtyDisabled: false,
			});
		}
		if (item.limit && !isMaxQtyDisabled && quantity === maxLimitCount) {
			this.setState({
				isMaxQtyDisabled: true,
			});
		}
	}

	getCurrencyConfig = (currency) => this.props.currencies.find((cfg) => cfg.name === currency || cfg.balanceKey === currency);

	handleQuantityChange = (value) => {
		const { item } = this.props;
		const minMax = { min: 1, max: 99 };
		const maxLimitCount = item.limit && item.limit - item.sold;
		if (item.limit) {
			minMax.max = maxLimitCount;
		}
		if (value === minMax.max) {
			this.setState({
				isMaxQtyDisabled: true,
			});
		}
		if (value > 0 && value < minMax.max) {
			this.setState({
				isMaxQtyDisabled: false,
			});
		}
		if (value >= minMax.min && value <= minMax.max) {
			this.setState({
				quantity: +value,
				sum: value * item.price,
			});
		}
	};

	toggleProductView = (event, productID) => {
		const { toggleActiveProduct } = this.props;
		const exception = event.target.closest(".change-quantity-inputs");
		if (exception) {
			return true;
		}
		toggleActiveProduct(productID);
	};

	toggleBuyConfirmation = (e) => {
		e.stopPropagation();
		const { buyConfirmation } = this.state;
		this.setState({
			buyConfirmation: !buyConfirmation,
		});
	};

	toggleShowImg = (e) => {
		e.stopPropagation();
		const { isShowImg } = this.state;
		this.setState({
			isShowImg: !isShowImg,
		});
	};

	buyButtonHandler = (e) => {
		e.stopPropagation();
		const { buyConfirmation, sum } = this.state;
		const { item, balance } = this.props;
		const currency = this.getCurrencyConfig(item.currency);
		if (balance[currency.code] < sum) {
			return this.openReplenishmentModal();
		}
		this.setState({ buyConfirmation: !buyConfirmation });
	};

	buyActionHandler = async (e, data) => {
		e.stopPropagation();
		const { buyAction, item } = this.props;
		this.setState({ buyConfirmation: false });
		await buyAction({ ...data, isSales: data.discount });
		this.setState({ sum: item.price, quantity: 1 });
	};

	openReplenishmentModal = () => {
		const { item, replenishmentModalStats, setReplenishmentModalStats, language } = this.props;
		const { quantity, sum } = this.state;
		setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: item.name[language] || item.name.en, quantity, price: sum });
	};

	render() {
		const { item, activeProductId, language, t, balance } = this.props;
		const { buyConfirmation, isShowImg, quantity, sum, isMaxQtyDisabled } = this.state;
		const currency = this.getCurrencyConfig(item.currency);
		const isViewPriceForRacks = item.discount;
		return (
			<Col
				xs={12}
				lg={4}
				key={item.id}
				className={`product-container ${item.id === activeProductId ? "active" : ""} ${item.isOutOfStock && !item.discount ? "out-of-stock" : ""}`}
				onClick={(event) => {
					this.toggleProductView(event, item.id);
				}}
			>
				<Row noGutters className="main-info-container">
					<Col xs={6}>
						<div className="product-image-wrapper" onClick={item.scalableImg && item.id === activeProductId ? (e) => this.toggleShowImg(e) : null}>
							<LazyLoad offset={100}>
								{item.type === ITEM_TYPE.MINER && (
									<img
										className="product-image"
										src={`${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${item.img_ver}`}
										width="126"
										height="100"
										alt={item.id}
									/>
								)}
								{item.type === ITEM_TYPE.RACK && (
									<img className="product-image" src={`${process.env.STATIC_URL}/static/img/market/racks/${item.id}.png?v=1.0.3`} width="126" height="100" alt={item.id} />
								)}
							</LazyLoad>
							{!!item.displayedPercent && (
								<div className="discount-percent">
									<span>{`-${item.displayedPercent}%`}</span>
								</div>
							)}
							{item.scalableImg && item.id === activeProductId && (
								<div className="product-image-view-icon">
									<LazyLoad offset={100}>
										<img src={magnifierIcon} alt="View" />
									</LazyLoad>
								</div>
							)}
						</div>
					</Col>
					<Col xs={6}>
						<div className="product-description-container">
							{item.type === ITEM_TYPE.MINER && (
								<Fragment>
									<p className="product-description-item product-title">{item.name[language] || item.name.en}</p>
									<p className="product-description-item product-power">
										<span>{`${item.width} ${t("market.cells")}`}</span>
										<span className="item-divider"> </span>
										<span>{`${item.power} Gh/s`}</span>
									</p>
								</Fragment>
							)}
							{item.type === ITEM_TYPE.RACK && (
								<Fragment>
									<p className="product-description-item">{item.name[language] || item.name.en}</p>
									<p className="product-description-item">
										<span>{t("market.capacity")}</span>
										<span>
											{item.width * item.height} {t("market.cells")}
										</span>
									</p>
									{!!item.percent && (
										<div className={`product-description-item ${!isViewPriceForRacks ? "bonus-item" : ""}`}>
											<span>{t("market.bonus")}</span>
											<div className="bonus-percent">
												<div className="bonus-icon">
													<img src={ArrowBonusUp} alt="Arrow bonus up" />
												</div>

												<span>{`+${item.percent / 100}%`}</span>
											</div>
										</div>
									)}
								</Fragment>
							)}
							{item.type !== ITEM_TYPE.RACK && (
								<div className="product-price">
									<span className="product-price-title">{item.isOutOfStock && !item.discount ? "" : t("market.price")}</span>
									{(!item.isOutOfStock || (item.isOutOfStock && !!item.discount)) && (
										<div className="product-price-values">
											<p className={`product-price-new ${item.discount ? "success-text" : ""}`}>
												{decimalAdjust(item.price / currency.toSmall, currency.marketPrecision)} {currency.name}
											</p>
											{item.discount && item.currency === item.productCurrency && !!item.normalPrice && item.normalPrice > item.price && (
												<p className="product-price-old">
													{decimalAdjust(item.normalPrice / currency.toSmall, currency.precision).toFixed(currency.name === "RLT" ? 2 : 0)} {currency.name}
												</p>
											)}
										</div>
									)}
								</div>
							)}
							{item.type === ITEM_TYPE.RACK && isViewPriceForRacks && (
								<div className="product-price">
									<span className="product-price-title">{item.isOutOfStock && !item.discount ? "" : t("market.price")}</span>
									{(!item.isOutOfStock || (item.isOutOfStock && !!item.discount)) && (
										<div className="product-price-values">
											<p className={`product-price-new ${item.discount ? "success-text" : ""}`}>
												{decimalAdjust(item.price / currency.toSmall, currency.marketPrecision)} {currency.name}
											</p>
											{item.discount && item.currency === item.productCurrency && !!item.normalPrice && item.normalPrice > item.price && (
												<p className="product-price-old">
													{decimalAdjust(item.normalPrice / currency.toSmall, currency.precision).toFixed(currency.name === "RLT" ? 2 : 0)} {currency.name}
												</p>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					</Col>
					{(!item.isOutOfStock || (item.isOutOfStock && !!item.discount)) && item.id !== activeProductId && (
						<Fragment>
							{item.type === ITEM_TYPE.MINER && (
								<div className="status-of-sell">
									{item.canBeSold ? <p className="text positive">{t("market.canBeSold")}</p> : <p className="text negative">{t("market.cantBeSold")}</p>}
								</div>
							)}
							<div className="change-quantity-wrapper">
								<InputGroup className="change-quantity-inputs">
									<InputGroupAddon addonType="prepend">
										<Button
											type="button"
											className={`tree-dimensional-button small-btn ${quantity <= 1 || buyConfirmation ? "disabled" : ""}`}
											disabled={quantity <= 1 || buyConfirmation}
											onClick={() => this.handleQuantityChange(+quantity - 1)}
										>
											<span className="change-quantity-text">-</span>
										</Button>
									</InputGroupAddon>
									<Input
										value={quantity}
										className="quantity-input"
										onClick={(e) => {
											e.target.select();
										}}
										onChange={(e) => (item.currency !== "RLT" && balance[currency.code] < sum ? null : this.handleQuantityChange(e.target.value))}
									/>
									<InputGroupAddon addonType="append">
										<Button
											type="button"
											className={`tree-dimensional-button small-btn ${
												isMaxQtyDisabled || buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum) ? "disabled" : ""
											}`}
											disabled={isMaxQtyDisabled || buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum)}
											onClick={() => this.handleQuantityChange(+quantity + 1)}
										>
											<span className={`change-quantity-text`}>+</span>
										</Button>
									</InputGroupAddon>
								</InputGroup>
								<div className="total-price">
									<p>
										<span className="product-price-title">{t("market.price")} </span>
										<span>
											{decimalAdjust(sum / currency.toSmall, currency.marketPrecision)} {currency.name}
										</span>
									</p>
								</div>
							</div>
							<div className={`product-buy-button ${buyConfirmation ? "hidden" : ""}`}>
								<button
									type="button"
									className="tree-dimensional-button btn-cyan w-100"
									onClick={this.buyButtonHandler}
									disabled={buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum)}
								>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={item.currency !== "RLT" && balance[currency.code] < item.price ? cartDisabledIcon : cartIcon} alt="cart" />
										{item.type === ITEM_TYPE.MINER && (item.currency === "RLT" || balance[currency.code] >= sum) && <span className="btn-text">{t("market.buyMiner")}</span>}
										{item.type === ITEM_TYPE.RACK && (item.currency === "RLT" || balance[currency.code] >= sum) && <span className="btn-text">{t("market.buyRack")}</span>}
										{item.currency !== "RLT" && balance[currency.code] < sum && <span className="btn-text">{t("market.notEnough")}</span>}
									</span>
								</button>
							</div>
							<div className={`confirmation-wrapper w-100 ${buyConfirmation ? "" : "hidden"}`}>
								<p className="confirmation-title">{t("market.buyIt")}</p>
								<div className="confirmation-buttons w-100">
									<button type="button" className="tree-dimensional-button btn-cyan" onClick={(e) => this.buyActionHandler(e, { ...item, qty: quantity })}>
										<span className="btn-text">{t("market.yes")}</span>
									</button>
									<button type="button" className="tree-dimensional-button btn-red" onClick={this.toggleBuyConfirmation}>
										<span className="btn-text">{t("market.no")}</span>
									</button>
								</div>
							</div>
						</Fragment>
					)}
					<div className="dropdown">
						<Fragment>
							{item.type === ITEM_TYPE.MINER && <p>{t("market.minersDetails")}</p>}
							{item.type === ITEM_TYPE.RACK && <p>{t("market.rackDetails")}</p>}
						</Fragment>
						<img src={arrowDownIcon} alt="Arrow down" />
					</div>
				</Row>
				<div className="hidden-info">
					<p className="product-description">
						{item.description[language] || item.description.en}
						{!!item.createdByTitle && !!item.createdByTitle.text && (
							<Fragment>
								{" "}
								{!item.createdByTitle.link && <span>{item.createdByTitle.text}</span>}
								{!!item.createdByTitle.link && (
									<Link to={`${getLanguagePrefix(language)}${item.createdByTitle.link}`}>
										<span>{item.createdByTitle.text}</span>
									</Link>
								)}
							</Fragment>
						)}
					</p>
					{item.isOutOfStock && !item.discount && (
						<div className="info-overprice">
							<div className="icon-block">
								<LazyLoad offset={100}>
									<img src="/static/img/info.svg" alt="out of stock" />
								</LazyLoad>
							</div>
							<div className="text-block">
								<p>{t("market.outOfStock")}</p>
							</div>
						</div>
					)}
					{(!item.isOutOfStock || (item.isOutOfStock && !!item.discount)) && (
						<Fragment>
							{item.type === ITEM_TYPE.MINER && (
								<>
									<div className="characteristics">
										<div className="characteristics-block">
											<div className="characteristics-title">
												<LazyLoad height={10}>
													<img src="/static/img/icon/file.svg" alt="characteristics" />
													<span className="ml-2">{t("market.characteristics")}</span>
												</LazyLoad>
											</div>
										</div>
										<div className="characteristics-block">
											<p className="characteristics-name">{t("market.cells")}</p>
											<p className="characteristics-value">{item.width}</p>
										</div>
										<div className="characteristics-block">
											<p className="characteristics-name">{`${t("market.power")}:`}</p>
											<p className="characteristics-value">{`${item.power} Gh/s`}</p>
										</div>
									</div>
									<div className="status-of-sell">
										{item.canBeSold ? <p className="text positive">{t("market.canBeSold")}</p> : <p className="text negative">{t("market.cantBeSold")}</p>}
									</div>
								</>
							)}
							<div className="change-quantity-wrapper">
								<InputGroup className="change-quantity-inputs">
									<InputGroupAddon addonType="prepend">
										<Button
											type="button"
											className={`tree-dimensional-button small-btn ${quantity <= 1 || buyConfirmation ? "disabled" : ""}`}
											disabled={quantity <= 1 || buyConfirmation}
											onClick={() => this.handleQuantityChange(+quantity - 1)}
										>
											<span className="change-quantity-text">-</span>
										</Button>
									</InputGroupAddon>
									<Input
										value={quantity}
										className="quantity-input"
										disabled={buyConfirmation}
										onClick={(e) => {
											e.target.select();
										}}
										onChange={(e) => (item.currency !== "RLT" && balance[currency.code] < item.price ? null : this.handleQuantityChange(e.target.value))}
									/>
									<InputGroupAddon addonType="append">
										<Button
											type="button"
											className={`tree-dimensional-button small-btn ${
												isMaxQtyDisabled || buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum) ? "disabled" : ""
											}`}
											disabled={isMaxQtyDisabled || buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum)}
											onClick={() => this.handleQuantityChange(+quantity + 1)}
										>
											<span className={`change-quantity-text`}>+</span>
										</Button>
									</InputGroupAddon>
								</InputGroup>
								<div className="total-price">
									<p>
										<span className="product-price-title">{t("market.price")} </span>
										<span>
											{decimalAdjust(sum / currency.toSmall, currency.marketPrecision)} {currency.name}
										</span>
									</p>
								</div>
							</div>
							<div className={`product-buy-button ${buyConfirmation ? "hidden" : ""}`}>
								<button
									type="button"
									className="tree-dimensional-button btn-cyan w-100"
									onClick={this.buyButtonHandler}
									disabled={buyConfirmation || (item.currency !== "RLT" && balance[currency.code] < sum)}
								>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src="/static/img/cart.svg" alt="cart" />
										{item.currency === "RLT" && (
											<Fragment>
												{item.type === ITEM_TYPE.MINER && <span className="btn-text">{t("market.buyMiner")}</span>}
												{item.type === ITEM_TYPE.RACK && <span className="btn-text">{t("market.buyRack")}</span>}
											</Fragment>
										)}
										{item.currency !== "RLT" && (
											<Fragment>
												{balance[currency.code] >= sum && <span className="btn-text">{t("market.buyMiner")}</span>}
												{balance[currency.code] < sum && <span className="btn-text">{t("market.notEnough")}</span>}
											</Fragment>
										)}
									</span>
								</button>
							</div>
							<div className={`confirmation-wrapper ${buyConfirmation ? "" : "hidden"}`}>
								<p className="confirmation-title">{t("market.buyIt")}</p>
								<div className="confirmation-buttons">
									<button type="button" className="tree-dimensional-button btn-cyan" onClick={(e) => this.buyActionHandler(e, { ...item, qty: quantity })}>
										<span className="btn-text">{t("market.yes")}</span>
									</button>
									<button type="button" className="tree-dimensional-button btn-red" onClick={this.toggleBuyConfirmation}>
										<span className="btn-text">{t("market.no")}</span>
									</button>
								</div>
							</div>
						</Fragment>
					)}
					<div className="dropdown">
						<p>{t("market.hide")}</p>
						<img src={arrowDownUp} alt="Arrow up" />
					</div>
				</div>
				{item.type === ITEM_TYPE.RACK && (
					<ShowFullImage isShowImg={isShowImg} showImgUrl={`${process.env.STATIC_URL}/static/img/market/racks/large/${item.id}.png?v=1.0.3`} toggleShowImg={this.toggleShowImg} />
				)}
			</Col>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketProductCard));
