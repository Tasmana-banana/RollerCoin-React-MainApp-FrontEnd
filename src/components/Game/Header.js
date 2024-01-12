import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import DailyWeeklyQuests from "./DailyWeeklyQuests/DailyWeeklyQuests";
import PowerPartitionModal from "./PowerPartitionModal";
import TutorialModal from "../Tutorial/TutorialModal";
import ElectricityRechargeBlock from "./ElectricityRechargeBlock";
import MyPowerBlock from "./MyPowerBlock";
import TotalNetworkBlock from "./TotalNetworkBlock";
import YourRewardBlock from "./YourRewardBlock";
import EventPopup from "../SingleComponents/EventPopup";
import MinerRewardModal from "../SingleComponents/MinerRewardModal";
import decimalAdjustFloor from "../../services/decimalAdjustFloor";
import scientificToDecimal from "../../services/scientificToDecimal";
import fetchWithToken from "../../services/fetchWithToken";
import getPrefixPower from "../../services/getPrefixPower";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import { LEFT_HOURS_TO_FREE_RECHARGE } from "../../constants/Game/electricity";

import * as actionsUser from "../../actions/userInfo";
import * as actions from "../../actions/game";

import electricitySuccessIcon from "../../assets/img/icon/electricity_success_icon.svg";
import successIcon from "../../assets/img/icon/success_notice.svg";
import errorIcon from "../../assets/img/icon/error_notice.svg";
import blockMinedIcon from "../../assets/img/game/block_mined.svg";

import "../../assets/scss/Game/Header.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	totalRewardBlock: state.game.totalRewardBlock,
	userPower: state.game.userPower,
	userMinersAmount: state.user.userMinersAmount,
	userPowerPenalty: state.game.userPowerPenalty,
	poolsPower: state.game.poolsPower,
	progressBlocks: state.game.progressBlocks,
	pathName: state.router.location.pathname,
	miningConfig: state.user.miningConfig,
	isPowerPartitionModalOpen: state.user.isPowerPartitionModalOpen,
	currentMiningCurrency: state.user.currentMiningCurrency,
	rollerCurrencies: state.wallet.rollerCurrencies,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
	isViewedTutorial: state.user.userViewedTutorial,
	eventPopup: state.notification.event_pop_up,
	isShowCustomNotification: state.game.isShowCustomNotification,
	isMobile: state.game.isMobile,
	userInfo: state.user,
	gameInfo: state.game,
	wsNode: state.webSocket.wsNode,
	isFirstMinerInGame: state.game.isFirstMinerInGame,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	togglePartitionModal: (state) => dispatch(actionsUser.togglePartitionModal(state)),
	reloadMainGame: (state) => dispatch(actions.reloadMainGame(state)),
	setIsFirstMiningInGame: (state) => dispatch(actions.setIsFirstMiningInGame(state)),
});

