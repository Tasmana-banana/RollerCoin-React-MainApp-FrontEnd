import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import ConnectMetamaskButton from "../../SingleComponents/ConnectMetamaskButton";

import placeholderImg from "../../../assets/img/profile/nft/collection_placeholder.gif";
import findImg from "../../../assets/img/profile/nft/find.gif";
import avatarIcon from "../../../assets/img/profile/nft/avatar_icon.svg";

const ConnectMetamask = ({ isSyncInitialization, isHiddenBackToAvatarBtn = false }) => {
	const { t } = useTranslation("Profile");
	const language = useSelector((state) => state.game.language);
	return (
		<Row noGutters={true} className="connect-metamask-container">
			<Col xs={12}>
				{!isSyncInitialization && (
					<div className="connect-metamask-menu">
						<img className="metamask-placeholder-img" src={placeholderImg} width={240} height={168} alt="connect a wallet" />
						<h3 className="metamask-title">{t("nft-collection.connectWallet")}</h3>
						<p className="metamask-description">{t("nft-collection.getStarted")}</p>
						<div className="metamask-buttons-wrapper">
							<ConnectMetamaskButton fluid />
							{!isHiddenBackToAvatarBtn && (
								<Fragment>
									<div className="metamask-buttons-divider">
										<span>OR</span>
									</div>
									<Link to={`${getLanguagePrefix(language)}/customize-avatar`} className="tree-dimensional-button btn-default w-100">
										<span className="with-horizontal-image button-text-wrapper">
											<span className="btn-icon">
												<img className="btn-icon" src={avatarIcon} width={23} height={24} alt="metamask" />
											</span>
											<span className="btn-text">{t("nft-collection.backToAvatar")}</span>
										</span>
									</Link>
								</Fragment>
							)}
						</div>
					</div>
				)}
				{isSyncInitialization && (
					<div className="connect-metamask-loader">
						<img className="metamask-placeholder-img" src={findImg} width={240} height={168} alt="looking for" />
						<h3 className="metamask-title">{t("nft-collection.wait")}</h3>
						<p className="metamask-description">
							{t("nft-collection.lookingFor")}
							<br />
							{t("nft-collection.takeMinute")}
						</p>
					</div>
				)}
			</Col>
		</Row>
	);
};

ConnectMetamask.propTypes = {
	isSyncInitialization: PropTypes.bool.isRequired,
	isHiddenBackToAvatarBtn: PropTypes.bool,
};

export default ConnectMetamask;
