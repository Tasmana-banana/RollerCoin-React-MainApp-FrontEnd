import React, { Fragment, useState } from "react";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import * as actionsGame from "../../actions/game";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import ShowFullImage from "./ShowFullImage";

import magnifierIcon from "../../assets/img/icon/magnifier.svg";
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

const MarketAppearanceCard = ({ t, language, isMobile, balance, item, setAppearance, isSetAvailable, buyAction, setReplenishmentModalStats, replenishmentModalStats }) => {
	const [buyConfirmation, setBuyConfirmation] = useState(false);
	const [isShowImg, setIsShowImg] = useState(false);
	const currency = getCurrencyConfig(item.currency);

	const toggleBuyConfirmation = () => {
		if (balance[currency.code] < item.price) {
			return openReplenishmentModal();
		}
		setBuyConfirmation(!buyConfirmation);
	};

	const toggleShowImg = (e) => {
		e.stopPropagation();
		setIsShowImg(!isShowImg);
	};

	const buySkin = async () => {
		toggleBuyConfirmation();
		await buyAction({ ...item, qty: 1 });
	};

	const openReplenishmentModal = () => {
		setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: item.name[language] || item.name.en, quantity: 1, price: item.price });
	};
	const isRoomFree = item.price === 0;
	return (
		<Fragment>
			<Col xs={12} lg={4} key={item.id} className={`appearance-container ${buyConfirmation ? "active" : ""} ${item.isOutOfStock ? "out-of-stock" : ""}`}>
				<Row noGutters className="main-appearance-container">
					<Col xs={12}>
						<p className="appearance-title">{item.name[language] || item.name.en}</p>
						<div className="appearance-image-wrapper" onClick={(e) => toggleShowImg(e, item.id)}>
							<LazyLoad offset={100}>
								<img className="appearance-image" src={`${process.env.STATIC_URL}/static/img/market/appearances/${item.id}.png?v=1.0.2`} alt={item.id} width="273" height="176" />
							</LazyLoad>
							{!!item.displayedPercent && !item.userHas && (
								<div className="discount-percent">
									<span>{`-${item.displayedPercent}%`}</span>
								</div>
							)}
							<div className="appearance-image-view-icon">
								<LazyLoad offset={100}>
									<img src={magnifierIcon} width="16" height="16" alt="View" />
								</LazyLoad>
							</div>
						</div>
						{!item.userHas && (
							<div className="appearance-price">
								<p className="appearance-price-title">{item.isOutOfStock ? "" : t("market.price")}</p>
								{!isRoomFree && (
									<Fragment>
										{item.discount && <p className="appearance-price-old">{decimalAdjust(item.normalPrice / currency.toSmall, currency.precision).toFixed(2)}</p>}
										<p className={`appearance-price-new ${item.discount ? "success-text" : ""}`}>
											{decimalAdjust(item.price / currency.toSmall, currency.precision).toFixed(2)} {currency.name}
										</p>
									</Fragment>
								)}
								{isRoomFree && <p className={`appearance-price-new`}>{t("market.free")}</p>}
							</div>
						)}
						{item.userHas && (
							<div className="appearance-price">
								<p className="appearance-price-title">{item.isOutOfStock ? "" : t("market.price")}</p>
								<p className="appearance-status">{`${item.selected ? t("market.installed") : t("market.bought")}`}</p>
							</div>
						)}
						{!item.userHas && (
							<div className={`appearance-buy-button-wrapper ${buyConfirmation && isMobile && "hidden"}`}>
								<button
									type="button"
									className="tree-dimensional-button btn-cyan w-100"
									disabled={item.currency !== "RLT" && balance[currency.code] < item.price}
									onClick={toggleBuyConfirmation}
								>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={item.currency !== "RLT" && balance[currency.code] < item.price ? cartDisabledIcon : cartIcon} alt="cart" />
										{isRoomFree && <span className="btn-text">{t("market.getFree")}</span>}
										{!isRoomFree && (
											<span className="btn-text">{item.currency !== "RLT" && balance[currency.code] < item.price ? t("market.notEnough") : t("market.buySkin")}</span>
										)}
									</span>
								</button>
							</div>
						)}
						{item.userHas && isSetAvailable && (
							<div className={`appearance-buy-button-wrapper ${buyConfirmation && isMobile && "hidden"}`}>
								<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled={item.selected} onClick={() => setAppearance(item.id)}>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<span className="btn-text">{t("market.setRoom")}</span>
									</span>
								</button>
							</div>
						)}
						{item.userHas && !isSetAvailable && (
							<div className={`appearance-buy-button-wrapper ${buyConfirmation && isMobile && "hidden"}`}>
								<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled>
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<span className="btn-text">{t("market.purchased")}</span>
									</span>
								</button>
							</div>
						)}
					</Col>
				</Row>
				<div className="appearance-confirmation-wrapper">
					<p className="appearance-confirmation-title">{t("market.buyIt")}</p>
					<div className="appearance-confirmation-buttons">
						<button type="button" className="tree-dimensional-button btn-cyan" onClick={buySkin}>
							<span className="btn-text">{t("market.yes")}</span>
						</button>
						<button type="button" className="tree-dimensional-button btn-red" onClick={toggleBuyConfirmation}>
							<span className="btn-text">{t("market.no")}</span>
						</button>
					</div>
				</div>
				<ShowFullImage isShowImg={isShowImg} showImgUrl={`${process.env.STATIC_URL}/static/img/market/appearances/large/${item.id}.png?v=1.0.2`} toggleShowImg={toggleShowImg} />
			</Col>
		</Fragment>
	);
};

MarketAppearanceCard.propTypes = {
	item: PropTypes.object.isRequired,
	balance: PropTypes.number.isRequired,
	setAppearance: PropTypes.func,
	isSetAvailable: PropTypes.bool.isRequired,
	setReplenishmentModalStats: PropTypes.func.isRequired,
	replenishmentModalStats: PropTypes.object.isRequired,
	buyAction: PropTypes.func.isRequired,
	language: PropTypes.string.isRequired,
	wsReact: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketAppearanceCard));
