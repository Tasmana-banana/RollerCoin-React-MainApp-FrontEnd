import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import LazyLoad from "react-lazyload";
import comingSoonImage from "../../assets/img/gamePreview/coming_soon.svg";
import flagImage from "../../assets/img/icon/flag.svg";

const ComingSoon = ({ games, createDifficultBar, t }) => {
	const activeGamesCount = games.length;
	const GAMES_IN_ROW = 3;
	let comingSoonGames = GAMES_IN_ROW;
	if (activeGamesCount % GAMES_IN_ROW) {
		comingSoonGames += GAMES_IN_ROW - (activeGamesCount % GAMES_IN_ROW);
	}
	return new Array(comingSoonGames).fill(
		<Col xs={12} md={6} lg={4} className="choose-game-item-container">
			<Row noGutters={true} className="choose-game-item coming-soon-block">
				<Col xs={5} className="img-container">
					<div className="img-item">
						<LazyLoad offset={100}>
							<img src={comingSoonImage} width="107" height="107" alt="coming soon" />
						</LazyLoad>
					</div>
				</Col>
				<Col xs={7}>
					<p className="game-title">{t("comingSoon")}</p>
					<div className="game-information-block">
						<div className="game-information-text-wrapper">
							<p className="game-information-text">{t("difficulty")}</p>
							<p className="game-information-number">0</p>
						</div>
						<div className="progress-difficult progress-info">{createDifficultBar(0)}</div>
					</div>
					<div className="game-start-button">
						<button className="tree-dimensional-button btn-cyan w-100 game-start-button-cursor" disabled={true}>
							<span className="with-horizontal-image flex-lg-row button-text-wrapper">
								<img src={flagImage} alt="play_game" />
								<span className="btn-text">{t("start")}</span>
							</span>
						</button>
					</div>
				</Col>
			</Row>
		</Col>
	);
};
ComingSoon.propTypes = {
	games: PropTypes.array.isRequired,
	createDifficultBar: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};
export default withTranslation("Games")(ComingSoon);
