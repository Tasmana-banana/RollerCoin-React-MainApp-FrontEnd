import React, { Fragment, useState } from "react";
import { Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import EditNameModal from "./EditNameModal";
import calcAge from "../../../services/calcAge";
import formattedProfileDate from "../../../services/formattedProfileDate";

import "../../../assets/scss/Profile/ProfileDetailsInfo.scss";

import penIconImg from "../../../assets/img/profile/pen.svg";

const ProfileDetailsInfo = ({ userID, fullName, gender, registrationDate, avatarVersion }) => {
	const [isOpenModal, setIsOpenModal] = useState(false);
	const { t } = useTranslation("Profile");

	const toggleModal = () => setIsOpenModal(!isOpenModal);

	return (
		<Fragment>
			<Row className="profile-details-info">
				<Col xs={4}>
					<div className="avatar-image-wrapper">
						<img className="avatar-img" src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/83/${userID}.png?v=${avatarVersion}`} alt="avatar" />
					</div>
				</Col>
				<Col xs={8}>
					<div className="user-info-wrapper d-flex flex-column justify-content-between h-100">
						<p className="label">{t("name")}:</p>
						<Row noGutters={true} className="align-items-center">
							<Col xs={9}>
								<p className="text name">{fullName}</p>
							</Col>
							<Col xs={3} className="d-flex justify-content-end">
								<button className="tree-dimensional-button btn-default" onClick={toggleModal}>
									<span className="edit-name-btn">
										<img src={penIconImg} width="16" height="17" alt="pen" />
									</span>
								</button>
							</Col>
						</Row>
						<div className="user-info">
							<p className="label">{t("gender")}:</p>
							<p className="text">{gender}</p>
						</div>
						<div className="user-info">
							<p className="label">{t("registration")}:</p>
							<p className="text">{formattedProfileDate(registrationDate)}</p>
						</div>
						<div className="user-info">
							<p className="label">{t("characterAge")}:</p>
							<p className="text">{calcAge(registrationDate)}</p>
						</div>
					</div>
				</Col>
			</Row>
			<EditNameModal isOpen={isOpenModal} toggleModal={toggleModal} />
		</Fragment>
	);
};

ProfileDetailsInfo.propTypes = {
	userID: PropTypes.string.isRequired,
	fullName: PropTypes.string.isRequired,
	gender: PropTypes.string.isRequired,
	registrationDate: PropTypes.string.isRequired,
	avatarVersion: PropTypes.string.isRequired,
};

export default ProfileDetailsInfo;
