import React, { useEffect, useState } from "react";
import { Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import validator from "validator";
import ModalActionButtons from "../ModalActionButtons";
import fetchWithToken from "../../../../services/fetchWithToken";

import "../../../../assets/scss/Profile/OneInputModal.scss";

const EntryEmail = ({ email, setEmail, onCancelHandler, nextModalStep }) => {
	const { t } = useTranslation("Profile");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const controller = new AbortController();
	const { signal } = controller;

	const validateInput = (inputValue) => {
		if (RegExp(/ /g).test(inputValue)) {
			return t("spaceInPass");
		}
		return "";
	};

	const onBlurHandler = () => {
		if (!email) {
			setError(t("emailRequired"));
		}
	};

	const onChangeHandler = (inputValue) => {
		const trimmedValue = inputValue.trim();
		setEmail(trimmedValue);
		setError(validateInput(trimmedValue));
	};

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		if (!validator.isEmail(email)) {
			return setError(t("invalidEmail"));
		}
		setIsLoading(true);
		try {
			const response = await fetchWithToken("/api/profile/add-email-validate", {
				signal,
				method: "POST",
				body: JSON.stringify({ email }),
			});
			if (!response.success) {
				setError(response.error);
				setIsLoading(false);
				return false;
			}
			nextModalStep(response.data.time_to_next_try);
		} catch (e) {
			setIsLoading(false);
			console.error(e);
		}
	};

	const abortFetch = () => controller.abort();

	useEffect(() => abortFetch, []);

	return (
		<Form onSubmit={onSubmitHandler} className="one-input-modal-wrapper">
			<FormGroup className={error ? "error" : ""}>
				<Label for="setEmail">{t("enterYouEmail")}</Label>
				<Input invalid={!!error} type="email" id="setEmail" onBlur={onBlurHandler} onChange={(event) => onChangeHandler(event.target.value)} value={email} />
				<FormFeedback>{error}</FormFeedback>
			</FormGroup>
			<ModalActionButtons isSubmitDisable={isLoading} onCancelHandler={onCancelHandler} />
		</Form>
	);
};

EntryEmail.propTypes = {
	email: PropTypes.string.isRequired,
	setEmail: PropTypes.func.isRequired,
	onCancelHandler: PropTypes.func.isRequired,
	nextModalStep: PropTypes.func.isRequired,
};

export default EntryEmail;
