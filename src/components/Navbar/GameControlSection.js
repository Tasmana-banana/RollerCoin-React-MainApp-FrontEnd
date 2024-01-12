import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RollerButton from "../SingleComponents/RollerButton";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Navbar/GameControlSection.scss";

import homeIcon from "../../assets/img/icon/home_icon.svg";
import storeIcon from "../../assets/img/icon/store_icon_black.svg";
import gamepadIcon from "../../assets/img/icon/gamepad_icon_white.svg";
import taskwallIcon from "../../assets/img/icon/taskwall_icon.svg";
import storageIcon from "../../assets/img/icon/storage_icon.svg";
import marketplaceIcon from "../../assets/img/icon/marketplace_icon.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class GameControlSectionClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		redDotStatus: PropTypes.object.isRequired,
		isShowOfferwallNotifications: PropTypes.bool.isRequired,
	};

	render() {
		const {
			t,
			language,
			isMobile,
			redDotStatus: { isViewedEventQuestion },
			isShowOfferwallNotifications,
		} = this.props;
		return (
			<div className="control-container">
				<div className="control-button-wrapper">
					<Link to={`${getLanguagePrefix(language)}/game`}>
						<RollerButton className="control-button" icon={homeIcon} disabled={this.props.pathName.endsWith("/game")} />
					</Link>
				</div>
				<div className="control-button-wrapper">
					<Link to={`${getLanguagePrefix(language)}/game/choose_game`}>
						<RollerButton className="control-button" icon={gamepadIcon} disabled={this.props.pathName.includes("/choose_game")} />
					</Link>
				</div>
				<div className={`control-button-wrapper ${isShowOfferwallNotifications ? "pulsated" : ""}`}>
					<Link to={`${getLanguagePrefix(language)}/taskwall`}>
						<RollerButton className="control-button" color="cyan" icon={taskwallIcon} text={t("taskwall")} disabled={this.props.pathName.includes("/taskwall")} />
					</Link>
				</div>
				<div className="control-button-wrapper">
					<Link to={`${getLanguagePrefix(language)}/game/market${isMobile ? "" : "/season-pass"}`}>
						<RollerButton className="control-button" color="gold" icon={storeIcon} text={t("store")} disabled={this.props.pathName.includes("/game/market")} />
					</Link>
				</div>
				<div className="control-button-wrapper">
					<Link to={`${getLanguagePrefix(language)}/marketplace`}>
						<RollerButton className="control-button" icon={marketplaceIcon} disabled={this.props.pathName.includes("/marketplace")} />
					</Link>
				</div>
				<div className="control-button-wrapper">
					<Link to={`${getLanguagePrefix(language)}/storage`}>
						<RollerButton className="control-button" icon={storageIcon} disabled={this.props.pathName.includes("/storage")} />
					</Link>
				</div>
			</div>
		);
	}
}
const GameControlSection = withTranslation("Layout")(connect(mapStateToProps, null)(GameControlSectionClass));

export default GameControlSection;
