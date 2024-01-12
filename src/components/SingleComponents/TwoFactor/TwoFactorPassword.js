import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { FormGroup } from "reactstrap";
import PasswordInput from "../../Profile/PersonalInfo/PasswordInput";

const TwoFactorPassword = ({ passwordInputHandler, password }) => {
	const passwordLengthValidation = (value) => {
		if (value.length < 6) {
			return "Please enter at least 6 characters";
		}
		if (value.length > 32) {
			return "Please enter 32 characters or less";
		}
		if (RegExp(/ /g).test(value)) {
			return "Cannot use space in the password";
		}
		return "";
	};

	const onBlurHandler = (inputStateName) => {
		if (!password[inputStateName].value) {
			passwordInputHandler({ ...password, [inputStateName]: { ...password[inputStateName], error: "Password is required" } });
		}
	};

	const onChangePasswordHandler = (value, inputStateName) => {
		const trimmedValue = value.trim();
		passwordInputHandler({ ...password, [inputStateName]: { value, error: passwordLengthValidation(trimmedValue, inputStateName) } });
	};

	return (
		<Fragment>
			<hr className="hr-2fa" />
			<FormGroup>
				<PasswordInput
					key="newPassword"
					className="twofactor-input"
					id="newPassword"
					label="new password"
					error={password.newPassword.error}
					onChangeHandler={onChangePasswordHandler}
					onBlurHandler={onBlurHandler}
					value={password.newPassword.value}
				/>
			</FormGroup>
			<FormGroup>
				<PasswordInput
					key="confirmPassword"
					className="twofactor-input"
					id="confirmPassword"
					label="Confirm password"
					error={password.confirmPassword.error}
					onChangeHandler={onChangePasswordHandler}
					onBlurHandler={onBlurHandler}
					value={password.confirmPassword.value}
				/>
			</FormGroup>
		</Fragment>
	);
};

TwoFactorPassword.propTypes = {
	passwordInputHandler: PropTypes.func.isRequired,
	password: PropTypes.object.isRequired,
	passwordValidHandler: PropTypes.func,
};

export default TwoFactorPassword;
