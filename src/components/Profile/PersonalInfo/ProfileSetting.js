import React from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ProfileCard from "../ProfileCard";

import "../../../assets/scss/Profile/ProfileSetting.scss";

import settingIconImg from "../../../assets/img/profile/settings.svg";

const ProfileSetting = ({ settingList, settingState, setCheckboxStatus }) => {
	const { t } = useTranslation("Profile");
	return (
		<Row className="profile-setting-wrapper">
			<Col xs={12}>
				<ProfileCard titleIcon={settingIconImg} title={t("setting")}>
					<div className="profile-checkbox-column">
						{settingList.map((name) => (
							<div key={name}>
								<Input className="profile-checkbox" type="checkbox" id={name} checked={settingState[name]} onChange={() => setCheckboxStatus(name, !settingState[name])} />
								<Label for={name} className="profile-checkbox-label">
									{t(name)}
								</Label>
							</div>
						))}
					</div>
				</ProfileCard>
			</Col>
		</Row>
	);
};

ProfileSetting.propTypes = {
	settingState: PropTypes.object.isRequired,
	setCheckboxStatus: PropTypes.func.isRequired,
	settingList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProfileSetting;
