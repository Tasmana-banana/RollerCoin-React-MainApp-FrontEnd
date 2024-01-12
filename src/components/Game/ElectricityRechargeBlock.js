import React, { useState, useEffect } from "react";
import { Col, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import ApplyCancelModal from "../SingleComponents/ApplyCancelModal";
import ElectricityBar from "./ElectricityBar";
import RollerButton from "../SingleComponents/RollerButton";
import ElectricityTimer from "./ElectricityTimer";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";

import lightningIcon from "../../assets/img/game/lightning.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round_new.svg";
import arrowDown from "../../assets/img/game/arrow_down_lavander.svg";
import plusIcon from "../../assets/img/game/plus.svg";
import arrowUp from "../../assets/img/game/arrow_up_lavander.svg";
import lightningBlackIcon from "../../assets/img/game/lightning_black.svg";
import gamesIcon from "../../assets/img/icon/gamepad_icon_white.svg";
import gameBlackIcon from "../../assets/img/icon/gamepad_icon.svg";
import marketPlaceIcon from "../../assets/img/icon/marketplace_icon_white.svg";

const ElectricityRechargeBlock = ({
	widthLg,
	activePowerBlock,
	timeToRecharge,
	startRecharge,
	setActiveCellsCountHandler,
	activeCellsCount,
	totalCellsCount,
	totalFreeCellsCount,
	userBatteriesCount,
	isRechargeAcceptModalOpen,
	btnPulsated,
	isRechargeButtonDisable,
	rechargeButtonApprove,
	setActivePowerBlock,
	rechargeElectricity,
	userInfo,
	setElectricityPulsatedBtn,
}) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const notification = useSelector((state) => state.notification);
	const [progressRechargePercent, setProgressRechargePercent] = useState(0);
	const [isShowElectricityInfoTooltip, setIsShowElectricityInfoTooltip] = useState(false);
	const [isLowChargeTimer, setIsLowChargeTimer] = useState(false);
	const { t } = useTranslation("Game");

	useEffect(() => {
		setIsLowChargeTimer(activeCellsCount === totalFreeCellsCount && progressRechargePercent < 50);
	}, [activeCellsCount, progressRechargePercent]);

	const isViewedBtnPlay =
		(userBatteriesCount <= 0 && activeCellsCount > totalFreeCellsCount) ||
		(userBatteriesCount <= 0 && activeCellsCount === totalFreeCellsCount && dayjs(timeToRecharge).diff(dayjs(), "hours") >= 12);
	const isViewedBtnFreeRecharge = timeToRecharge ? dayjs(timeToRecharge).diff(dayjs(), "hours") < 12 && activeCellsCount <= totalFreeCellsCount : true;
	const isViewedBtnUpgrade = (userBatteriesCount > 0 && activeCellsCount > totalFreeCellsCount) || dayjs(timeToRecharge).diff(dayjs(), "hours") >= 12;
	const toggleElectricityInfoTooltip = async () => {
		setIsShowElectricityInfoTooltip(!isShowElectricityInfoTooltip);
		if (notification?.electricity_info?.is_show_notification) {
			await setNotificationReadAccept("read", notification.electricity_info);
		}
	};

	return (
		<Col xs="6" lg={widthLg} className="game-header-block electricity-block-header">
			<div className={`inside-content-block with-footer ${activePowerBlock === "myElectricity" ? "open" : ""}`}>
				<div className="head-block">
					<div className="title-container">
						<div className="title-block">
							{!isMobile && (
								<div className="img-block">
									<img src={lightningIcon} width={15} height={15} alt="lightning" />
								</div>
							)}
							<p>{`${t("header.electricity")} (${userBatteriesCount})`}</p>
						</div>
						{!!activeCellsCount && (
							<ElectricityTimer
								timeToRecharge={timeToRecharge}
								startRecharge={startRecharge}
								setProgressRechargePercent={setProgressRechargePercent}
								setActiveCellsCountHandler={setActiveCellsCountHandler}
								setElectricityPulsatedBtn={setElectricityPulsatedBtn}
								isLowCharge={isLowChargeTimer}
							/>
						)}
						<div className="info-tooltip-icon-container" id="electricityTooltipId">
							<div className={`info-icon-block ${notification?.electricity_info?.is_show_notification ? "cyan-pulsated" : ""}`}>
								<img className="info-icon" src={infoTooltipImg} alt="info img" width="16" height="16" />
							</div>
							<UncontrolledTooltip
								placement={isMobile ? "bottom" : "right"}
								autohide={true}
								target="electricityTooltipId"
								isOpen={isShowElectricityInfoTooltip}
								toggle={toggleElectricityInfoTooltip}
							>
								<p>
									<span className="text-cyan-outline">{t("infoHints.electricityTooltipText.electricityBold")}</span>
									{t("infoHints.electricityTooltipText.electricityText")}
								</p>
								<p>
									<span className="text-cyan-outline">{t("infoHints.electricityTooltipText.freeCellBold")}</span>
									{t("infoHints.electricityTooltipText.freeCellText")}
								</p>
								<p>
									<span className="text-cyan-outline">{t("infoHints.electricityTooltipText.premiumCellBold")}</span>
									{t("infoHints.electricityTooltipText.premiumCellText")}
								</p>
								<p>
									<span className="text-cyan-outline">{t("infoHints.electricityTooltipText.batteriesBold")}</span>
									{t("infoHints.electricityTooltipText.batteriesText")}
								</p>
							</UncontrolledTooltip>
						</div>
					</div>
					<div className="dropdown-container">
						<div
							className="btn-dropdown"
							onClick={() => {
								setActivePowerBlock("myElectricity");
							}}
						>
							<p>
								<img src={arrowDown} width={15} height={15} alt="arrow_down" hidden={activePowerBlock === "myElectricity"} />
								<img src={arrowUp} width={15} height={15} alt="arrow_up" hidden={activePowerBlock !== "myElectricity"} />
							</p>
						</div>
					</div>
				</div>
				<div className="body-block">
					<div className="electricity-block">
						<ElectricityBar
							activeCellsCount={activeCellsCount}
							totalCellsCount={totalCellsCount}
							totalFreeCellsCount={totalFreeCellsCount}
							progressRechargePercent={progressRechargePercent}
						/>
						<div className="electricity-recharge-btn-container">
							{!isViewedBtnPlay && (
								<button
									type="button"
									className={`tree-dimensional-button btn-cyan electricity-recharge-btn ${btnPulsated} ${isRechargeButtonDisable ? "inactive" : ""}`}
									disabled={isRechargeButtonDisable}
									onClick={rechargeButtonApprove}
								>
									<span className="btn-text">
										{isMobile && isViewedBtnFreeRecharge && <img className="btn-icon" src={lightningBlackIcon} width={8} height={10} alt="lightning" />}
										{!isMobile && isViewedBtnFreeRecharge && t("header.rechargeBtn")}
										{isMobile && isViewedBtnUpgrade && <img className="btn-icon" src={plusIcon} width={10} height={10} alt="plus icon" />}
										{!isMobile && isViewedBtnUpgrade && t("header.upgradeRechargeBtn")}
									</span>
								</button>
							)}
							{isViewedBtnPlay && (
								<Link to={`${getLanguagePrefix(language)}/game/choose_game`}>
									<button type="button" className={`tree-dimensional-button btn-cyan electricity-recharge-btn`}>
										<span className="btn-text">
											{isMobile && <img className="btn-icon" src={gameBlackIcon} width={12} height={12} alt="Cart icon" />}
											{!isMobile && t("header.play")}
										</span>
									</button>
								</Link>
							)}
						</div>
					</div>
				</div>
				<div className={`currencies-dropdown ${activePowerBlock === "myElectricity" ? "open" : ""}`}>
					<div className="electricity-wrapper">
						<p className="electricity-description">
							{t("header.electricityDescription.electricityDescriptionPar1")}
							<span className="electricity-description-bold">{t("header.electricityDescription.electricityMiniGames")}</span>
							{t("header.electricityDescription.electricityDescriptionPar2")}
							<span className="electricity-description-bold">{t("header.electricityDescription.electricityMarketplace")}</span>
						</p>
					</div>
					<div className="electricity-btn-block">
						<Link className="electricity-btn-link" to={`${getLanguagePrefix(language)}/game/choose_game`}>
							<RollerButton className="electricity-btn" icon={gamesIcon} size="small" />
						</Link>
						<Link className="electricity-btn-link" to={`${getLanguagePrefix(language)}/marketplace/buy/battery/6454bcdf75f06df66d28af04`}>
							<RollerButton className="electricity-btn" icon={marketPlaceIcon} size="small" />
						</Link>
					</div>
				</div>
				{isRechargeAcceptModalOpen && (
					<ApplyCancelModal
						isOpen={isRechargeAcceptModalOpen}
						handler={() => rechargeElectricity(userInfo.uid, "batteries")}
						title={t("header.areYouSure")}
						description={t("header.acceptRecharge")}
						leftButtonText="recharge"
						leftButtonColor="cyan"
						toggleModal={rechargeButtonApprove}
					/>
				)}
			</div>
		</Col>
	);
};

ElectricityRechargeBlock.propTypes = {
	widthLg: PropTypes.number.isRequired,
	activePowerBlock: PropTypes.string.isRequired,
	timeToRecharge: PropTypes.string.isRequired,
	startRecharge: PropTypes.string.isRequired,
	setActiveCellsCountHandler: PropTypes.func.isRequired,
	activeCellsCount: PropTypes.number.isRequired,
	totalCellsCount: PropTypes.number.isRequired,
	totalFreeCellsCount: PropTypes.number.isRequired,
	userBatteriesCount: PropTypes.number.isRequired,
	isRechargeAcceptModalOpen: PropTypes.bool.isRequired,
	btnPulsated: PropTypes.string.isRequired,
	isRechargeButtonDisable: PropTypes.bool.isRequired,
	rechargeButtonApprove: PropTypes.func.isRequired,
	setActivePowerBlock: PropTypes.func.isRequired,
	rechargeElectricity: PropTypes.func.isRequired,
	userInfo: PropTypes.object.isRequired,
	setElectricityPulsatedBtn: PropTypes.func.isRequired,
};

export default ElectricityRechargeBlock;
