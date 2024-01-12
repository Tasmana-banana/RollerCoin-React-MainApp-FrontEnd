import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/Game/CongratGoldPurchasesModal.scss";

const CongratsGoldPurchasesModal = ({ isShowModalCongratsGoldPurchases, toggleModalCongratsGoldPurchases, seasonId }) => {
	const { t } = useTranslation("Game");
	return (
		<Modal isOpen={isShowModalCongratsGoldPurchases} toggle={toggleModalCongratsGoldPurchases} centered className="congratulations-season-pass-modal">
			<ModalBody className="congratulations-season-pass-modal">
				<div className="congratulations-header-block">
					<img src={`${process.env.STATIC_URL}/static/img/seasons/${seasonId}/congrats_modal.gif`} alt="congratulations img" />
				</div>
				<div className="congratulations-footer-block">
					<p className="congratulations-text">
						{t("eventPass.congratulations")} <span className="gold-color">{t("eventPass.goldPass")}</span>
					</p>
					<RollerButton className="congratulations-btn" text={t("eventPass.goFun")} color="cyan" action={toggleModalCongratsGoldPurchases} />
				</div>
			</ModalBody>
		</Modal>
	);
};

CongratsGoldPurchasesModal.propTypes = {
	toggleModalCongratsGoldPurchases: PropTypes.func.isRequired,
	isShowModalCongratsGoldPurchases: PropTypes.bool.isRequired,
	seasonId: PropTypes.string.isRequired,
};

export default CongratsGoldPurchasesModal;
