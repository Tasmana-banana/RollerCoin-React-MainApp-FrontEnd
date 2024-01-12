import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import getLanguagePrefix from "../../../services/getLanguagePrefix";

import noPartsImg from "../../../assets/img/storage/inventory/no_parts.gif";
import noMinersImg from "../../../assets/img/storage/inventory/no_miners.gif";
import noRacksImg from "../../../assets/img/storage/inventory/no_racks.gif";
import noBatteriesImg from "../../../assets/img/storage/inventory/no_batteries.gif";
import cartIcon from "../../../assets/img/cart.svg";

import "../../../assets/scss/Storage/Inventroy/EmptyInventory.scss";

const ITEMS_DATA = {
	parts: {
		img: noPartsImg,
		path: "game/market/season-store",
		text: "inventory.youDontHaveParts",
		btnText: "inventory.buyParts",
	},
	miners: {
		img: noMinersImg,
		path: "game/market/miners",
		text: "inventory.youDontHaveMiners",
		btnText: "inventory.buyMiners",
	},
	racks: {
		img: noRacksImg,
		path: "game/market/racks",
		text: "inventory.youDontHaveRacks",
		btnText: "inventory.buyRacks",
	},
	batteries: {
		img: noBatteriesImg,
		path: "game/market/season-store",
		text: "inventory.youDontHaveBatteries",
		btnText: "inventory.buyBatteries",
	},
};

const EmptyInventory = ({ inventoryType }) => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Storage");
	const { img, path, text, btnText } = ITEMS_DATA[inventoryType];
	return (
		<div className="empty-inventory-container">
			<div className="empty-inventory-wrapper">
				<h2 className="empty-text">{t(text)}</h2>
				<div className="empty-image-block">
					<img className="empty-image" src={img} alt="You don't have items" width="276" height="210" />
				</div>
				<div className="buy-button-block">
					<Link to={`${getLanguagePrefix(language)}/${path}`} className="tree-dimensional-button btn-cyan content-btn">
						<span className="btn-text">
							<span className="btn-img">
								<img src={cartIcon} alt="cart" width="19" height="19" />
							</span>
							{t(btnText)}
						</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

EmptyInventory.propTypes = {
	inventoryType: PropTypes.string.isRequired,
};

export default EmptyInventory;
