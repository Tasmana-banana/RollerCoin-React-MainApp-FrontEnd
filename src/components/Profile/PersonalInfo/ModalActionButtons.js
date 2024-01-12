import React from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import "../../../assets/scss/Profile/ModalActionButtons.scss";

const ModalActionButtons = ({ isSubmitDisable, onCancelHandler }) => {
	const { t } = useTranslation("Profile");
	return (
		<Row noGutters={false} className="modal-action-buttons">
			<Col xs={6}>
				<button disabled={isSubmitDisable} type="submit" className="tree-dimensional-button btn-cyan w-100">
					<span className="w-100 btn-padding">{t("submit")}</span>
				</button>
			</Col>
			<Col xs={6}>
				<button type="button" className="tree-dimensional-button btn-default w-100" onClick={onCancelHandler}>
					<span className="w-100 btn-padding">{t("cancel")}</span>
				</button>
			</Col>
		</Row>
	);
};

ModalActionButtons.propTypes = {
	isSubmitDisable: PropTypes.bool,
	onCancelHandler: PropTypes.func.isRequired,
};

export default ModalActionButtons;
