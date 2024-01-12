import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "./RollerButton";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/SingleComponents/EventPopup.scss";

const EventPopup = ({ eventData }) => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("SingleComponents");
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const history = useHistory();

	useEffect(() => {
		if (phaserScreenInputManager && eventData.is_show_notification) {
			phaserScreenInputManager.enabled = false;
		}
	}, [phaserScreenInputManager, eventData.is_show_notification]);

	const handlerCloseModal = async () => {
		phaserScreenInputManager.enabled = true;
		await setNotificationReadAccept("read", eventData);
		history.push(`${getLanguagePrefix(language)}/christmas-event/quests`);
	};

	return (
		<Modal isOpen={eventData.is_show_notification} centered className="event-popup" zIndex={1100}>
			<ModalBody className="event-popup-modal-body">
				<div className="event-img-wrapper">
					<img className="event-img" src={`${process.env.STATIC_URL}/static/img/notifications/${eventData.notification_id}/${eventData.image}`} alt="event image" width={368} height={168} />
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

EventPopup.propTypes = {
	eventData: PropTypes.object.isRequired,
};

export default EventPopup;
