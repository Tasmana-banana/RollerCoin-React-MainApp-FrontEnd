import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Modal, ModalBody } from "reactstrap";
import { withTranslation } from "react-i18next";
import getPrefixPower from "../../services/getPrefixPower";
import secToHours from "../../services/secToHours";
import decimalAdjust from "../../services/decimalAdjust";

import closeImage from "../../assets/img/header/close_menu.svg";

import "../../assets/scss/Game/ModalGotDrops.scss";

const getImgSrc = (type, id, filename) => {
	switch (type) {
		case "miner":
			return `${process.env.STATIC_URL}/static/img/market/miners/${filename || id}.gif`;
		case "rack":
			return `${process.env.STATIC_URL}/static/img/market/racks/${id}.png`;
		case "mutation_component":
			return `${process.env.STATIC_URL}/static/img/storage/mutation_components/${id}.png`;
		case "money":
			return "/static/img/game/drops/money.png";
		case "tmp_power":
			return "/static/img/game/drops/free-power.png";
		case "game_power_multiplier":
			return "/static/img/game/drops/multiply-power.png";
		case "game_hold_time_multiplier":
			return "/static/img/game/drops/hold-power.png";
		case "battery":
			return `${process.env.STATIC_URL}/static/img/market/batteries/${id}.png`;
		default:
			break;
	}
};

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	rollerCurrencies: state.wallet.rollerCurrencies,
});

const ModalGotDrops = (props) => {
	const { isOpen, closeModal, data, language, t, rollerCurrencies } = props;
	const { type, value, item_obj: itemObj, ttl, currency, power: minerPower, filename } = data;
	const { rarity_group: rarityGroup, drops_name: dropsName } = itemObj;
	let baseColor = "03e1e4";
	if (rarityGroup && rarityGroup.base_color_hex) {
		baseColor = rarityGroup.base_color_hex;
	}
	const itemPower = type === "miner" ? minerPower : data.value;
	const { hashDetail, power } = getPrefixPower(itemPower);
	const imgSrc = getImgSrc(type, itemObj._id, filename);
	const isBonusImgScaled = ["mutation_component", "miner"].includes(type);
	const currencyConfig = rollerCurrencies.find((obj) => obj.balanceKey === currency);
	return (
		<Modal isOpen={isOpen} toggle={closeModal} centered={true} className="drops-modal" size="md">
			<ModalBody className="drops-modal-wrapper">
				<div className="drops-modal-close">
					<button className="tree-dimensional-button close-menu-btn btn-default" onClick={closeModal}>
						<span className="close-btn-text">
							<img src={closeImage} width="12" height="12" alt="Close modal window" />
						</span>
					</button>
				</div>
				<div className="drops-block">
					<div className="bonus-info">
						<h2 className="info-title" style={{ color: `#${baseColor}` }}>
							{t("market.congratulations")}
						</h2>
						<p className="info-subtitle">{t("market.dropsModalDescription")}</p>
					</div>
					<div className="background-light-wrapper">
						<div className="background-light">
							<img className="light" src={`/static/img/game/drops/backLight/_${baseColor}.svg?v=1.0.0`} alt={baseColor} />
						</div>
						<div className="bonus-img">
							<img className={`${isBonusImgScaled ? "bonus-img-scale" : ""}`} src={imgSrc} alt={type} />
						</div>
					</div>
					{type === "mutation_component" && (
						<p className="bonus-description">
							<span style={{ color: `#${baseColor}` }}>{rarityGroup.title[language] || rarityGroup.title.en} </span>
							{dropsName[language] || dropsName.en} x{value}
						</p>
					)}
					{type === "game_hold_time_multiplier" && (
						<p className="bonus-description">
							<span className="accent">x{value}</span> {t("market.powerTimeHold")}
						</p>
					)}
					{type === "game_power_multiplier" && (
						<p className="bonus-description">
							<span className="accent">x{value}</span> {t("market.powerReward")}
						</p>
					)}
					{type === "tmp_power" && (
						<p className="bonus-description">
							{t("market.freePower")}{" "}
							<span className="accent">
								{power} {hashDetail}
							</span>{" "}
							{t("market.for")} <span className="accent">{secToHours(ttl)} h</span>
						</p>
					)}
					{type === "miner" && (
						<p className="bonus-description">
							{dropsName[language] || dropsName.en}{" "}
							<span className="accent">
								{power} {hashDetail}
							</span>
						</p>
					)}
					{type === "rack" && (
						<p className="bonus-description">
							<span className="accent">x{value}</span> {dropsName[language] || dropsName.en}
						</p>
					)}
					{type === "money" && (
						<p className="bonus-description">
							{t("market.free")} <span className="accent">{decimalAdjust(value / currencyConfig.toSmall / currencyConfig.divider, currencyConfig.precision)} RLT</span>
						</p>
					)}
					{type === "battery" && (
						<p className="bonus-description">
							<span className="accent">x{value}</span> {dropsName[language] || dropsName.en}
						</p>
					)}
					<div className="collect-button">
						<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={closeModal}>
							<span className="btn-text">{t("market.collect")}</span>
						</button>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
};

ModalGotDrops.propTypes = {
	t: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	closeModal: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
	rollerCurrencies: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
};
export default withTranslation("Game")(connect(mapStateToProps, null)(ModalGotDrops));
