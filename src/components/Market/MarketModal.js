import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PropTypes from "prop-types";

import "../../assets/scss/Market/MarketModal.scss";

const MarketModal = ({ isOpen, toggleModal, titleText, children, className = "" }) => (
	<Modal className={`market-modal-wrapper ${className}`} isOpen={isOpen} toggle={toggleModal} centered scrollable={false}>
		{!!titleText && <ModalHeader>{titleText}</ModalHeader>}
		<ModalBody className="p-0">{children}</ModalBody>
	</Modal>
);

MarketModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	titleText: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};

export default MarketModal;
