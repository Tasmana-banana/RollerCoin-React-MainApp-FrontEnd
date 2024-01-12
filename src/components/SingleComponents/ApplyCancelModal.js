import React from "react";
import { Col, Modal, ModalBody, Row } from "reactstrap";
import PropTypes from "prop-types";
import RollerButton from "./RollerButton";

import "../../assets/scss/SingleComponents/ApplyCancelModal.scss";

const ApplyCancelModal = ({ className = "", isOpen, toggleModal, handler, title, description, leftButtonText = "buy", leftButtonColor, rightButtonText = "cancel", rightButtonColor }) => {
	const applyHandler = (e) => {
		handler(e);
		toggleModal();
	};

	return (
		<Modal className={`apply-cancel-modal-wrapper ${className}`} isOpen={isOpen} toggle={toggleModal} centered scrollable={false}>
			<ModalBody>
				<div className="modal-text-wrapper">
					<p className="modal-body-title">{title}</p>
					<p className="modal-body-description" dangerouslySetInnerHTML={{ __html: description }} />
				</div>
				<Row noGutters={false} className="modal-buttons">
					<Col xs={6} className="button-wrapper">
						<RollerButton className="modal-button" color={leftButtonColor} text={leftButtonText} action={applyHandler} />
					</Col>
					<Col xs={6} className="button-wrapper">
						<RollerButton className="modal-button" action={toggleModal} text={rightButtonText} color={rightButtonColor} />
					</Col>
				</Row>
			</ModalBody>
		</Modal>
	);
};

ApplyCancelModal.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	handler: PropTypes.func.isRequired,
	title: PropTypes.string,
	headerTitle: PropTypes.string,
	leftButtonText: PropTypes.string,
	leftButtonColor: PropTypes.string,
	rightButtonText: PropTypes.string,
	rightButtonColor: PropTypes.string,
	description: PropTypes.string,
	className: PropTypes.string,
};

export default ApplyCancelModal;
