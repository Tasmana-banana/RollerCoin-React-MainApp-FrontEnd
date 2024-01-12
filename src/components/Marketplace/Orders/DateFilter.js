import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";

import "../../../assets/scss/Marketplace/DateFilter.scss";
import "react-datepicker/dist/react-datepicker.css";

const DateFilter = ({ currentTab, getMyOrders, getMyOrdersCount }) => {
	const { t } = useTranslation("Marketplace");
	const marketplaceConfig = useSelector((state) => state.marketplace.marketplaceConfig);

	const initialDate = {
		from: null,
		to: dayjs().format("MM/DD/YYYY"),
		min: new Date(marketplaceConfig.ordersSearchStartDate),
		max: new Date(dayjs().format("MM/DD/YYYY")),
	};

	const [date, setDate] = useState(initialDate);

	useEffect(() => {
		setDate(initialDate);
	}, [currentTab]);

	const datesFromHandler = async (from) => {
		let fromDate = null;
		if (from) {
			fromDate = dayjs(from).format("MM/DD/YYYY");
		}
		setDate({ ...date, from: fromDate });

		await Promise.all([getMyOrders(null, null, fromDate, date.to), getMyOrdersCount(null, null, fromDate, date.to)]);
	};

	const datesToHandler = async (to) => {
		let toDate = null;
		if (to) {
			toDate = dayjs(to).format("MM/DD/YYYY");
		}
		setDate({ ...date, to: toDate });

		await Promise.all([getMyOrders(null, null, date.from, toDate), getMyOrdersCount(null, null, date.from, toDate)]);
	};

	return (
		<div className="marketplace-dates-filter">
			<Col xs="12" className="datepicker-container">
				<Row noGutters={true}>
					<Col xs="12" className="datepicker-block">
						<div className="header-filter">
							<p>{t("main.from")}</p>
						</div>
						<div className="body-filter">
							<DatePicker
								selected={date.from && new Date(date.from)}
								dateFormat="MMMM d, yyyy"
								onChange={datesFromHandler}
								dropdownMode={"scroll"}
								minDate={date.min}
								maxDate={new Date(date.to)}
							/>
						</div>
					</Col>
				</Row>
			</Col>

			<Col xs="12" className="datepicker-container">
				<Row noGutters={true}>
					<Col xs="12" className="datepicker-block">
						<div className="header-filter">
							<p>{t("main.to")}</p>
						</div>
						<div className="body-filter">
							<DatePicker
								selected={new Date(date.to)}
								dateFormat="MMMM d, yyyy"
								onChange={datesToHandler}
								dropdownMode={"scroll"}
								minDate={date.from ? new Date(date.from) : date.min}
								maxDate={date.max}
							/>
						</div>
					</Col>
				</Row>
			</Col>
		</div>
	);
};

DateFilter.propTypes = {
	currentTab: PropTypes.string.isRequired,
	getMyOrders: PropTypes.func.isRequired,
	getMyOrdersCount: PropTypes.func.isRequired,
};

export default DateFilter;
