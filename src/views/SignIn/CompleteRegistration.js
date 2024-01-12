import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Row, Col, Container } from "reactstrap";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import RollerInput from "../../components/SingleComponents/RollerInput";
import RollerButton from "../../components/SingleComponents/RollerButton";

import "../../assets/scss/SignInUp.scss";

import fetchWithToken from "../../services/fetchWithToken";
import useGrecaptcha from "../../services/hooks/useGrecaptcha";

const CompleteRegistration = () => {
	const [socialContext, setSocialContext] = useState("");
	const [authEmailError, setAuthEmailError] = useState("");
	const [emailInputValueAndStatus, setEmailInputValueAndStatus] = useState({ value: "", isValid: false });
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const history = useHistory();
	const controllers = {};
	const signals = {};
	const { t } = useTranslation("Registration");

	const { isLoading, setIsLoading, isGrecaptchaError, isUncountableError, setIsUncountableError, isTooManyRequests, getCaptchaStatus, captchaRef, geetestSeccode, isCaptchaRequired } =
		useGrecaptcha();

	useEffect(async () => {
		const params = new URLSearchParams(window.location.search);
		const context = params.get("social_context");
		if (context) {
			setSocialContext(context);
		}
		if (!context) {
			window.location.href = `${getLanguagePrefix(language)}/sign-in`;
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

	useEffect(async () => {
		setAuthEmailError("");
		if (emailInputValueAndStatus.isValid) {
			const isValid = geetestSeccode.length > 3 && isCaptchaRequired;
			if (isValid && !isLoading) {
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

	const continueAuthSubmit = async (values) => {
		setIsLoading(true);
		const { mail } = values;
		await getAuthCode(mail);
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
		const requestBody = { mail: email, registrationLanguage: language, social_context: socialContext, geetestSeccode };
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
				} else {
					setAuthEmailError(json.error);
				}
				return false;
			}
			toast(renderToast("Code successfully sent to your email!", "success_notice"));
			const queryObject = { email: json.data.email, userId: json.data.user_id, codeId: json.data.confirm_code_id, social_context: socialContext };
			const queryString = new URLSearchParams(queryObject).toString();
			history.push(`${getLanguagePrefix(language)}/sign-in/step-2?${queryString}`);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const emailInputHandler = (value) => {
		setEmailInputValueAndStatus(value);
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
				<Col sx="12" lg="5" className=" main-container-authorize">
					<div className="text-center text-container">
						<span>
							<img className="auth-logo" width={33} height={38} src="/static/img/icon/hamster.svg?v=1.0.3" alt="auth banner" />
						</span>
						<p className="default-text create-account-title">{t("signUp.completeRegistration")}</p>
					</div>
					<div className="autorization-block">
						<Form
							className="mgb-16"
							onSubmit={continueAuthSubmit}
							render={({ handleSubmit, form, submitting, valid }) => (
								<form onSubmit={handleSubmit}>
									<div className="form-group input-wrapper">
										<RollerInput emailInputHandler={emailInputHandler} name="mail" placeholder="Enter email" type="mail" label={t("signUp.email")} />
									</div>
									{authEmailError && <p className="error-message-text">{authEmailError}</p>}
									{isTooManyRequests && <p className="error-message-text">{t("logIn.tooManyReq")}</p>}
									{isUncountableError && <p className="error-message-text">{t("logIn.refreshPage")}</p>}
									<div className="form-group input-wrapper captcha-wrapper">
										<div ref={captchaRef} className="captcha-style" />
										{isGrecaptchaError && <p className="error-message-text">{t("logIn.checkCaptcha")}</p>}
									</div>
									<RollerButton
										width="100"
										color="cyan"
										size="default"
										text="SEND CODE"
										className={"auth-button"}
										action={handleSubmit}
										isLoading={submitting}
										disabled={isLoading || submitting || !valid || isGrecaptchaError || (isCaptchaRequired && geetestSeccode.length < 3)}
									/>
								</form>
							)}
						/>
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

CompleteRegistration.propTypes = {
	language: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};
export default CompleteRegistration;
