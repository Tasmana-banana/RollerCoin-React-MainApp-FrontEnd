import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import successEmailImg from "../../../../assets/img/profile/email_succes.gif";

import "../../../../assets/scss/Profile/SuccessEmail.scss";

const SuccessEmail = ({ onDoneHandler }) => {
	const { t } = useTranslation("Profile");
	return (
		<div className="email-success">
			<div>
				<img className="success-image m-auto" src={successEmailImg} alt="Success email" />
			</div>
			<h5 className="title-text mt-3">{t("success")}</h5>
			<p className="description-text">{t("emailVerifySuccess")}</p>
			<div className="mt-2 pl-3 pr-3 w-100">
				<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={onDoneHandler}>
					<span className="w-100 btn-padding">{t("done")}</span>
				</button>
			</div>
		</div>
	);
};

SuccessEmail.propTypes = {
	onDoneHandler: PropTypes.func.isRequired,
};

export default SuccessEmail;
