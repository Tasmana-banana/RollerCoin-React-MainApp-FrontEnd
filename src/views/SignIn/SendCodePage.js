import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Row, Col, Container } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import wait from "../../services/wait";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import RollerButton from "../../components/SingleComponents/RollerButton";
import VerificationCodeInput from "../../components/SingleComponents/VerificationCodeInput";
import { AUTH_EVENTS_STEP_FOUR } from "../../constants/SingleComponents";

import "../../assets/scss/SignInUp.scss";

const CODE_DIGITS_NEEDED = 6;

const SendCodePage = () => {
	const { t } = useTranslation("Registration");
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const [isLoading, setIsLoading] = useState(false);
	const [authEmail, setAuthEmail] = useState("");
	const [confirmData, setConfirmData] = useState({});
	const [authTitle, setAuthTitle] = useState(t("logIn.rollercoinLogin"));
	const [notYouLink, setNotYouLink] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const controllers = {};
	const signals = {};

	useEffect(async () => {
		const params = new URLSearchParams(window.location.search);
		const email = params.get("email");
		const userId = params.get("userId");
		const codeId = params.get("codeId");
		const code = params.get("code");
		const context = params.get("social_context");
		if (!email) {
			window.location.href = `${getLanguagePrefix(language)}/sign-in`;
		}
		if (context) {
			const queryObject = new URLSearchParams({ email, social_context: context });
			setNotYouLink(`${getLanguagePrefix(language)}/sign-in/step-3?${queryObject.toString()}`);
		}
		if (!context) {
			const queryObject = new URLSearchParams({ email, not_you: true });
			setNotYouLink(`${getLanguagePrefix(language)}/sign-in?${queryObject.toString()}`);
		}
		const welcome = params.get("welcome");
		if (welcome) {
			setAuthTitle(t("signUp.welcome"));
		}
		setAuthEmail(email);
		setConfirmData({
			email,
			userId,
			codeId,
			codeInput: code || "",
		});
		const lastVisitDate = localStorage.getItem("lastVisit");
		if (lastVisitDate) {
			const today = new Date();
			const dateLimit = new Date(new Date().setDate(today.getDate() - 30));
			const visitedSiteLast30Days = new Date(lastVisitDate) > dateLimit;
			if (visitedSiteLast30Days) {
				setAuthTitle(t("signUp.logInSignUp"));
			}
		}
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(async () => {
		if (confirmData.codeInput && confirmData.codeInput.length === CODE_DIGITS_NEEDED) {
			setIsLoading(true);
			await postSendCode();
		}
	}, [confirmData.codeInput]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
			<span>{text}</span>
		</div>
	);

	const postSendCode = async () => {
		const body = {
			user_id: confirmData.userId,
			code_id: confirmData.codeId,
			code: confirmData.codeInput,
		};
		setErrorMessage("");
		try {
			createSignalAndController("postSendCode");
			setIsLoading(true);
			const { event, params } = AUTH_EVENTS_STEP_FOUR.VERIFY_CODE;
			googleAnalyticsPush(event, params);
			const json = await fetchWithToken("/api/auth/validate-auth-code", {
				method: "POST",
				body: JSON.stringify(body),
				signal: signals.postSendCode,
			});
			if (!json.success) {
				setErrorMessage(json.error);
				const { event: errorEvent, params: errorParams } = AUTH_EVENTS_STEP_FOUR.CODE_ERROR;
				googleAnalyticsPush(errorEvent, errorParams);
				return toast(renderToast(json.error, "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
			const { event: submitEvent, params: submitParams } = AUTH_EVENTS_STEP_FOUR.SUBMIT;
			googleAnalyticsPush(submitEvent, submitParams);
			localStorage.setItem("token", json.data.token);
			await wait(1000);
			window.location.href = json.data.redirectPage;
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
								<img className="auth-banner" src={`${process.env.STATIC_URL}/static/img/authorization/banner_signup.gif?v=1.0.1`} alt="auth banner" />
							</span>
						</div>
					</Col>
				)}
				{isMobile && (
					<Col lg="7">
						<div className="auth-banner-container">
							<span>
								<img className="auth-banner" src={`${process.env.STATIC_URL}/static/img/authorization/banner_signup_mobile.gif?v=1.0.1`} alt="auth banner" />
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
						<div className="text-block">
							<p>
								{t("signUp.weSentCode")} <span>{authEmail}</span>
							</p>
							<Link className="link-underline" to={notYouLink}>
								{t("signUp.notYou")}
							</Link>
						</div>
					</div>
					<div className="autorization-block">
						<Form
							className="mgb-24"
							onSubmit={postSendCode}
							render={({ handleSubmit, form, submitting, valid }) => (
								<form onSubmit={handleSubmit}>
									<div className="form-group input-wrapper">
										<VerificationCodeInput errorMessage={errorMessage} setErrorMessage={setErrorMessage} confirmData={confirmData} setConfirmData={setConfirmData} />
										{errorMessage && <p className="error-message-text">{errorMessage}</p>}
									</div>
									<RollerButton
										width="100"
										color="cyan"
										size="default"
										text="CONTINUE"
										className={"auth-button"}
										action={handleSubmit}
										isLoading={submitting || isLoading}
										disabled={isLoading || submitting || confirmData.codeInput?.length < CODE_DIGITS_NEEDED}
									/>
								</form>
							)}
						/>
						<div className="text-container auth-text">
							<p className="purple-text">{t("signUp.cantFindEmail")}</p>
							<a className="link-underline" href="mailto:support@rollercoin.com">
								support@rollercoin.com
							</a>
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

SendCodePage.propTypes = {
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
export default SendCodePage;
