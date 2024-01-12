import React from "react";
import PropTypes from "prop-types";

import paymentDoneImg from "../../assets/img/market/payment_status/payment_done.svg";

const PaymentConfirmed = ({ price, close, t }) => (
	<div className="payment-confirmed-wrapper">
		<div className="payment-confirmed-body">
			<h2 className="payment-confirmed-total-text">{t("replenishmentModal.totalAmount")}</h2>
			<h3 className="payment-confirmed-amount-payment">{price} RLT</h3>
			<div className="payment-confirmed-status">
				<img src={paymentDoneImg} width="32" height="32" alt="Invoice canceled image" />
				<p className="confirmed-status-text">{t("replenishmentModal.paymentConfirmed")}</p>
			</div>
			<p className="payment-confirmed-info">
				<span className="confirmed-info-price">{price} RLT</span> {t("replenishmentModal.balanceSuccessfully")}
			</p>
		</div>
		<div className="payment-confirmed-footer">
			<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={close}>
				<span className="btn-text">{t("replenishmentModal.close")}</span>
			</button>
		</div>
	</div>
);

PaymentConfirmed.propTypes = {
	price: PropTypes.number.isRequired,
	close: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};

export default PaymentConfirmed;
