import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { InputGroup, Input } from "reactstrap";
import Slider from "rc-slider";
import RollerButton from "../SingleComponents/RollerButton";
import RollerCheckbox from "../SingleComponents/RollerCheckbox";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";

import "../../assets/scss/Marketplace/BuyFilters.scss";

const BuyFilters = ({ filters, filtersHandler, balance }) => {
	const RLTConfig = getCurrencyConfig("RLT");
	const { t } = useTranslation("Marketplace");

	const handleCheckboxFilters = (value, key) => {
		filtersHandler(
			{
				...filters,
				[key]: { ...filters[key], values: { ...filters[key].values, [value]: !filters[key].values[value] } },
			},
			true
		);
	};

	const handleMaxButton = (e, { key, filter }) => {
		e.stopPropagation();
		const currBalance = Math.floor(decimalAdjust(Number(balance?.rlt) / RLTConfig.toSmall, RLTConfig.precision));
		if (!currBalance) {
			handleRangeFilter([0, 1], key, "slider");
			return;
		}
		if (filter.limitMax > currBalance && currBalance > filter.min) {
			handleRangeFilter(currBalance, key, "max");
		} else if (filter.max < filter.limitMax) {
			handleRangeFilter(filter.limitMax, key, "max");
		}
	};

	const handleRangeFilter = (value, key, inputType) => {
		switch (inputType) {
			case "min":
				if (value === "" || value >= 0) {
					filtersHandler(
						{
							...filters,
							[key]: { ...filters[key], min: +value },
						},
						false
					);
				}
				break;
			case "max":
				if (value === "" || value >= 0) {
					const correctedValue = Math.min(filters[key].limitMax, +value);
					filtersHandler(
						{
							...filters,
							[key]: { ...filters[key], max: correctedValue },
						},
						false
					);
				}
				break;
			case "slider":
				filtersHandler(
					{
						...filters,
						[key]: { ...filters[key], min: value[0], max: value[1] },
					},
					false
				);
				break;
			default:
				break;
		}
	};

	return (
		<div className="marketplace-filters-wrapper">
			{Object.keys(filters).map((key) => {
				const filter = filters[key];
				switch (filter.type) {
					case "range":
						return (
							<div key={key} className="marketplace-filter-wrapper">
								<p className="filter-title">
									<span>{t(`buy.filters.${key}`)}:</span>
									{key === "price" && (
										<span onClick={(e) => handleMaxButton(e, { key, filter })} className="filter-max">
											{t("buy.filters.max")}
										</span>
									)}
								</p>

								<div className="roller-slider-wrapper">
									<Slider
										range
										className="roller-slider"
										value={[filter.min, filter.max]}
										min={filter.limitMin}
										max={filter.limitMax}
										step={1}
										allowCross={false}
										onChange={(value) => handleRangeFilter(value, key, "slider")}
									/>
								</div>
								<InputGroup className="change-amount-inputs">
									<Input
										value={filter.min}
										className="filters-input"
										onClick={(e) => {
											e.stopPropagation();
											e.target.select();
										}}
										onBlur={filter.min > filter.max ? () => handleRangeFilter(filter.max, key, "min") : null}
										onChange={(e) => handleRangeFilter(e.target.value, key, "min")}
									/>
									<p className="filter-dash">-</p>
									<Input
										value={filter.max}
										className="filters-input"
										onClick={(e) => {
											e.stopPropagation();
											e.target.select();
										}}
										onBlur={filter.max < filter.min ? () => handleRangeFilter(filter.min, key, "max") : null}
										onChange={(e) => handleRangeFilter(e.target.value, key, "max")}
									/>
									<RollerButton className="filter-btn" size="small" color="cyan" text="OK" action={() => filtersHandler(filters, true)} />
								</InputGroup>
							</div>
						);
					case "list":
						return (
							<div className="marketplace-filter-wrapper">
								<p className="filter-title">{t(`buy.filters.${key}`)}:</p>
								{Object.keys(filter.values).map((itemKey) => (
									<RollerCheckbox
										key={`${key}-${itemKey}`}
										className="marketplace-filter-item"
										title={itemKey}
										value={itemKey}
										isChecked={filter.values[itemKey]}
										handleChange={(value) => handleCheckboxFilters(value, key)}
									/>
								))}
							</div>
						);
					default:
						return <Fragment />;
				}
			})}
		</div>
	);
};

BuyFilters.propTypes = {
	filters: PropTypes.object.isRequired,
	filtersHandler: PropTypes.func.isRequired,
	balance: PropTypes.number.isRequired,
};

export default BuyFilters;
