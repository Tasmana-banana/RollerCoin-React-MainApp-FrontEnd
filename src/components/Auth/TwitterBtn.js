import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { BUTTON_AUTH_PROVIDER_EVENT } from "../../constants/SingleComponents";
import fetchWithToken from "../../services/fetchWithToken";
import abortTasks from "../../services/abortTasks";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import LoginBtn from "./LoginBtn";

import twitterLogo from "../../assets/img/icon/social/twitterXLogo.svg";

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

const TwitterBtn = ({ setIsShowErrorModal, setSocialProvider }) => {
	const [isLoading, setIsLoading] = useState(false);
	const abortFetch = abortTasks();
	const location = useLocation();
	const login = async () => {
		const { event, params } = BUTTON_AUTH_PROVIDER_EVENT.twitter;
		googleAnalyticsPush(event, params);
		try {
			abortFetch.create("twitter-request-token");
			setIsLoading(true);
			const json = await fetchWithToken("/api/auth/twitter-request-token", {
				method: "GET",
				signal: abortFetch.getSignal("twitter-request-token"),
			});
			setIsLoading(false);
			if (!json.success) {
				setIsShowErrorModal(true);
				setSocialProvider("twitter");
				return toast(renderToast(json.error ?? "Auth error! Something went wrong", "error_notice"), toastOptions);
			}

			window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${json.data.oauth_token}`;
			return true;
		} catch (e) {
			setIsLoading(false);
			setIsShowErrorModal(true);
			setSocialProvider("twitter");
			toast(renderToast("Something went wrong!", "error_notice"), toastOptions);
			return false;
		}
	};

	useEffect(() => {
		(async () => {
			try {
				const query = new URLSearchParams(location.search);
				const oauthToken = query.get("oauth_token");
				const oauthVerifier = query.get("oauth_verifier");

				if (!oauthToken || !oauthVerifier) {
					return null;
				}
				abortFetch.create("twitter");
				setIsLoading(true);
				const json = await fetchWithToken(`/api/auth/twitter`, {
					method: "POST",
					body: JSON.stringify({ oauth_token: oauthToken, oauth_verifier: oauthVerifier }),
					signal: abortFetch.getSignal("twitter"),
				});
				setIsLoading(false);
				if (!json.success) {
					return toast(renderToast(json.error ?? "Something went wrong", "error_notice"), toastOptions);
				}
				localStorage.setItem("token", json.data.token);
				if (json.data.redirectPage.includes("sign-in")) {
					const queryObject = new URLSearchParams({ email: json.data.email, social_context: json.data.social_context, provider: "twitter" });
					window.location.href = `${json.data.redirectPage}?${queryObject.toString()}`;
					return null;
				}
				window.location.href = json.data.redirectPage;
			} catch (e) {
				setIsLoading(false);
				console.error(e);
			}
		})();
		return () => abortFetch.abortAll();
	}, []);

	return <LoginBtn className={"twitter"} text="Twitter" logo={twitterLogo} onClick={login} isLoading={isLoading} />;
};

TwitterBtn.propTypes = {
	setIsShowErrorModal: PropTypes.func.isRequired,
	setSocialProvider: PropTypes.func.isRequired,
};

export default TwitterBtn;
