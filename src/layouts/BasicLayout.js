import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ReactPixel from "react-facebook-pixel";
import * as Sentry from "@sentry/react";
import { toast } from "react-toastify";
import cookie from "react-cookies";
import { load } from "@fingerprintjs/botd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import getBMFingerprint from "@bmlabs/fingerprint";
import * as actions from "../actions/game";
import * as actionsUser from "../actions/userInfo";
import * as actionsWallet from "../actions/wallet";
import * as actionsWebSocket from "../actions/webSocket";
import * as actionsNotifications from "../actions/notification";
import decimalAdjust from "../services/decimalAdjust";
import getLangFromUrl from "../services/getLangFromUrl";
import getWalletsAddressFromProfile from "../services/getWalletsAddressFromProfile";
import fetchWithToken from "../services/fetchWithToken";
import { getPEData } from "../services/ProgressionEventDataProcessing";
import redDotNotification from "../services/redDotNotify";
import WSocket from "../services/connectClass";
import electricityToast from "../services/electricityToast";
import { ELECTRICITY_PUBLISH_MESSAGES } from "../constants/SingleComponents";
import progressionEventRewardToast from "../services/progressionEventRewardToast";

const toastOptions = {
	position: "top-left",
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

dayjs.extend(utc);

const INITIAL_SOCKET_REQUESTS = ["profile_data", "updrank", "get_powers_info"];

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	wsNode: state.webSocket.wsNode,
	isBanned: state.user.isBanned,
	pathName: state.router.location.pathname,
	language: state.game.language,
	isMobile: state.game.isMobile,
	isViewedEventQuestion: state.user.isViewedEventQuestion,
	isViewedWeeklyOffer: state.user.isViewedWeeklyOffer,
	endTimeWeeklyOffer: state.user.endTimeWeeklyOffer,
	replenishmentModalStats: state.game.replenishmentModalStats,
	isOfferwallsActive: state.user.isOfferwallsActive,
	miningConfig: state.user.miningConfig,
	email: state.user.email,
	isUserViewed2fa: state.user.isUserViewed2fa,
	is2faEnabled: state.user.is2faEnabled,
	userInfo: state.user,
	notifications: state.notification,
	rollerCurrencies: state.wallet.rollerCurrencies,
	isRedDotNotify: state.wallet.isRedDotNotify,
	isRefreshBalance: state.wallet.isRefreshBalance,
	isRoomLoaded: state.game.isRoomLoaded,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setIsAuthorizedSocket: (state) => dispatch(actionsUser.setIsAuthorizedSocket(state)),
	setIsAuthorizedNode: (state) => dispatch(actionsUser.setIsAuthorizedNode(state)),
	setIsSessionSocketChecked: (state) => dispatch(actionsUser.setIsSessionSocketChecked(state)),
	setIsSessionNodeChecked: (state) => dispatch(actionsUser.setIsSessionNodeChecked(state)),
	setWSNodeConnection: (state) => dispatch(actionsWebSocket.setWSNodeConnection(state)),
	setRank: (state) => dispatch(actionsUser.setRank(state)),
	setUserPower: (state) => dispatch(actions.setUserPower(state)),
	setPoolsPower: (state) => dispatch(actions.setPoolsPower(state)),
	setBalance: (state) => dispatch(actions.setBalance(state)),
	setIsMobile: (state) => dispatch(actions.setIsMobile(state)),
	setUser: (state) => dispatch(actionsUser.setUser(state)),
	setAddress: (state) => dispatch(actionsWallet.setAddress(state)),
	setMinersBroken: (state) => dispatch(actions.setMinersBroken(state)),
	setUserTutorial: (state) => dispatch(actionsUser.setUserTutorial(state)),
	setViewedWeeklyOffer: (state) => dispatch(actionsUser.setViewedWeeklyOffer(state)),
	setViewedEventQuestion: (state) => dispatch(actionsUser.setViewedEventQuestion(state)),
	setEndTimeWeeklyOffer: (state) => dispatch(actionsUser.setEndTimeWeeklyOffer(state)),
	setCrowdfundingTokensDiscounts: (state) => dispatch(actionsWallet.setCrowdfundingTokensDiscounts(state)),
	setNotification: (state) => dispatch(actionsNotifications.setNotification(state)),
	setRedDotNotify: (state) => dispatch(actionsWallet.setRedDotNotify(state)),
	setIsShowCustomNotification: (state) => dispatch(actions.setIsShowCustomNotification(state)),
	setRefreshBalance: (state) => dispatch(actionsWallet.setRefreshBalance(state)),
	reloadMainGame: (state) => dispatch(actions.reloadMainGame(state)),
});

