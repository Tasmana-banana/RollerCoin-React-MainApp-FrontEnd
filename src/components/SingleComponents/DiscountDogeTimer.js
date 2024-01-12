import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Link } from "react-router-dom";
import "moment-duration-format";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import "../../assets/scss/SingleComponents/DiscountDogeTimer.scss";

import dogeImage from "../../assets/img/market/doge-roller.png";

export default class DiscountDogeTimer extends Component {
	static propTypes = {
		showButton: PropTypes.bool.isRequired,
		inSidebar: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			timeLeft: 0,
			viewTime: {
				days: "00",
				hours: "00",
				min: "00",
				seconds: "00",
			},
		};
		this.endDate = "2020-02-10";
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		this.startDiscountFunction();
	}

	startDiscountFunction = () => {
		const endDate = moment(new Date(this.endDate))
			.utc()
			.endOf("day");
		const today = moment(new Date()).utc();
		const timeLeft = endDate.diff(today, "milliseconds");
		this.setState({ timeLeft });
		this.timerInterval();
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevState.timeLeft !== this.state.timeLeft) {
			this.makeCounterData();
		}
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
		clearInterval(this.timer);
	}

	makeCounterData = () => {
		const { timeLeft } = this.state;
		const toEventLeft = moment.duration(timeLeft, "milliseconds").format("dd:hh:mm:ss", {
			trim: false,
		});

		const toEventLeftArray = toEventLeft.split(":");
		const days = toEventLeftArray[0].split("");
		const hours = toEventLeftArray[1].split("");
		const min = toEventLeftArray[2].split("");
		const seconds = toEventLeftArray[3].split("");

		this.setState({ viewTime: { days, hours, min, seconds } });
	};

	timerInterval = () => {
		this.timer = setInterval(() => this.setState({ timeLeft: this.state.timeLeft - 1000 }), 1000);
	};

	render() {
		const { timeLeft, viewTime } = this.state;
		const { days, hours, min, seconds } = viewTime;
		const { showButton, inSidebar } = this.props;

		return +timeLeft >= 0 ? (
			<div className={`countdown-wrapper ${inSidebar ? "countdown-column" : ""}`}>
				<Row noGutters={true} className="countdown-background">
					<Col xs={12} lg={inSidebar ? 12 : 4} className="countdown-discount-text">
						<p>
							<span className="countdown-discount-number">30% </span>
							<span className="countdown-discount-text">Off buying tokens via </span>
							<span className="countdown-discount-doge">Doge</span>
						</p>
					</Col>
					<Col xs={12} lg={inSidebar ? 12 : 4} className="countdown-image">
						<LazyLoad offset={100}>
							<img src={dogeImage} alt="doge" />
						</LazyLoad>
					</Col>
					<Col xs={12} lg={inSidebar ? 12 : 4} className="countdown">
						<p className="countdown-text">Discount ends in</p>
						<div className="timer">
							<div className="timer-item">
								<div className="timer-value">
									<span className="timer-one-value">{days[0]}</span>
									<span className="timer-one-value">{days[1]}</span>
								</div>
								<div className="timer-info">Days</div>
							</div>
							<div className="timer-item">
								<div className="timer-value">
									<span className="timer-one-value">{hours[0]}</span>
									<span className="timer-one-value">{hours[1]}</span>
								</div>
								<div className="timer-info">Hours</div>
							</div>
							<div className="timer-item">
								<div className="timer-value">
									<span className="timer-one-value">{min[0]}</span>
									<span className="timer-one-value">{min[1]}</span>
								</div>
								<div className="timer-info">Min</div>
							</div>
							<div className="timer-item">
								<div className="timer-value">
									<span className="timer-one-value">{seconds[0]}</span>
									<span className="timer-one-value">{seconds[1]}</span>
								</div>
								<div className="timer-info">Sec</div>
							</div>
						</div>
					</Col>
				</Row>
				<div className={`countdown-button-wrapper ${showButton ? "" : "hide"}`}>
					<Link to="/wallet/token">
						<button type="button" className="tree-dimensional-button btn-cyan w-100">
							<span className="with-horizontal-image">
								<img src="/static/img/wallet/buy_tokens.svg" alt="buy_tokens" />
								<span className="btn-text">BUY TOKENS</span>
							</span>
						</button>
					</Link>
				</div>
			</div>
		) : (
			""
		);
	}
}
