import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import fetchWithToken from "../fetchWithToken";

const useGrecaptcha = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isGrecaptchaError, setIsGrecaptchaError] = useState(false);
	const [isUncountableError, setIsUncountableError] = useState(false);
	const [isTooManyRequests, setIsTooManyRequests] = useState(false);
	const [captchaObjState, setCaptchaObjState] = useState();
	const [isCaptchaRequired, setIsCaptchaRequired] = useState(true);
	const [geetestSeccode, setGeetestSeccode] = useState("");
	const captchaRef = useRef(null);
	const controllers = {};
	const signals = {};
	const { t } = useTranslation("Registration");

	useEffect(async () => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getCaptchaStatus = async () => {
		if (captchaObjState) {
			captchaObjState.destroy();
		}
		setIsCaptchaRequired(true);
		setGeetestSeccode("");
		setIsLoading(true);
		createSignalAndController("getCaptchaStatus");
		try {
			const isCaptchaRequiredJSON = await fetchWithToken(`/api/game/captcha-auth-status`, {
				method: "GET",
				signal: signals.getCaptchaStatus,
			});
			if (isCaptchaRequiredJSON.status === 429) {
				return setIsTooManyRequests(true);
			}
			if (!isCaptchaRequiredJSON.success) {
				throw new Error(isCaptchaRequiredJSON.error);
			}
			if (!isCaptchaRequiredJSON.data.is_captcha_required) {
				setIsLoading(false);
				setIsCaptchaRequired(false);
				return null;
			}
			if (!window.initGeetest) {
				throw new Error("geetest not loaded");
			}
			window.initGeetest(
				{
					gt: isCaptchaRequiredJSON.data.geetest_key,
					product: "popup",
					lang: "en",
					challenge: isCaptchaRequiredJSON.data.captcha_code,
					offline: false,
					new_captcha: true,
				},
				(captchaObj) => geetestCallback(captchaObj)
			);
		} catch (e) {
			setIsLoading(false);
			setIsCaptchaRequired(false);
		}
	};

	const geetestCallback = async (captchaObj) => {
		captchaObj.appendTo(captchaRef.current);
		captchaObj.onReady(() => {
			setIsLoading(false);
			setCaptchaObjState(captchaObj);
		});
		captchaObj.onSuccess(async () => {
			const result = captchaObj.getValidate();
			if (!result) {
				toast(renderToast("Not valid data", "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
			setIsLoading(false);
			setIsGrecaptchaError(false);
			setGeetestSeccode(result ? result.geetest_seccode : "");
		});
		captchaObj.onError(() =>
			toast(renderToast(t("signUp.geetestError"), "error_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})
		);
	};

	const renderToast = (text, icon) => {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
				<span>{text}</span>
			</div>
		);
	};

	const isRecaptchaValid = () => {
		if (isCaptchaRequired && geetestSeccode.length < 3) {
			setIsGrecaptchaError(true);
		}
		return geetestSeccode.length > 3 || !isCaptchaRequired;
	};

	return {
		geetestSeccode,
		isCaptchaRequired,
		captchaRef,
		isLoading,
		setIsLoading,
		isGrecaptchaError,
		setIsGrecaptchaError,
		isUncountableError,
		isTooManyRequests,
		isRecaptchaValid,
		getCaptchaStatus,
		setIsUncountableError,
	};
};

export default useGrecaptcha;
