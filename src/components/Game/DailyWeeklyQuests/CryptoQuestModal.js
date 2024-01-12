import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody, Row, Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import { useSelector, useDispatch } from "react-redux";
import RollerButton from "../../SingleComponents/RollerButton";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import { setIsOpenDailyWeeklyQuestModal, setIsOpenCryptoQuestModalRedux } from "../../../actions/game";

import "../../../assets/scss/questsBanners/CryptoQuestModal.scss";

import clockIcon from "../../../assets/img/icon/clock.svg";
import closeIcon from "../../../assets/img/header/close_menu.svg";
import cryptoQuestLogo from "../../../assets/img/questsBanners/crypto_quest_logo.png";
import dogeLogo from "../../../assets/img/questsBanners/currencyLogo/doge_coin.png";

CryptoQuestModal.propTypes = {
	isOpenCryptoQuestModal: PropTypes.bool.isRequired,
	closeModalHandler: PropTypes.func.isRequired,
	cryptoQuest: PropTypes.object.isRequired,
};

const CryptoQuestModal = ({ isOpenCryptoQuestModal, closeModalHandler, cryptoQuest }) => {
	const isOpenDailyWeeklyQuestModal = useSelector((state) => state.game.isOpenDailyWeeklyQuestModal);
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const isOpenCryptoQuestModalRedux = useSelector((state) => state.game.isOpenCryptoQuestModal);
	const dispatch = useDispatch();
	const [viewTime, setViewTime] = useState({
		days: "",
		hours: "0H",
		minutes: "00M",
	});
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const timer = useRef(null);

	useEffect(() => {
		if (phaserScreenInputManager) {
			phaserScreenInputManager.enabled = false;
		}
		clearInterval(timer.current);
		startTimer(cryptoQuest.end_date);
	}, []);

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setViewTime({
				days: "",
				hours: "00H",
				minutes: "00M",
			});
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		setViewTime({
			days: time.days,
			hours: time.hours,
			minutes: time.minutes,
		});
	}, [timeLeftSeconds]);

	const startTimer = (date) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(date));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	const openDailyWeeklyQuestHandler = () => {
		if (!isOpenDailyWeeklyQuestModal) {
			dispatch(setIsOpenDailyWeeklyQuestModal(true));
			closeModal();
		}
	};

	const closeModal = () => {
		if (!phaserScreenInputManager.enabled) {
			phaserScreenInputManager.enabled = true;
		}
		if (isOpenCryptoQuestModalRedux) {
			dispatch(setIsOpenCryptoQuestModalRedux(false));
		}
		closeModalHandler();
	};

	const currencyConfig = getCurrencyConfig(cryptoQuest.currency);

	return (
		<Modal isOpen={isOpenCryptoQuestModal} toggle={closeModal} centered className="crypto-quests-modal">
			<ModalBody className="quest-modal-body">
				<Row className="content-block">
					<button className="tree-dimensional-button close-menu-btn btn-default quest-modal-close-btn" onClick={closeModal}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
						</span>
					</button>

					<Col xs={12} lg={8}>
						<div className="crypto-quest-logo">
							<LazyLoad offset={100}>
								<img src={cryptoQuestLogo} alt="Crypto Quest Logo" />
							</LazyLoad>
						</div>
						<div className="quest-timer-wrapper">
							<div className="remaining-time">
								<div className="time-icon">
									<LazyLoad offset={100}>
										<img src={clockIcon} alt="timer" width={15} height={15} />
									</LazyLoad>
								</div>
								<p className="time-text">
									{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes}
								</p>
							</div>
						</div>
					</Col>
					<Col xs={12} lg={4}>
						<div className="crypto-quest-currency-logo">
							<LazyLoad offset={100}>
								<img src={dogeLogo} alt="Doge coin" width={92} />
							</LazyLoad>
						</div>
						<div className="reward-coin-wrapper">
							<span className="reward-value">
								+{decimalAdjust(cryptoQuest.reward / currencyConfig.toSmall, currencyConfig.precision)} {currencyConfig.name}
							</span>
						</div>
					</Col>
				</Row>
				<div className="crypto-quest-action">
					<p className="text-action">Complete all Weekly Quests and get additional reward in crypto!</p>

					<RollerButton text="Do it!" className="cyan crypto-quest-btn" action={() => openDailyWeeklyQuestHandler()} />
				</div>
			</ModalBody>
		</Modal>
	);
};

export default CryptoQuestModal;
