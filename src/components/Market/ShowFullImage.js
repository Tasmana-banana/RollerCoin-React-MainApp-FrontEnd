import React from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";

import closeIcon from "../../assets/img/header/close_menu.svg";

const ShowFullImage = ({ isShowImg, showImgUrl, toggleShowImg }) => (
	<Modal isOpen={isShowImg} toggle={toggleShowImg} centered className="market-view-img-modal">
		<ModalBody className="market-view-img-body" onClick={toggleShowImg}>
			<img src={showImgUrl} alt="Rollercoin store" className="w-100" />
			<button className="tree-dimensional-button close-menu-btn btn-default market-view-img-close">
				<span>
					<img src={closeIcon} alt="close_modal" />
				</span>
			</button>
		</ModalBody>
	</Modal>
);

ShowFullImage.propTypes = {
	isShowImg: PropTypes.bool.isRequired,
	showImgUrl: PropTypes.string.isRequired,
	toggleShowImg: PropTypes.func.isRequired,
};

export default ShowFullImage;
