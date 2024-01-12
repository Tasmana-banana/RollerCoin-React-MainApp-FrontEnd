import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import RoundRadioButton from "../SingleComponents/RoundRadioButton";
import threeDigitDivisor from "../../services/threeDigitDivisor";

import "../../assets/scss/Marketplace/TypesFilter.scss";

const TypesFilter = ({ selectedType, typesHandler, itemsCounts }) => {
	const { t } = useTranslation("Marketplace");

	return (
		<div className="marketplace-types-filter">
			<RoundRadioButton
				className="marketplace-type-radio"
				title={t("main.all")}
				subtitle={`(${threeDigitDivisor(itemsCounts.all, "space")})`}
				value={"all"}
				isChecked={selectedType === "all"}
				margin={12}
				handleChange={typesHandler}
			/>
			<RoundRadioButton
				className="marketplace-type-radio"
				title={t("main.miners")}
				subtitle={`(${threeDigitDivisor(itemsCounts.miners, "space")})`}
				value={"miner"}
				isChecked={selectedType === "miner"}
				margin={12}
				handleChange={typesHandler}
			/>
			<RoundRadioButton
				className="marketplace-type-radio"
				title={t("main.parts")}
				subtitle={`(${threeDigitDivisor(itemsCounts.parts, "space")})`}
				value={"mutation_component"}
				isChecked={selectedType === "mutation_component"}
				margin={12}
				handleChange={typesHandler}
			/>
			<RoundRadioButton
				className="marketplace-type-radio"
				title={t("main.racks")}
				subtitle={`(${threeDigitDivisor(itemsCounts.racks, "space")})`}
				value={"rack"}
				isChecked={selectedType === "rack"}
				margin={12}
				handleChange={typesHandler}
			/>
			<RoundRadioButton
				className="marketplace-type-radio"
				title={t("main.batteries")}
				subtitle={`(${threeDigitDivisor(itemsCounts.batteries, "space")})`}
				value={"battery"}
				isChecked={selectedType === "battery"}
				handleChange={typesHandler}
			/>
		</div>
	);
};

TypesFilter.propTypes = {
	selectedType: PropTypes.object.isRequired,
	typesHandler: PropTypes.func.isRequired,
	itemsCounts: PropTypes.object.isRequired,
};

export default TypesFilter;
