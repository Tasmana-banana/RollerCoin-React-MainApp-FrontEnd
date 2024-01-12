import React from "react";
import { Col, Modal, ModalBody, Row } from "reactstrap";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import getPrefixPower from "../../../services/getPrefixPower";

import "../../../assets/scss/SystemSaleEvent/SystemSaleEventModals/RewardMinersModal.scss";
import closeIcon from "../../../assets/img/header/close_menu.svg";

const imgSrc = (type, filename, imgVer) => {
	let src = "";
	switch (type) {
		case "miner":
		case "miners":
			src = `${process.env.STATIC_URL}/static/img/market/miners/${filename}.gif?v=${imgVer}`;
			break;
		default:
			src = "";
	}
	return src;
};

const RewardMinersModal = ({ rewards, divider, isViewRewardsModal, toggleViewRewardsModal, rewardIcon }) => {
	const language = useSelector((state) => state.game.language);

	return (
		<Modal isOpen={isViewRewardsModal} toggle={toggleViewRewardsModal} returnFocusAfterClose={false} centered className="rewards-modal">
			<ModalBody className="rewards-modal-body">
				<button className="btn-default modal-close-btn" onClick={toggleViewRewardsModal}>
					<span className="close-btn-img-wrapper">
						<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
					</span>
				</button>
				<div className="rewards-modal-title">rewards miners</div>

				<Row className="rewards-list" noGutters={true}>
					{rewards.map((reward, index) => {
						return (
							<Col xs={6} className="reward-item" key={reward.item.item_id}>
								<div className="reward-item-card">
									<LazyLoadImage
										alt={reward.item.item_id}
										src={imgSrc(reward.type, reward.type === "miner" ? reward.item.filename : reward.item.item_id, reward.item.img_ver)}
										threshold={100}
										className="reward-item-img"
									/>
									<span className="reward-item-text">{reward.item.name[language] || reward.item.name.en} </span>
									<div className="reward-item-text">
										<span className="reward-item-text">
											{getPrefixPower(reward.item.power).power} {getPrefixPower(reward.item.power).hashDetail} {" | "}
										</span>
										<span></span>
										<span className="reward-item-text reward-item-bonus">{reward.item.bonus / 100}%</span>
									</div>
								</div>
								<div className="reward-item-description">
									<span>Level {index + 1}</span>
									<span>
										<img src={rewardIcon} width={17} height={17} alt="level-icon" />
										{reward.required_xp / (divider || 1)}
									</span>
								</div>
							</Col>
						);
					})}
				</Row>
			</ModalBody>
		</Modal>
	);
};

RewardMinersModal.propTypes = {
	rewards: PropTypes.array.isRequired,
	divider: PropTypes.number.isRequired,
	isViewRewardsModal: PropTypes.bool.isRequired,
	toggleViewRewardsModal: PropTypes.func.isRequired,
	rewardIcon: PropTypes.string.isRequired,
};

export default RewardMinersModal;
