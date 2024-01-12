import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import RollerButton from "../SingleComponents/RollerButton";

import "../../assets/scss/Market/SeasonTutorialModal.scss";

import arrowIcon from "../../assets/img/icon/arrow_right_green.svg";

const SeasonTutorialModal = ({ toggleModal, isShowTutorial }) => {
	const { t } = useTranslation("Game");
	const isMobile = useSelector((state) => state.game.isMobile);

	return (
		<div className="season-tutorial-modal-wrapper">
			<Modal className="season-tutorial-modal" toggle={toggleModal} centered isOpen={isShowTutorial}>
				<ModalBody className="season-tutorial-modal-body">
					<p className="tutorial-title">
						<span className="bold-text">{t("eventPass.seasonPass")}</span> {t("eventPass.tutorial")}
					</p>
					<div className="tutorial-block">
						<div className="tutorial-wrapper">
							<div className="tutorial-img-wrapper">
								<LazyLoadImage
									width={isMobile ? 90 : 160}
									height={isMobile ? 80 : 142}
									src={`${process.env.STATIC_URL}/static/img/seasons/tutorial/tutorial_step_1.png`}
									alt="tutorial"
									threshold={100}
								/>
							</div>
							<div className="description-wrapper">
								<p className="description-text">
									Complete the
									<br />
									<span className="bold-text">Quests</span>
								</p>
							</div>
						</div>
						<div className="next-step-wrapper">
							<LazyLoadImage width={isMobile ? 14 : 20} height={isMobile ? 16 : 20} src={arrowIcon} alt="next" threshold={100} />
						</div>
						<div className="tutorial-wrapper">
							<div className="tutorial-img-wrapper">
								<LazyLoadImage
									width={isMobile ? 90 : 160}
									height={isMobile ? 80 : 142}
									src={`${process.env.STATIC_URL}/static/img/seasons/tutorial/tutorial_step_2.png`}
									alt="tutorial"
									threshold={100}
								/>
							</div>
							<div className="description-wrapper">
								<p className="description-text">
									to raise your
									<br />
									<span className="bold-text">Level XP</span>
								</p>
							</div>
						</div>
						<div className="next-step-wrapper">
							<LazyLoadImage width={isMobile ? 14 : 20} height={isMobile ? 16 : 20} src={arrowIcon} alt="next" threshold={100} />
						</div>
						<div className="tutorial-wrapper">
							<div className="tutorial-img-wrapper">
								<LazyLoadImage
									width={isMobile ? 90 : 160}
									height={isMobile ? 80 : 142}
									src={`${process.env.STATIC_URL}/static/img/seasons/tutorial/tutorial_step_3.png`}
									alt="tutorial"
									threshold={100}
								/>
							</div>
							<div className="description-wrapper">
								<p className="description-text">
									and claim <br />
									<span className="bold-text">Rewards</span>
								</p>
							</div>
						</div>
					</div>
					<div className="tutorial-block">
						<div className="tutorial-wrapper">
							<div className="tutorial-img-wrapper gold-board">
								<LazyLoadImage
									width={isMobile ? 160 : 320}
									height={isMobile ? 80 : 160}
									src={`${process.env.STATIC_URL}/static/img/seasons/tutorial/tutorial_step_4.png`}
									alt="tutorial"
									threshold={100}
								/>
							</div>
							<div className="description-wrapper">
								<p className="description-text">
									Activate <span className="bold-text accent-text">GOLD pass</span>
								</p>
							</div>
						</div>
					</div>
					<div className="button-wrapper">
						<RollerButton className="tutorial-btn" color="cyan" text="Let's start!" action={toggleModal} />
					</div>
				</ModalBody>
			</Modal>
		</div>
	);
};

SeasonTutorialModal.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	isShowTutorial: PropTypes.bool.isRequired,
};

export default SeasonTutorialModal;
