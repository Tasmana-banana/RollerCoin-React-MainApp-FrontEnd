import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import whiteGamepadImg from "../../../assets/img/profile/gamepad-white.svg";
import gamepadImg from "../../../assets/img/profile/gamepad.svg";

import "../../../assets/scss/Profile/TableStats.scss";

const GameTable = ({ content }) => {
	const { t } = useTranslation("Profile");
	const language = useSelector((state) => state.game.language);
	return (
		<div className="stats-table">
			<div className="table-header">
				<div className="mr-2">
					<img src={whiteGamepadImg} width={24} height={24} alt="GamepadImg" />
				</div>
				<p>{t("gameStats")}</p>
			</div>
			<div className="line" />
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("won")}</p>
				<p className="body-text">{content.won}</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("lost")}</p>
				<p className="body-text">{content.lost}</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("totalPlayed")}</p>
				<p className="body-text">{content.total}</p>
			</div>
			<div className="line" />
			<Link to={`${getLanguagePrefix(language)}/game/choose_game`} className="choose-game-link">
				<span className="icon">
					<img src={gamepadImg} width={16} height={16} alt="gamepadImg" />
				</span>
				<span className="button-text">{t("chooseGame")}</span>
			</Link>
		</div>
	);
};

GameTable.propTypes = {
	content: PropTypes.array.isRequired,
};

export default GameTable;
