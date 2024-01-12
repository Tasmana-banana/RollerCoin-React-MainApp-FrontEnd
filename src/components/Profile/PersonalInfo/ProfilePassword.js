import React, { Fragment, useState } from "react";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ProfileCard from "../ProfileCard";
import ChangePasswordModal from "./ChangePasswordModal";
import calcAge from "../../../services/calcAge";

import lockIconImg from "../../../assets/img/profile/lock.svg";

import "../../../assets/scss/Profile/ProfilePassword.scss";

const ProfilePassword = ({ lastPasswordChange, setLastPasswordChange }) => {
	const [isOpenModal, setIsOpenModal] = useState(false);
	const userInfo = useSelector((state) => state.user);
	const [body2FA, setBody2FA] = useState({
		code_id: "",
		new_password: "",
		old_password: "",
	});
	const [isShowModal2FA, setIsShowModal2FA] = useState(false);
	const { t } = useTranslation("Profile");

	const { email } = userInfo;

	const toggleModal = () => setIsOpenModal(!isOpenModal);

	const setBody2FaHandler = (body) => {
		setBody2FA(body);
	};

	const toggle2FaModal = () => {
		setIsShowModal2FA(!isShowModal2FA);
	};

	return (
		<Fragment>
			<Row className="profile-password">
				<Col xs={12}>
					<div className="separate-line" />
					<ProfileCard titleIcon={lockIconImg} title={t("password")}>
						<div className="d-flex align-items-center justify-content-between">
							{!lastPasswordChange && ""}
							{!!lastPasswordChange && (
								<Fragment>
									<p>{`${t("updated")} ${calcAge(lastPasswordChange, true)} ${t("ago")}`}</p>
									<button className="btn-link-style" onClick={toggleModal}>
										<span className="link-text">{t("change")}</span>
									</button>
								</Fragment>
							)}
						</div>
					</ProfileCard>
				</Col>
			</Row>
			<ChangePasswordModal isOpen={isOpenModal} toggleModal={toggleModal} setLastPasswordChange={setLastPasswordChange} setBody2FaHandler={setBody2FaHandler} toggle2FaModal={toggle2FaModal} />
		</Fragment>
	);
};

ProfilePassword.propTypes = {
	lastPasswordChange: PropTypes.oneOfType([null, PropTypes.string]).isRequired,
	setLastPasswordChange: PropTypes.func.isRequired,
};

export default ProfilePassword;
