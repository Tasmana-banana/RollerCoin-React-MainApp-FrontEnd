import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { ReactSelectOption, ReactSelectValue } from "./ReactSelectOption";

const NotEnoughRlt = (props) => {
	const { quantity, price, itemName, setSelectedCurrency, selectedCurrency, setStep, optionsForSelect, isLoading, t } = props;
	return (
		<div className="not-enough-wrapper">
			<h2 className="not-enough-header">{t("replenishmentModal.yourOrder")}</h2>
			<div className="not-enough-order">
				<div className="order-title">
					<p className="title-text">{t("replenishmentModal.orderList")}</p>
					<p className="title-text">{t("replenishmentModal.totalAmount")}</p>
				</div>
				<div className="order-body">
					<p className="order-body-name">
						{quantity} x {itemName}
					</p>
					<p className="order-body-price">{price} RLT</p>
				</div>
				<div className="order-select">
					<div className="order-select-warning">
						<img className="select-warning-img" src="/static/img/icon/error_notice.svg" alt="error image" />
						<p className="select-warning-text">{t("replenishmentModal.notEnough")}</p>
					</div>
					<div className="order-select-currency">
						<p className="select-currency-text">{t("replenishmentModal.buyIn")}</p>
						<Select
							className="select-currency-container"
							classNamePrefix="select-currency"
							value={selectedCurrency}
							onChange={setSelectedCurrency}
							options={optionsForSelect}
							isClearable={false}
							isSearchable={false}
							components={{ Option: ReactSelectOption, ValueContainer: ReactSelectValue }}
						/>
					</div>
				</div>
				<div className="order-confirmation-button">
					<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={setStep} disabled={isLoading}>
						<span className="btn-text">{t("replenishmentModal.buyRLT")}</span>
					</button>
				</div>
			</div>
		</div>
	);
};

NotEnoughRlt.propTypes = {
	quantity: PropTypes.number.isRequired,
	price: PropTypes.number.isRequired,
	itemName: PropTypes.string.isRequired,
	selectedCurrency: PropTypes.object.isRequired,
	optionsForSelect: PropTypes.array.isRequired,
	setSelectedCurrency: PropTypes.func.isRequired,
	setStep: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	t: PropTypes.func.isRequired,
};

export default NotEnoughRlt;
