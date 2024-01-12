import React from "react";
import PropTypes from "prop-types";

import paymentReceivedImg from "../../assets/img/market/payment_status/payment_process.svg";

const PaymentReceived = ({ price, exchangeRateTime, currency, t }) => (
	<div className="payment-received-wrapper">
		<div className="payment-received-body">
			<h2 className="payment-received-total-text">{t("replenishmentModal.totalAmount")}</h2>
			<h3 className="payment-received-amount-payment">{price} RLT</h3>
			<div className="payment-received-status">
				<img src={paymentReceivedImg} width="32" height="32" alt="Payment received image" />
				<p className="received-status-text">{t("replenishmentModal.paymentReceived")}</p>
			</div>
			<p className="payment-received-info">{t("replenishmentModal.waitingFor")}</p>
			<p className="payment-received-time-left">
				{t("replenishmentModal.timeLeft")} <span className="time-left-color">{exchangeRateTime}</span>
			</p>
		</div>
		<div className="payment-received-footer">{t("replenishmentModal.ifThePayment", { currency })}</div>
	</div>
);

PaymentReceived.propTypes = {
	price: PropTypes.number.isRequired,
	exchangeRateTime: PropTypes.string.isRequired,
	currency: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};

export default PaymentReceived;