class BasicLayoutClass extends Component {
	static propTypes = {
		isAuthorizedSocket: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
		isBanned: PropTypes.bool.isRequired,
		pathName: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		setIsAuthorizedSocket: PropTypes.func.isRequired,
		setIsAuthorizedNode: PropTypes.func.isRequired,
		setIsSessionSocketChecked: PropTypes.func.isRequired,
		setIsSessionNodeChecked: PropTypes.func.isRequired,
		wsNode: PropTypes.object.isRequired,
		setWSNodeConnection: PropTypes.func.isRequired,
		setRank: PropTypes.func.isRequired,
		setUserPower: PropTypes.func.isRequired,
		setPoolsPower: PropTypes.func.isRequired,
		setBalance: PropTypes.func.isRequired,
		setIsMobile: PropTypes.func.isRequired,
		setAddress: PropTypes.func.isRequired,
		setUser: PropTypes.func.isRequired,
		setMinersBroken: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		isViewedWeeklyOffer: PropTypes.bool.isRequired,
		isViewedEventQuestion: PropTypes.bool.isRequired,
		isOfferwallsActive: PropTypes.bool.isRequired,
		setViewedWeeklyOffer: PropTypes.func.isRequired,
		setViewedEventQuestion: PropTypes.func.isRequired,
		setEndTimeWeeklyOffer: PropTypes.func.isRequired,
		setUserTutorial: PropTypes.func.isRequired,
		endTimeWeeklyOffer: PropTypes.string.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		miningConfig: PropTypes.array.isRequired,
		email: PropTypes.string.isRequired,
		isUserViewed2fa: PropTypes.bool.isRequired,
		is2faEnabled: PropTypes.bool.isRequired,
		userInfo: PropTypes.object.isRequired,
		setCrowdfundingTokensDiscounts: PropTypes.func.isRequired,
		notifications: PropTypes.object.isRequired,
		setNotification: PropTypes.func.isRequired,
		setIsShowCustomNotification: PropTypes.func.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		setRedDotNotify: PropTypes.func.isRequired,
		isRedDotNotify: PropTypes.bool.isRequired,
		isRefreshBalance: PropTypes.bool.isRequired,
		setRefreshBalance: PropTypes.func.isRequired,
		reloadMainGame: PropTypes.func.isRequired,
		isRoomLoaded: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		miningConfig: [],
	};

	constructor(props) {
		super(props);
		this.isMobile = window.screen.width < 1200;
		this.state = {
			openMenu: false,
			progress: {},
			isShowTwoFactorModal: false,
			isShowModalGenerateAddress: false,
			isUpdateGameScreen: false,
		};
		this.props.wsReact.setListenersMessage({ basicLayout: this.onWSMessage });
		this.props.wsReact.setListenersOpen({ basicLayout: this.socketOpen });
		this.controllers = {};
		this.signals = {};
		this.updateRankTimer = null;
		this.weeklyOfferTimer = null;
		this.wrapperRef = React.createRef();
		this.delayTimeout = 0;
	}

