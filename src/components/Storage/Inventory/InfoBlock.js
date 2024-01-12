import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import infoImg from "../../../assets/img/storage/info_icon_big_round.svg";

import "../../../assets/scss/Storage/Inventroy/InfoBlock.scss";

const InfoBlock = () => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Storage");
	return (
		<div className="info-block-container">
			<div className="info-icon-block">
				<img className="info-icon" src={infoImg} alt="info img" width="24" height="24" />
			</div>
			<p className="info-text">
				{t("inventory.youCanGet")}
				<Link to={`${getLanguagePrefix(language)}/game/choose_game`}>
					<span className="info-cyan">{t("inventory.game")}</span>
				</Link>
			</p>
		</div>
	);
};

export default InfoBlock;
