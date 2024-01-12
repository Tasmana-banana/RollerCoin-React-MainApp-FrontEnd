import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Col, Modal, ModalBody, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";

import "../../assets/scss/Offerwall/LeaderboardTutorialModal.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import choose from "../../assets/img/offerwall/start_choose.gif";
import check from "../../assets/img/offerwall/start_check.gif";
import complete from "../../assets/img/offerwall/start_complete.gif";
import reward from "../../assets/img/offerwall/start_reward.gif";

const LeaderboardTutorial = () => {
	const [isOpenModal, setIsOpenModal] = useState(false);
	const { t } = useTranslation("Offerwall");
	const notificationData = useSelector((state) => state.notification.tutorial_taskwall);

	useEffect(() => {
		if (notificationData && notificationData.is_show_notification) {
			setIsOpenModal(true);
		}
	}, [notificationData]);

	const ROADMAP = [
		{
			step: 1,
			img: choose,
			title: "howToGet.choose",
			description: "howToGet.chooseDescription",
		},
		{
			step: 2,
			img: check,
			title: "howToGet.check",
			description: "howToGet.checkDescription",
		},
		{
			step: 3,
			img: complete,
			title: "howToGet.complete",
			description: "howToGet.completeDescription",
		},
		{
			step: 4,
			img: reward,
			title: "howToGet.reward",
			description: "howToGet.rewardDescription",
		},
	];

	const handleCloseModal = () => {
		setNotificationReadAccept("read", notificationData);
		setIsOpenModal(false);
	};

	return (
		<Modal isOpen={isOpenModal} size="lg" centered className="tutorial-popup">
			<ModalBody className="tutorial-modal-body">
				<div className="title-block">
					<h2 className="tutorial-title">{t("howToGet.tutorialTitle")}</h2>
					<button className="close-menu-btn" onClick={handleCloseModal}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={14} height={14} alt="close modal icon" />
						</span>
					</button>
				</div>

				<div className="tutorial-text-block">
					<p>{t("howToGet.textModal")}</p>
				</div>
				<div className="tutorial-img-block">
					<Row>
						{ROADMAP.map((item) => (
							<Col className="how-to-card-wrapper" xs={6} lg={3} key={item.step}>
								<div className="how-to-card">
									<p className="how-to-card-step">{item.step}</p>
									<div className="how-to-card-image">
										<img src={item.img} width={192} height={128} alt={t(item.title)} />
									</div>
									<p className="how-to-card-title">{t(item.title)}</p>
									<p className="how-to-card-description">{t(item.description)}</p>
								</div>
							</Col>
						))}
					</Row>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default LeaderboardTutorial;
