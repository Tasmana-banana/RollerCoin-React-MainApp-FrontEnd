import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import cartImage from "../../assets/img/cart.svg";

const BuyLootboxButtonWrapper = ({ isAvailableProduct, isAvailableConfirm, toggleActiveProduct, chooseAction, buyHandler, isEnoughFunds = null }) => {
	const { t } = useTranslation("SingleComponents");
	return (
		<div className={`box-buy-button ${isAvailableProduct ? "" : "disable"}`}>
			<button type="button" className={`tree-dimensional-button btn-gold w-100 ${isAvailableConfirm ? "hidden" : ""}`} disabled={!isAvailableProduct || isEnoughFunds} onClick={chooseAction}>
				<span className="with-horizontal-image flex-lg-row button-text-wrapper">
					<img src={cartImage} alt="cart" />
					{!isEnoughFunds && <span className="btn-text">{t("market.buyBox")}</span>}
					{isEnoughFunds && <span className="btn-text">{t("market.notEnough")}</span>}
				</span>
			</button>
			<div className={`buy-confirm-buttons ${!isAvailableConfirm ? "hidden" : ""}`}>
				<button type="button" className="tree-dimensional-button btn-gold w-100 mr-1" onClick={buyHandler}>
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
	);
};

BuyLootboxButtonWrapper.propTypes = {
	isAvailableProduct: PropTypes.bool.isRequired,
	isAvailableConfirm: PropTypes.bool.isRequired,
	toggleActiveProduct: PropTypes.func.isRequired,
	chooseAction: PropTypes.func.isRequired,
	buyHandler: PropTypes.func.isRequired,
	isEnoughFunds: PropTypes.bool,
};

export default BuyLootboxButtonWrapper;
