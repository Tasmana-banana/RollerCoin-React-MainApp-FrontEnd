import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import RollerButton from "../SingleComponents/RollerButton";

import closeIcon from "../../assets/img/header/close_menu.svg";
import linkIcon from "../../assets/img/icon/go_to_link.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const OffersProviderModal = ({ closeModalHandler, isModalOpen, currentProvider }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("Offerwall");
	const goToLink = (link) => {
		window.open(link, "_blank");
	};

	return (
		<Modal size="lg" isOpen={isModalOpen} toggle={closeModalHandler} centered={true} className="provider-modal">
			<ModalBody className="provider-modal-body">
				<RollerButton className="close-modal-btn" size="smallest" icon={closeIcon} action={closeModalHandler} />
				<div className="provider-modal-header">
					<div className="provider-modal-title">
						<h4 className="provider-modal-title-text">{currentProvider.title}</h4>
						<button type="button" className="provider-modal-title-link" onClick={() => goToLink(currentProvider.url)}>
							<img src={linkIcon} width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} alt="URL" />
						</button>
					</div>
					{!!currentProvider.multiplier && currentProvider.multiplier > 1 && (
						<div className="provider-attention-block">
							<div className="provider-attention-wrapper">
								<p className="provider-attention-text">
									<span className="attention">{t("attention")}: </span>
									{t("attentionText")}{" "}
									<span className="accent-text">
										{currentProvider.multiplier} {t("timesHigher")}
									</span>{" "}
									{t("attentionTextSecond", { multiplier: currentProvider.multiplier })}
								</p>
							</div>
						</div>
					)}
				</div>
				<div className="provider-iframe-wrapper">
					<div className="iframe-loader">
						<img src={loaderImg} height={126} width={126} className="loader-img" alt="loader" />
					</div>
					<iframe className="provider-iframe" src={currentProvider.url}>
						Your browser doesn&apos;t support iframes
					</iframe>
				</div>
			</ModalBody>
		</Modal>
	);
};

OffersProviderModal.propTypes = {
	closeModalHandler: PropTypes.func.isRequired,
	isModalOpen: PropTypes.bool.isRequired,
	currentProvider: PropTypes.object.isRequired,
};

export default OffersProviderModal;
