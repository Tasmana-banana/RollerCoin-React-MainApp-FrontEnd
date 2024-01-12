import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Container, UncontrolledTooltip } from "reactstrap";
import { withTranslation } from "react-i18next";
import * as actionsUser from "../../actions/userInfo";
import * as actions from "../../actions/game";
import NavTab from "../../components/PowerChart/NavTab";
import PowerChartItem from "../../components/PowerChart/PowerChartItem";
import CurrencyInfo from "../../components/PowerChart/CurrencyInfo";
import RoundInfo from "../../components/PowerChart/RoundInfo";
import decimalAdjust from "../../services/decimalAdjust";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/PowerChart/main.scss";

import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";
// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	miningConfig: state.user.miningConfigUnauthorizedUser,
	currentMiningCurrency: state.user.currentMiningCurrency,
	isPowerPartitionModalOpen: state.user.isPowerPartitionModalOpen,
	language: state.game.language,
	isMobile: state.game.isMobile,
	currencies: state.wallet.rollerCurrencies,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	togglePartitionModal: (state) => dispatch(actionsUser.togglePartitionModal(state)),
	setBlockProgress: (state) => dispatch(actions.setBlockProgress(state)),
	setTotalRewardBlock: (state) => dispatch(actions.setTotalRewardBlock(state)),
});
class PowerChartClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		miningConfig: PropTypes.array.isRequired,
		currentMiningCurrency: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		togglePartitionModal: PropTypes.func.isRequired,
		isPowerPartitionModalOpen: PropTypes.bool.isRequired,
		wsReact: PropTypes.object.isRequired,
		setBlockProgress: PropTypes.func.isRequired,
		setTotalRewardBlock: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		currencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			data: {
				created: null,
				sequenceId: null,
				activeUsers: null,
				average: null,
			},
			currentCurrencyConfig: { code: "", name: "", balanceKey: "" },
		};
		this.URL = "network-power";
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		this.props.wsReact.setListenersMessage({ powerHistory: this.onWSMessage });
		this.props.wsReact.setListenersOpen({ powerHistory: this.socketOpen });
		this.setCurrentCurrencyConfig();
	}

	socketOpen = () => {
		const cmd = ["get_global_settings", "block_mining_progress_request"];
		cmd.forEach((item) => {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: item,
				})
			);
		});
	};

	componentDidUpdate(prevProps, prevState) {
		if (this.props.pathName !== prevProps.pathName) {
			this.setCurrentCurrencyConfig();
		}
		if (JSON.stringify(prevState.currentCurrencyConfig) !== JSON.stringify(this.state.currentCurrencyConfig)) {
			this.getCurrencyInfo();
		}
	}

	handleGlobalSettings = (data) => {
		data = data.map((item) => {
			const currentPoolPowerConfig = this.props.currencies.find((config) => config.balanceKey === item.currency);
			return {
				currency: item.currency,
				blockSize: decimalAdjust(item.block_size / currentPoolPowerConfig.divider / (item.currency !== "SAT" ? currentPoolPowerConfig.toSmall : 1), currentPoolPowerConfig.precisionToBalance),
				poolPower: item.pool_power_for_currency,
			};
		});
		this.props.setTotalRewardBlock(data);
	};

	componentWillUnmount() {
		this.props.wsReact.removeListenersMessage("powerHistory");
		this.props.wsReact.removeListenersOpen("powerHistory");
		if (this.controller) {
			this.controller.abort();
		}
	}

	setCurrentCurrencyConfig = () => {
		const { miningConfig, pathName, language } = this.props;
		const urlCurrency = pathName.replace(`${getLanguagePrefix(language)}/${this.URL}`, "").replace("/", "");
		const currentCurrencyName = urlCurrency || "btc";
		const config = miningConfig.find((item) => currentCurrencyName === item.code);
		if (config && miningConfig.length) {
			this.setState({ currentCurrencyConfig: { code: config.code, name: config.name, balanceKey: config.balanceKey } });
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	onWSMessage = (event) => {
		const data = JSON.parse(event.data);
		const command = data.cmd;
		const value = data.cmdval;
		switch (command) {
			case "block_mining_progress_response":
				this.handleProgress(value);
				break;
			case "global_settings":
				this.handleGlobalSettings(value);
				break;
			default:
				break;
		}
	};

	handleProgress = (data) => {
		this.props.setBlockProgress({
			currency: data.currency,
			progress: data.progress,
			timeLeft: data.time_left,
		});
	};

	getCurrencyInfo = async () => {
		const { currentCurrencyConfig } = this.state;
		try {
			this.createSignalAndController();
			const json = await fetchWithToken(`/api/mining/last-block-info-for-currency?currency=${currentCurrencyConfig.balanceKey}`, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return this.setState({
					data: {
						created: 0,
						sequenceId: 0,
						activeUsers: 0,
						average: 0,
					},
				});
			}
			this.setState({
				data: {
					created: json.data.created,
					sequenceId: json.data.sequence_id,
					activeUsers: json.data.active_users,
					average: json.data.average,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	changeRoute = (currencyCode) => {
		const { history, language } = this.props;
		history.push(`${getLanguagePrefix(language)}/network-power/${currencyCode}`);
	};

	render() {
		const { miningConfig, language, t } = this.props;
		const { sequenceId, activeUsers, created, average } = this.state.data;
		const { currentCurrencyConfig } = this.state;
		const powerChartsRoutes = miningConfig.map((currency) => `${getLanguagePrefix(language)}/network-power/${currency.code}`);
		powerChartsRoutes.push(`${getLanguagePrefix(language)}/network-power`);
		return (
			<Container className="main-container power-charts-container">
				<div className="info-tooltip-icon-container">
					<div className="info-icon-block" id="powerChartId">
						<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
					</div>
					<UncontrolledTooltip placement="right" autohide={true} target="powerChartId">
						{t("infoHints.powerChartTitleInfoMessage")}
					</UncontrolledTooltip>
					<h1 className="power-charts-title">Power chart</h1>
				</div>
				{!!currentCurrencyConfig.code && (
					<Row>
						{/* <PowerPartitionModal isOpen={isPowerPartitionModalOpen} togglePartitionModal={togglePartitionModal} /> */}
						<Col xs={12} lg={3}>
							<NavTab miningConfig={miningConfig} changeRoute={this.changeRoute} currentCurrencyConfig={currentCurrencyConfig} />
						</Col>
						<Col xs={12} lg={9}>
							<Row>
								<CurrencyInfo sequenceId={sequenceId} activeUsers={activeUsers} currentCurrencyConfig={currentCurrencyConfig} />
								<RoundInfo average={average} created={created} currentCurrencyConfig={currentCurrencyConfig} />
							</Row>
							<div>
								<PowerChartItem groupBy="total_power" title="Network power (Th/s)" currency={currentCurrencyConfig.code} />
								<PowerChartItem groupBy="block_reward" title="Block daily reward" currency={currentCurrencyConfig.code} />
								<PowerChartItem groupBy="duration" title="Average time per block" currency={currentCurrencyConfig.code} />
								<PowerChartItem groupBy="reward_user_count" title="Active miners per block" currency={currentCurrencyConfig.code} />
							</div>
						</Col>
					</Row>
				)}
			</Container>
		);
	}
}
const PowerChart = withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(PowerChartClass));
export default withRouter(PowerChart);
