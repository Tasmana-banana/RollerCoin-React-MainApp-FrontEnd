import React from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import Select from "react-select";
import { forceCheck } from "react-lazyload";

import "../../assets/scss/MarketSelectFilter.scss";

const SORTING_OPTIONS = [
	{
		// index: 0 <= DEFAULT
		label: "priceHigh",
		value: {
			sort: "price",
			sort_direction: -1,
		},
	},
	{
		// index: 1
		label: "priceLow",
		value: {
			sort: "price",
			sort_direction: 1,
		},
	},
	{
		// index: 2
		label: "dateNew",
		value: {
			sort: "created",
			sort_direction: -1,
		},
	},
	{
		// index: 3
		label: "dateOld",
		value: {
			sort: "created",
			sort_direction: 1,
		},
	},
];

const QTY_ON_PAGE_OPTIONS = [
	{
		// index: 0
		label: "12",
		value: {
			limit: 12,
		},
	},
	{
		// index: 1 <= DEFAULT
		label: "24",
		value: {
			limit: 24,
		},
	},
	{
		// index: 2
		label: "36",
		value: {
			limit: 36,
		},
	},
	{
		// index: 3
		label: "48",
		value: {
			limit: 48,
		},
	},
];

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

const MarketSelectFilter = ({ options, paginationType, productsUpdate, t, isMobile, sortingOptions }) => {
	const sortByOptions = sortingOptions || SORTING_OPTIONS;
	const onChangeSort = async (value) => {
		if (value.sort === options.sort && value.sort_direction === options.sort_direction) {
			return false;
		}
		let newPaginationType = paginationType;
		const responseOptions = { ...options, ...value };
		if (paginationType === "more") {
			responseOptions.skip = 0;
			newPaginationType = "all";
		}
		await productsUpdate(responseOptions, newPaginationType, paginationType === "more" ? 1 : null);
		forceCheck();
	};

	const onChangePagination = async (value) => {
		if (value.limit === options.limit) {
			return false;
		}
		const responseOptions = { ...options, ...value, skip: 0 };
		await productsUpdate(responseOptions, "all", 1);
	};

	return (
		<Row noGutters={isMobile} className="select-filters-wrapper">
			<Col xs={12} lg={4}>
				<Row noGutters>
					<Select
						className="select-filter-container w-100"
						classNamePrefix="select-filter"
						onChange={(e) => onChangeSort(e.value)}
						options={sortByOptions.map((item) => ({ ...item, label: t(`market.${item.label}`) }))}
						defaultValue={{ ...sortByOptions[0], label: t(`market.${sortByOptions[0].label}`) }}
						isClearable={false}
						isSearchable={false}
					/>
				</Row>
			</Col>
			{!isMobile && (
				<Col xs={{ size: 2, offset: 6 }}>
					<Row noGutters className="filter-short-container">
						<Select
							className="select-filter-container w-100"
							classNamePrefix="select-filter"
							onChange={(e) => onChangePagination(e.value)}
							options={QTY_ON_PAGE_OPTIONS}
							defaultValue={QTY_ON_PAGE_OPTIONS[1]}
							isClearable={false}
							isSearchable={false}
						/>
					</Row>
				</Col>
			)}
		</Row>
	);
};

MarketSelectFilter.propTypes = {
	productsUpdate: PropTypes.func.isRequired,
	options: PropTypes.object.isRequired,
	paginationType: PropTypes.string.isRequired,
	sortingOptions: PropTypes.object,
	t: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketSelectFilter));
