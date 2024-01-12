import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { BUTTON_AUTH_PROVIDER_EVENT } from "../../constants/SingleComponents";
import fetchWithToken from "../../services/fetchWithToken";
import abortTasks from "../../services/abortTasks";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import LoginBtn from "./LoginBtn";

import googleLogo from "../../assets/img/icon/social/googleLogo.svg";

const toastOptions = {
	position: "top-left",
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};
const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
		<span>{text}</span>
	</div>
);
const GoogleBtnLogic = () => {
	const [isLoading, setIsLoading] = useState(false);
	const abortFetch = abortTasks();

	useEffect(() => {
		return () => abortFetch.abortAll();
	}, []);
	const googleAuthSuccess = async (response) => {
		try {
			if (!response.access_token) {
				return toast(renderToast("Auth error! Google empty response", "error_notice"), toastOptions);
			}
			abortFetch.create("google");
			setIsLoading(true);
			const json = await fetchWithToken(`/api/auth/google`, {
				method: "POST",
				body: JSON.stringify({ access_token: response.access_token }),
				signal: abortFetch.getSignal("google"),
			});
			setIsLoading(false);
			if (!json.success) {
				return toast(renderToast(json.error ?? "Something went wrong", "error_notice"), toastOptions);
			}
			localStorage.setItem("token", json.data.token);
			if (json.data.redirectPage.includes("sign-in")) {
				const queryObject = new URLSearchParams({ email: json.data.email, social_context: json.data.social_context, provider: "google" });
				window.location.href = `${json.data.redirectPage}?${queryObject.toString()}`;
				return null;
			}
			window.location.href = json.data.redirectPage;
		} catch (e) {
			setIsLoading(false);
			console.error(e);
		}
	};

	const login = useGoogleLogin({
		onSuccess: googleAuthSuccess,
		flow: "implicit",
	});

	const buttonClickHandler = () => {
		const { event, params } = BUTTON_AUTH_PROVIDER_EVENT.google;
		googleAnalyticsPush(event, params);
		login();
	};

	return <LoginBtn className={"google"} onClick={buttonClickHandler} text="Log in With Google" logo={googleLogo} isLoading={isLoading} />;
};

const GoogleBtn = () => (
	<GoogleOAuthProvider clientId={process.env.GOOGLE_OAUTH_CLIENT_ID}>
		<GoogleBtnLogic />
	</GoogleOAuthProvider>
);
export default GoogleBtn;
