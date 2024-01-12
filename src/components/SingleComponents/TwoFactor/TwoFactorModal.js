import React, { useState, useEffect, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { Modal, ModalBody, Input, Label, UncontrolledTooltip } from "reactstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import RollerButton from "../RollerButton";
import fetchWithToken from "../../../services/fetchWithToken";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";
import { POST_TYPE_AUTH, TYPE_AUTH_API_CONFIRM_CODE, AUTH_MODAL_TEXTS } from "../../../constants/SingleComponents";

import "../../../assets/scss/SingleComponents/TwoFactorModal.scss";

import infoTooltipImg from "../../../assets/img/storage/info_icon_round.svg";
import mailHamsterImg from "../../../assets/img/autorize/mail_hamster.png";

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
		<span>{text}</span>
	</div>
);

const TwoFactorModal = ({ isShowModal, type, email, closeModalHandler, is2faEnabled, body2FA, statusTwoFactorHandler, setUpdateHistorySuccess }) => {
	const [codeInput, setCodeInput] = useState("");
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [viewTime, setViewTime] = useState("0");
	const [isLoading, setIsLoading] = useState(false);
	const [invalidCode, setInvalidCode] = useState(false);
	const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
	const [password, setPassword] = useState({
		newPassword: {
			value: "",
			error: "",
		},
		confirmPassword: {
			value: "",
			error: "",
		},
	});
	const timer = useRef(null);
	const signals = {};
	const controllers = {};
	const { t } = useTranslation("Registration");

	const toastMessageConstructor = () => {
		if (type === POST_TYPE_AUTH.ACTIVATE_2FA) {
			return !is2faEnabled ? "Two-factor Authentication succesffully enabled!" : "Two-factor Authentication succesffully disabled!";
		}
		if (type === POST_TYPE_AUTH.WITHDRAW) {
			return "Your withdrawal request is accepted.";
		}
	};

	useEffect(async () => {
		clearInterval(timer.current);
		startTimer(dayjs().add(60, "s"));
	}, []);

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
		}
		const time = makeCounterData(timeLeftSeconds);

		setViewTime(time.seconds.replace("s", ""));
	}, [timeLeftSeconds]);

	const startTimer = (leftDate) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(leftDate));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const postSetCodeConfirm = async () => {
		let body = { ...body2FA, code: codeInput };
		setIsLoading(true);
		createSignalAndController("setCodeConfirm");
		try {
			const json = await fetchWithToken(TYPE_AUTH_API_CONFIRM_CODE[type], {
				method: "POST",
				body: JSON.stringify(body),
				signal: signals.setCodeConfirm,
			});

			if (!json.success) {
				setInvalidCode(true);
				return false;
			}
			if (json.data?.token) {
				localStorage.setItem("token", json.data.token);
				window.location.href = json.data.redirectPage;
				return false;
			}
			toast(renderToast(toastMessageConstructor(), "success_notice"));
			if (type === POST_TYPE_AUTH.ACTIVATE_2FA && statusTwoFactorHandler) {
				statusTwoFactorHandler(!is2faEnabled);
			}
			if (type === POST_TYPE_AUTH.RESET_PASSWORD) {
				setTimeout(() => {
					window.location.href = "sign-in";
				}, 1500);
			}
			if (type === POST_TYPE_AUTH.WITHDRAW) {
				setUpdateHistorySuccess();
			}
			closeModal();
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const postResend2FaCode = async () => {
		createSignalAndController("resend2FaCode");
		const { code_id: prevCodeId } = body2FA;
		try {
			const json = await fetchWithToken("/api/auth/resend-auth-code", {
				method: "POST",
				signal: signals.resendAuthCode,
				body: JSON.stringify({ mail: email, prev_code_id: prevCodeId, type }),
			});

			if (!json.success) {
				toast(renderToast(json.error, "error_notice"));
				return false;
			}
			body2FA.code_id = json.data.confirm_code_id;
			toast(renderToast("Code successfully sent to your email!", "success_notice"));
		} catch (err) {
			console.error(err);
		}
	};

	const submitHandler = async () => {
		await postSetCodeConfirm();
	};

	const codeInputHandler = (e) => {
		setInvalidCode(false);
		setCodeInput(e.target.value.replace(/\D/, ""));
	};

	const closeModal = () => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		closeModalHandler(false);
	};

	const passwordInputHandler = (value) => {
		setPassword(value);
	};

	const setErrorsIfEmptyInputs = () => {
		const newState = Object.keys(password)
			.filter((key) => key.endsWith("Password"))
			.reduce((acc, key) => {
				if (!password[key].value) {
					acc[key] = { ...password[key], error: "Password is required" };
				}
				return acc;
			}, {});
		setPassword({ ...password, ...newState });
	};

	const beforeSendValidation = () => {
		const { newPassword, confirmPassword } = password;
		if (!password.newPassword.value || !password.confirmPassword.value) {
			setErrorsIfEmptyInputs();
			return false;
		}
		if (newPassword.value !== confirmPassword.value) {
			setPassword({
				newPassword: { ...newPassword, error: "The password and its confirmation do not match" },
				confirmPassword: { ...confirmPassword, error: "The password and its confirmation do not match" },
			});
			return false;
		}
		setPassword({
			newPassword: { ...newPassword, error: "" },
			confirmPassword: { ...confirmPassword, error: "" },
		});
		return true;
	};

	const protectEmail = (userEmail) => {
		const splitted = userEmail.split("@");
		let part1 = splitted[0];
		let part2 = splitted[1].split(".")[0];
		let part3 = splitted[1].split(/\.(.*)/g, 2)[1];
		const avg = part1.length - 2;
		const avg2 = part2.length - 2;
		const protect = "*";
		part1 = part1.substring(0, part1.length - avg);
		part2 = part2.substring(0, part2.length - avg2);

		const protectAsterisk = (val) => {
			let protectString = "";
			for (let i = 0; i < val; i++) {
				protectString += protect;
			}
			return protectString;
		};
		return `${part1}${protectAsterisk(avg)}@${part2}${protectAsterisk(avg2)}.${part3}`;
	};

	const resendCodeHandler = async () => {
		startTimer(dayjs().add(60, "s"));
		await postResend2FaCode();
	};

	const openInfoModalHandler = () => {
		setIsOpenInfoModal(!isOpenInfoModal);
	};

	return (
		<Fragment>
			{isOpenInfoModal && (
				<Modal isOpen={isOpenInfoModal} className="confirm-modal" centered>
					<ModalBody>
						<div className="img-block">
							<img src={mailHamsterImg} width={95} height={72} alt="hamster_and_mailman" />
						</div>
						<h2 className="modal-title">{t("restorePass.emailVerification")}</h2>
						<div className="modal-text-block">
							<p className="modal-text">{t("restorePass.codeHasBeenSent")}</p>
							<ol className="modal-ol">
								<li className="modal-li">{t("restorePass.checkSpam")}</li>
								<li className="modal-li">
									{t("restorePass.makeSure")} {protectEmail(email)}
								</li>
								<li className="modal-li">{t("restorePass.fewMinutes")}</li>
								<li className="modal-li">{t("restorePass.setupWhitelist")}</li>
								<li>{t("restorePass.checkIfUse")}</li>
							</ol>
						</div>
						<RollerButton className="modal-btn" color="cyan" text="Ok" action={openInfoModalHandler} />
					</ModalBody>
				</Modal>
			)}
			<Modal isOpen={isShowModal} centered className="twofactor-modal">
				<ModalBody className="twofactor-modal-body">
					<h2 className="twofactor-title">{AUTH_MODAL_TEXTS[type].title}</h2>
					<div className="twofactor-text">
						{type === "activate_2fa" && is2faEnabled ? (
							<p>{t("restorePass.enterTheCode")}</p>
						) : (
							<>
								<p className="mb-1">
									{AUTH_MODAL_TEXTS[type].description} <span>{protectEmail(email)}</span>
								</p>
								<p>{AUTH_MODAL_TEXTS[type].description2 ? AUTH_MODAL_TEXTS[type].description2 : ""}</p>
							</>
						)}
					</div>
					<div className="confirm-input-block input-wrapper w-100">
						<Fragment>
							<Label for="verification-code" className="input-label">
								{t("restorePass.emailVerificationCode")}
							</Label>
							<Input
								className={`confirm-input ${invalidCode ? "invalid-code" : ""}`}
								type="tel"
								id="twofactor-code"
								maxLength={6}
								minLength={6}
								value={codeInput}
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
						</Fragment>
					</div>
					{invalidCode && <span className="error-message-text">{t("restorePass.invalidCode")}</span>}
					<div className="twofactor-btn-block">
						<RollerButton
							className="twofactor-button"
							disabled={codeInput.length < 6 || isLoading || invalidCode}
							isLoading={isLoading}
							text="Submit"
							color="cyan"
							action={() => submitHandler()}
						/>
						<RollerButton className="twofactor-button" text="Cancel" color="default" action={() => closeModal()} />
					</div>
					<button className="receive-btn" onClick={openInfoModalHandler}>
						{t("restorePass.didntReceive")}
					</button>
				</ModalBody>
			</Modal>
		</Fragment>
	);
};

TwoFactorModal.propTypes = {
	isShowModal: PropTypes.bool.isRequired,
	closeModalHandler: PropTypes.func.isRequired,
	is2faEnabled: PropTypes.bool.isRequired,
	statusTwoFactorHandler: PropTypes.func,
	email: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	body2FA: PropTypes.object.isRequired,
	setUpdateHistorySuccess: PropTypes.func,
};

export default TwoFactorModal;
