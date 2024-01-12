import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import infoImg from "../../assets/img/storage/info_icon_big_round.svg";

import "../../assets/scss/SingleComponents/InfoBlockWithIcon.scss";

const InfoBlockWithIcon = ({ tName, message, obj, isViewIcon = true, showButtons = false }) => {
	const [isInfoShow, setIsInfoShow] = useState(showButtons);
	const { t } = useTranslation(tName);
	const isShowIcon = message !== "eventPassInfoMessage" && isViewIcon;
	return (
		<div className="info-block-with-icon-container">
			{isShowIcon && (
				<div className="info-icon-block">
					<img className="info-icon" src={infoImg} alt="info img" width="24" height="24" />
				</div>
			)}
			<div className={`info-text-wrapper ${!isInfoShow ? "open-tips" : "close-tips"}`}>
				<p className="info-text" dangerouslySetInnerHTML={{ __html: t(`${obj}.${message}`) }}></p>
				{showButtons && (
					<p className="info-show-btn" onClick={() => setIsInfoShow(!isInfoShow)}>
						{!isInfoShow ? t(`${obj}.showLess`) : t(`${obj}.showMore`)}
					</p>
				)}
			</div>
		</div>
	);
};

export default InfoBlockWithIcon;

InfoBlockWithIcon.propTypes = {
	message: PropTypes.string,
	obj: PropTypes.string,
	isInfoShow: PropTypes.bool,
	showInfoToggle: PropTypes.func,
	tName: PropTypes.string.isRequired,
	showButtons: PropTypes.bool,
	isViewIcon: PropTypes.bool,
};
