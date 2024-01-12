import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, FormGroup } from "reactstrap";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ProfileModal from "./ProfileModal";
import PasswordInput from "./PasswordInput";
import ModalActionButtons from "./ModalActionButtons";
import fetchWithToken from "../../../services/fetchWithToken";

import "../../../assets/scss/Profile/ChangePasswordModal.scss";

import cartSuccessIcon from "../../../assets/img/icon/cart_successfully_notice.svg";

class ChangePasswordModal extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		isOpen: PropTypes.bool.isRequired,
		toggleModal: PropTypes.func.isRequired,
		setLastPasswordChange: PropTypes.func.isRequired,
		setBody2FaHandler: PropTypes.func.isRequired,
		toggle2FaModal: PropTypes.func.isRequired,
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	constructor(props) {
		super(props);
		this.defaultState = {
			oldPassword: {
				value: "",
				error: "",
			},
			newPassword: {
				value: "",
				error: "",
			},
			confirmPassword: {
				value: "",
				error: "",
			},
			apiError: "",
			isLoading: false,
		};
		this.state = { ...this.defaultState };
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	passwordLengthValidation = (value) => {
		const { t } = this.props;
		if (value.length < 6) {
			return t("least6");
		}
		if (value.length > 32) {
			return t("least32");
		}
		if (RegExp(/ /g).test(value)) {
			return t("spaceInPass");
		}
		return "";
	};

	checkIsAllValid = () =>
		Object.keys(this.state)
			.filter((key) => key.endsWith("Password"))
			.every((key) => !this.state[key].error);

	setErrorsIfEmptyInputs = () => {
		const { t } = this.props;
		const newState = Object.keys(this.state)
			.filter((key) => key.endsWith("Password"))
			.reduce((acc, key) => {
				if (!this.state[key].value) {
					acc[key] = { ...this.state[key], error: t("passwordRequired") };
				}
				return acc;
			}, {});
		this.setState({ ...this.state, ...newState });
	};

	onChangeHandler = (value, inputStateName) => {
		const trimmedValue = value.trim();
		this.setState({ [inputStateName]: { value, error: this.passwordLengthValidation(trimmedValue, inputStateName) } });
	};

	onBlurHandler = (inputStateName) => {
		const { t } = this.props;
		if (!this.state[inputStateName].value) {
			this.setState({ [inputStateName]: { ...this.state[inputStateName], error: t("passwordRequired") } });
		}
	};

	onCloseHandler = () => {
		const { toggleModal } = this.props;
		this.setState({ ...this.defaultState });
		toggleModal();
	};

	beforeSendValidation = () => {
		const { t } = this.props;
		const { oldPassword, newPassword, confirmPassword } = this.state;
		if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
			this.setErrorsIfEmptyInputs();
			return false;
		}
		if (oldPassword.value === newPassword.value) {
			this.setState({
				newPassword: { ...newPassword, error: t("samePass") },
				oldPassword: { ...oldPassword, error: t("samePass") },
			});
			return false;
		}
		if (newPassword.value !== confirmPassword.value) {
			this.setState({
				newPassword: { ...newPassword, error: t("notMatch") },
				confirmPassword: { ...confirmPassword, error: t("notMatch") },
			});
			return false;
		}
		this.setState({
			oldPassword: { ...oldPassword, error: "" },
			newPassword: { ...newPassword, error: "" },
			confirmPassword: { ...confirmPassword, error: "" },
		});
		return true;
	};

	closeModalHandler = () => {
		const { isShowModal } = this.state;
		this.setState({
			isShowModal: !isShowModal,
		});
	};

	submitForm = async (e) => {
		e.preventDefault();
		const { oldPassword, newPassword } = this.state;
		const { setLastPasswordChange, setBody2FaHandler, toggle2FaModal } = this.props;

		const isAllValid = this.beforeSendValidation();
		if (!isAllValid) {
			return false;
		}
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken("/api/auth/change-password", {
				method: "POST",
				signal: this.signal,
				body: JSON.stringify({
					old_password: oldPassword.value,
					new_password: newPassword.value,
				}),
			});
			if (!json.success) {
				return this.setState({ apiError: json.error, isLoading: false });
			}
			setBody2FaHandler({ old_password: oldPassword.value, new_password: newPassword.value, code_id: json.data.confirm_code_id });
			this.setState({ ...this.defaultState });
			setLastPasswordChange();
			this.onCloseHandler();
			toggle2FaModal();
		} catch (error) {
			console.error(error);
		}
	};

	render() {
		const { t, isOpen } = this.props;
		const { confirmPassword, oldPassword, newPassword, apiError, isLoading } = this.state;
		return (
			<ProfileModal toggleModal={this.onCloseHandler} isOpen={isOpen} titleText={t("changePassword")}>
				<Form onSubmit={this.submitForm} className="change-password-modal">
					<FormGroup>
						<PasswordInput
							key="oldPassword"
							id="oldPassword"
							label={t("oldPass")}
							error={oldPassword.error}
							onChangeHandler={this.onChangeHandler}
							onBlurHandler={this.onBlurHandler}
							value={oldPassword.value}
						/>
					</FormGroup>
					<FormGroup>
						<PasswordInput
							key="newPassword"
							id="newPassword"
							label={t("newPass")}
							error={newPassword.error}
							onChangeHandler={this.onChangeHandler}
							onBlurHandler={this.onBlurHandler}
							value={newPassword.value}
						/>
					</FormGroup>
					<FormGroup className={apiError ? "p-with-api-error" : "p-without-api-error"}>
						<PasswordInput
							key="confirmPassword"
							id="confirmPassword"
							label={t("confirmPass")}
							error={confirmPassword.error}
							onChangeHandler={this.onChangeHandler}
							onBlurHandler={this.onBlurHandler}
							value={confirmPassword.value}
						/>
					</FormGroup>
					{apiError && <p className="api-error">{apiError}!</p>}
					<ModalActionButtons isSubmitDisable={isLoading} onCancelHandler={this.onCloseHandler} />
				</Form>
			</ProfileModal>
		);
	}
}

export default withTranslation("Profile")(ChangePasswordModal);
