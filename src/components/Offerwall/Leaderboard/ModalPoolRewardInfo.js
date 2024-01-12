import React from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";

import "../../../assets/scss/Offerwall/ModalPoolRewardInfo.scss";

import closeIcon from "../../../assets/img/header/close_menu.svg";
import goldCup from "../../../assets/img/offerwall/leaderboard/crown_gold_small.png";
import silverCup from "../../../assets/img/offerwall/leaderboard/crown_silver_small.png";
import bronzeCup from "../../../assets/img/offerwall/leaderboard/crown_bronze_small.png";

const placeConstructor = (place) => {
	const PLACE_ITEMS = {
		first_place: {
			icon: goldCup,
			color: "#ffdc00",
			place: "1th",
			text: "place",
		},
		second_place: {
			icon: silverCup,
			color: "#e0e0e0",
			place: "2nd",
			text: "place",
		},
		third_place: {
			icon: bronzeCup,
			color: "#ed955a",
			place: "3rd",
			text: "place",
		},
		fourth_place: {
			icon: "",
			color: "",
			place: "4th",
			text: "place",
		},
		default_place: {
			icon: "",
			color: "",
			place,
			text: "place",
		},
		other_place: {
			icon: "",
			color: "",
			place,
			text: "places",
		},
	};
	if (Number.isInteger(place)) {
		if (place === 1) {
			return PLACE_ITEMS.first_place;
		}
		if (place === 2) {
			return PLACE_ITEMS.second_place;
		}
		if (place === 3) {
			return PLACE_ITEMS.third_place;
		}
		if (place === 4) {
			return PLACE_ITEMS.fourth_place;
		}
		return PLACE_ITEMS.default_place;
	}
	return PLACE_ITEMS.other_place;
};

const ModalPoolRewardInfo = ({ poolReward, openModal, toggleModal, activeTab, currency }) => {
	const rewardTitle = activeTab === "weekly" ? "Weekly Competition Prize Pool" : "Grand Competition Prize Pool";
	const currencyConfig = getCurrencyConfig(currency);
	return (
		<Modal isOpen={openModal} centered={true} className="modal-reward">
			<ModalBody className="modal-reward-wrapper">
				<button className="btn-default reward-modal-close-btn" onClick={toggleModal}>
					<span className="close-btn-img-wrapper">
						<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
					</span>
				</button>
				<div className="reward-content">
					<p className="reward-title">{rewardTitle}</p>
					<div className="pool-reward-table">
						{!!poolReward.length &&
							poolReward.map((item) => {
								const place = item.required_rank_from === item.required_rank_to ? item.required_rank_from : `${item.required_rank_from}-${item.required_rank_to}`;

								return (
									<div key={item._id} className="reward-tr">
										<div className="reward-place">
											<div className="reward-place-text" style={{ color: placeConstructor(place).color }}>
												{placeConstructor(place).icon && <img className="reward-cup" src={placeConstructor(place).icon} width={19} height={24} alt="Reward cup" />}
												<span>{placeConstructor(place).place}</span>
												{placeConstructor(place).text}
											</div>
										</div>
										<div className="reward-count">
											<img className="reward-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={24} height={24} alt="currency icon" />
											<span>{decimalAdjust(item.amount / currencyConfig.toSmall, currencyConfig.precision)}</span>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
};

ModalPoolRewardInfo.propTypes = {
	poolReward: PropTypes.array.isRequired,
	openModal: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired,
	activeTab: PropTypes.string.isRequired,
	currency: PropTypes.string.isRequired,
};
export default ModalPoolRewardInfo;
