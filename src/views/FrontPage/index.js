import React, { Component, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import LazyLoad from "react-lazyload";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";

import "../../assets/scss/FrontPage/main.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import logoImg from "../../assets/img/icon/hamster.svg";

const RenderTopUsers = lazy(() => import(/* webpackPrefetch: true */ "../../components/FrontPage/renderTopUsers"));

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});

class FrontPage extends Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			timeLeft: 0,
			timer: {
				hours: "00",
				minutes: "00",
				seconds: "00",
			},
			pool: {
				todayPower: 0,
				total: 0,
			},
			topUsers: [],
			registeredStats: {
				total: 0,
				today: 0,
			},
			totalPaid: 0,
			blockSize: 0,
			online: {
				max: 0,
				total: 0,
			},
		};
		this.miningInterval = 0;
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.props.wsReact.setListenersMessage({ frontPage: this.onWSMessage });
		this.props.wsReact.setListenersOpen({ frontPage: this.socketOpen });
		this.getUsers();
		googleAnalyticsPush("home_page", { step: "1st_step" });
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getUsers = async () => {
		this.createSignalAndController("getUsers");
		try {
			const json = await fetchWithToken(`/api/game/rank?limit=5&start=0`, {
				method: "GET",
				signal: this.signals.getUsers,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ topUsers: json.data.items });
		} catch (e) {
			console.error(e);
		}
	};

	socketOpen = () => {
		const cmd = ["user_register_stats_request", "total_reward_request", "online_info_request", "block_mining_progress_request", "get_global_settings"];
		cmd.forEach((item) => {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: item,
				})
			);
		});
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevState.timeLeft !== this.state.timeLeft) {
			this.getTimeRemaining();
		}
	}

	componentWillUnmount() {
		clearInterval(this.miningInterval);
		this.props.wsReact.removeListenersMessage("frontPage");
		this.props.wsReact.removeListenersOpen("frontPage");
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	onWSMessage = (event) => {
		const data = JSON.parse(event.data);
		const command = data.cmd;
		const value = data.cmdval;
		switch (command) {
			case "block_mining_progress_response":
				this.handleBlockMining(value);
				break;
			case "user_register_stats_response":
				this.handleRegistrStats(value);
				break;
			case "total_reward_response":
				this.handleTotalReward(value);
				break;
			case "global_settings":
				this.handleGlobalSettings(value);
				break;
			case "online_info":
				this.handleOnline(value);
				break;
			default:
				break;
		}
	};

	handleOnline = (data) => {
		this.setState({
			online: data,
		});
	};

	handleRegistrStats = (data) => {
		this.setState({ registeredStats: data });
	};

	handlePowerUserRate = (data) => {
		this.setState({
			topUsers: data,
		});
	};

	handleTotalReward = (data) => {
		this.setState({
			totalPaid: (+data.balance / 10000000000).toFixed(2),
		});
	};

	handleGlobalSettings = (data) => {
		let satBlockSize = 0;
		const SATData = data.find((obj) => obj.currency === "SAT");
		if (SATData) {
			satBlockSize = SATData.block_size / 100;
		}
		this.setState({
			blockSize: satBlockSize.toFixed(2),
			pool: {
				today: 0,
				total: data.reduce((acc, obj) => +obj.pool_power_for_currency + acc, 0),
			},
		});
	};

	handleBlockMining = (data) => {
		if (data.currency === "SAT") {
			clearInterval(this.miningInterval);
			this.setState({
				timeLeft: data.time_left,
			});
			this.miningInterval = setInterval(() => {
				this.setState({ timeLeft: this.state.timeLeft - 1 });
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

	// eslint-disable-next-line class-methods-use-this
	sendStartMiningEvent = () => {
		googleAnalyticsPush("start_mining", { step: "1st_step" });
	};

	render() {
		const { language, t } = this.props;
		const isChinese = language === "cn";
		return (
			<Container fluid={true} className={`frontpage-container ${language !== "en" ? `${language}` : ""}`}>
				<style
					dangerouslySetInnerHTML={{
						__html: `
							.progress::before {
								transform: rotate(${Math.round(170 + (+this.state.online.total * 100) / +this.state.online.max)}deg)!important;
							}
						`,
					}}
				/>
				<div className="frontpage-top-block">
					<div className="header-hamster">
						<img src={logoImg} className="hamster-header-logo custom-size" alt="hamster-header" width={155} height={155} />
					</div>
					<div className="description">
						<h1>
							<span className="header-rollercoin">Rollercoin</span>
							<br />
							{t("rollerTitleAdditional")}
						</h1>
					</div>
					<div className="sign-btn-container" onClick={this.sendStartMiningEvent}>
						<a href={`${getLanguagePrefix(language)}/sign-up`} className="tree-dimensional-button btn-cyan">
							<span>
								<img src="/static/img/icon/pickaxe.svg" alt="pickaxe" /> <span>{t("startMining")}</span>
							</span>
						</a>
					</div>
					<div className="virtual-data">
						{t("virtualData")}
						<br />
						{t("haveFun")}
					</div>
					<div className="report-list">
						<div className="report-concrete">
							<LazyLoad offset={100}>
								<img src="/static/img/report1.png" alt="report1" />
							</LazyLoad>
							<div className="report-concrete-text">{t("nextBlock")}</div>
							<div className="report-size">{this.state.blockSize}</div>
							<div className="report-detail">SATOSHI</div>
						</div>
						<div className="report-concrete">
							<LazyLoad offset={100}>
								<img src="/static/img/report2.png" alt="report2" />
							</LazyLoad>
							<div className="report-concrete-text">{t("distributed")}</div>
							<div className="report-size">
								<span id="timer" />
							</div>
							<div className="report-size">
								<span>
									{this.state.timer.hours}:{this.state.timer.minutes}:{this.state.timer.seconds}
								</span>
							</div>
							<div className="report-detail">HH:MM:SS</div>
						</div>
						<div className="report-concrete">
							<LazyLoad offset={100}>
								<img src="/static/img/report3.png" alt="report3" />
							</LazyLoad>
							<div className="report-concrete-text">{t("poolSize")}</div>

							<div className="report-size" id="pool">
								{getPrefixPower(this.state.pool.total).power}
							</div>
							<div className="report-detail" id="report-detail">
								{getPrefixPower(this.state.pool.total).hashDetail}
							</div>
						</div>
						<div className="report-concrete">
							<LazyLoad offset={100}>
								<img src="/static/img/report4.png" alt="report4" />
							</LazyLoad>
							<div className="report-concrete-text">{t("payout")}</div>

							<div className="report-size">{(((this.state.blockSize * 60) / 5) * 24).toFixed(2)}</div>
							<div className="report-detail">SATOSHI</div>
						</div>
						<div className="report-concrete">
							<LazyLoad offset={100}>
								<img src="/static/img/report5.png" alt="report4" />
							</LazyLoad>
							<div className="report-concrete-text">{t("totalPaid")}</div>
							<div className="report-size">{this.state.totalPaid}</div>
							<div className="report-detail">BTC</div>
						</div>
					</div>
				</div>
				<div className="aside-1">
					<h2>{t("nutshell.title")}</h2>
					<div className="aside-1-container">
						<div className="aside-1-side left">
							<div className="context">
								<p>{t("nutshell.description1")}</p>
								<p>{t("nutshell.description2")}</p>
							</div>
							<div className="top-miners">
								<div className="king">
									<LazyLoad offset={100}>
										<img src="/static/img/king.png" alt="king" />
									</LazyLoad>
								</div>
								<h3>{t("nutshell.topMiners")}</h3>
								<div className="miners-container">
									{this.state.topUsers.length > 0 && (
										<Suspense fallback={<div>Loading...</div>}>
											<RenderTopUsers topUsers={this.state.topUsers} />
										</Suspense>
									)}
								</div>
								<div className="all-miners">
									<Link to={`${getLanguagePrefix(language)}/rank`}>{t("nutshell.allMiners")}</Link>
								</div>
							</div>
						</div>
						<div className="aside-1-side right">
							<div className="total-miners">
								<div className="top-miners round-progress">
									<div className="quantity online">
										{t("nutshell.online")} <span>{this.state.online.total}</span>
									</div>
									<div className="round-progress">
										<div className="progress">
											<div className="center">
												<img src="/static/img/shapekj.png" alt="shapekj" />
												<br />
												<span className="sum">{this.state.registeredStats.total}</span>
												<br />
												{isChinese && (
													<span>
														{t("nutshell.total")}
														{t("nutshell.miners")}
													</span>
												)}
												{!isChinese && (
													<span>
														{t("nutshell.total")}
														<br /> {t("nutshell.miners")}
													</span>
												)}
											</div>
										</div>
										<div className="black-side" />
									</div>
									<div className="quantity max">
										{t("nutshell.max")} <span>{this.state.online.max}</span>
									</div>
								</div>
								<div className="bottom-miners">
									<div className="today-left">
										{t("nutshell.joined")}
										<p>
											<img src="/static/img/miner.png" alt="miner" />
											<span id="js-user-register-stats-today" className="quantity-progress">
												{this.state.registeredStats.today}
											</span>
										</p>
									</div>
									{/* <h3>Today</h3> */}
									{/* <div className="today-right"> */}
									{/*	Power:<span id="today-power-type">{getPrefixPower(this.state.pool.todayPower).hashDetail}</span> */}
									{/*	<p> */}
									{/*		<img src="/static/img/power.png" alt="power" /> */}
									{/*		<span id="today-power" className="quantity-progress magenta-text"> */}
									{/*			{getPrefixPower(this.state.pool.todayPower).power} */}
									{/*		</span> */}
									{/*	</p> */}
									{/* </div> */}
								</div>
							</div>
							<div className="aside-1-img">
								<LazyLoad offset={100}>
									<img src="/static/img/aside-1.png" alt="aside-1" />
								</LazyLoad>
							</div>
						</div>
					</div>
				</div>
				<div className="aside-2">
					<h2>{t("howItWorks.title")}</h2>
					<div className="aside-2 steps">
						<div className="steps-concrete">
							<div className="aside-2-header">
								<img src="/static/img/step-1.png" alt="step-1" />
								<br />
								<span>{t("howItWorks.signup")}</span>
								<div className="steps-content">{t("howItWorks.description")}</div>
							</div>
						</div>
						<div className="steps-concrete">
							<div className="aside-2-header signup-header">
								<img src="/static/img/step-2.png" alt="step-2" />
								<br />
								<span>
									{t("howItWorks.customize")}
									<div className="pointer">{">"}</div>
								</span>
								<div className="steps-content">{t("howItWorks.ownCharacter")}</div>
							</div>
						</div>
						<div className="steps-concrete">
							<div className="aside-2-header">
								<img src="/static/img/step-3.png" alt="step-3" />
								<br />
								<span>
									{t("howItWorks.startMining")}
									<div className="pointer">{">"}</div>
								</span>
								<div className="steps-content">{t("howItWorks.playAndFun")}</div>
							</div>
						</div>
						<div className="steps-concrete">
							<div className="aside-2-header">
								<img src="/static/img/step-4.png" alt="step-4" />
								<br />
								<span>
									{t("howItWorks.earnBitcoin")}
									<div className="pointer">{">"}</div>
								</span>
								<div className="steps-content">{t("howItWorks.profits")}</div>
							</div>
						</div>
						<div className="steps-concrete">
							<div className="aside-2-header signup-header">
								<img src="/static/img/step-5.png" alt="step-5" />
								<br />
								<span>
									{t("howItWorks.empire")}
									<div className="pointer">{">"}</div>
								</span>
								<div className="steps-content">{t("howItWorks.history")}</div>
							</div>
						</div>
					</div>
				</div>
				<div className="Tell-more">
					<h2>{t("hooked.title")}</h2>
				</div>
				<div className="aside-3">
					<div className="racks">
						<div className="concrete-rack">
							<h3>{t("hooked.obstacles")}</h3>
							<p>{t("hooked.realStuff")}</p>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.friend")}</h3>
							<p>{t("hooked.bestFriend")}</p>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.earn")}</h3>
							<p>{t("hooked.cut")}</p>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.facility")}</h3>
							<p>{t("hooked.playGames")}</p>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.prizes")}</h3>
							<p>{t("hooked.promotions")}</p>
						</div>
					</div>
					<div className="racks-small">
						<div className="rack-img">
							<LazyLoad offset={100}>
								<img src="/static/img/rack-1.png" width="320" height="191" alt="rack-1" />
							</LazyLoad>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.obstacles")}</h3>
							<p>{t("hooked.realStuff")}</p>
						</div>
						<div className="rack-img">
							<LazyLoad offset={100}>
								<img src="/static/img/rack-2.png" width="320" height="156" alt="rack-2" />
							</LazyLoad>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.friend")}</h3>
							<p>{t("hooked.bestFriend")}</p>
						</div>
						<div className="rack-img">
							<LazyLoad offset={100}>
								<img src="/static/img/rack-3.png" width="320" height="174" alt="rack-3" />
							</LazyLoad>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.earn")}</h3>
							<p>{t("hooked.cut")}</p>
						</div>

						<div className="rack-img">
							<LazyLoad offset={100}>
								<img src="/static/img/rack-4.png" width="320" height="233" alt="rack-4" />
							</LazyLoad>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.facility")}</h3>
							<p>{t("hooked.playGames")}</p>
						</div>
						<div className="rack-img">
							<LazyLoad offset={100}>
								<img src="/static/img/rack-5.png" width="320" height="200" alt="rack-5" />
							</LazyLoad>
						</div>
						<div className="concrete-rack">
							<h3>{t("hooked.prizes")}</h3>
							<p>{t("hooked.promotions")}</p>
						</div>
					</div>
				</div>
				<div className="aside-5">
					<div className="aside-5-center">
						<div className="aside-5-container">
							<div className="container-detail">
								<br />
								<span>{t("joinText")}</span>
							</div>
							<div className="sign-btn-container">
								<a href={`${getLanguagePrefix(language)}/sign-up`} className="tree-dimensional-button btn-cyan">
									<span>
										<img src="/static/img/icon/pickaxe.svg" alt="pickaxe" /> <span>{t("signup")}</span>
									</span>
								</a>
							</div>
						</div>
						<div className="aside-5-border">
							<LazyLoad offset={100}>
								<img src="/static/img/border.png" alt="border" />
							</LazyLoad>
						</div>
					</div>
				</div>
			</Container>
		);
	}
}
export default withTranslation("FrontPage")(connect(mapStateToProps, null)(FrontPage));
