import React, { Component, Fragment } from "react";
import { Col, Modal, ModalBody, Progress, Row } from "reactstrap";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import SimpleBar from "simplebar-react";

import { ELECTRICITY_EVENTS } from "../../../constants/SingleComponents";

import ShowFullImage from "../ShowFullImage";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import getPrefixPower from "../../../services/getPrefixPower";
import googleAnalyticsPush from "../../../services/googleAnalyticsPush";

import BuyLootboxButtonWrapper from "../../SingleComponents/BuyLootboxButtonWrapper";
import RollerButton from "../../SingleComponents/RollerButton";

import "../../../assets/scss/Market/SpecialEventStoreCard.scss";

import "simplebar-react/dist/simplebar.min.css";
import closeImage from "../../../assets/img/header/close_menu.svg";
import cartImage from "../../../assets/img/cart.svg";
import magnifierIcon from "../../../assets/img/icon/magnifier.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	isMobile: state.game.isMobile,
	language: state.game.language,
});

class MarketSeasonStoreProductsCard extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		buyProductStore: PropTypes.func.isRequired,
		isAvailableProduct: PropTypes.bool.isRequired,
		isPurchasedProduct: PropTypes.bool.isRequired,
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
			isShowImg: false,
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
		const { item_info: itemInfo } = item;
		if (prevProps.activeProductId !== activeProductId && activeProductId === itemInfo._id) {
			this.setState({ isAvailableConfirm: true });
		}
		if (prevProps.activeProductId !== activeProductId && (activeProductId !== itemInfo._id || !activeProductId)) {
			this.setState({ isAvailableConfirm: false });
		}
	}

	buyHandler = () => {
		const { buyProductStore, item, toggleActiveProduct } = this.props;
		const { event } = ELECTRICITY_EVENTS.PURCHASE;
		const { currency, item_info: itemInfo, item_type: itemType, price } = item;
		const currentCurrencyConfig = getCurrencyConfig(currency);
		const ecommerceData = {
			currency,
			value: decimalAdjust(price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance),
			tax: 0.0,
			affiliation: "Event Store",
			transaction_id: `${itemInfo._id}${Date.now()}`,
			items: [],
		};
		const itemObj = {
			item_name: "",
			item_id: itemInfo._id,
			price: decimalAdjust(price / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance),
			item_category: itemType === "mutation_component" ? "part" : itemType,
			quantity: 1,
		};
		if (item.item_type === "loot_box" || item.item_type === "hat") {
			itemObj.item_name = itemInfo.title.en;
		} else {
			itemObj.item_name = itemInfo.name.en;
		}
		ecommerceData.items.push(itemObj);
		googleAnalyticsPush(event, {
			ecommerceData,
		});
		buyProductStore(itemInfo._id, itemType, currency);
		toggleActiveProduct();
		this.setState({ isOpenModal: false });
	};

	chooseAction = () => {
		const { isMobile, toggleActiveProduct, item } = this.props;
		const { isOpenModal } = this.state;
		const { item_info: itemInfo } = item;
		if (isMobile && !isOpenModal && itemInfo?.items && itemInfo.items.length > 1) {
			return this.setState({ isOpenModal: true });
		}
		toggleActiveProduct(itemInfo._id);
	};

	closeModal = () => {
		const { toggleActiveProduct } = this.props;
		toggleActiveProduct();
		this.setState({ isOpenModal: false });
	};

	openModal = () => this.setState({ isOpenModal: true });

	toggleShowImg = (e) => {
		const { isShowImg } = this.state;
		e.stopPropagation();
		this.setState({
			isShowImg: !isShowImg,
		});
	};

	getButtonText = (isAvailableProduct, isEnoughFunds, isPurchasedProduct) => {
		const { t } = this.props;
		if (isAvailableProduct && !isEnoughFunds && isPurchasedProduct) {
			return t("market.buy");
		}
		if (!isAvailableProduct && !isEnoughFunds && isPurchasedProduct) {
			return t("market.soldOut");
		}
		if (isEnoughFunds && isPurchasedProduct) {
			return t("market.notEnough");
		}
		if (!isPurchasedProduct) {
			return t("market.purchased");
		}
	};

	render() {
		const { item, t, isAvailableProduct, language, toggleActiveProduct, isProcessing, isPurchasedProduct, isMobile, balance } = this.props;
		const { isAvailableConfirm, isOpenModal, isShowImg } = this.state;
		const { item_info: itemInfo, currency, price } = item;
		const currencyConfig = getCurrencyConfig(currency);
		const limitedSold = !!itemInfo.limit_for_sale && itemInfo.limit_for_sale - itemInfo.sold > 0;
		const isEnoughFunds = balance[currencyConfig.code] < price;

		return (
			<Fragment>
				{item.item_type === "loot_box" && (
					<Modal isOpen={isOpenModal} toggle={this.closeModal} centered={true} className="box-modal">
						<ModalBody className="box-modal-wrapper">
							<div className="box-modal-close">
								<button className="tree-dimensional-button close-menu-btn btn-default" onClick={this.closeModal}>
									<span className="close-btn-text">
										<img src={closeImage} width="12" height="12" alt="Close modal window" />
									</span>
								</button>
							</div>
							<h1 className="modal-mobile-title">{itemInfo.title[language] || itemInfo.title.en}</h1>
							<div className="box-modal-body">
								<div className="box-modal-main-block">
									<div className="box-image-block">
										<img className="box-img" src={`${process.env.STATIC_URL}/static/img/market/lootboxes/${itemInfo._id}.png?v=1.0.4`} alt="Lootbox image" />
										{!!itemInfo.limit_for_sale && (
											<div className="limit-progress-block">
												<Progress
													value={isAvailableProduct ? Math.round(((itemInfo.limit_for_sale - itemInfo.sold) / itemInfo.limit_for_sale) * 100) : 0}
													className="limit-progress-bar"
												/>
												<p className="limit-progress-text">
													{t("market.leftLootBox", {
														itemLimit: itemInfo.limit_for_sale,
														itemSold: itemInfo.limit_for_sale - itemInfo.sold > 0 ? itemInfo.limit_for_sale - itemInfo.sold : 0,
													})}
												</p>
											</div>
										)}
									</div>
									{isMobile && (
										<div className="box-modal-footer">
											<div className="price-block">
												<p className="price-text">{t("market.price")}</p>
												<p className="price-amount">
													{decimalAdjust(item.price / currencyConfig.toSmall, currencyConfig.divider).toFixed(2)} {currencyConfig.name}
												</p>
											</div>
											<BuyLootboxButtonWrapper
												isAvailableProduct={isAvailableProduct}
												isAvailableConfirm={isAvailableConfirm}
												toggleActiveProduct={toggleActiveProduct}
												isEnoughFunds={isEnoughFunds}
												chooseAction={this.chooseAction}
												buyHandler={this.buyHandler}
											/>
										</div>
									)}
								</div>
								<div className="box-details">
									<h2 className="box-name">{itemInfo.title[language] || itemInfo.title.en}</h2>
									<p className="box-description">{t("market.insideIsOne")}</p>
									<SimpleBar style={{ maxHeight: 260 }} autoHide={false}>
										<div className={`miners-list-block ${itemInfo.items.length > 11 ? "with-scroll" : ""}`}>
											<ul className="list">
												{itemInfo.items.sort(this.compare).map((bonus, index) => (
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
														{bonus.type === "RLT" && `${decimalAdjust(bonus.amount / currencyConfig.toSmall, 2)} ${currencyConfig.name}`}
														{["mutation_component"].includes(bonus.type) && (
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
										<p className="price-amount">
											{decimalAdjust(item.price / currencyConfig.toSmall, currencyConfig.divider).toFixed(2)} {currencyConfig.name}
										</p>
									</div>
									<BuyLootboxButtonWrapper
										isAvailableProduct={isAvailableProduct}
										isAvailableConfirm={isAvailableConfirm}
										toggleActiveProduct={toggleActiveProduct}
										isEnoughFunds={isEnoughFunds}
										chooseAction={this.chooseAction}
										buyHandler={this.buyHandler}
									/>
								</div>
							)}
						</ModalBody>
					</Modal>
				)}
				<Col xs={12} md={6} lg={4} key={item._id} className="store-container">
					<Row noGutters className={`main-store-container product-container ${isAvailableProduct ? "" : "disable-store-item"} ${isAvailableConfirm ? "confirm" : ""}`}>
						<Col xs={12}>
							<div className="name-block">
								<h2 className="store-name">{itemInfo.name ? itemInfo.name[language] || itemInfo.name.en : itemInfo.title[language] || itemInfo.title.en}</h2>
							</div>
							<div
								className={`store-preview-wrapper${item.item_type === "loot_box" && itemInfo.items.length > 1 ? " box-preview-wrapper" : ""}${
									item.item_type === "appearance" ? " room-preview-wrapper" : ""
								}`}
							>
								{item.item_type === "loot_box" && itemInfo.items.length > 1 && (
									<>
										<div className="box-info-block">
											<button type="button" className="info-btn" onClick={this.openModal}>
												<span className="btn-text">{t("market.moreDetails")}</span>
											</button>
										</div>
									</>
								)}
								<div className={`store-preview${item.item_type === "loot_box" ? " box-preview" : ""}`} onClick={(e) => this.toggleShowImg(e, item._id)}>
									<div className="info-block">
										<LazyLoad offset={100}>
											{item.item_type === "miner" && (
												<img
													className="store-img"
													src={`${process.env.STATIC_URL}/static/img/market/miners/${itemInfo.filename}.gif?v=${item.img_ver}`}
													width={175}
													alt={itemInfo._id}
												/>
											)}
											{item.item_type === "loot_box" && (
												<img className="store-img" src={`${process.env.STATIC_URL}/static/img/market/lootboxes/${itemInfo._id}.png?v=1.0.3`} alt={itemInfo._id} />
											)}
											{item.item_type === "hat" && (
												<img className="store-img" src={`${process.env.STATIC_URL}/static/img/market/hats/${itemInfo._id}.png?v=1.0.3`} width={85} alt={itemInfo.id} />
											)}
											{item.item_type === "appearance" && (
												<img className="store-img" src={`${process.env.STATIC_URL}/static/img/market/appearances/${itemInfo._id}.png?v=1.0.3`} alt={itemInfo._id} />
											)}
											{item.item_type === "battery" && (
												<img className="store-img" src={`${process.env.STATIC_URL}/static/img/market/batteries/${itemInfo._id}.png?v=1.0.3`} width={175} alt={itemInfo._id} />
											)}
											{item.item_type === "trophy" && (
												<img
													className="store-img"
													src={`${process.env.STATIC_URL}/static/img/game/room/trophies/${itemInfo.file_name}.png?v=1.0.3`}
													width={90}
													alt={itemInfo._id}
												/>
											)}
											{item.item_type === "rack" && (
												<img className="store-img" src={`${process.env.STATIC_URL}/static/img/market/racks/${itemInfo._id}.png?v=1.0.3`} width={175} alt={itemInfo._id} />
											)}
										</LazyLoad>
										{item.item_type === "miner" && (
											<div className="power-info">
												<span className="power-count">
													{getPrefixPower(itemInfo.power).power} {getPrefixPower(itemInfo.power).hashDetail}
												</span>
											</div>
										)}
										{item.item_type === "appearance" && (
											<div className="appearance-image-view-icon">
												<LazyLoad offset={100}>
													<img src={magnifierIcon} width="16" height="16" alt="View" />
												</LazyLoad>
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="store-price">
								<p className="price-text">{t("market.price")}</p>
								{(!item.limit_for_sale || limitedSold) && (
									<div className="price-block">
										<span className="price-amount">{decimalAdjust(item.price / currencyConfig.toSmall, currencyConfig.divider).toFixed(2)}</span>{" "}
										<span className="currency-block">
											<img className="currency-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} alt="" />
										</span>
									</div>
								)}
								{!!item.limit_for_sale && item.limit_for_sale - item.sold <= 0 && <p className="price-amount">-</p>}
							</div>
							<div className={`store-buy-button ${!isAvailableConfirm ? "" : "confirm"}`}>
								<RollerButton
									size="small"
									className="special-event-button"
									width={100}
									icon={isAvailableProduct && !isEnoughFunds && isPurchasedProduct && cartImage}
									text={this.getButtonText(isAvailableProduct, isEnoughFunds, isPurchasedProduct, t)}
									action={this.chooseAction}
									color="gold"
									hidden={isAvailableConfirm}
									disabled={!isAvailableProduct || isProcessing || !isPurchasedProduct || isEnoughFunds}
								/>
								<div className={`buy-confirm ${isAvailableConfirm ? "" : "hidden"}`}>
									<p className="buy-confirm-text">Are you sure?</p>
									<div className="buy-confirm-buttons">
										<RollerButton
											size="small"
											className="special-event-button"
											width={100}
											text={t("market.buy")}
											action={this.buyHandler}
											color="gold"
											disabled={!isAvailableProduct || isProcessing || !isPurchasedProduct || isEnoughFunds}
										/>
										<RollerButton
											size="small"
											className="special-event-button discard-button"
											width={100}
											text={t("market.discard")}
											action={() => toggleActiveProduct()}
											color="red"
											disabled={!isAvailableProduct || isProcessing || !isPurchasedProduct || isEnoughFunds}
										/>
									</div>
								</div>
							</div>
						</Col>
					</Row>
					{item.item_type === "appearance" && (
						<ShowFullImage
							isShowImg={isShowImg}
							showImgUrl={`${process.env.STATIC_URL}/static/img/market/appearances/large/${itemInfo._id}.png?v=1.0.2`}
							toggleShowImg={this.toggleShowImg}
						/>
					)}
				</Col>
			</Fragment>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketSeasonStoreProductsCard));
