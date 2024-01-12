import React from "react";
import { Form } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ModalBuyButtons from "./ModalBuyButtons";
import MarketModal from "./MarketModal";
import decimalAdjust from "../../services/decimalAdjust";

import "../../assets/scss/Market/BuyLevelModal.scss";

const BuyLevelModal = ({ isOpen, toggleModal, userLevel, nextLevelPriceConfig, buyLevelHandler }) => {
	if (!nextLevelPriceConfig) {
		return null;
	}
	const { t } = useTranslation("Game");
	const { isEnoughToBuy, price, currency, currencyToSmall } = nextLevelPriceConfig;
	const normalizedPrice = decimalAdjust(price / currencyToSmall, 2).toFixed(2);

	const preBuyHandler = (e) => {
		toggleModal();
		buyLevelHandler(e);
	};

	return (
		<MarketModal isOpen={isOpen} toggleModal={toggleModal} titleText={`Buy level ${userLevel}`} className="buy-level-modal">
			<Form className="buy-level-modal-wrapper" onSubmit={preBuyHandler}>
				<div className="d-flex justify-content-between price-wrapper">
					<p>{t("market.price")}</p>
					<p className="price">{`${normalizedPrice} ${currency}`}</p>
				</div>
				{!isEnoughToBuy && <p className="not-enough-money">{t("market.notEnoughMoney")}</p>}
				<ModalBuyButtons onCancelHandler={toggleModal} isSubmitDisable={!isEnoughToBuy} />
			</Form>
		</MarketModal>
	);
};

BuyLevelModal.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	userLevel: PropTypes.number.isRequired,
	nextLevelPriceConfig: PropTypes.object.isRequired,
	buyLevelHandler: PropTypes.func.isRequired,
};

export default BuyLevelModal;
