import React from "react";
import PropTypes from "prop-types";

import invoiceCanceledImg from "../../assets/img/market/payment_status/payment_error.svg";

const InvoiceCanceled = ({ price, t }) => (
	<div className="invoice-canceled-wrapper">
		<h2 className="invoice-canceled-total-text">{t("replenishmentModal.totalAmount")}</h2>
		<h3 className="invoice-canceled-amount-payment">{price} RLT</h3>
		<div className="invoice-canceled-status">
			<img src={invoiceCanceledImg} width="32" height="32" alt="Invoice canceled image" />
			<p className="canceled-status-text">{t("replenishmentModal.invoiceCanceled")}</p>
		</div>
		<p className="invoice-canceled-info">{t("replenishmentModal.canceledInfo")}</p>
	</div>
);

InvoiceCanceled.propTypes = {
	price: PropTypes.number.isRequired,
	t: PropTypes.func.isRequired,
};

export default InvoiceCanceled;
