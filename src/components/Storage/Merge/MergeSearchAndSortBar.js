import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Input, InputGroup } from "reactstrap";
import Select from "react-select";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "../../../assets/scss/Storage/Merge/MergeSearchAndSortBar.scss";

const INPUT_WAIT_INTERVAL = 600;

const MergeSearchAndSortBar = ({ options, sortOptions, searchAndSortHandler }) => {
	const { t } = useTranslation("Storage");
	const isMobile = useSelector((state) => state.game.isMobile);
	const [searchValue, setSearchValue] = useState("");
	const timerRef = useRef(null);

	const searchHandler = (value) => {
		setSearchValue(value);
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		if (value.length >= 3 || !value) {
			const optionsWithSearch = { ...options, skip: 0, search: value || "" };
			timerRef.current = setTimeout(() => {
				searchAndSortHandler(optionsWithSearch);
			}, INPUT_WAIT_INTERVAL);
		}
	};

	const onChangeSort = async (value) => {
		if (value.sort === options.sort && value.sort_direction === options.sort_direction) {
			return false;
		}
		const responseOptions = { ...options, ...value, skip: 0 };
		await searchAndSortHandler(responseOptions);
	};

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return (
		<div className="merge-search-sort-bar">
			<Row noGutters={isMobile}>
				<Col xs={6} lg={4}>
					<InputGroup className="search-wrapper">
						<Input
							value={searchValue}
							placeholder={t("main.search")}
							type="miners"
							className="search-input"
							maxLength={30}
							onClick={(e) => {
								e.target.select();
							}}
							onChange={(e) => searchHandler(e.target.value)}
						/>
					</InputGroup>
				</Col>
				<Col xs={6} lg={{ size: 4, offset: 4 }}>
					<Select
						className="select-filter-container w-100"
						classNamePrefix="select-filter"
						onChange={(e) => onChangeSort(e.value)}
						options={sortOptions.map((item) => ({ ...item, label: t(`main.sort.${item.label}`) }))}
						defaultValue={{ ...sortOptions[0], label: t(`main.sort.${sortOptions[0].label}`) }}
						isClearable={false}
						isSearchable={false}
					/>
				</Col>
			</Row>
		</div>
	);
};

MergeSearchAndSortBar.propTypes = {
	options: PropTypes.object.isRequired,
	sortOptions: PropTypes.array.isRequired,
	searchAndSortHandler: PropTypes.func.isRequired,
};

export default MergeSearchAndSortBar;
