import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import { connect } from "react-redux";
import moment from "moment";
import PropTypes from "prop-types";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	progressBlocks: state.game.progressBlocks,
});

class RoundInfoClass extends Component {
	static propTypes = {
		progressBlocks: PropTypes.array.isRequired,
		average: PropTypes.number.isRequired,
		created: PropTypes.string.isRequired,
		currentCurrencyConfig: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.miningInterval = 0;
		this.state = {
			timer: {
				hours: "00",
				minutes: "00",
				seconds: "00",
			},
			timeLeft: 0,
			progress: 0,
		};
	}

	componentWillUnmount() {
		clearInterval(this.miningInterval);
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			JSON.stringify(this.props.progressBlocks) !== JSON.stringify(prevProps.progressBlocks) ||
			JSON.stringify(this.props.currentCurrencyConfig) !== JSON.stringify(prevProps.currentCurrencyConfig)
		) {
			this.handleProgress();
		}
		if (this.state.timeLeft !== prevState.timeLeft) {
			this.getTimeRemaining();
		}
	}

	handleProgress = () => {
		clearInterval(this.miningInterval);
		const { progressBlocks, currentCurrencyConfig } = this.props;
		const currentCurrency = progressBlocks.find((item) => currentCurrencyConfig.balanceKey === item.currency);
		if (!currentCurrency) {
			return null;
		}
		this.setState({
			progress: +currentCurrency.progress === 100 ? 0 : +currentCurrency.progress,
			timeLeft: +currentCurrency.timeLeft,
		});
		if (+currentCurrency.progress < 100) {
			this.miningInterval = setInterval(() => {
				this.setState(() => ({ ...this.state, timeLeft: this.state.timeLeft - 1 }));
			}, 1000);
		}
	};

	getTimeRemaining = () => {
		const total = this.state.timeLeft;
		const seconds = Math.floor(total % 60);
		const minutes = Math.floor((total / 60) % 60);
		const hours = Math.floor((total / (60 * 60)) % 24);
		this.setState(() => ({
			timer: {
				hours: hours > 0 ? hours : "00",
				minutes: minutes > 0 ? (minutes < 10 ? "0" : "") + minutes : "00",
				seconds: seconds > 0 ? (seconds < 10 ? "0" : "") + seconds : "00",
			},
		}));
	};

	render() {
		const { created, average } = this.props;
		const minutes = Math.floor(average / 60);
		const seconds = (average - minutes * 60).toFixed(0);
		return (
			<Col xs={12} lg={6} className="currency-info-wrapper round-info">
				<div className="currency-info-border">
					<p className="currency-info-title">
						<img src="/static/img/icon/clocks_grey.svg" alt="clocks" />
						<span className="timer-title">Current round duration</span>
					</p>
					<p className="currency-info-timer">{`${this.state.timer.hours}:${this.state.timer.minutes}:${this.state.timer.seconds}`}</p>
					<Row noGutters={true} className="currency-info-active-wrapper">
						<Col xs={6} className="currency-info-active">
							<p className="currency-info-name">Average duration</p>
							<p className="currency-info-value">{`${minutes} min ${seconds} sec`}</p>
						</Col>
						<Col xs={6} className="currency-info-active">
							<p className="currency-info-name">Round beginning</p>
							<p className="currency-info-value">{moment(new Date(created)).format("YYYY-MM-DD HH:mm")}</p>
						</Col>
					</Row>
				</div>
				{/* <button className="tree-dimensional-button btn-cyan w-100"> */}
				{/*	<span className="with-horizontal-image flex-lg-row button-text-wrapper"> */}
				{/*		<img src={`/static/img/icon/partition.svg`} alt="partition" /> */}
				{/*		<span className="btn-text">PARTITION</span> */}
				{/*	</span> */}
				{/* </button> */}
			</Col>
		);
	}
}

const RoundInfo = connect(mapStateToProps, null)(RoundInfoClass);

export default RoundInfo;
