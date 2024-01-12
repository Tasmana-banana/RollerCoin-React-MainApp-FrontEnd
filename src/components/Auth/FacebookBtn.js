import React, { useEffect, useRef, useState } from "react";
import ReactGA from "react-ga";
import cookie from "react-cookies";
import PropTypes from "prop-types";
import { BUTTON_AUTH_PROVIDER_EVENT } from "../../constants/SingleComponents";
import fetchWithToken from "../../services/fetchWithToken";
import loadScript from "../../services/loadScript";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import LoginBtn from "./LoginBtn";

import facebookLogo from "../../assets/img/icon/social/facebook_logo.svg";

ReactGA.initialize(process.env.GTM_ID);
const FacebookBtn = ({ setIsShowErrorModal, setSocialProvider }) => {
	const [authError, setAuthError] = useState(false);
	const [FBScript, setFBScript] = useState(null);
	const controller = useRef(null);
	const signal = useRef(null);

	useEffect(() => {
		controller.current = new AbortController();
		signal.current = controller.current.signal;
		if (window.fbAsyncInit) {
			window.fbAsyncInit();
		}
		if (!window.FB) {
			setFBScript(loadScript(`https://connect.facebook.net/en_US/sdk.js`, false, FBOnload));
		} else {
			window.FB.AppEvents.logPageView();
		}
		const accessCode = getTokenInApp();
		if (accessCode) {
			responseFacebook({ code: accessCode, profile: {} });
		}
		window.checkLoginState = () => {
			// Called when a person is finished with the Login Button.
			window.FB.getLoginStatus((response) => {
				// See the onlogin handler
				if (response && response.status === "connected") {
					responseFacebook(response);
				} else {
					setAuthError(true);
				}
			});
		};
		return () => {
			if (controller.current) {
				controller.current.abort();
			}
		};
	}, []);

	const FBOnload = () => {
		// eslint-disable-next-line func-names
		window.fbAsyncInit = function () {
			window.FB.init({
				appId: process.env.FACEBOOK_APP_ID,
				cookie: true,
				xfbml: true,
				version: "v12.0",
			});
		};
	};

	const createSignalAndController = () => {
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		signal.current = controller.current.signal;
	};

	const sendGA = () => {
		const registeredCokies = +cookie.load("registered");
		ReactGA.event({
			category: "Click",
			action: registeredCokies ? "log_in_fb" : "sign_up_fb",
			label: registeredCokies ? "Facebook log in" : "Facebook sign-up",
		});
	};

	const responseFacebook = async (data) => {
		sendGA();
		if (!data.authResponse && !data.code) {
			setSocialProvider("facebook");
			setIsShowErrorModal(true);
			return null;
		}
		createSignalAndController();
		try {
			const json = await fetchWithToken(`/api/auth/facebook?${data.authResponse ? `access_token=${data.authResponse.accessToken}` : `code=${data.code}`}`, {
				method: "POST",
				signal: signal.current,
			});
			if (json.success) {
				localStorage.setItem("token", json.data.token);
				if (json.data.redirectPage.includes("sign-in")) {
					const providerName = json.data.email ? "facebook_mail" : "facebook_phone";
					const queryObject = new URLSearchParams({ email: json.data.email, social_context: json.data.social_context, provider: providerName });
					window.location.href = `${json.data.redirectPage}?${queryObject.toString()}`;
					return null;
				}
				window.location.href = json.data.redirectPage;
				return null;
			}
		} catch (e) {
			setIsShowErrorModal(true);
			setSocialProvider("facebook");
			setAuthError(true);
		}
	};

	const getTokenInApp = () => {
		try {
			const params = new URLSearchParams(window.location.search);
			const token = params.get("code");
			if (!token) {
				return "";
			}
			return token;
		} catch (e) {
			return "";
		}
	};

	const login = () => {
		// login with facebook then authenticate with the API to get a JWT auth token
		const { event, params } = BUTTON_AUTH_PROVIDER_EVENT.facebook;
		googleAnalyticsPush(event, params);
		window.FB.login(
			(response) => {
				responseFacebook(response);
			},
			{ scope: "public_profile,email" }
		);
	};

	return <LoginBtn className={"facebook"} onClick={login} text="Facebook" logo={facebookLogo} />;
};

FacebookBtn.propTypes = {
	setIsShowErrorModal: PropTypes.func.isRequired,
	setSocialProvider: PropTypes.func.isRequired,
};

export default FacebookBtn;
