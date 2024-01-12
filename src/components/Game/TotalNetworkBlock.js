import React from "react";
import PropTypes from "prop-types";
import { Col, UncontrolledTooltip } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import RewardBlock from "./RewardBlock";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import globeIcon from "../../assets/img/game/globe.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round_new.svg";
import arrowDown from "../../assets/img/game/arrow_down_lavander.svg";
import arrowUp from "../../assets/img/game/arrow_up_lavander.svg";

const TotalNetworkBlock = ({ activePowerBlock, totalPoolsPower, colorPoolPower, getBlocksItems, setActivePowerBlock }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Game");
	return (
		<Col xs={6} lg={12} className="game-header-block">
			<div className={`inside-content-block with-footer ${activePowerBlock === "NetworkPower" ? "open" : ""}`}>
				<div className="head-block">
					<div className="title-container">
						<div className="title-block">
							{!isMobile && (
								<div className="img-block">
									<img src={globeIcon} width={15} height={15} alt="globe" />
								</div>
							)}
							<p>{t("header.networkPower")}</p>
						</div>
						<div className="info-tooltip-icon-container" id="networkPowerId">
							<div className="info-icon-block">
								<img className="info-icon" src={infoTooltipImg} alt="info img" width="16" height="16" />
							</div>
							<UncontrolledTooltip placement={isMobile ? "bottom" : "right"} autohide={true} target="networkPowerId">
								{t("infoHints.networkPowerTooltipText")}
							</UncontrolledTooltip>
						</div>
					</div>
					<div className="dropdown-container">
						<div
							className="btn-dropdown"
							onClick={() => {
								setActivePowerBlock("NetworkPower");
							}}
						>
							<p>
								<img src={arrowDown} width={15} height={15} alt="arrow_down" hidden={activePowerBlock === "NetworkPower"} />
								<img src={arrowUp} width={15} height={15} alt="arrow_up" hidden={activePowerBlock !== "NetworkPower"} />
							</p>
						</div>
					</div>
					<div className="body-block">
						<p className="power-total">
							<span className="reward-info-title">{t("header.total")}</span>
							<span className={`power-value ${colorPoolPower}`}>{`${getPrefixPower(totalPoolsPower).power} ${getPrefixPower(totalPoolsPower).hashDetail}`}</span>
						</p>
					</div>
				</div>
				<RewardBlock
					buttonText={t("header.powerChart")}
					buttonIcon="statistic_cyan"
					buttonLink={`${getLanguagePrefix(language)}/network-power`}
					data={getBlocksItems("NetworkPower")}
					isOpen={activePowerBlock === "NetworkPower"}
				/>
			</div>
		</Col>
	);
};

TotalNetworkBlock.propTypes = {
	activePowerBlock: PropTypes.string.isRequired,
	totalPoolsPower: PropTypes.number.isRequired,
	colorPoolPower: PropTypes.string.isRequired,
	getBlocksItems: PropTypes.func.isRequired,
	setActivePowerBlock: PropTypes.func.isRequired,
};

export default TotalNetworkBlock;
