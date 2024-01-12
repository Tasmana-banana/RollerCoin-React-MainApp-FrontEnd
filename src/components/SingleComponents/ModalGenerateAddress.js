import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "./RollerButton";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";

import "../../assets/scss/SingleComponents/ModalGenerateAddress.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";

const ModalGenerateAddress = ({ isShowModalGenerateAddress, closeModalGenerateAddress, notifyData }) => {
	const language = useSelector((state) => state.game.language);
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const { t } = useTranslation("GenerateAddress");

	useEffect(() => {
		if (phaserScreenInputManager && isShowModalGenerateAddress) {
			phaserScreenInputManager.enabled = false;
		}

		if (!notifyData.is_notification_read) {
			setNotificationReadAccept("read", notifyData);
		}
	}, [phaserScreenInputManager, isShowModalGenerateAddress]);

	const handlerCloseButton = (isClickButton = false) => {
		if (isClickButton) {
			setNotificationReadAccept("accept", notifyData);
		}
		phaserScreenInputManager.enabled = true;

		closeModalGenerateAddress();
	};
	return (
		<Modal isOpen={isShowModalGenerateAddress} size="lg" centered className="technical-popup">
			<ModalBody className="technical-modal-body">
				<button className="close-menu-btn" onClick={() => handlerCloseButton()}>
					<span className="close-btn-img-wrapper">
						<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
					</span>
				</button>
				<div className="img-block">
					<img src={`${process.env.STATIC_URL}/static/img/notifications/${notifyData.notification_id}/${notifyData.image}`} alt="Wallet generate img" width={276} height={210} />
					<h2 className="technical-title">{notifyData.title[language]}</h2>
				</div>
				<div className="technical-text" dangerouslySetInnerHTML={{ __html: notifyData.text[language] }}></div>
				<div className="technical-btn-block">
					<a href={`${getLanguagePrefix(language)}/wallet/btc/deposit`}>
						<RollerButton color="cyan" className="technical-button" text={t("btnText")} action={() => handlerCloseButton(true)} />
					</a>
				</div>
			</ModalBody>
		</Modal>
	);
};

ModalGenerateAddress.propTypes = {
	isShowModalGenerateAddress: PropTypes.bool.isRequired,
	closeModalGenerateAddress: PropTypes.func.isRequired,
	notifyData: PropTypes.object.isRequired,
};

export default ModalGenerateAddress;