class HeaderClass extends Component {
	static propTypes = {
		totalRewardBlock: PropTypes.object.isRequired,
		userPower: PropTypes.number.isRequired,
		userPowerPenalty: PropTypes.number.isRequired,
		userMinersAmount: PropTypes.number.isRequired,
		poolsPower: PropTypes.array.isRequired,
		pathName: PropTypes.string.isRequired,
		widthLg: PropTypes.number.isRequired,
		progressBlocks: PropTypes.array.isRequired,
		wsReact: PropTypes.object.isRequired,
		miningConfig: PropTypes.array.isRequired,
		rollerCurrencies: PropTypes.object.isRequired,
		isPowerPartitionModalOpen: PropTypes.bool.isRequired,
		togglePartitionModal: PropTypes.func.isRequired,
		currentMiningCurrency: PropTypes.string.isRequired,
		phaserScreenInputManager: PropTypes.object,
		reloadMainGame: PropTypes.func.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		eventPopup: PropTypes.object.isRequired,
		isShowCustomNotification: PropTypes.bool.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		userInfo: PropTypes.object.isRequired,
		gameInfo: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		isLoading: PropTypes.bool.isRequired,
		isFirstMinerInGame: PropTypes.bool.isRequired,
		setIsFirstMiningInGame: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			reward: 0,
			progress: 0,
			colorPoolPower: "",
			blockRewardOpen: false,
			prevStateBlockRewardOpen: false,
			activePowerBlock: "",
			totalPoolsPower: this.getTotalPoolPower(),
			isRechargeButtonDisable: true,
			isOpenInfoTooltip: false,
			userBonusPercent: 0,
			userBonusPower: 0,
			userBatteriesCount: 0,
			totalCellsCount: 0,
			activeCellsCount: 0,
			totalFreeCellsCount: 0,
			startRecharge: null,
			timeToRecharge: null,
			timeLeftSeconds: 0,
			btnPulsated: "",
			isRechargeAcceptModalOpen: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	async componentDidMount() {
		const { wsNode } = this.props;
		if (wsNode && !wsNode.listenersMessage.updateGameData) {
			wsNode.setListenersMessage({ updateGameData: this.onWSNodeMessage });
		}
		localStorage.setItem("lastVisit", `${new Date()}`);
		await this.getElectricityInfo();
		this.getReward();
		this.getUserBonusPower();
		this.setElectricityButtonStatus();
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("updateGameData");
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidUpdate(prevProps, prevState) {
		if (
			JSON.stringify(this.props.totalRewardBlock) !== JSON.stringify(prevProps.totalRewardBlock) ||
			JSON.stringify(prevProps.poolsPower) !== JSON.stringify(this.props.poolsPower) ||
			prevProps.userPower !== this.props.userPower ||
			this.props.currentMiningCurrency !== prevProps.currentMiningCurrency ||
			JSON.stringify(this.props.progressBlocks) !== JSON.stringify(prevProps.progressBlocks)
		) {
			try {
				const isCurrentMiningCurrency = prevProps.progressBlocks
					.filter((obj) => obj.progress !== this.props.progressBlocks.find((obj2) => obj2.currency === obj.currency).progress)
					.find((obj) => obj.currency === this.props.currentMiningCurrency);
				if (isCurrentMiningCurrency || this.props.currentMiningCurrency !== prevProps.currentMiningCurrency) {
					if (JSON.stringify(this.props.progressBlocks) !== JSON.stringify(prevProps.progressBlocks) || this.props.currentMiningCurrency !== prevProps.currentMiningCurrency) {
						this.getReward();
					}
					this.handleProgress();
				}
			} catch (e) {
				console.error(e);
			}
		}
		const { activeCellsCount, totalCellsCount, timeToRecharge, userBatteriesCount, totalPoolsPower, activePowerBlock, isRechargeAcceptModalOpen } = this.state;
		if (prevState.activePowerBlock !== activePowerBlock) {
			this.props.phaserScreenInputManager.enabled = !activePowerBlock;
		}
		if (prevState.isRechargeAcceptModalOpen !== isRechargeAcceptModalOpen) {
			this.props.phaserScreenInputManager.enabled = !isRechargeAcceptModalOpen;
		}
		if (prevState.totalPoolsPower !== totalPoolsPower && prevState.totalPoolsPower !== 0) {
			let colorPoolPower = "success-text";
			if (prevState.totalPoolsPower > totalPoolsPower) {
				colorPoolPower = "danger-text";
			}
			this.setState({
				colorPoolPower,
			});
		}
		if (JSON.stringify(this.props.poolsPower) !== JSON.stringify(prevProps.poolsPower)) {
			this.setState({ totalPoolsPower: this.getTotalPoolPower() });
		}
		if (prevState.activeCellsCount !== activeCellsCount) {
			this.setElectricityPulsatedBtn();
			this.setElectricityButtonStatus();
		}
		if (prevState.activeCellsCount !== activeCellsCount && activeCellsCount === totalCellsCount) {
			this.setState({ isRechargeButtonDisable: activeCellsCount === totalCellsCount });
		}
		if ((prevState.activeCellsCount !== activeCellsCount && !activeCellsCount && !!timeToRecharge) || (prevState.totalCellsCount !== totalCellsCount && !activeCellsCount && !!timeToRecharge)) {
			toast(this.renderElectricityNeedToRechargeToast, {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		}
		if (!prevProps.isFirstMinerInGame && this.props.isFirstMinerInGame) {
			this.getElectricityInfo();
			this.props.setIsFirstMiningInGame(false);
			this.props.reloadMainGame(false);
		}
		if (prevState.userBatteriesCount !== userBatteriesCount && userBatteriesCount && !!timeToRecharge) {
			this.setElectricityButtonStatus();
		}
	}

	electricityWSHandler = (value) => {
		if (value.message === "electricity_recharged" && value.data) {
			this.setState({
				userBatteriesCount: value.data.user_batteries_count,
				activeCellsCount: value.data.active_cells_count,
				timeToRecharge: value.data.time_to_recharge,
				startRecharge: dayjs(value.data.time_to_recharge).subtract(24, "hours").toString(),
			});
		}
	};

	onWSNodeMessage = async (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "bonus_power_updated":
				this.refreshPower();
				await this.getUserBonusPower();
				break;
			case "electricity_updated":
				this.electricityWSHandler(value);
				break;
			default:
				break;
		}
	};

	getTotalPoolPower = () => {
		return this.props.poolsPower.reduce((acc, curr) => acc + curr.power, 0);
	};

	getReward = () => {
		const { poolsPower, currentMiningCurrency, userPower, totalRewardBlock, miningConfig, rollerCurrencies } = this.props;
		const currentPoolPower = poolsPower.find((item) => item.currency === currentMiningCurrency);
		const config = miningConfig.find((item) => item.currency === currentMiningCurrency);
		if (!currentPoolPower || !config) {
			return null;
		}
		const configForCurrency = rollerCurrencies.find((obj) => obj.balanceKey === config.currency);
		const poolReward = totalRewardBlock.find((findItem) => findItem.currency === config.currency);
		if (!poolReward || !configForCurrency) {
			return null;
		}
		if (currentPoolPower.power === 0) {
			return this.setState({ reward: 0 });
		}
		const userPowerPercent = Math.floor((userPower * config.percent) / 100) / currentPoolPower.power;
		const reward = scientificToDecimal(decimalAdjustFloor(poolReward.blockSize * userPowerPercent, configForCurrency.balanceKey !== "SAT" ? configForCurrency.precisionToBalance : 2));
		this.setState({ reward });
	};

	handleProgress = () => {
		const { progressBlocks, currentMiningCurrency } = this.props;
		const currentConfig = progressBlocks.find((item) => item.currency === currentMiningCurrency);
		if (!currentConfig) {
			return false;
		}
		this.setState({
			progress: +currentConfig.progress === 100 ? 0 : +currentConfig.progress,
		});
		if (+currentConfig.progress === 100) {
			toast(this.renderBlockMined, {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		}
	};

	renderBlockMined = () => {
		const { t } = this.props;
		return (
			<div className="content-with-image">
				<img src={blockMinedIcon} width={46} height={46} alt="block_mined" />
				<span>{t("header.blockWasMined")}</span>
			</div>
		);
	};

	renderElectricityNeedToRechargeToast = () => {
		const { t } = this.props;
		return (
			<div className="content-with-image">
				<img src={electricitySuccessIcon} alt="recharged" />
				<span>{t("header.electricityNeedRecharge")}</span>
			</div>
		);
	};

	renderElectricityToast = (status) => {
		const { t } = this.props;
		return (
			<div className="content-with-image">
				<img src={status ? successIcon : errorIcon} alt="recharged" />
				<span>{status ? t("header.electricityRecharged") : t("header.rechargeFail")}</span>
			</div>
		);
	};

	setElectricityButtonStatus = () => {
		const { userMinersAmount } = this.props;
		const { totalCellsCount, timeToRecharge, activeCellsCount } = this.state;
		if (!!userMinersAmount && activeCellsCount < totalCellsCount && !!timeToRecharge) {
			this.setState({ isRechargeButtonDisable: false });
		}
	};

	refreshPower = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "get_powers_info",
			})
		);
	};

	getElectricityInfo = async () => {
		this.createSignalAndController("getElectricityInfo");
		try {
			const json = await fetchWithToken(`/api/mining/user-electricity-info`, {
				method: "GET",
				signal: this.signals.getElectricityInfo,
			});

			if (!json.success) {
				console.error(json.error);
			}
			this.setState({
				userBatteriesCount: json.data.user_batteries_count,
				totalCellsCount: json.data.total_cells_count,
				activeCellsCount: json.data.active_cells_count,
				timeToRecharge: json.data.time_to_recharge,
				startRecharge: dayjs(json.data.time_to_recharge).subtract(24, "hours").toString(),
				totalFreeCellsCount: json.data.total_free_cells_count,
			});
		} catch (err) {
			console.error(err);
		}
	};

	rechargeElectricity = async (userId, action) => {
		const { reloadMainGame } = this.props;
		this.setState({
			isRechargeButtonDisable: true,
		});
		const getApiUrl = {
			free: "recharge-electricity-free",
			batteries: "recharge-electricity",
		};
		this.createSignalAndController("recharge");
		try {
			const json = await fetchWithToken(`/api/mining/${getApiUrl[action]}`, {
				method: "POST",
				signal: this.signals.recharge,
			});
			if (!json.success) {
				this.setState({
					isRechargeButtonDisable: false,
				});
				return toast(this.renderElectricityToast(false), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
			googleAnalyticsPush("click_recharge", { step: "2nd_step" }, userId);
			const { activeCellsCount } = this.state;

			this.refreshPower();
			if (!activeCellsCount) {
				reloadMainGame(false);
			}

			if (this.state.totalCellsCount !== json.data.active_cells_count) {
				this.setState({
					isRechargeButtonDisable: false,
				});
			}

			this.setState({
				userBatteriesCount: json.data.user_batteries_count,
				activeCellsCount: json.data.active_cells_count,
				timeToRecharge: json.data.time_to_recharge,
				startRecharge: dayjs(json.data.time_to_recharge).subtract(24, "hours").toString(),
			});

			toast(this.renderElectricityToast(true), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		} catch (e) {
			console.error(e);
			this.setState({
				isRechargeButtonDisable: false,
			});
		}
	};

	getUserBonusPower = async () => {
		this.createSignalAndController("getUserBonusPower");
		try {
			const json = await fetchWithToken(`/api/mining/user-bonus-power`, {
				method: "GET",
				signal: this.signals.getUserBonusPower,
			});
			if (!json.success) {
				return null;
			}
			this.setState({
				userBonusPercent: json.data.bonus_percent,
				userBonusPower: +json.data.bonus_power,
			});
		} catch (e) {
			console.error(e);
		}
	};

	getBlocksItems = (blockName) => {
		const { miningConfig, poolsPower, userPower, totalRewardBlock, rollerCurrencies } = this.props;
		const returnObj = {};
		return miningConfig.map((config) => {
			const configForCurrency = rollerCurrencies.find((obj) => obj.balanceKey === config.currency);
			const poolPower = poolsPower.find((findItem) => findItem.currency === config.currency);
			if (poolPower) {
				if (blockName === "ExpReward") {
					const poolReward = totalRewardBlock.find((findItem) => findItem.currency === config.currency);
					if (poolReward) {
						const userPowerPercent = Math.floor((userPower * config.percent) / 100) / poolPower.power;
						if (poolPower.power && configForCurrency) {
							returnObj.value = decimalAdjustFloor(
								(poolReward.blockSize * userPowerPercent) / (configForCurrency.balanceKey === "SAT" ? configForCurrency.toSmall : 1),
								configForCurrency.precisionToBalance
							).toFixed(configForCurrency.precisionToBalance);
							returnObj.precision = configForCurrency.precision;
							returnObj.precisionToBalance = configForCurrency.precisionToBalance;
						}
					}
				}
				if (blockName === "MyPower") {
					const power = Math.floor((userPower * config.percent) / 100);
					returnObj.value = `${getPrefixPower(power).power} ${getPrefixPower(power).hashDetail}`;
					returnObj.originalValue = power;
				}
				if (blockName === "NetworkPower") {
					returnObj.value = `${getPrefixPower(poolPower.power).power} ${getPrefixPower(poolPower.power).hashDetail}`;
				}
			}
			return {
				...returnObj,
				name: config.name,
				code: config.code,
				img: config.img,
			};
		});
	};

	setActivePowerBlock = (name) => {
		if (this.state.activePowerBlock === name) {
			return this.setState({ activePowerBlock: "" });
		}
		this.setState({ activePowerBlock: name });
	};

	setActiveCellsCountHandler = () => {
		const { activeCellsCount, timeToRecharge } = this.state;
		if (activeCellsCount > 0) {
			const isActiveCellsCountOut = activeCellsCount - 1 === 0;
			this.setState({
				activeCellsCount: activeCellsCount - 1,
				timeToRecharge: isActiveCellsCountOut ? null : dayjs(timeToRecharge).add(24, "hours").toString(),
				startRecharge: dayjs(timeToRecharge).add(24, "hours").subtract(24, "hours").toString(),
			});
		}
	};

	setElectricityPulsatedBtn = () => {
		const { activeCellsCount, timeToRecharge, totalFreeCellsCount } = this.state;
		if (activeCellsCount === totalFreeCellsCount && dayjs(timeToRecharge).diff(dayjs(), "hours") < LEFT_HOURS_TO_FREE_RECHARGE) {
			this.setState({
				btnPulsated: "cyan-pulsated",
			});
			return false;
		}

		this.setState({
			btnPulsated: "",
		});
	};

	rechargeButtonApprove = () => {
		const { isRechargeAcceptModalOpen, activeCellsCount, totalCellsCount, timeToRecharge, totalFreeCellsCount } = this.state;
		const { userInfo } = this.props;
		if (activeCellsCount === totalCellsCount) {
			this.setState({ isRechargeAcceptModalOpen: !isRechargeAcceptModalOpen });
		}

		if (activeCellsCount < totalCellsCount) {
			const isFreeRecharge = timeToRecharge ? dayjs(timeToRecharge).diff(dayjs(), "hours") < LEFT_HOURS_TO_FREE_RECHARGE && activeCellsCount <= totalFreeCellsCount : true;
			this.rechargeElectricity(userInfo.uid, isFreeRecharge ? "free" : "batteries");
		}
	};

	render() {
		const {
			userPower,
			widthLg,
			isPowerPartitionModalOpen,
			togglePartitionModal,
			currentMiningCurrency,
			totalRewardBlock,
			isMobile,
			isViewedTutorial,
			eventPopup,
			isShowCustomNotification,
			rollerCurrencies,
			userPowerPenalty,
			userInfo,
		} = this.props;
		const {
			colorPoolPower,
			activePowerBlock,
			reward,
			totalPoolsPower,
			isRechargeButtonDisable,
			userBonusPercent,
			userBatteriesCount,
			totalCellsCount,
			activeCellsCount,
			timeToRecharge,
			startRecharge,
			btnPulsated,
			isRechargeAcceptModalOpen,
			totalFreeCellsCount,
		} = this.state;
		const poolReward = totalRewardBlock.find((findItem) => findItem.currency === currentMiningCurrency);
		const currencyConfig = rollerCurrencies.find((findItem) => findItem.balanceKey === currentMiningCurrency);

		return (
			<Fragment>
				{!isViewedTutorial.game && <TutorialModal tutorialCategories={"game"} />}
				{isShowCustomNotification && <MinerRewardModal />}
				{isViewedTutorial.game && !isShowCustomNotification && !!eventPopup && eventPopup.is_show_notification && <EventPopup eventData={eventPopup} />}
				<div className="header-rewards-container game-header-container">
					{isPowerPartitionModalOpen && <PowerPartitionModal isOpen={isPowerPartitionModalOpen} togglePartitionModal={togglePartitionModal} />}
					<Row className="justify-content-center rewards-wrapper">
						<ElectricityRechargeBlock
							userInfo={userInfo}
							widthLg={widthLg}
							activePowerBlock={activePowerBlock}
							timeToRecharge={timeToRecharge}
							startRecharge={startRecharge}
							setActiveCellsCountHandler={this.setActiveCellsCountHandler}
							activeCellsCount={activeCellsCount}
							setActivePowerBlock={this.setActivePowerBlock}
							totalCellsCount={totalCellsCount}
							totalFreeCellsCount={totalFreeCellsCount}
							userBatteriesCount={userBatteriesCount}
							isRechargeAcceptModalOpen={isRechargeAcceptModalOpen}
							rechargeElectricity={this.rechargeElectricity}
							btnPulsated={btnPulsated}
							isRechargeButtonDisable={isRechargeButtonDisable}
							setElectricityPulsatedBtn={this.setElectricityPulsatedBtn}
							rechargeButtonApprove={this.rechargeButtonApprove}
						/>
						<MyPowerBlock
							activePowerBlock={activePowerBlock}
							setActivePowerBlock={this.setActivePowerBlock}
							userPower={userPower}
							userBonusPercent={userBonusPercent}
							getBlocksItems={this.getBlocksItems}
							userPowerPenalty={userPowerPenalty}
							togglePartitionModal={togglePartitionModal}
						/>
						<TotalNetworkBlock
							getBlocksItems={this.getBlocksItems}
							activePowerBlock={activePowerBlock}
							colorPoolPower={colorPoolPower}
							totalPoolsPower={totalPoolsPower}
							setActivePowerBlock={this.setActivePowerBlock}
						/>
						<YourRewardBlock
							setActivePowerBlock={this.setActivePowerBlock}
							activePowerBlock={activePowerBlock}
							getBlocksItems={this.getBlocksItems}
							poolReward={poolReward}
							currencyConfig={currencyConfig}
							progress={this.state.progress}
							reward={reward}
						/>
						{!isMobile && (
							<Col xs={12} className="game-header-block">
								<DailyWeeklyQuests wsReact={this.props.wsReact} />
							</Col>
						)}
					</Row>
				</div>
			</Fragment>
		);
	}
}

const Header = withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(HeaderClass));
export default Header;
