import React, { Fragment, useState } from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ProfileCard from "../ProfileCard";
import AddEmailModal from "./AddEmailModal";

import emailIconImg from "../../../assets/img/profile/envelope.svg";

const ProfileEmail = ({ email, setNewEmail, toggleModal, isOpenModal }) => {
	const { t } = useTranslation("Profile");

	return (
		<Fragment>
			<Row className="profile-email mt-3">
				<Col xs={12}>
					<ProfileCard titleIcon={emailIconImg} title={t("email")}>
						<div className="d-flex align-items-center justify-content-between">
							{email === null && ""}
							{typeof email === "string" && !!email && <p>{email}</p>}
							{typeof email === "string" && !email && (
								<Fragment>
									<p>{t("notStated")}</p>
									<button className="btn-link-style" onClick={toggleModal}>
										<span className="link-text">{t("add")}</span>
									</button>
								</Fragment>
							)}
						</div>
					</ProfileCard>
				</Col>
			</Row>
			<AddEmailModal isOpen={isOpenModal} toggleModal={toggleModal} setNewEmail={setNewEmail} />
		</Fragment>
	);
};

ProfileEmail.propTypes = {
	email: PropTypes.oneOfType([null, PropTypes.string]).isRequired,
	setNewEmail: PropTypes.func.isRequired,
	toggleModal: PropTypes.func.isRequired,
	isOpenModal: PropTypes.bool.isRequired,
};

export default ProfileEmail;
