import React from "react";
import { Col, UncontrolledTooltip } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import RewardBlock from "./RewardBlock";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import monitorIcon from "../../assets/img/game/monitor.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round_new.svg";
import arrowDown from "../../assets/img/game/arrow_down_lavander.svg";
import arrowUp from "../../assets/img/game/arrow_up_lavander.svg";
import arrowCyan from "../../assets/img/game/arrow_top_cyan.svg";

const MyPowerBlock = ({ activePowerBlock, setActivePowerBlock, userPower, userBonusPercent, togglePartitionModal, getBlocksItems, userPowerPenalty }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Game");
	const content = t("infoHints.myPowerTooltipText", { returnObjects: true });

	return (
		<Col xs={6} lg={12} className="game-header-block">
			<div className={`inside-content-block with-footer ${activePowerBlock === "MyPower" ? "open" : ""}`}>
				<div className="head-block">
					<div className="title-container">
						<div className="title-block">
							{!isMobile && (
								<div className="img-block">
									<img src={monitorIcon} width={15} height={15} alt="monitor" />
								</div>
							)}
							<p>{t("header.myPower")}</p>
						</div>
						<div className="info-tooltip-icon-container" id="myPowerId">
							<div className="info-icon-block">
								<img className="info-icon" src={infoTooltipImg} alt="info img" width="16" height="16" />
							</div>
							<UncontrolledTooltip placement={isMobile ? "bottom" : "right"} autohide={true} target="myPowerId">
								<p>
									<span className="text-cyan-outline">{content.subtitle}</span>
									{content.descr}
								</p>
								<p>
									<span className="text-cyan-outline">{content.subtitle4}</span>
									{content.descr4}
								</p>
								<p>
									<span className="text-cyan-outline">{content.subtitle2}</span>
									{content.descr2}
									<span className="text-golden"> {content.descrGold2}</span>
									{content.descr2_2}
								</p>
								<p>
									<span className="text-cyan-outline">{content.subtitle3}</span>
									{content.descr3}
									<span className="text-golden"> {content.descrGold3}</span>
									{content.descr3_2}
								</p>
								<p>
									<span className="text-cyan-outline">{content.subtitle5}</span>
									{content.descr5}
								</p>
								<p>
									<span className="text-cyan-outline">{content.subtitle7}</span>
									{content.descr7}
								</p>
							</UncontrolledTooltip>
						</div>
					</div>
					<div className="dropdown-container">
						<div
							className="btn-dropdown"
							onClick={() => {
								setActivePowerBlock("MyPower");
							}}
						>
							<p>
								<img src={arrowDown} width={15} height={15} alt="arrow_down" hidden={activePowerBlock === "MyPower"} />
								<img src={arrowUp} width={15} height={15} alt="arrow_up" hidden={activePowerBlock !== "MyPower"} />
							</p>
						</div>
					</div>
					<div className="body-block">
						{(activePowerBlock !== "MyPower" || userPower <= 0) && (
							<div className="power-total">
								{!isMobile && <span className="reward-info-title">{t("header.total")}</span>}
								<div className={`my-power-total-wrapper ${isMobile && !userBonusPercent ? "justify-content-end" : ""}`}>
									{!!userBonusPercent && (
										<div className="bonus-percent-power-wrapper cyan-text">
											<div className="img-block">
												<img src={arrowCyan} width={16} height={16} alt="up" />
											</div>
											<p>{`+${(userBonusPercent / 100).toFixed(2)}%`}</p>
										</div>
									)}
									{!!userBonusPercent && <span className="power-separator">{" / "}</span>}
									<span className="power-value">{`${getPrefixPower(userPower).power} ${getPrefixPower(userPower).hashDetail}`}</span>
								</div>
							</div>
						)}
						{activePowerBlock === "MyPower" && userPower > 0 && (
							<div className="power-total">
								<span className="reward-info-title">{t("header.bonusPower")}</span>
								<div className="my-power-total-wrapper bonus-info">
									<div className="bonus-percent-power-wrapper cyan-text">
										<div className="img-block">
											<img src={arrowCyan} width={16} height={16} alt="up" />
										</div>
										<p>{`+${(userBonusPercent / 100).toFixed(2) || 0}%`}</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				<RewardBlock
					buttonText={t("header.splitPower")}
					buttonIcon="partiotion-cyan"
					buttonLink={`${getLanguagePrefix(language)}/game/choose_game`}
					data={getBlocksItems("MyPower")}
					isOpen={activePowerBlock === "MyPower"}
					togglePartitionModal={togglePartitionModal}
					type="MyPower"
					userPower={userPower}
					userPowerPenalty={userPowerPenalty}
				/>
			</div>
		</Col>
	);
};

MyPowerBlock.propTypes = {
	activePowerBlock: PropTypes.string.isRequired,
	setActivePowerBlock: PropTypes.func.isRequired,
	userPower: PropTypes.number.isRequired,
	userBonusPercent: PropTypes.number.isRequired,
	togglePartitionModal: PropTypes.func.isRequired,
	getBlocksItems: PropTypes.func.isRequired,
	userPowerPenalty: PropTypes.number.isRequired,
};

export default MyPowerBlock;
