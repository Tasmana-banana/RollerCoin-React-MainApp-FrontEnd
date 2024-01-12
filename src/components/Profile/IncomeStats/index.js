import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import Select from "react-select";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import IncomeStatsChart from "./IncomeStatsChart";
import IncomeStatsTable from "./IncomeStatsTable";
import { ReactSelectOption, ReactSelectValue } from "./ReactSelectOption";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";

import "../../../assets/scss/RollerSelect.scss";
import "../../../assets/scss/Profile/IncomeStats.scss";

const IncomeStats = () => {
	const { t } = useTranslation("Profile");
	const rollerCurrencies = useSelector((state) => state.wallet.rollerCurrencies);
	const isMobile = useSelector((state) => state.game.isMobile);
	const selectOptions = rollerCurrencies
		.filter(({ isCanBeMined }) => !!isCanBeMined)
		.map(({ code, name, balanceKey, toSmall, precision, divider }) => ({
			value: code,
			label: name,
			balanceKey,
			toSmall,
			precision,
			divider,
		}));
	const [selectedCurrency, setSelectedCurrency] = useState(selectOptions[0]);
	const [dateQuery, setDateQuery] = useState({ from: "", to: "" });

	return (
		<>
			{<InfoBlockWithIcon tName="Profile" message="incomeStatsInfoMessage" obj="infoHints" showButtons={isMobile} />}
			<Row className="income-stats-page" noGutters={true}>
				<Col xs="12">
					<Row noGutters={true} className="header-stats">
						<Col xs="12" lg="3">
							<div className="header-text">
								<p>{t("incomeStats.incomeStatsBy")}</p>
							</div>
						</Col>
						<Col xs="12" lg="4">
							<div>
								<Select
									className="rollercoin-select-container"
									classNamePrefix="rollercoin-select"
									value={selectedCurrency}
									options={selectOptions}
									onChange={setSelectedCurrency}
									isClearable={false}
									isSearchable={false}
									components={{ Option: ReactSelectOption, ValueContainer: ReactSelectValue }}
								/>
							</div>
						</Col>
					</Row>
					<IncomeStatsChart currency={selectedCurrency} queryData={dateQuery} setDateQuery={setDateQuery} />
					<IncomeStatsTable currency={selectedCurrency} queryData={dateQuery} />
				</Col>
			</Row>
		</>
	);
};

export default IncomeStats;
