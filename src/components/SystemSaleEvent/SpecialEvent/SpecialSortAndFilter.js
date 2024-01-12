import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Row, Col, Input, InputGroup } from "reactstrap";
import { useTranslation } from "react-i18next";

import "../../../assets/scss/SystemSaleEvent/SpecialSortAndFilter.scss";

import searchIcon from "../../../assets/img/system_sale_event/icon/search.svg";

const INPUT_WAIT_INTERVAL = 600;
const SpecialSortAndFilter = ({ options, sortAndSearchHandler, sortOptionsList, isDisabledPanel, isLoading }) => {
	const { t } = useTranslation("SystemSaleEvent");
	const timerRef = useRef(null);
	const [searchValue, setSearchValue] = useState("");

	const handleSearch = (value) => {
		setSearchValue(value);
		clearTimeout(timerRef.current);
		if (value.length >= 3 || !value) {
			const optionsWithSearch = { ...options, skip: 0, search: value || "" };
			timerRef.current = setTimeout(() => {
				sortAndSearchHandler(optionsWithSearch, 1);
			}, INPUT_WAIT_INTERVAL);
		}
	};

	const onChangeSort = async (value) => {
		const responseOptions = { ...options, ...value, skip: 0 };
		await sortAndSearchHandler(responseOptions, 1);
	};

	useEffect(() => {
		return () => clearTimeout(timerRef.current);
	}, []);

	useEffect(() => {
		setSearchValue("");
		const optionsWithSearch = { ...options, skip: 0, search: "" };
	}, []);

	const isDisabledSort = isDisabledPanel || isLoading;
	const isDisabledSearch = (isDisabledPanel && !searchValue) || isLoading;

	return (
		<div className="special-filter-panel">
			<Row className="search-and-sort-wrapper">
				<Col>
					<InputGroup className="search-wrapper">
						<Input
							value={searchValue}
							placeholder={t("specialEventProducts.search")}
							className="search-input"
							maxLength={30}
							disabled={isDisabledSearch}
							onClick={(e) => {
								e.target.select();
							}}
							onChange={(e) => handleSearch(e.target.value)}
						/>
						<div className={`search-icon-block ${isDisabledSearch ? "disabled-icon" : ""}`}>
							<img className="search-icon" src={searchIcon} alt="Search icon" width={16} height={16} />
						</div>
					</InputGroup>
				</Col>
				<Col>
					<Select
						className={`special-select-item ${isDisabledSort ? "disabled-select" : ""}`}
						classNamePrefix="special-select-filter"
						onChange={(e) => onChangeSort({ sort: e.value.sort, sort_direction: e.value.sort_direction })}
						options={sortOptionsList.map((item) => ({ ...item, label: t(`sort.${item.label}`) }))}
						defaultValue={{ ...sortOptionsList[0], label: t(`sort.${sortOptionsList[0].label}`) }}
						isClearable={false}
						isDisabled={isDisabledSort}
						isSearchable={false}
					/>
				</Col>
			</Row>
		</div>
	);
};

SpecialSortAndFilter.propTypes = {
	options: PropTypes.object.isRequired,
	sortAndSearchHandler: PropTypes.func.isRequired,
	sortOptionsList: PropTypes.object.isRequired,
	isDisabledPanel: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
};
export default SpecialSortAndFilter;
