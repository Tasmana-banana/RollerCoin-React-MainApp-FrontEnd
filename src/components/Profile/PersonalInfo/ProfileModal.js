import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PropTypes from "prop-types";

import "../../../assets/scss/Profile/ProfileModal.scss";

const ProfileModal = ({ isOpen, toggleModal, titleText, children }) => (
	<Modal className="profile-modal-wrapper" isOpen={isOpen} toggle={toggleModal} centered>
		{!!titleText && <ModalHeader>{titleText}</ModalHeader>}
		<ModalBody className="p-0">{children}</ModalBody>
	</Modal>
);

ProfileModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	titleText: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export default ProfileModal;
