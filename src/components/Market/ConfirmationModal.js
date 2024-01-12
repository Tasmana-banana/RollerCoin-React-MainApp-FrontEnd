import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Modal, ModalBody, Row, Col } from "reactstrap";

const mapStateToProps = (state) => ({
	language: state.game.language,
});

const ConfirmationModal = ({ t, isShowConfirmationModal, toggleConfirmationModal, buyAction }) => {
	return (
		<Modal isOpen={isShowConfirmationModal} toggle={toggleConfirmationModal} centered className="confirmation-modal">
			<ModalBody className="confirmation-window">
				<Row>
					<Col xs="12" className="confirmation-modal-text">
						<p>{t("market.buyIt")}</p>
					</Col>
					<Col xs="6" className="confirmation-btn-container">
						<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={buyAction}>
							<span className="btn-text">{t("market.yes")}</span>
						</button>
					</Col>
					<Col xs="6" className="confirmation-btn-container">
						<button type="button" className="tree-dimensional-button btn-red w-100" onClick={toggleConfirmationModal}>
							<span className="btn-text">{t("market.no")}</span>
						</button>
					</Col>
				</Row>
			</ModalBody>
		</Modal>
	);
};

ConfirmationModal.propTypes = {
	isShowConfirmationModal: PropTypes.bool.isRequired,
	toggleConfirmationModal: PropTypes.func.isRequired,
	buyAction: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	language: PropTypes.string.isRequired,
};

export default withTranslation("Game")(connect(mapStateToProps, null)(ConfirmationModal));
