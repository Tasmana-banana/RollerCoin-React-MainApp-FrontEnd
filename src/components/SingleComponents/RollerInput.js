import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Field } from "react-final-form";
import validator from "validator";
import { useTranslation } from "react-i18next";

import "../../assets/scss/SingleComponents/RollerInput.scss";

const RollerInput = ({ label = "", placeholder = "", margin = 0, type = "text", name, id, className = "", minLength = 0, maxLength = 0, defaultValue = "", emailInputHandler }) => {
	const [currentType, setCurrentType] = useState(type);
	const { t } = useTranslation("Registration");

	const validateEmail = (inputValue = "") => {
		const isValid = validator.isEmail(inputValue);
		if (emailInputHandler) {
			emailInputHandler({ value: inputValue, isValid });
		}
		return validator.isEmail(inputValue) ? undefined : t("signUp.email");
	};

	const validatePassword = (inputValue = "") => {
		if (inputValue.length < 6 || inputValue.length > 30) {
			return t("signUp.passwordInvalid");
		}
		return undefined;
	};

	const toggleCurrentType = () => {
		setCurrentType(currentType === "text" ? "password" : "text");
	};

	return (
		<Fragment>
			{type === "password" && (
				<Field name={name} validate={validatePassword}>
					{({ input, meta }) => (
						<div className={`roller-input ${className}`}>
							{!!label && (
								<label htmlFor={id} className="input-label mgb-8">
									{label}
								</label>
							)}
							<div className={`input-group ${meta.touched && meta.error ? "danger" : ""}`}>
								<input
									{...input}
									className={`form-control input-password`}
									minLength={minLength}
									maxLength={maxLength}
									name={name}
									id={id}
									type={currentType}
									placeholder={placeholder}
								/>
								{type === "password" && (
									<div className="input-group-append">
										<span
											className="input-group-text toggle-pass"
											onClick={() => {
												toggleCurrentType();
											}}
										>
											{currentType === "password" && <img src="/static/img/autorize/show.svg" alt="show" className="pass-control-btn" id="showPassIco" />}
											{currentType === "text" && <img src="/static/img/autorize/hide.svg" alt="hide" className="pass-control-btn" id="hidePassIco" />}
										</span>
									</div>
								)}
							</div>
							{meta.touched && meta.error && <p className="danger-text wrong-mail-error error-text">{meta.error}</p>}
						</div>
					)}
				</Field>
			)}
			{type !== "password" && (
				<Field name={name} validate={validateEmail}>
					{({ input, meta }) => (
						<div className={`roller-input ${className}`}>
							<label htmlFor={name} className="auth-input-label mgb-8">
								{label}
							</label>
							<div className={`input-group ${meta.touched && meta.error ? "danger" : ""}`}>
								<input {...input} className="form-control" type={type} placeholder={placeholder} name={name} id={id} />
							</div>
							{meta.touched && meta.error && <p className="danger-text wrong-mail-error error-text">{type === "mail" ? t("logIn.emailError") : meta.error}</p>}
						</div>
					)}
				</Field>
			)}
		</Fragment>
	);
};

RollerInput.propTypes = {
	label: PropTypes.string,
	type: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	margin: PropTypes.number,
	className: PropTypes.string,
	id: PropTypes.string,
	minLength: PropTypes.number,
	maxLength: PropTypes.number,
	defaultValue: PropTypes.string,
	emailInputHandler: PropTypes.func,
};

export default RollerInput;
