import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Col, Progress, UncontrolledTooltip } from "reactstrap";
import RewardBlock from "./RewardBlock";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import cupIcon from "../../assets/img/game/cup.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round_new.svg";
import arrowDown from "../../assets/img/game/arrow_down_lavander.svg";
import arrowUp from "../../assets/img/game/arrow_up_lavander.svg";

const YourRewardBlock = ({ activePowerBlock, currencyConfig, poolReward, getBlocksItems, setActivePowerBlock, reward, progress }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Game");

	return (
		<Col xs={6} lg={12} className="game-header-block">
			<div className={`inside-content-block with-footer ${activePowerBlock === "ExpReward" ? "open" : ""}`}>
				<div className="head-block">
					<div className="title-container">
						<div className="title-block">
							{!isMobile && (
								<div className="img-block">
									<img src={cupIcon} width={15} height={15} alt="cup" />
								</div>
							)}
							<p>
								{t("header.blockReward")} <span className="reward-number success-text hidden-mobile">{poolReward ? poolReward.blockSize : 0}</span>
								<span className="satoshi-text hidden-mobile">{currencyConfig.nameDisplayedInExpReward}</span>
							</p>
						</div>
						<div className="info-tooltip-icon-container" id="blockRewardId">
							<div className="info-icon-block">
								<img className="info-icon" src={infoTooltipImg} alt="info img" width="16" height="16" />
							</div>
							<UncontrolledTooltip placement={isMobile ? "bottom" : "right"} autohide={true} target="blockRewardId">
								{t("infoHints.blockRewardTooltipText")}
							</UncontrolledTooltip>
						</div>
					</div>
					<div className="dropdown-container">
						<div
							className="btn-dropdown"
							onClick={() => {
								setActivePowerBlock("ExpReward");
							}}
						>
							<p>
								<img src={arrowDown} width={14} height={14} alt="arrow_down" hidden={activePowerBlock === "ExpReward"} />
								<img src={arrowUp} width={14} height={14} alt="arrow_up" hidden={activePowerBlock !== "ExpReward"} />
							</p>
						</div>
					</div>
					<div className="body-block">
						<p className="reward-info your-exp-block">
							<span className="reward-info-title">{isMobile ? t("header.your") : t("header.exp")}</span>
							<span className="reward-text-wrapper">
								<span>{`= ${reward}`}</span>
								<span className="reward-text-currency">{currencyConfig.nameDisplayedInExpReward}</span>
							</span>
						</p>
						<div className="footer-block">
							<Progress animated value={progress} className={`progress-block ${activePowerBlock === "ExpReward" && "open"}`} />
						</div>
					</div>
				</div>
				<RewardBlock
					buttonText={t("header.powerChart")}
					buttonIcon="statistic_cyan"
					buttonLink={`${getLanguagePrefix(language)}/network-power`}
					data={getBlocksItems("ExpReward")}
					isOpen={activePowerBlock === "ExpReward"}
					type="block"
				/>
			</div>
		</Col>
	);
};

YourRewardBlock.propTypes = {
	activePowerBlock: PropTypes.string.isRequired,
	currencyConfig: PropTypes.array.isRequired,
	poolReward: PropTypes.array.isRequired,
	getBlocksItems: PropTypes.func.isRequired,
	setActivePowerBlock: PropTypes.func.isRequired,
	reward: PropTypes.number.isRequired,
	progress: PropTypes.number.isRequired,
};

export default YourRewardBlock;
