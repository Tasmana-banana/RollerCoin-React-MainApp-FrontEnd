import React from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/SeparatorWithOr.scss";

const SeparatorWithOr = ({ className }) => {
	const { t } = useTranslation("SingleComponents");
	return (
		<div className={`wrapper-block ${className}`}>
			<Row noGutters={true} className="align-items-center justify-content-between">
				<Col xs="5" className="line" />
				<p className="default-text col-2 text-center mgb-0">{t("or")}</p>
				<Col xs="5" className="line" />
			</Row>
		</div>
	);
};

SeparatorWithOr.propTypes = {
	className: PropTypes.string,
};

export default SeparatorWithOr;
