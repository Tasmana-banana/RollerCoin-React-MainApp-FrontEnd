import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Col, Form, FormFeedback, FormGroup, Input, Label, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import ModalActionButtons from "../ModalActionButtons";
import fetchWithToken from "../../../../services/fetchWithToken";

import "../../../../assets/scss/Profile/EntryEmailCode.scss";

import successIconImg from "../../../../assets/img/profile/success.svg";

const CODE_COUNT = 6;

const EntryEmailCode = ({ email, timeToRetry, onCancelHandler, nextModalStep, setNewEmail }) => {
	const { t } = useTranslation("Profile");
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [timer, setTimer] = useState(0);
	const [disableButton, setDisableButton] = useState(false);
	const timerInterval = useRef();

	const controller = new AbortController();
	const { signal } = controller;

	const onChangeHandler = (value) => {
		if (RegExp("^[0-9]*$").test(value) && value.length <= 6) {
			setCode(value);
		}
	};

	const resentCodeHandler = async () => {
		setDisableButton(true);
		try {
			const response = await fetchWithToken("/api/profile/add-email-validate", {
				signal,
				method: "POST",
				body: JSON.stringify({ email }),
			});
			if (!response.success) {
				setError(response.error);
				setDisableButton(false);
				return false;
			}
			setTimer(Math.round((response.data.time_to_next_try - Date.now()) / 1000));
			setDisableButton(false);
		} catch (e) {
			setDisableButton(false);
			console.error(e);
		}
	};

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		if (code.length !== CODE_COUNT) {
			return setError(t("invalidCodeLength"));
		}
		setIsLoading(true);
		try {
			const response = await fetchWithToken("/api/profile/add-email-validate-code", {
				signal,
				method: "POST",
				body: JSON.stringify({ code }),
			});
			if (!response.success) {
				setIsLoading(false);
				setError(response.error);
				return false;
			}
			setIsLoading(false);
			setNewEmail(email);
			nextModalStep();
		} catch (e) {
			setIsLoading(false);
			console.error(e);
		}
	};

	useEffect(() => {
		setTimer(Math.round((timeToRetry - Date.now()) / 1000));
		timerInterval.current = setInterval(() => setTimer((time) => time - 1), 1000);
		return () => {
			controller.abort();
			clearInterval(timerInterval.current);
		};
	}, []);

	useEffect(() => {
		if (timeToRetry <= 0) {
			clearInterval(timerInterval.current);
		}
	}, [timeToRetry]);

	return (
		<div className="entry-email-code">
			<Row noGutters={true}>
				<Col xs={2}>
					<img src={successIconImg} alt="Success icon" />
				</Col>
				<Col xs={10} className="info-text-wrapper d-flex align-items-center">
					<p className="m-0">We sent you an email. Please enter your verification code below</p>
				</Col>
			</Row>
			<Form onSubmit={onSubmitHandler} className="mt-4">
				<FormGroup className={error ? "error" : ""}>
					<Label for="setEmail">{t("enterYouEmail")}</Label>
					<Input
						className="confirm-code-input"
						invalid={!!error}
						type="text"
						id="setEmail"
						onChange={(event) => onChangeHandler(event.target.value)}
						value={code}
						autoFocus={true}
						autoComplete="off"
						placeholder="______"
					/>
					<FormFeedback>{error}</FormFeedback>
				</FormGroup>
				<div className="d-flex align-items-center mb-3">
					<p className="mb-0 mr-1">{t("didntGetAnEmail")}</p>
					{timer > 0 && <span>{`${t("tryAgain")} ${timer} ${t("sec")}`}</span>}
					{timer <= 0 && (
						<button className="btn-link-style" onClick={resentCodeHandler} type="button" disabled={disableButton}>
							<span className="link-text">{t("resendAgain")}</span>
						</button>
					)}
				</div>
				<ModalActionButtons isSubmitDisable={isLoading} onCancelHandler={onCancelHandler} />
			</Form>
		</div>
	);
};

EntryEmailCode.propTypes = {
	email: PropTypes.string.isRequired,
	onCancelHandler: PropTypes.func.isRequired,
	nextModalStep: PropTypes.func.isRequired,
	setNewEmail: PropTypes.func.isRequired,
	timeToRetry: PropTypes.number.isRequired,
};

export default EntryEmailCode;
