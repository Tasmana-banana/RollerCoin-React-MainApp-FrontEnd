import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import RollerButton from "./RollerButton";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";

import "../../assets/scss/SingleComponents/EventPopup.scss";
import "../../assets/scss/SingleComponents/HalloweenEventPopup.scss";

const HalloweenEventPopup = ({ eventData }) => {
	const history = useHistory();
	const { t } = useTranslation("SingleComponents");
	const language = useSelector((state) => state.game.language);
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);

	useEffect(() => {
		if (phaserScreenInputManager && eventData.is_show_notification) {
			phaserScreenInputManager.enabled = false;
		}
	}, [phaserScreenInputManager, eventData.is_show_notification]);

	const handlerCloseModal = async () => {
		phaserScreenInputManager.enabled = true;
		await setNotificationReadAccept("read", eventData);
		return history.push(`${getLanguagePrefix(language)}/special-event`);
	};

	return (
		<Modal isOpen={eventData.is_show_notification} centered className="event-popup" zIndex={1100}>
			<ModalBody className="event-popup-modal-body">
				<div className="event-img-wrapper">
					<img className="event-img" src={`${process.env.STATIC_URL}/static/img/notifications/${eventData.notification_id}/${eventData.image}`} alt="event image" width={324} height={184} />
				</div>
				<h2 className="event-popup-modal-title">{eventData.title[language]}</h2>
				<p className="event-popup-modal-text" dangerouslySetInnerHTML={{ __html: eventData.text[language] }}></p>
				<div className="event-popup-modal-btn-block">
					<RollerButton color="cyan" className="event-popup-modal-button" text={t("eventPopup.btnText")} action={handlerCloseModal} />
				</div>
			</ModalBody>
		</Modal>
	);
};

HalloweenEventPopup.propTypes = {
	eventData: PropTypes.object.isRequired,
};

export default HalloweenEventPopup;
