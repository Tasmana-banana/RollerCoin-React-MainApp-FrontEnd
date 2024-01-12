import React, { Fragment, useState } from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ProfileCard from "../ProfileCard";
import PublicLinkModal from "./PublicLinkModal";

import linkIconImg from "../../../assets/img/profile/link.svg";

const ProfilePublicLink = ({ publicLink, setProfileLink }) => {
	const [isOpenModal, setIsOpenModal] = useState(false);

	const toggleModal = () => setIsOpenModal(!isOpenModal);

	const { t } = useTranslation("Profile");
	return (
		<Fragment>
			<Row className="profile-public-link mt-3">
				<Col xs={12}>
					<ProfileCard titleIcon={linkIconImg} title={t("profileLink")}>
						<Row>
							<Col xs={10}>
								<div className="link-builder-wrapper d-flex">
									<p className="static-link">https://rollercoin.com/p/</p>
									<p className="dynamic-link">{publicLink}</p>
								</div>
							</Col>
							<Col xs={2} className="d-flex justify-content-end">
								<button className="btn-link-style" onClick={toggleModal}>
									<span className="link-text">{t("change")}</span>
								</button>
							</Col>
						</Row>
					</ProfileCard>
				</Col>
			</Row>
			<PublicLinkModal isOpen={isOpenModal} toggleModal={toggleModal} setProfileLink={setProfileLink} />
		</Fragment>
	);
};

ProfilePublicLink.propTypes = {
	publicLink: PropTypes.string.isRequired,
	setProfileLink: PropTypes.func.isRequired,
};

export default ProfilePublicLink;
