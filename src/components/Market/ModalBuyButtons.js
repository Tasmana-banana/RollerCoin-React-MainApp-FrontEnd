import React from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import "../../assets/scss/Market/ModalBuyButtons.scss";

const ModalBuyButtons = ({ isSubmitDisable, onCancelHandler }) => {
	const { t } = useTranslation("Game");
	return (
		<Row noGutters={false} className="modal-buy-buttons">
			<Col xs={6}>
				<button disabled={isSubmitDisable} type="submit" className="tree-dimensional-button btn-cyan w-100">
					<span className="w-100 btn-padding">{t("market.buy")}</span>
				</button>
			</Col>
			<Col xs={6}>
				<button type="button" className="tree-dimensional-button btn-default w-100" onClick={onCancelHandler}>
					<span className="w-100 btn-padding">{t("market.cancel")}</span>
				</button>
			</Col>
		</Row>
	);
};

ModalBuyButtons.propTypes = {
	isSubmitDisable: PropTypes.bool,
	onCancelHandler: PropTypes.func.isRequired,
};

export default ModalBuyButtons;
