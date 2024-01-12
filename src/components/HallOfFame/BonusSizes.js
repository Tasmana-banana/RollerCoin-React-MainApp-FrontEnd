import React from "react";
import { Col } from "reactstrap";
import PropTypes from "prop-types";

const BonusSizes = ({ t }) => {
	const bonusSizes = [
		{ title: "100 - 999", percentage: 5 },
		{ title: "1 000 - 4 999", percentage: 10 },
		{ title: "5 000 - 9 999", percentage: 15 },
		{ title: "10 000 - 50 000", percentage: 20 },
	];
	return bonusSizes.map((item) => (
		<Col key={item.title} xs={12} lg={3}>
			<p className="hall-bonus-title">{`${item.title} RLT`}</p>
			<p className="hall-bonus-percentage">{`${item.percentage}%`}</p>
			<p className="hall-bonus-text">{t("bonus")}</p>
		</Col>
	));
};

BonusSizes.PropsType = {
	t: PropTypes.func.isRequired,
};

export default BonusSizes;
