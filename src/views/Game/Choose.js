import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "reactstrap";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import GamePreview from "../../components/Game/GamePreview";
import BannersLoader from "../../components/Banners/BannersLoader";
import PCInfo from "../../components/Game/PCInfo";
import GeeTestModal from "../../components/Game/GeeTestModal";
import GeeTestTimeOverModal from "../../components/Game/GeeTestTimeOverModal";
import TutorialModal from "../../components/Tutorial/TutorialModal";
import ProgressionEvent from "../../components/ProgressionEvent/ProgressionEvent";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import encryptData from "../../services/encryptData";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Game/Choose.scss";
import loaderImg from "../../assets/img/icon/hamster_loader.gif";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	selectedGame: state.game.selectedGame,
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	language: state.game.language,
	uid: state.user.uid,
	isViewedTutorial: state.user.userViewedTutorial,
	isNeedShowInfluencersRewards: state.user.isNeedShowInfluencersRewards,
});

class ChooseGameClass extends Component {
	static propTypes = {
		isAuthorizedSocket: PropTypes.bool.isRequired,
		isAuthorizedNode: PropTypes.bool.isRequired,
		selectedGame: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		uid: PropTypes.string.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		isNeedShowInfluencersRewards: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			mounted: false,
			isLoading: false,
			isGeetestModalOpen: false,
			isCaptchaTimeOverModalOpen: false,
			unbanTimestamp: null,
			captchaExpireDate: null,
			timeToSolveCaptcha: null,
			captchaObj: null,
		};
		this.props.wsReact.setListenersOpen({ chooseGame: this.onLoadFunction });
		this.isMobile = window.screen.width < 992;
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		if (document.readyState === "complete") {
			this.setState({
				mounted: true,
			});
		} else {
			this.windowLoadTest();
		}
	}

	componentWillUnmount() {
		this.setState({ mounted: false });
		this.props.wsReact.removeListenersOpen("chooseGame");
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

	windowLoadTest = () => {
		window.addEventListener("load", () => {
			this.setState({
				mounted: true,
			});
		});
	};

	onLoadFunction = () => {
		const { isAuthorizedSocket, isAuthorizedNode } = this.props;
		if (!(isAuthorizedSocket && isAuthorizedNode)) {
			return null;
		}
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "games_data_request",
			})
		);
	};

	startGame = async (id) => {
		this.setState({ isLoading: true });
		const { isAuthorizedSocket, isAuthorizedNode, history, language, uid } = this.props;
		if (!(isAuthorizedSocket && isAuthorizedNode)) {
			return history.push(`${getLanguagePrefix(language)}/games/play`);
		}
		try {
			this.createSignalAndController("startGame");
			const isCaptchaRequiredJSON = await fetchWithToken(`/api/game/captcha-status/${uid}`, {
				method: "GET",
				signal: this.signals.startGame,
			});
			if (!isCaptchaRequiredJSON.success) {
				if (isCaptchaRequiredJSON.status === 429) {
					this.setState({ isCaptchaTimeOverModalOpen: true, unbanTimestamp: isCaptchaRequiredJSON.data.unban_timestamp });
				}
				throw new Error(isCaptchaRequiredJSON.error);
			}
			this.setState({
				captchaExpireDate: isCaptchaRequiredJSON.data.geetest_key_expire,
				timeToSolveCaptcha: isCaptchaRequiredJSON.data.time_to_solve,
			});
			if (!isCaptchaRequiredJSON.data.is_captcha_required) {
				await this.sendEncodedData(id);
				this.setState({ isLoading: false });
				return null;
			}
			if (!window.initGeetest) {
				throw new Error("geetest not loaded");
			}
			window.initGeetest(
				{
					gt: isCaptchaRequiredJSON.data.geetest_key,
					product: "custom",
					area: "#geetest-block",
					lang: language === "en" ? language : "zh-cn",
					challenge: isCaptchaRequiredJSON.data.captcha_code,
					offline: false,
					new_captcha: true,
				},
				(captchaObj) => this.geetestCallback(captchaObj, id)
			);
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
		}
	};

	geetestCallback = async (captchaObj, gameID) => {
		captchaObj.appendTo("#geetest-block");

		captchaObj.onReady(() => {
			this.setState({ isGeetestModalOpen: true, isLoading: false, captchaObj });
		});
		captchaObj.onSuccess(async () => {
			const result = captchaObj.getValidate();
			this.setState({ isGeetestModalOpen: false, isLoading: true });
			if (!result) {
				toast(this.constructor.renderToast("Not valid data", "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			} else {
				await this.sendEncodedData(gameID, result.geetest_seccode);
			}
			this.setState({ isLoading: false });
		});
		captchaObj.onError(() =>
			toast(this.constructor.renderToast("Something went wrong. Please refresh page", "error_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})
		);
	};

	sendEncodedData = async (gameID, seccode = "") => {
		const { uid } = this.props;
		try {
			this.createSignalAndController("sendEncodedData");
			const encryptedData = encryptData({ game_number: gameID }, uid);
			const encodedResult = await fetchWithToken(`/api/game/encode-start-game-data/${uid}?seccode=${seccode}`, {
				method: "POST",
				signal: this.signals.sendEncodedData,
				body: JSON.stringify({ data: encryptedData }),
			});
			if (!encodedResult.success) {
				toast(this.constructor.renderToast("Data not valid. Please refresh page", "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
				throw new Error("Data can't be encoded");
			}
			this.props.wsReact.send(
				JSON.stringify({
					cmd: "game_start_request",
					cmdval: encodedResult.data,
				})
			);
		} catch (e) {
			console.error(e);
		}
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt="block_mined" />
				<span>{text}</span>
			</div>
		);
	}

	geestModalTimeOver = () => {
		const { captchaObj } = this.state;
		if (captchaObj) {
			captchaObj.destroy();
		}
		this.setState({ isGeetestModalOpen: false });
	};

	closeGeestModalTimeOver = () => {
		this.setState({ isCaptchaTimeOverModalOpen: false });
	};

	render() {
		const { t, isAuthorizedSocket, isAuthorizedNode, isViewedTutorial, isNeedShowInfluencersRewards } = this.props;
		const { isLoading, isGeetestModalOpen, isCaptchaTimeOverModalOpen, timeToSolveCaptcha, captchaExpireDate, unbanTimestamp } = this.state;
		return (
			<Fragment>
				{!isViewedTutorial.choose_game && !isNeedShowInfluencersRewards && <TutorialModal tutorialCategories={"choose_game"} />}
				<Container className="transparent-bg without-padding container">
					<ProgressionEvent wsReact={this.props.wsReact} />
					{isGeetestModalOpen && <GeeTestModal timeOverCB={this.geestModalTimeOver} solveTime={timeToSolveCaptcha} captchaExpireDate={captchaExpireDate} />}
					{isCaptchaTimeOverModalOpen && <GeeTestTimeOverModal unbanTime={unbanTimestamp} close={this.closeGeestModalTimeOver} />}
					{isLoading && (
						<div className="preloader">
							<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
						</div>
					)}
					<Row className="choose-game-main-container justify-content-center">
						<Col xs="12" lg="10" className="choose-game-container">
							<div className="choose-game-body">
								<h1 className="choose-game-title update">{t("playGame")}</h1>
								{isAuthorizedSocket && isAuthorizedNode && <PCInfo isMobile={this.isMobile} />}
								<GamePreview isLoading={isLoading} startGame={this.startGame} />
							</div>
						</Col>
						<Col xs="12" lg="2" className="static-data-content game-choose-banners banner-right">
							{this.state.mounted && <BannersLoader name="gameChooseRight" isMobile={this.isMobile} />}
							{this.state.mounted && <BannersLoader name="gameMobile" isMobile={this.isMobile} />}
						</Col>
					</Row>
				</Container>
			</Fragment>
		);
	}
}
const ChooseGame = connect(mapStateToProps, null)(withRouter(withTranslation("Games")(ChooseGameClass)));

export default ChooseGame;
