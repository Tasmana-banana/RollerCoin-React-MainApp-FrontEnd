import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Row, Col, Container } from "reactstrap";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import useGrecaptcha from "../../services/hooks/useGrecaptcha";
import { initTimer } from "../../services/countdownТimer";
import fetchWithToken from "../../services/fetchWithToken";
import FacebookBtn from "../../components/Auth/FacebookBtn";
import TwitterBtn from "../../components/Auth/TwitterBtn";
import RollerInput from "../../components/SingleComponents/RollerInput";
import GoogleBtn from "../../components/Auth/GoogleBtn";
import RollerButton from "../../components/SingleComponents/RollerButton";
import FacebookBtnPopup from "../../components/Auth/FacebookBtnPopup";

import "../../assets/scss/SignInUp.scss";

const SignIn = () => {
	const { t } = useTranslation("Registration");
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const history = useHistory();
	const [isShowErrorModal, setIsShowErrorModal] = useState(true);
	const [emailInputValueAndStatus, setEmailInputValueAndStatus] = useState({ value: "", isValid: false });
	const [socialProvider, setSocialProvider] = useState("");
	const [authTitle, setAuthTitle] = useState(t("logIn.rollercoinLogin"));
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [notYouTimeError, setNotYouTimeError] = useState(false);
	const timer = useRef(null);
	const controllers = {};
	const signals = {};

	const {
		isLoading,
		setIsLoading,
		isGrecaptchaError,
		isUncountableError,
		setIsUncountableError,
		isTooManyRequests,
		isRecaptchaValid,
		getCaptchaStatus,
		captchaRef,
		geetestSeccode,
		isCaptchaRequired,
	} = useGrecaptcha();

	useEffect(async () => {
		const params = new URLSearchParams(window.location.search);
		const notYou = params.get("not_you");
		const email = params.get("email");
		const welcome = params.get("welcome");
		if (welcome) {
			setAuthTitle(t("signUp.welcome"));
		}
		const lastVisitDate = localStorage.getItem("lastVisit");
		if (lastVisitDate) {
			const today = new Date();
			const dateLimit = new Date(new Date().setDate(today.getDate() - 30));
			const visitedSiteLast30Days = new Date(lastVisitDate) > dateLimit;
			if (visitedSiteLast30Days) {
				setAuthTitle(t("signUp.logInSignUp"));
			}
		}
		if (email) {
			setEmailInputValueAndStatus({ value: email, isValid: true });
		}
		if (notYou) {
			clearInterval(timer.current);
			startTimer(dayjs().add(60, "s"));
		}
		await getCaptchaStatus();
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			setNotYouTimeError(false);
			clearInterval(timer.current);
		}
	}, [timeLeftSeconds]);

	useEffect(async () => {
		if (emailInputValueAndStatus.isValid) {
			const isValid = geetestSeccode.length > 3 && isCaptchaRequired;
			if (isValid && !isLoading) {
				setNotYouTimeError(false);
				await getCaptchaStatus();
			}
		}
	}, [emailInputValueAndStatus]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const emailInputHandler = (value) => {
		setEmailInputValueAndStatus(value);
	};

	const continueAuthSubmit = async (values) => {
		if (!isRecaptchaValid()) {
			return false;
		}
		const params = new URLSearchParams(window.location.search);
		const email = params.get("email");
		if (timeLeftSeconds > 0 && email === emailInputValueAndStatus.value) {
			setNotYouTimeError(true);
			return false;
		}
		setIsLoading(true);
		const { mail } = values;
		await getAuthCode(mail);
	};

	const startTimer = (leftDate) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(leftDate));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	const renderToast = (text, icon) => {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
				<span>{text}</span>
			</div>
		);
	};

	const getAuthCode = async (email) => {
		createSignalAndController("getAuthCode");
		const requestBody = { mail: email, registrationLanguage: language, geetestSeccode };
		try {
			const json = await fetchWithToken("/api/auth/email-auth", {
				method: "POST",
				signal: signals.getAuthCode,
				body: JSON.stringify(requestBody),
			});

			if (!json.success) {
				toast(renderToast(json.error, "error_notice"));
				if (json.error === "Challenge data is not valid" || json.status === 403) {
					setIsUncountableError(true);
				}
				return false;
			}
			toast(renderToast("Code successfully sent to your email!", "success_notice"));
			const queryObject = { email: json.data.email, userId: json.data.user_id, codeId: json.data.confirm_code_id };
			const params = new URLSearchParams(window.location.search);
			const welcome = params.get("welcome");
			if (welcome) {
				queryObject.welcome = true;
			}
			const queryString = new URLSearchParams(queryObject).toString();
			history.push(`${getLanguagePrefix(language)}/sign-in/step-2?${queryString}`);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const CloseButtonComponent = () => <img src="/static/img/icon/toast_close.svg" alt="toast_close" className="close-toast" />;

	return (
		<Container className="main-container">
			<Row>
				{!isMobile && (
					<Col lg="7">
						<div className="auth-banner-container">
							<span>
								<img className="auth-banner" src={`${process.env.STATIC_URL}/static/img/authorization/banner_signup.gif?v=1.0.3`} alt="auth banner" />
							</span>
						</div>
					</Col>
				)}
				{/* TODO change the picture to static */}
				{isMobile && (
					<Col lg="7">
						<div className="auth-banner-container">
							<span>
								<img className="auth-banner" src={`${process.env.STATIC_URL}/static/img/authorization/banner_signup_mobile.gif?v=1.0.4`} alt="auth banner" />
							</span>
						</div>
					</Col>
				)}
				<Col sx="12" lg="5" className="main-container-authorize">
					<div className="text-center text-container">
						<span>
							<img className="auth-logo" width={33} height={38} src="/static/img/icon/hamster.svg?v=1.0.3" alt="auth banner" />
						</span>
						<p className="default-text create-account-title">{authTitle}</p>
					</div>
					<div className="autorization-block">
						<Form
							className="mgb-16"
							onSubmit={continueAuthSubmit}
							initialValues={{ mail: emailInputValueAndStatus.value || "" }}
							render={({ handleSubmit, submitting, valid }) => (
								<form onSubmit={handleSubmit}>
									<div className="form-group input-wrapper">
										<RollerInput emailInputHandler={emailInputHandler} name="mail" placeholder="Enter email" type="mail" label={t("signUp.email")} />
									</div>
									{isTooManyRequests && <p className="error-message-text">{t("logIn.tooManyReq")}</p>}
									{isUncountableError && <p className="error-message-text">{t("logIn.refreshPage")}</p>}
									{notYouTimeError && (
										<p className="error-message-text">
											{t("signUp.notYouDelayMessage")} <span className="purple-text">{t("signUp.oneMinute")}</span>
										</p>
									)}
									<div className="form-group input-wrapper captcha-wrapper">
										<div ref={captchaRef} className="captcha-style" />
										{isGrecaptchaError && <p className="error-message-text">{t("logIn.checkCaptcha")}</p>}
									</div>
									<RollerButton
										width="100"
										color="cyan"
										size="default"
										text={t("signUp.continueWithEmail")}
										className={"auth-button"}
										action={handleSubmit}
										isLoading={submitting}
										disabled={notYouTimeError || isLoading || submitting || !valid || isGrecaptchaError || (isCaptchaRequired && geetestSeccode.length < 3)}
									/>
								</form>
							)}
						/>
						<Row noGutters={true} className="align-items-center justify-content-between line-separator">
							<Col xs="5" className="line" />
							<p className="default-text col-2 text-center mgb-0">{t("signUp.or")}</p>
							<Col xs="5" className="line" />
						</Row>
						<GoogleBtn />
						<div className="d-flex justify-content-between">
							<FacebookBtn setSocialProvider={setSocialProvider} setIsShowErrorModal={setIsShowErrorModal} />
							<TwitterBtn setSocialProvider={setSocialProvider} setIsShowErrorModal={setIsShowErrorModal} />
						</div>
						{isShowErrorModal && socialProvider && <FacebookBtnPopup isModalOpen={isShowErrorModal} provider={socialProvider} />}
					</div>
					<div className="text-container auth-text">
						<p>
							{t("signUp.termsDescr")}{" "}
							<a className="link-underline" href={`${getLanguagePrefix(language)}/terms`} target="_blank" rel="noopener noreferrer">
								{t("signUp.termsLinkText")}
							</a>{" "}
							&{" "}
							<a className="link-underline" href={`${getLanguagePrefix(language)}/privacy`} target="_blank" rel="noopener noreferrer">
								{t("signUp.privacyLinkText")}
							</a>
						</p>
					</div>
				</Col>
				<ToastContainer
					position="top-left"
					autoClose={3000}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnVisibilityChange
					draggable
					pauseOnHover
					closeButton={<CloseButtonComponent />}
				/>
			</Row>
		</Container>
	);
};

SignIn.propTypes = {
	language: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};
export default SignIn;
