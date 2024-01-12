import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Label, Input, UncontrolledTooltip } from "reactstrap";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import fetchWithToken from "../../services/fetchWithToken";
import { initTimer, makeCounterData } from "../../services/countdownТimer";

import "../../assets/scss/SignInUp.scss";

import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";

const VerificationCodeInput = ({ confirmData, setConfirmData, errorMessage, setErrorMessage }) => {
	const history = useHistory();
	const [isTooManyRequests, setIsTooManyRequests] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [viewTime, setViewTime] = useState("0");
	const timer = useRef(null);
	const controllers = {};
	const signals = {};
	const { t } = useTranslation("Registration");

	useEffect(async () => {
		clearInterval(timer.current);
		startTimer(dayjs().add(60, "s"));
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
			clearInterval(timer.current);
		}
		const time = makeCounterData(timeLeftSeconds);

		setViewTime(time.seconds.replace("s", ""));
	}, [timeLeftSeconds]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const renderToast = (text, icon) => {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
				<span>{text}</span>
			</div>
		);
	};

	const codeInputHandler = (e) => {
		setErrorMessage("");
		setConfirmData({ ...confirmData, codeInput: e.target.value.replace(/\D/, "") });
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

	const postResendCode = async () => {
		createSignalAndController("resend2FaCode");
		const body = { prev_code_id: confirmData.codeId };
		try {
			const json = await fetchWithToken("/api/auth/resend-auth-code", {
				method: "POST",
				signal: signals.resendAuthCode,
				body: JSON.stringify(body),
			});

			if (!json.success) {
				toast(renderToast(json.error, "error_notice"));
				if (json.status === 429 || json.error === "Too many input attempts") {
					setIsTooManyRequests(true);
				}
				if (json.error === "You are blocked to refresh confirm code") {
					setIsBlocked(true);
				}
				return false;
			}
			const { search, pathname } = history.location;
			let params = new URLSearchParams(search);
			params.set("codeId", json.data.confirm_code_id);
			history.push(`${pathname}?${params.toString()}`);
			setIsTooManyRequests(false);
			setConfirmData({ ...confirmData, codeId: json.data.confirm_code_id, codeInput: "" });
			toast(renderToast(t("signUp.codeSent"), "success_notice"));
		} catch (err) {
			console.error(err);
		}
	};

	const resendCodeHandler = async () => {
		startTimer(dayjs().add(60, "s"));
		await postResendCode();
	};

	return (
		<Fragment>
			<div className="confirm-input-block input-wrapper w-100">
				<Label for="verification-code" className="input-label">
					Code
				</Label>
				<Input
					className={`confirm-input ${errorMessage ? "invalid-code" : ""}`}
					type="tel"
					id="verification-code"
					maxLength={6}
					minLength={6}
					value={confirmData.codeInput}
					onChange={(e) => codeInputHandler(e)}
					autoFocus={true}
				/>
				<div className="resend-block">
					{timeLeftSeconds <= 0 && (
						<button onClick={resendCodeHandler} className="resend-btn">
							{t("restorePass.resendCode")}
						</button>
					)}
					{timeLeftSeconds > 0 && (
						<div className="resend-timer">
							<span>
								{t("restorePass.codeSent")} ({viewTime})
							</span>{" "}
							<img id="infoIconTooltip" src={infoTooltipImg} alt="Info icon" width="15" height="15" />
							<UncontrolledTooltip className="confirm-tooltip" placement="top" autohide={true} target="infoIconTooltip">
								{t("restorePass.tooltipHint")}
							</UncontrolledTooltip>
						</div>
					)}
				</div>
			</div>
			{isTooManyRequests && <p className="error-message-text">{t("logIn.tooManyReq")}</p>}
			{isBlocked && <p className="error-message-text">{t("logIn.blocked")}</p>}
		</Fragment>
	);
};

VerificationCodeInput.propTypes = {
	confirmData: PropTypes.object.isRequired,
	setConfirmData: PropTypes.func.isRequired,
	setErrorMessage: PropTypes.string.isRequired,
	errorMessage: PropTypes.string.isRequired,
};
export default VerificationCodeInput;
