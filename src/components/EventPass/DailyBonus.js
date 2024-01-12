import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import { initTimer, makeCounterData } from "../../services/countdownТimer";
import DailyBonusModal from "./DailyBonusModal";

import schedulerIcon from "../../assets/img/icon/scheduler.svg";
import levelUpIcon from "../../assets/img/seasonPass/icon/level_up.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
});

class DailyBonus extends Component {
	static propTypes = {
		dailyBonus: PropTypes.object.isRequired,
		phaserScreenInputManager: PropTypes.object,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="season notification" />
				<span>{text}</span>
			</div>
		);
	}

	constructor(props) {
		super(props);
		this.state = {
			isShowDailyBonusModal: localStorage.getItem("is_daily_collected_today") !== "true",
			isDailyCollectedToday: false,
			timeLeftSeconds: 0,
			viewTime: {
				days: "",
				hours: "0H",
				minutes: "00M",
			},
		};
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.setState({
			timeLeftSeconds: initTimer(this.props.dailyBonus.seasonEndDate),
		});
		this.timer = setInterval(() => {
			const time = makeCounterData(this.state.timeLeftSeconds);
			this.setState({
				viewTime: {
					days: time.days,
					hours: time.hours,
					minutes: time.minutes,
				},
				timeLeftSeconds: time.leftSeconds,
			});
		}, 1000);
	}

	componentDidUpdate(prevProps, prevState) {
		const { timeLeftSeconds } = this.state;
		if (this.timer && prevState.timeLeftSeconds !== timeLeftSeconds && timeLeftSeconds <= 0) {
			clearInterval(this.timer);
			this.setState({
				viewTime: {
					days: "",
					hours: "00h",
					minutes: "00m",
				},
			});
		}
	}

	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
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

	toggleBonusModal = () => {
		const { isShowDailyBonusModal } = this.state;
		this.setState({ isShowDailyBonusModal: !isShowDailyBonusModal });
	};

	collectDailyBonus = async () => {
		this.createSignalAndController("collect");
		this.toggleBonusModal();
		try {
			const json = await fetchWithToken("/api/season/collect-daily", {
				method: "POST",
				signal: this.signals.collect,
			});
			if (!json.success) {
				return false;
			}
			localStorage.setItem("is_daily_collected_today", "true");
			toast(this.constructor.renderToast("Daily bonus received!", schedulerIcon), this.toastDefaultConfig);
			if (this.timer) {
				clearInterval(this.timer);
			}
			if (json.data.is_level_up) {
				toast(
					this.constructor.renderToast(
						<span>
							Your <span className="accent-text">Season pass</span> level increased
						</span>,
						levelUpIcon
					),
					this.toastDefaultConfig
				);
			}
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { dailyBonus } = this.props;
		const { isShowDailyBonusModal, viewTime } = this.state;
		return (
			<Fragment>
				{dailyBonus && dailyBonus.dailyRewards && (
					<DailyBonusModal
						dailyBonus={dailyBonus}
						viewTime={viewTime}
						isShowDailyBonusModal={isShowDailyBonusModal}
						toggleBonusModal={this.toggleBonusModal}
						collectDailyBonus={this.collectDailyBonus}
					/>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(DailyBonus));
