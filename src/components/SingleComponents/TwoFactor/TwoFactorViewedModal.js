import React, { useState, useEffect, Fragment } from "react";
import { Modal, ModalBody, Input, Label, FormGroup } from "reactstrap";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import RollerButton from "../RollerButton";
import fetchWithToken from "../../../services/fetchWithToken";
import TwoFactorModal from "./TwoFactorModal";
import { POST_TYPE_AUTH } from "../../../constants/SingleComponents";

import "../../../assets/scss/SingleComponents/TwoFactorAuthentication.scss";

import closeIcon from "../../../assets/img/header/close_menu.svg";
import twoFactorImg from "../../../assets/img/singleComponents/2fa_modal.gif";

const TwoFactorViewedModal = ({ isShowTwoFactorModal = false }) => {
	const { t } = useTranslation("Registration");
	const userInfo = useSelector((state) => state.user);
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const [isShowModal, setIsShowModal] = useState(false);
	const [isShow2FAModal, setIsShow2FAModal] = useState(false);
	const [dontShowAgain, setDontShowAgain] = useState(false);
	const [codeID, setCodeID] = useState("");
	const signals = {};
	const controllers = {};

	useEffect(() => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(() => {
		if (phaserScreenInputManager && isShowModal) {
			phaserScreenInputManager.enabled = false;
		}
	}, [phaserScreenInputManager, isShowModal]);

	useEffect(() => {
		if (isShowTwoFactorModal) {
			setIsShowModal(true);
		}
	}, [isShowTwoFactorModal]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const activate2FAHandler = async () => {
		if (dontShowAgain) {
			await dontShowModalFetch();
		}
		setIsShowModal(false);
		await activate2FAFetch();
	};

	const dontShowModalFetch = async () => {
		createSignalAndController("postDontShowModal");
		try {
			const json = await fetchWithToken("/api/profile/update-user-viewed-2fa", {
				method: "POST",
				signal: signals.postDontShowModal,
			});
			if (!json.success) {
				return false;
			}
		} catch (err) {
			console.error(err);
		}
	};

	const activate2FAFetch = async () => {
		createSignalAndController("activate2FAFetch");
		try {
			const json = await fetchWithToken("/api/auth/activation-2fa", {
				method: "POST",
				body: JSON.stringify({ is_activate: true }),
				signal: signals.activate2FAFetch,
			});
			if (!json.success) {
				return false;
			}
			setCodeID(json.data.confirm_code_id);
			setIsShow2FAModal(true);
		} catch (err) {
			console.error(err);
		}
	};

	const checkboxHandler = () => {
		setDontShowAgain(!dontShowAgain);
	};

	const closeModalHandler = async () => {
		setIsShowModal(false);
		phaserScreenInputManager.enabled = true;
		if (dontShowAgain) {
			await dontShowModalFetch();
		}
	};

	const close2FAModalHandler = async () => {
		setIsShow2FAModal(false);
		phaserScreenInputManager.enabled = true;
	};

	return (
		<Fragment>
			<Modal isOpen={isShowModal} centered className="twofactor-popup" size="lg">
				<ModalBody className="twofactor-modal-body">
					<button className="close-menu-btn" onClick={closeModalHandler}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={14} height={14} alt="close modal icon" />
						</span>
					</button>
					<img className="two-factor-modal-image" src={twoFactorImg} alt="two factor auth" />
					<h2 className="twofactor-title">{t("twoFactorModal.safe")}</h2>
					<p className="twofactor-text">
						{t("twoFactorModal.dearRoller")}
						{t("twoFactorModal.codeSent")}
					</p>

					<div className="twofactor-btn-block">
						<RollerButton className="twofactor-button" text="Let’s enable 2fa!" color="cyan" action={activate2FAHandler} />
					</div>

					<FormGroup check>
						<Input type="checkbox" className="roller-checkbox" id="dont_show_again" checked={dontShowAgain} onChange={() => checkboxHandler()} />
						<Label for="dont_show_again" className="form-check-label small-text">
							<span className="dont-show-text">{t("twoFactorModal.dontShow")}</span>
						</Label>
					</FormGroup>
				</ModalBody>
			</Modal>
			{isShow2FAModal && (
				<TwoFactorModal
					isShowModal={isShow2FAModal}
					email={userInfo.email}
					type={POST_TYPE_AUTH.ACTIVATE_2FA}
					is2faEnabled={false}
					body2FA={{ code_id: codeID, is_activate: true }}
					closeModalHandler={close2FAModalHandler}
				/>
			)}
		</Fragment>
	);
};

TwoFactorViewedModal.propTypes = {
	isShowTwoFactorModal: PropTypes.bool.isRequired,
};

export default TwoFactorViewedModal;
