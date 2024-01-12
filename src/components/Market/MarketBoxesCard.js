import React, { Component, Fragment } from "react";
import { Col, Modal, ModalBody, Progress, Row } from "reactstrap";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import SimpleBar from "simplebar-react";
import * as actionsGame from "../../actions/game";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";
import getPrefixPower from "../../services/getPrefixPower";
import BuyLootboxButtonWrapper from "../SingleComponents/BuyLootboxButtonWrapper";

import "simplebar-react/dist/simplebar.min.css";
import closeImage from "../../assets/img/header/close_menu.svg";
import cartImage from "../../assets/img/cart.svg";

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

class MarketBoxesCard extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		buyBox: PropTypes.func.isRequired,
		isAvailableProduct: PropTypes.bool.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		isProcessing: PropTypes.bool.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		balance: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isOpenModal: false,
			isAvailableConfirm: false,
			isOpenReplenishmentModal: false,
		};
		this.colors = {
			ffdc00: "yellow",
			"03e1e4": "blue",
			ff33dd: "purple",
			ffffff: "white",
		};
	}

	componentDidUpdate(prevProps) {
		const { activeProductId, item } = this.props;
		if (prevProps.activeProductId !== activeProductId && activeProductId === item._id) {
			this.setState({ isAvailableConfirm: true });
		}
		if (prevProps.activeProductId !== activeProductId && (activeProductId !== item._id || !activeProductId)) {
			this.setState({ isAvailableConfirm: false });
		}
	}

	closeModal = () => {
		const { toggleActiveProduct } = this.props;
		toggleActiveProduct();
		this.setState({ isOpenModal: false });
	};

	openModal = () => this.setState({ isOpenModal: true });

	// eslint-disable-next-line class-methods-use-this
	compare = (a, b) => {
		if (a.sort && b.sort) {
			return a.sort - b.sort;
		}
		return a.rarity_drop_rate - b.rarity_drop_rate || b.amount - a.amount || a.drop_rate - b.drop_rate;
	};

	buyHandler = () => {
		const { buyBox, item, toggleActiveProduct } = this.props;
		buyBox(item._id);
		toggleActiveProduct();
		this.setState({ isOpenModal: false });
	};

	chooseAction = () => {
		const { isMobile, toggleActiveProduct, balance, item } = this.props;
		const { isOpenModal } = this.state;
		if (isMobile && !isOpenModal) {
			return this.setState({ isOpenModal: true });
		}
		const currency = getCurrencyConfig(item.currency);
		if (balance[currency.code] < item.price) {
			return this.openReplenishmentModal();
		}
		toggleActiveProduct(item._id);
	};

	openReplenishmentModal = () => {
		const { item, replenishmentModalStats, setReplenishmentModalStats, language } = this.props;
		setReplenishmentModalStats({
			...replenishmentModalStats,
			isOpen: true,
			itemName: item.title[language] || item.title.en,
			quantity: 1,
			price: item.price,
		});
	};

	render() {
		const { item, t, isAvailableProduct, language, toggleActiveProduct, isProcessing, isMobile } = this.props;
		const { isOpenModal, isAvailableConfirm } = this.state;
		const rltConfig = getCurrencyConfig("RLT");
		const limitedSold = !!item.limit_for_sale && item.limit_for_sale - item.sold > 0;
		return (
			<Fragment>
				<Modal isOpen={isOpenModal} toggle={this.closeModal} centered={true} className="box-modal">
					<ModalBody className="box-modal-wrapper">
						<div className="box-modal-close">
							<button className="tree-dimensional-button close-menu-btn btn-default" onClick={this.closeModal}>
								<span className="close-btn-text">
									<img src={closeImage} width="12" height="12" alt="Close modal window" />
								</span>
							</button>
						</div>
						<h1 className="modal-mobile-title">{item.title[language] || item.title.en}</h1>
						<div className="box-modal-body">
							<div className="box-modal-main-block">
								<div className="box-image-block">
									<img className="box-img" src={`${process.env.STATIC_URL}/static/img/market/lootboxes/${item._id}.png?v=1.0.0`} alt="Lootbox image" />
									{!!item.limit_for_sale && (
										<div className="limit-progress-block">
											<Progress value={isAvailableProduct ? Math.round(((item.limit_for_sale - item.sold) / item.limit_for_sale) * 100) : 0} className="limit-progress-bar" />
											<p className="limit-progress-text">
												{t("market.leftLootBox", {
													itemLimit: item.limit_for_sale,
													itemSold: item.limit_for_sale - item.sold > 0 ? item.limit_for_sale - item.sold : 0,
												})}
											</p>
										</div>
									)}
								</div>
								{isMobile && (
									<div className="box-modal-footer">
										<div className="price-block">
											<p className="price-text">{t("market.price")}</p>
											<p className="price-amount">{decimalAdjust(item.price / rltConfig.toSmall, 2).toFixed(2)} RLT</p>
										</div>
										<BuyLootboxButtonWrapper
											isAvailableProduct={isAvailableProduct}
											isAvailableConfirm={isAvailableConfirm}
											toggleActiveProduct={toggleActiveProduct}
											chooseAction={this.chooseAction}
											buyHandler={this.buyHandler}
										/>
									</div>
								)}
							</div>
							<div className="box-details">
								<h2 className="box-name">{item.title[language] || item.title.en}</h2>
								<p className="box-description">{t("market.insideIsOne")}</p>
								<SimpleBar style={{ maxHeight: 260 }} autoHide={false}>
									<div className={`miners-list-block ${item.items.length > 10 ? "with-scroll" : ""}`}>
										<ul className="list">
											{item.items.sort(this.compare).map((bonus, index) => (
												<li key={index} className={`item ${this.colors[bonus.base_color_hex]}`}>
													{["miner", "rack"].includes(bonus.type) && (
														<div className="item-text">
															<span>{bonus.item_info.name[language] || bonus.item_info.name.en}</span>
															{bonus.type === "miner" && (
																<span className="item-miner-power">
																	{getPrefixPower(bonus.item_info.power).power} {getPrefixPower(bonus.item_info.power).hashDetail}
																</span>
															)}
														</div>
													)}
													{["RLT", "RST"].includes(bonus.type) && `${decimalAdjust(bonus.amount / rltConfig.toSmall, 2)} ${bonus.type}`}
													{["ETH_SMALL", "BNB_SMALL", "DOGE_SMALL"].includes(bonus.type) &&
														`${decimalAdjust(bonus.amount / getCurrencyConfig(bonus.type).toSmall, 2)} ${getCurrencyConfig(bonus.type).name}`}
													{bonus.type === "mutation_component" && (
														<div className="item-text">
															<span>{bonus.item_info.name[language] || bonus.item_info.name.en}</span>
															<span className="item-miner-power">x{bonus.amount}</span>
														</div>
													)}
												</li>
											))}
										</ul>
									</div>
								</SimpleBar>
							</div>
						</div>
						{!isMobile && (
							<div className="box-modal-footer">
								<div className="price-block">
									<p className="price-text">{t("market.price")}</p>
									<p className="price-amount">{decimalAdjust(item.price / rltConfig.toSmall, 2).toFixed(2)} RLT</p>
								</div>
								<BuyLootboxButtonWrapper
									isAvailableProduct={isAvailableProduct}
									isAvailableConfirm={isAvailableConfirm}
									toggleActiveProduct={toggleActiveProduct}
									chooseAction={this.chooseAction}
									buyHandler={this.buyHandler}
								/>
							</div>
						)}
					</ModalBody>
				</Modal>
				<Col xs={12} lg={4} key={item._id} className="box-container">
					<Row noGutters className={`main-box-container product-container ${isAvailableProduct ? "" : "disable-box-item"}`}>
						<Col xs={12}>
							<div className="box-preview-wrapper">
								<div className="box-info-block">
									<button type="button" className="info-btn" onClick={this.openModal}>
										<span className="btn-text">{t("market.moreDetails")}</span>
									</button>
								</div>
								<div className="box-preview">
									<div className="info-block">
										<h2 className="box-name">{item.title[language] || item.title.en}</h2>
										<LazyLoad offset={100}>
											<img className="box-img" src={`${process.env.STATIC_URL}/static/img/market/lootboxes/${item._id}.png?v=1.0.0`} alt="Lootbox image" />
										</LazyLoad>
									</div>
									{limitedSold && (
										<div className="limit-progress-block">
											<Progress value={isAvailableProduct ? Math.round(((item.limit_for_sale - item.sold) / item.limit_for_sale) * 100) : 0} className="limit-progress-bar" />
											<p className="limit-progress-text">
												{t("market.leftLootBox", {
													itemLimit: item.limit_for_sale,
													itemSold: item.limit_for_sale - item.sold > 0 ? item.limit_for_sale - item.sold : 0,
												})}
											</p>
										</div>
									)}
								</div>
							</div>
							<div className="box-price">
								<p className="price-text">{t("market.price")}</p>
								{(!item.limit_for_sale || limitedSold) && <p className="price-amount">{decimalAdjust(item.price / rltConfig.toSmall, 2).toFixed(2)} RLT</p>}
								{!!item.limit_for_sale && item.limit_for_sale - item.sold <= 0 && <p className="price-amount">-</p>}
							</div>
							<div className={`box-buy-button ${isAvailableProduct ? "" : "disable"}`}>
								<button
									type="button"
									className={`tree-dimensional-button btn-gold w-100 ${isAvailableConfirm && !isOpenModal ? "hidden" : ""}`}
									disabled={!isAvailableProduct}
									onClick={this.chooseAction}
								>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={cartImage} alt="cart" />
										{isAvailableProduct && (
											<Fragment>
												<span className="btn-text">{t("market.buyBox")}</span>
											</Fragment>
										)}
										{!isAvailableProduct && <span className="btn-text">{t("market.soldOut")}</span>}
									</span>
								</button>
								<div className={`buy-confirm-buttons ${isAvailableConfirm && !isOpenModal ? "" : "hidden"}`}>
									<button type="button" className="tree-dimensional-button btn-gold w-100 mr-1" disabled={!isAvailableProduct || isProcessing} onClick={this.buyHandler}>
										<span className="with-horizontal-image flex-lg-row button-text-wrapper">
											<span className="btn-text confirm-text">{t("market.buy")}</span>
										</span>
									</button>
									<button type="button" className="tree-dimensional-button btn-red w-100 ml-1" onClick={() => toggleActiveProduct()}>
										<span className="with-horizontal-image flex-lg-row button-text-wrapper">
											<span className="btn-text confirm-text">{t("market.discard")}</span>
										</span>
									</button>
								</div>
							</div>
						</Col>
					</Row>
				</Col>
			</Fragment>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketBoxesCard));
