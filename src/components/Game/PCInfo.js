import React, { Component } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Tooltip } from "reactstrap";
import "moment-duration-format";
import fetchWithToken from "../../services/fetchWithToken";

import gamePowerTimeIcon from "../../assets/img/game/winning/power_time_icon.png";
import gameMinerIcon from "../../assets/img/game/winning/game_miner_icon.png";
import gamePowerIcon from "../../assets/img/game/winning/game_power_icon.png";
import gameRewardIcon from "../../assets/img/game/winning/power_reward_icon.png";
import gameRltIcon from "../../assets/img/game/winning/game_rlt_icon.png";
import gameBatteryIcon from "../../assets/img/market/battery_icon.svg";

class PCInfo extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			name: "-",
			code: "10000",
			level: 0,
			powerHolding: 0,
			levelReset: 0,
			gamesLeft: 0,
			maxLevel: 0,
			isInfoTooltipOpen: false,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.updateRankTimer = null;
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	componentDidMount() {
		this.getPCConfig();
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
		if (this.updateRankTimer) {
			clearInterval(this.updateRankTimer);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.levelReset > 0 && this.state.levelReset <= 0 && this.updateRankTimer) {
			clearInterval(this.updateRankTimer);
			this.getPCConfig();
		}
	}

	getPCConfig = async () => {
		try {
			this.createSignalAndController();
			const json = await fetchWithToken(`/api/game/pc-config`, {
				method: "GET",
				signal: this.signal,
			});
			if (json.success) {
				const { name, code, level, level_reset: levelReset, power_holding: powerHolding, games_to_next_level: gamesLeft, max_level: maxLevel } = json.data;
				this.setState({
					name,
					code,
					level,
					powerHolding,
					levelReset,
					gamesLeft,
					maxLevel,
				});
				this.timerInterval();
			}
		} catch (e) {
			console.error(e);
		}
	};

	timerInterval = () => {
		this.updateRankTimer = setInterval(() => this.setState({ levelReset: this.state.levelReset - 1000 }), 1000);
	};

	infoTooltipToggle = () => {
		const { isInfoTooltipOpen } = this.state;
		this.setState({ isInfoTooltipOpen: !isInfoTooltipOpen });
	};

	render() {
		const { name, code, level, powerHolding, levelReset, gamesLeft, maxLevel, isInfoTooltipOpen } = this.state;
		const { t, isMobile } = this.props;
		return (
			<div className="pc-info-container-border">
				<div className="pc-info-container">
					<div className="pc-image-container">
						<img className="pc-image" src={`/static/img/gamePC/${code}.png`} width={isMobile ? 102 : 146} height={isMobile ? 67 : 96} alt={name} />
					</div>
					<div className="pc-info">
						<div>
							<p className="pc-info-item">
								{t("pcInfo.pcName")}
								<span className="text-white">
									{name}/ {t("pcInfo.pcLevel")}
									{level}
								</span>
							</p>
							<p className="pc-info-item">
								{t("pcInfo.powerHolding")}
								<span className="text-white">{powerHolding} days</span>
							</p>
						</div>
						<div className="level-reset">
							<p className="pc-info-item">
								{t("pcInfo.levelReset")}
								<span className="text-white">
									{levelReset > 0 &&
										moment.duration(levelReset, "milliseconds").format("hh:mm:ss", {
											trim: false,
										})}
									{levelReset <= 0 && t("pcInfo.never")}
								</span>
							</p>
						</div>
						<div>
							<p className="pc-info-item">
								{t("pcInfo.nextLevel")} <span className="text-white">{level === maxLevel ? t("pcInfo.maxPcLevel") : t("pcInfo.winGames", { gamesCount: gamesLeft })}</span>
							</p>
						</div>
					</div>
				</div>
				<div className="winning-game-info">
					<h3 className="winning-game-title">{t("pcInfo.winning.title")}</h3>
					<div className="winning-game-list">
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gamePowerTimeIcon} alt="" />
							<p className="winning-game-text">{t("pcInfo.winning.text1")}</p>
						</div>
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gamePowerIcon} alt="" />
							<p className="winning-game-text">{t("pcInfo.winning.text2")}</p>
						</div>
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gameRewardIcon} alt="" />
							<p className="winning-game-text">{t("pcInfo.winning.text3")}</p>
						</div>
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gameMinerIcon} alt="" />
							<p className="winning-game-text">{t("pcInfo.winning.text4")}</p>
						</div>
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gameRltIcon} alt="" />
							<p className="winning-game-text">{t("pcInfo.winning.text5")}</p>
						</div>
						<div className="winning-game-item">
							<img className="winning-game-icon" src={gameBatteryIcon} alt="" width={24} height={24} />
							<p className="winning-game-text">{t("pcInfo.winning.text6")}</p>
						</div>
					</div>
				</div>
				<div className="dropdown-container d-flex">
					<div className="btn-dropdown" id="infoTooltip">
						<img src="/static/img/storage/info_icon_round.svg" width={22} height={22} alt="notice" />
					</div>
				</div>
				<Tooltip placement="left" autohide={true} target="infoTooltip" isOpen={isInfoTooltipOpen} toggle={this.infoTooltipToggle}>
					<p className="m-0">{t("pcInfo.temporaryPower")}</p>
					<p className="m-0">{t("pcInfo.cooldown")}</p>
					<p className="m-0">{t("pcInfo.externalSoftware")}</p>
				</Tooltip>
			</div>
		);
	}
}

export default withTranslation("Games")(PCInfo);
