import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Progress } from "reactstrap";
import LazyLoad from "react-lazyload";
import CryptoQuestModal from "./CryptoQuestModal";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import { setIsOpenCryptoQuestModalRedux } from "../../../actions/game";

import "../../../assets/scss/questsBanners/CryptoQuestBanner.scss";

import cryptoQuestIcon from "../../../assets/img/questsBanners/crypto_quest_icon.png";

CryptoQuestBanner.propTypes = {
	cryptoQuest: PropTypes.object.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

const CryptoQuestBanner = ({ cryptoQuest, isMobile }) => {
	const [isOpenCryptoQuestModal, setIsOpenCryptoQuestModal] = useState(false);
	const isOpenCryptoQuestModalRedux = useSelector((state) => state.game.isOpenCryptoQuestModal);
	const dispatch = useDispatch();

	useEffect(() => {
		if (isOpenCryptoQuestModalRedux && !isOpenCryptoQuestModal) {
			setIsOpenCryptoQuestModal(true);
		}
	}, [isOpenCryptoQuestModalRedux]);

	const toggleCryptoQuestModal = () => {
		setIsOpenCryptoQuestModal(!isOpenCryptoQuestModal);
	};

	const currencyConfig = getCurrencyConfig(cryptoQuest.currency);
	return (
		<Fragment>
			<div className={`crypto-quests ${isMobile ? "crypto-quest-mobile" : ""}`} onClick={toggleCryptoQuestModal}>
				<div className="content-wrapper">
					<div className="event-icon-block">
						<LazyLoad offset={100}>
							<img src={cryptoQuestIcon} alt="Crypto Quest icon" />
						</LazyLoad>
					</div>
					<div className="progress-wrapper">
						<Progress value={(cryptoQuest.progress / cryptoQuest.count_repeats) * 100} className="progress-bar" />
						<span className="progress-text">
							{cryptoQuest.progress}/{cryptoQuest.count_repeats} {isMobile ? "W. quests" : "Weekly quests"}
						</span>
					</div>
					<div className="reward-wrapper">
						<div className="currency-icon-block">
							<LazyLoad offset={100}>
								<img src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={isMobile ? 43 : 49} alt="currency icon" />
							</LazyLoad>
						</div>
						<div className="count-wrapper-block">
							<span>
								+{decimalAdjust(cryptoQuest.reward / currencyConfig.toSmall, currencyConfig.precision)} {currencyConfig.name}
							</span>
						</div>
					</div>
				</div>
			</div>
			{isOpenCryptoQuestModal && <CryptoQuestModal isOpenCryptoQuestModal={isOpenCryptoQuestModal} closeModalHandler={toggleCryptoQuestModal} cryptoQuest={cryptoQuest} />}
		</Fragment>
	);
};

export default CryptoQuestBanner;
