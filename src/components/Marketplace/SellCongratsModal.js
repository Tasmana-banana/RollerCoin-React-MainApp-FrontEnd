import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import "../../assets/scss/Marketplace/SellCongratsModal.scss";

import sellGif from "../../assets/img/marketplace/sell.gif";
import closeIcon from "../../assets/img/header/close_menu.svg";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import RollerButton from "../SingleComponents/RollerButton";

const SellCongratsModal = ({ isDisplayed, onClose }) => {
	const { t } = useTranslation("Marketplace");
	const language = useSelector((state) => state.game.language);

	return (
		<Modal isOpen={isDisplayed} centered className="sell-congrats-modal">
			<ModalBody className="modal-body">
				<RollerButton className="close-btn" size="small" icon={closeIcon} action={onClose} />
				<p className="title mb-3">{t("sell.sellCongratsModal.title")}</p>
				<p className="description mb-4">{t("sell.sellCongratsModal.description")}</p>
				<div className="content">
					<img className="image mb-4" width="240px" height="216px" src={sellGif} alt="congratulations" />
					<button onClick={onClose} type="button" className="tree-dimensional-button btn-cyan w-100 mb-4">
						<span className="btn-text">{t("sell.sellCongratsModal.btnContinue")}</span>
					</button>
					<Link to={`${getLanguagePrefix(language)}/marketplace/orders`} className="tree-dimensional-button btn-default w-100 mb-2">
						<span className="btn-text">{t("sell.sellCongratsModal.btnListings")}</span>
					</Link>
				</div>
			</ModalBody>
		</Modal>
	);
};

SellCongratsModal.propTypes = {
	isDisplayed: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default SellCongratsModal;
