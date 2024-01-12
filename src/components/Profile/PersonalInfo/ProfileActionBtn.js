import React, { useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CopyToClipboard } from "react-copy-to-clipboard";
import PropTypes from "prop-types";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import avatarImg from "../../../assets/img/profile/avatar-icon.svg";
import shareImg from "../../../assets/img/profile/share.svg";
import copiedImg from "../../../assets/img/profile/check24x24.svg";

import "../../../assets/scss/Profile/ProfileActionBtn.scss";

const ProfileActionBtn = ({ publicLink }) => {
	const [isCopy, setIsCopy] = useState(false);
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Profile");

	const countRef = useRef(null);

	const setCopyHandler = () => {
		clearTimeout(countRef.current);
		countRef.current = setTimeout(() => setIsCopy(false), 3000);
		setIsCopy(true);
	};

	return (
		<Row className="profile-action-btn">
			<Col xs={12} lg={8}>
				<Link to={`${getLanguagePrefix(language)}/customize-avatar`} className="tree-dimensional-button btn-default w-100">
					<span className="go-to-text flex-row w-100">
						<div className="mr-3">
							<img className="image-size" height={24} width={24} src={avatarImg} alt="Avatar icon" />
						</div>
						{t("customizeAvatar")}
					</span>
				</Link>
			</Col>
			<Col xs={12} lg={4} className="mobile-space">
				<CopyToClipboard text={`https://rollercoin.com/p/${publicLink}`} onCopy={setCopyHandler}>
					<button type="button" className="tree-dimensional-button btn-cyan w-100">
						<span className={`go-to-text flex-row ${isCopy ? "copy-padding" : ""}`}>
							<div className="mr-3">
								<img className="image-size" height={24} width={24} src={isCopy ? copiedImg : shareImg} alt="Copied icon" />
							</div>
							{isCopy ? t("copied") : t("share")}
						</span>
					</button>
				</CopyToClipboard>
			</Col>
		</Row>
	);
};

ProfileActionBtn.propTypes = {
	publicLink: PropTypes.string.isRequired,
};

export default ProfileActionBtn;