	async componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
		await Promise.all([this.getPixel(), this.getUserProfile(), this.getCrowdfundingTokensDiscounts(), this.postOfferwallProgress()]);
		this.wsNodeConnectHandler();
		window.addEventListener("resize", this.handleResizeEvent);
		this.changeRouteBasedOnLanguage();
		this.setMainClassBasedOnLang();
		this.checkAndSetIsMobile();
		this.getEmailRewardsToken();
	}

	checkViewedEventQuest = (isSeasonQuestsAvailable) => {
		const { setViewedEventQuestion } = this.props;
		setViewedEventQuestion(!isSeasonQuestsAvailable || redDotNotification.isViewEventQuestionOnThisDay());
		if (isSeasonQuestsAvailable) {
			this.eventQuestionTimer = setTimeout(() => setViewedEventQuestion(false), redDotNotification.getTimeToNextDayMs());
		}
	};

	checkViewedWeeklyOffer = () => {
		const { setViewedWeeklyOffer, endTimeWeeklyOffer } = this.props;
		setViewedWeeklyOffer(redDotNotification.isViewWeeklyOfferOnThisWeek(endTimeWeeklyOffer));
		this.weeklyOfferTimer = setTimeout(() => setViewedWeeklyOffer(false), redDotNotification.getMSToNextWeeklyOffer(endTimeWeeklyOffer));
	};

	handleResizeEvent = () => {
		const isMobile = window.screen.width < 992;
		if (isMobile !== this.props.isMobile) {
			this.props.setIsMobile(isMobile);
		}
	};

	getEmailRewardsToken = () => {
		const { history } = this.props;
		const { search, pathname } = history.location;
		const searchParams = new URLSearchParams(search);

		if (!localStorage.getItem("emailRewardsToken") && searchParams.get("email_rewards_token")) {
			const emailRewardsToken = searchParams.get("email_rewards_token");
			localStorage.setItem("emailRewardsToken", emailRewardsToken);
			searchParams.delete("email_rewards_token");
			history.push(`${pathname}?${searchParams.toString()}`);
			return emailRewardsToken;
		}
		return null;
	};

	checkEmailRewardsToken = async () => {
		const emailRewardsToken = localStorage.getItem("emailRewardsToken") || this.getEmailRewardsToken();

		if (emailRewardsToken) {
			this.createSignalAndController("checkEmailRewardsToken");
			try {
				const result = await fetchWithToken("/api/profile/collect-email-rewards", {
					method: "POST",
					body: JSON.stringify({ email_rewards_token: emailRewardsToken }),
					signal: this.signals.checkEmailRewardsToken,
				});

				if (result.success) {
					progressionEventRewardToast(result.data);
					this.getBalanceWS();
					this.setState({ isUpdateGameScreen: true });
				} else {
					toast(this.constructor.renderToast(result.error ?? "No awards", "error_notice.svg"), toastOptions);
				}
				localStorage.removeItem("emailRewardsToken");
			} catch (e) {
				console.error(e);
			}
		}
	};

	checkAndSetIsMobile = () => this.props.setIsMobile(window.screen.width < 992);

	changeRouteBasedOnLanguage = () => {
		const { location } = this.props;
		try {
			let selectedLanguage = localStorage.getItem("language");
			const langFromUrl = getLangFromUrl(location.pathname);
			const languageRoutes = {
				en: "",
				cn: "cn",
				es: "es",
				pt: "pt",
			};

			const prevLang = languageRoutes[selectedLanguage] || languageRoutes.en;
			if (langFromUrl !== prevLang) {
				localStorage.setItem("language", langFromUrl);
			}
		} catch (e) {
			console.error(e);
		}
	};

	setMainClassBasedOnLang = () => {
		const { language } = this.props;
		const wrapper = document.querySelector(".wrapper");

		if (language !== "en") {
			try {
				wrapper.classList.value = `wrapper ${language}`;
			} catch (e) {
				console.error(e);
			}
		} else {
			try {
				wrapper.classList.value = "wrapper";
			} catch (e) {
				console.error(e);
			}
		}
	};

	componentDidUpdate(prevProps, prevState) {
		const { isAuthorizedSocket, isAuthorizedNode, language, endTimeWeeklyOffer, isRefreshBalance } = this.props;
		const { progress } = this.state;
		const isUserFullAuth = isAuthorizedSocket && isAuthorizedNode;
		const progressCompleted = Object.keys(progress).find((key) => prevState.progress[key] && progress[key] >= 0 && prevState.progress[key] > progress[key]);

		if ((isAuthorizedSocket !== prevProps.isAuthorizedSocket && isUserFullAuth) || (isAuthorizedNode !== prevProps.isAuthorizedNode && isUserFullAuth)) {
			this.wsNodeConnectHandler();
			this.getBalanceWS();
			this.checkEmailRewardsToken();
			this.usersFingerprint();
			localStorage.setItem("lastVisit", `${new Date()}`);
		}
		if (language !== prevProps.language) {
			this.setMainClassBasedOnLang();
		}
		if (endTimeWeeklyOffer !== prevProps.endTimeWeeklyOffer && endTimeWeeklyOffer) {
			this.checkViewedWeeklyOffer();
		}
		if (isUserFullAuth && progressCompleted) {
			this.refreshBalance(progressCompleted);
		}
		if (prevProps.isRefreshBalance !== isRefreshBalance && isRefreshBalance) {
			this.refreshBalance();
		}

		if (this.state.isUpdateGameScreen && this.props.isRoomLoaded) {
			this.props.reloadMainGame(false);
			this.setState({ isUpdateGameScreen: false });
		}
	}

	componentWillUnmount() {
		this.props.wsReact.removeListenersMessage("basicLayout");
		this.props.wsReact.removeListenersOpen("basicLayout");
		window.removeEventListener("resize", this.handleResizeEvent);
		document.removeEventListener("click", this.handleClickOutside);
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		if (this.props.wsNode) {
			this.props.wsNode.removeListenersMessage("peUpdate");
			this.props.wsNode.destroyConnect();
		}
		if (this.updateRankTimer) {
			clearInterval(this.updateRankTimer);
		}
		if (this.weeklyOfferTimer) {
			clearInterval(this.weeklyOfferTimer);
		}
		if (this.delayTimeout) {
			clearTimeout(this.delayTimeout);
		}
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	refreshPE = async () => {
		const msDelay = Math.floor(Math.random() * 100000);
		this.delayTimeout = setTimeout(async () => {
			await getPEData();
		}, msDelay);
	};

	onWSMessage = async (event) => {
		try {
			const data = JSON.parse(event.data);
			const command = data.cmd;
			const value = data.cmdval;
			switch (command) {
				case "balance":
					await this.handleBalance(value);
					break;
				case "profile":
					this.handleProfileInfo(value);
					break;
				case "rank":
					this.handleUserRank(value);
					break;
				case "power":
					this.handleUserPower(value);
					break;
				case "pool_power_response":
					this.handlePoolPower(value);
					break;
				case "block_mining_progress_response":
					this.handleBlockMining(value);
					break;
				case "tokens_discounts_updated":
					this.getCrowdfundingTokensDiscounts();
					break;
				default:
					break;
			}
		} catch (e) {
			console.error(e);
		}
	};

	onWSNodeMessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			const { cmd, value } = data;
			switch (cmd) {
				case "pe_edited_update":
					this.refreshPE();
					break;
				case "electricity_updated": {
					const { status, text } = ELECTRICITY_PUBLISH_MESSAGES[value.message];
					electricityToast(status, text);
					break;
				}
				default:
					break;
			}
		} catch (e) {
			console.error(e);
		}
	};

	wsNodeConnectHandler = () => {
		if (!process.env.NODE_WS_WITH_AUTH || this.props.wsNode) {
			return false;
		}

		const wsNode = new WSocket(process.env.NODE_WS_URL);
		wsNode.connect();
		wsNode.setListenersMessage({ peUpdate: this.onWSNodeMessage });
		this.props.setWSNodeConnection(wsNode);
	};

	handleBlockMining = (data) => {
		const { progress } = this.state;
		this.setState({ progress: { ...progress, [data.currency]: data.progress } });
	};

	handleClickOutside = (event) => {
		if (this.wrapperRef.current && !this.wrapperRef.current.contains(event.target)) {
			this.setState({ openMenu: false });
		}
	};

	refreshBalance = (currencySmall) => {
		const { miningConfig, wsReact, isRefreshBalance } = this.props;
		const isCurrencyInMining = currencySmall ? miningConfig.find(({ currency }) => currency === currencySmall) : null;
		if ((isCurrencyInMining && isCurrencyInMining.percent) || isRefreshBalance) {
			wsReact.send(
				JSON.stringify({
					cmd: "balance_request",
				})
			);
		}

		if (isRefreshBalance) {
			this.props.setRefreshBalance(false);
		}
	};

	getBalanceWS = () => {
		const { isAuthorizedSocket, isAuthorizedNode } = this.props;
		if (isAuthorizedSocket && isAuthorizedNode) {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: "balance_request",
				})
			);
		}
	};

	socketOpen = () => {
		const { wsReact } = this.props;
		if (this.updateRankTimer) {
			clearInterval(this.updateRankTimer);
		}

		INITIAL_SOCKET_REQUESTS.forEach((request) => {
			wsReact.send(JSON.stringify({ cmd: request }));
		});

		this.updateRankTimer = setInterval(this.updateRank, 180000);
	};

	handleUserPower = (data) => {
		const { total } = data;
		this.props.setUserPower(total);
	};

	handlePoolPower = (data) => {
		this.props.setPoolsPower(data);
	};

	handleProfileInfo = (data) => {
		const { setIsAuthorizedSocket, setIsSessionSocketChecked } = this.props;
		setIsAuthorizedSocket(data.auth);
		setIsSessionSocketChecked(true);
	};

	handleUserRank = (data) => {
		this.props.setRank(data);
	};

	handleBalance = (data) => {
		try {
			const balance = {};
			Object.keys(data).forEach((currency) => {
				const key = currency.split("_")[1] ? currency.split("_")[1] : currency;
				if (key === "btc") {
					balance[key] = +decimalAdjust(+data[currency] / 100, 2);
				} else {
					balance[key] = data[currency];
				}
			});
			this.props.setBalance(balance);
		} catch (e) {
			console.error(e);
		}
	};

	updateRank = () => {
		const { isAuthorizedSocket, isAuthorizedNode } = this.props;
		if (isAuthorizedSocket && isAuthorizedNode) {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: "updrank",
				})
			);
		}
	};

	getPixel = async () => {
		this.createSignalAndController("getPixel");
		try {
			await fetchWithToken("/api/common/get-pixel", {
				method: "GET",
				signal: this.signals.getPixel,
			});
		} catch (e) {
			console.error(e);
		}
	};

	getUserProfile = async () => {
		const { setUser, setAddress, setMinersBroken, setIsAuthorizedNode, setIsSessionNodeChecked, setIsSessionSocketChecked, setUserTutorial, setEndTimeWeeklyOffer } = this.props;
		if (!localStorage.getItem("token")) {
			setIsSessionNodeChecked(true);
			setIsSessionSocketChecked(true);
			return false;
		}
		this.createSignalAndController("getUserProfile");
		try {
			const json = await fetchWithToken("/api/profile/user-profile-data", {
				method: "GET",
				signal: this.signals.getUserProfile,
			});
			if (!json.success) {
				return setIsSessionNodeChecked(true);
			}
			setUser(json.data);
			setIsAuthorizedNode(json.data.is_completed);
			setMinersBroken(json.data.miners_broken);
			setAddress(getWalletsAddressFromProfile(json.data.external_wallet));
			setUserTutorial(json.data.user_viewed_tutorial);
			setEndTimeWeeklyOffer(json.data.end_date_weekly_offer);
			setIsSessionNodeChecked(true);
			Sentry.setUser({ id: json.data.id });
			this.checkViewedEventQuest(json.data.is_season_quests_available);
			this.facebookPixelInit(json.data.id);
			this.googleAnalyticsInit(json.data.id);
			const notificationsProcessed = json.data.user_notifications.reduce((acc, val) => {
				if (val.name === "privacy_modal") {
					const isShow = val.is_show_notification && (json.data.is_social_registration || new Date(val.from).getTime() > new Date(json.data.registration).getTime());
					acc[val.name] = { ...val, is_show_notification: isShow };
					return acc;
				}
				acc[val.name] = val;
				return acc;
			}, {});
			this.props.setNotification(notificationsProcessed);
			this.props.setIsShowCustomNotification(json.data.is_show_custom_notification);
			document.cookie = `user_id=${json.data.id}`;
			if (cookie.load("show_referral_prize")) {
				cookie.remove("show_referral_prize", { path: "/", domain: ".rollercoin.com" });
				toast(this.constructor.renderToast("Good news – welcome bonus received!"), toastOptions);
			}
		} catch (e) {
			console.error(e);
		}
	};

	// eslint-disable-next-line class-methods-use-this
	facebookPixelInit = (uid) => {
		const matching = { external_id: uid };
		const options = {
			autoConfig: true, // set pixel's autoConfig
			debug: false, // enable logs
		};
		ReactPixel.init(process.env.FACEBOOK_PIXEL_ID, matching, options);
	};

	// eslint-disable-next-line class-methods-use-this
	googleAnalyticsInit = (uid) => {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event: "login",
			userId: uid,
		});
	};

	static renderToast(text, icon = "gift_box.gif") {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}`} alt="block_mined" />
				<span>{text}</span>
			</div>
		);
	}

	getCrowdfundingTokensDiscounts = async () => {
		if (!localStorage.getItem("token")) {
			return;
		}
		const { setCrowdfundingTokensDiscounts } = this.props;
		this.createSignalAndController("getCrowdfundingTokensDiscounts");
		try {
			const json = await fetchWithToken(`/api/crowdfunding/tokens-discounts`, {
				method: "GET",
				signal: this.signals.getCrowdfundingTokensDiscounts,
			});
			if (!json.success) {
				return false;
			}

			setCrowdfundingTokensDiscounts(json.data);
			this.checkRedDotForWallet(json.data);
			return json.data;
		} catch (err) {
			console.error(err);
		}
	};

	postOfferwallProgress = async () => {
		if (!localStorage.getItem("token")) {
			return;
		}
		const lastOfferwallUpdateString = localStorage.getItem("lastOfferwallUpdate");
		if (lastOfferwallUpdateString) {
			const dateForNewDetection = dayjs.utc(lastOfferwallUpdateString).add(+process.env.OFFERWALL_DELAY, "millisecond");
			const isNeedToDetect = dayjs().utc().isAfter(dateForNewDetection);
			if (!isNeedToDetect) {
				return;
			}
		}

		const botd = await load();
		const detector = await botd.detect();
		this.createSignalAndController("postOfferwallProgress");
		try {
			const json = await fetchWithToken(`/api/game/offerwall-progress/`, {
				method: "POST",
				signal: this.signals.postOfferwallProgress,
				body: JSON.stringify({
					offers_enabled: detector.bot,
					offers_for: detector.botKind || null,
				}),
			});
			if (!json.success) {
				return false;
			}
			localStorage.setItem("lastOfferwallUpdate", dayjs().toString());
			return true;
		} catch (err) {
			console.error(err);
		}
	};

	checkRedDotForWallet = (crowdFundingTokensDiscountsArr) => {
		const { rollerCurrencies, setRedDotNotify } = this.props;

		const currenciesOptions = [];
		rollerCurrencies.forEach((currency) => {
			const obj = {
				currency: currency.code,
				tag: currency?.tag || "",
				discount: 0,
			};
			currenciesOptions.push(obj);
		});

		crowdFundingTokensDiscountsArr.forEach((currency) => {
			const currentCurrency = currenciesOptions.find((item) => item.currency === currency.currency);
			if (currentCurrency) {
				currentCurrency.discount = currency.amount;
			}
		});

		setRedDotNotify(redDotNotification.isRedDotNotifyWallet(currenciesOptions));
	};

	usersFingerprint = async () => {
		const existingFp = localStorage.getItem("fpdata");
		try {
			this.createSignalAndController("postUsersFingerprint");
			const fpObj = await getBMFingerprint();
			if (!fpObj) {
				return false;
			}
			if (existingFp && existingFp === JSON.stringify(fpObj)) {
				return false;
			}
			const requestBody = { fingerprint: fpObj.fid, fingerprint_ua: fpObj.fidNoUa };
			const json = await fetchWithToken("/api/profile/fingerprint", {
				method: "POST",
				body: JSON.stringify(requestBody),
				signal: this.signals.postUsersFingerprint,
			});
			if (!json.success) {
				return false;
			}
			if (requestBody) {
				localStorage.setItem("fpdata", JSON.stringify(fpObj));
			}
		} catch (e) {
			console.error(`Fingerprint error: ${e}`);
		}
	};

	render() {
		return <div className="wrapper">{this.props.children}</div>;
	}
}

const BasicLayout = connect(mapStateToProps, mapDispatchToProps)(withRouter(BasicLayoutClass));
export default BasicLayout;
