import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Modal, ModalBody, Progress, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import * as actions from "../../actions/userInfo";
import PartitionCoinsValue from "./PartitionCoinsValue";
import ChangePowerInput from "./ChangePowerInput";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import PowerPartitionChart from "./PowerPartitionChart";
import getPrefixPower from "../../services/getPrefixPower";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Game/PowerPartitionModal.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	miningConfig: state.user.miningConfig,
	userPower: state.game.userPower,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setMiningConfig: (state) => dispatch(actions.setMiningConfig(state)),
	togglePartitionModal: (state) => dispatch(actions.togglePartitionModal(state)),
});

class PartitionModalClass extends Component {
	static defaultProps = {
		miningConfig: [],
	};

	static propTypes = {
		miningConfig: PropTypes.array.isRequired,
		userPower: PropTypes.number.isRequired,
		toggleModal: PropTypes.func.isRequired,
		isOpen: PropTypes.bool.isRequired,
		setMiningConfig: PropTypes.func.isRequired,
		togglePartitionModal: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		phaserScreenInputManager: PropTypes.object,
	};

	constructor(props) {
		super(props);
		this.freePowerConfig = { currency: "FREE", percent: 0, color: "#2f3045", img: "free", code: "free", name: "Free power", fullName: "Free power" };
		this.state = { miningConfig: [...this.props.miningConfig, this.freePowerConfig] };
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		const { phaserScreenInputManager } = this.props;
		if (phaserScreenInputManager) {
			phaserScreenInputManager.enabled = false;
		}
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.miningConfig) !== JSON.stringify(this.props.miningConfig)) {
			this.setState({ miningConfig: [...this.props.miningConfig, this.freePowerConfig] });
		}
	}

	componentWillUnmount() {
		const { phaserScreenInputManager } = this.props;
		if (phaserScreenInputManager) {
			phaserScreenInputManager.enabled = true;
		}
		if (this.controller) {
			this.controller.abort();
		}
	}

	getProgressItems = () => {
		const { miningConfig } = this.state;
		return miningConfig
			.filter((config) => config.percent > 0)
			.map((item) => {
				return <Progress bar className="partition-progress-item" color={`${item.code}-color`} value={item.percent} key={item.name} />;
			});
	};

	handlePowerChange = (currency, value) => {
		const newMiningConfig = this.state.miningConfig.map((item) => {
			if (item.currency === currency) {
				return { ...item, percent: value };
			}
			return item;
		});
		// get all power besides free power
		const allPower = this.getAllPower(newMiningConfig);
		// if power less then 100, convert it to free power
		const freePowerConfig = newMiningConfig.find((item) => item.currency === "FREE");
		freePowerConfig.percent = 0;
		if (allPower < 100) {
			freePowerConfig.percent = 100 - allPower;
		}
		this.setState({ miningConfig: newMiningConfig });
	};

	getAllPower = (miningConfig) => {
		const config = miningConfig || this.state.miningConfig;
		return config.reduce((accumulator, currentCurrency) => {
			if (currentCurrency.currency !== "FREE") {
				return accumulator + currentCurrency.percent;
			}
			return accumulator;
		}, 0);
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	handleSaveChanges = async () => {
		const { miningConfig } = this.state;
		const data = miningConfig
			.filter((config) => config.currency !== "FREE")
			.map((item) => ({
				currency: item.currency,
				percent: item.percent,
				_id: item._id,
			}));
		try {
			this.createSignalAndController();
			const json = await fetchWithToken(`/api/mining/update-settings`, {
				method: "POST",
				body: JSON.stringify({ settings: data }),
				signal: this.signal,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(json.error, "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
				return false;
			}
			this.props.setMiningConfig(data);
			this.props.togglePartitionModal();
			toast(this.constructor.renderToast("Successful update", "success_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		} catch (e) {
			console.error(e);
		}
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
				<span>{text}</span>
			</div>
		);
	}

	render() {
		const { userPower, isOpen, togglePartitionModal, t } = this.props;
		const powerString = `${getPrefixPower(userPower).power} ${getPrefixPower(userPower).hashDetail}`;
		const allPower = this.getAllPower();
		return (
			<Modal isOpen={isOpen} size="lg" className="partition-window" centered={true}>
				<ModalBody className="partition-body">
					<div className="partition-head">
						<p className="partition-title">{t("powerPartition.powerPartition")}</p>
						<button className="tree-dimensional-button close-menu-btn btn-default" onClick={togglePartitionModal}>
							<span>
								<img src="/static/img/header/close_menu.svg" alt="close_menu" />
							</span>
						</button>
					</div>
					<Row>
						<Col lg={4} className="chart-container">
							<div className="chart-wrapper">
								<PowerPartitionChart miningConfig={this.state.miningConfig} />
							</div>
							{<InfoBlockWithIcon tName="Game" message="powerPartitionInfoMessage" obj="infoHints" />}
							<div className="partition-buttons-wrapper">
								<button className="tree-dimensional-button btn-cyan w-100 partition-button" disabled={allPower !== 100} onClick={this.handleSaveChanges}>
									<span className="with-horizontal-image">
										<img src="/static/img/icon/save.svg" alt="save" />
										<span className="btn-text">
											{t("powerPartition.save")} <span className="btn-text-additional">{t("powerPartition.changes")}</span>
										</span>
									</span>
								</button>
								<button type="button" className="tree-dimensional-button btn-default w-100 partition-button" onClick={togglePartitionModal}>
									<span className="partition-button-cancel">{t("powerPartition.cancel")}</span>
								</button>
							</div>
						</Col>
						<Col lg={8}>
							<p className="user-power-wrapper">
								<span>{t("powerPartition.totalPower")}</span>
								<span className="user-power">{powerString}</span>
							</p>
							<div>
								<Progress multi className="partition-progress">
									{this.getProgressItems()}
								</Progress>
							</div>
							<Row noGutters={true} className="partition-coins-value-wrapper">
								<PartitionCoinsValue miningConfig={this.state.miningConfig} userPower={userPower} />
							</Row>
							<div className="change-power-container">
								<ChangePowerInput miningConfig={this.state.miningConfig} userPower={userPower} handlePowerChange={this.handlePowerChange} />
							</div>
						</Col>
					</Row>
				</ModalBody>
			</Modal>
		);
	}
}

const PartitionModal = withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(PartitionModalClass));

export default PartitionModal;
