import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Row, Col, Input, InputGroup } from "reactstrap";
import Select from "react-select";

import "../../assets/scss/SingleComponents/SearchAndSortPanel.scss";

const INPUT_WAIT_INTERVAL = 600;

const QTY_ON_PAGE_OPTIONS = [
	{
		// index: 0 <= DEFAULT
		label: "12",
		value: {
			limit: 12,
		},
	},
	{
		// index: 1
		label: "24",
		value: {
			limit: 24,
		},
	},
];

const SearchAndSortPanel = ({ options, sortHandler, searchHandler, className, sortOptionsList, paginationOptionsList = QTY_ON_PAGE_OPTIONS, activeTab = null }) => {
	const { t } = useTranslation("Marketplace");
	const timerRef = useRef(null);
	const [searchValue, setSearchValue] = useState("");

	const handleSearch = (value) => {
		setSearchValue(value);
		clearTimeout(timerRef.current);
		if (value.length >= 3 || !value) {
			const optionsWithSearch = { ...options, skip: 0, searchString: value || "" };
			timerRef.current = setTimeout(() => {
				searchHandler(optionsWithSearch);
			}, INPUT_WAIT_INTERVAL);
		}
	};

	const onChangeSort = async (value) => {
		const responseOptions = { ...options, ...value, skip: 0 };
		await sortHandler(responseOptions);
	};

	useEffect(() => {
		return () => clearTimeout(timerRef.current);
	}, []);

	useEffect(() => {
		setSearchValue("");
		const optionsWithSearch = { ...options, skip: 0, searchString: "" };
	}, [activeTab]);

	const currValue = sortOptionsList?.filter(({ value }) => value?.field === options.sort?.field && value?.order === options.sort?.order).map((item) => ({ ...item, label: t(`sort.${item.label}`) }));

	return (
		<div className={`search-and-sort-panel ${className || ""}`}>
			{searchHandler && (
				<div className="search-and-sort-wrapper">
					<InputGroup className="search-wrapper">
						<Input
							value={searchValue}
							placeholder={t("main.search")}
							className="search-input"
							maxLength={30}
							onClick={(e) => {
								e.target.select();
							}}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</InputGroup>
					<div className="d-flex">
						<Select
							className="marketplace-select-item"
							classNamePrefix="marketplace-select-filter"
							onChange={(e) => onChangeSort({ sort: e.value })}
							options={sortOptionsList.map((item) => ({ ...item, label: t(`sort.${item.label}`) }))}
							value={currValue}
							isClearable={false}
							isSearchable={false}
						/>
						<Select
							className="marketplace-select-item short"
							classNamePrefix="marketplace-select-filter"
							onChange={(e) => onChangeSort(e.value)}
							options={paginationOptionsList.map((item) => ({ ...item, label: item.label }))}
							defaultValue={{ ...paginationOptionsList[0], label: paginationOptionsList[0].label }}
							isClearable={false}
							isSearchable={false}
						/>
					</div>
				</div>
			)}
			{!searchHandler && (
				<Row className="sort-panel">
					<Col xs={9} lg={4}>
						<Select
							classNamePrefix="marketplace-select-filter"
							onChange={(e) => onChangeSort({ sort: e.value })}
							options={sortOptionsList.map((item) => ({ ...item, label: item.label }))}
							defaultValue={{ ...sortOptionsList[0], label: sortOptionsList[0].label }}
							isClearable={false}
							isSearchable={false}
						/>
					</Col>
					<Col xs={3} lg={{ offset: 6, size: 2 }}>
						<Select
							classNamePrefix="marketplace-select-filter"
							onChange={(e) => onChangeSort(e.value)}
							options={paginationOptionsList.map((item) => ({ ...item, label: item.label }))}
							defaultValue={{ ...paginationOptionsList[0], label: paginationOptionsList[0].label }}
							isClearable={false}
							isSearchable={false}
						/>
					</Col>
				</Row>
			)}
		</div>
	);
};

SearchAndSortPanel.propTypes = {
	options: PropTypes.object.isRequired,
	sortHandler: PropTypes.func.isRequired,
	searchHandler: PropTypes.func,
	className: PropTypes.string,
	paginationOptionsList: PropTypes.array,
	sortOptionsList: PropTypes.array.isRequired,
};

export default SearchAndSortPanel;
