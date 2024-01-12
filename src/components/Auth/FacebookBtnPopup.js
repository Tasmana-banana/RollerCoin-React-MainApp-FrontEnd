import React, { Fragment, useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { SIGN_UP_STEP_TWO_EVENTS } from "../../constants/SingleComponents";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/SingleComponents/FacebookBtn.scss";
import errorModalImage from "../../assets/img/singleComponents/error-modal-banner.png";

const FacebookBtnPopup = ({ isModalOpen, provider }) => {
	const [isOpen, setIsOpen] = useState(isModalOpen);
	const { t } = useTranslation("Registration");
	const content = t("facebookBtnPopup", { returnObjects: true });

	useEffect(() => {
		if (provider) {
			const { event, params } = SIGN_UP_STEP_TWO_EVENTS[provider].error;
			googleAnalyticsPush(event, params);
		}
	}, []);

	const toggleModal = () => {
		const { event, params } = SIGN_UP_STEP_TWO_EVENTS[provider].gotIt;
		googleAnalyticsPush(event, params);
		setIsOpen(!isOpen);
	};

	return (
		<Fragment>
			<Modal size="md" isOpen={isOpen} toggle={toggleModal} centered={true} className="facebook-modal">
				<ModalBody className="facebook-modal-wrapper">
					<img className="facebook-modal-img" src={errorModalImage} width={600} height={370} alt="repair" />
					<div className="facebook-modal-instruction-wrapper">
						<ul className="facebook-modal-instruction">
							<li>
								{content?.description1}
								<span className="gold-text">{content?.email}</span>
								{content?.description2}
							</li>
							<li>
								{content?.description3}
								<span className="gold-text">{content?.description4}</span>
								{content?.description5}
							</li>
						</ul>
					</div>
					<p className="facebook-modal-description">{content?.description6}</p>
					<div className="facebook-modal-btn-wrapper">
						<RollerButton className="facebook-modal-btn" text={content?.gotIt} color="cyan" width="200px" action={toggleModal} />
					</div>
				</ModalBody>
			</Modal>
		</Fragment>
	);
};

FacebookBtnPopup.propTypes = {
	isModalOpen: PropTypes.bool,
	provider: PropTypes.string,
};

export default FacebookBtnPopup;
