import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "./RollerButton";
import fetchWithToken from "../../services/fetchWithToken";
import { setIsShowCustomNotification } from "../../actions/game";

import "../../assets/scss/SingleComponents/EventPopup.scss";

import rewardImg from "../../assets/img/singleComponents/miner_reward.gif";
import shiningImg from "../../assets/img/singleComponents/gold_shining.svg";

const MinerRewardModal = () => {
	const { t } = useTranslation("SingleComponents");
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const isShowCustomNotification = useSelector((state) => state.game.isShowCustomNotification);
	const dispatch = useDispatch();
	const controller = useRef(null);
	const signal = useRef(null);

	useEffect(() => {
		if (phaserScreenInputManager && isShowCustomNotification) {
			phaserScreenInputManager.enabled = false;
		}
	}, [phaserScreenInputManager, isShowCustomNotification]);

	useEffect(() => {
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, []);

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	const handlerCloseModal = async () => {
		await postClaimCustomModal();
		phaserScreenInputManager.enabled = true;
		dispatch(setIsShowCustomNotification(false));
	};

	const postClaimCustomModal = async () => {
		createSignalAndController();
		try {
			const json = await fetchWithToken("/api/notifications/post-claim-custom-modal", {
				method: "POST",
				signal: signal.current,
			});
			if (!json.success) {
				console.error(json.error);
				return false;
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Modal isOpen={isShowCustomNotification} centered className="event-popup" zIndex={1100}>
			<ModalBody className="event-popup-modal-body">
				<div className="event-background-wrapper">
					<img className="shining-background" src={shiningImg} width={300} height={300} alt="shining" />
					<img className="event-shining-img" src={rewardImg} width={232} height={100} alt="miner" />
				</div>
				<h2 className="event-popup-modal-title">{t("customModal.title")}</h2>
				<p className="event-popup-modal-text mb-2">{t("customModal.subtitle")}</p>
				<p className="event-popup-modal-text">{t("customModal.text")}</p>
				<div className="event-popup-modal-btn-block">
					<RollerButton color="cyan" className="event-popup-modal-button" text={t("customModal.accept")} action={handlerCloseModal} />
				</div>
			</ModalBody>
		</Modal>
	);
};

export default MinerRewardModal;
