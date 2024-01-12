import React, { Fragment } from "react";
import { Modal, ModalBody } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import RollerButton from "./RollerButton";
import getPrefixPower from "../../services/getPrefixPower";
import msecToDays from "../../services/msecToDays";
import decimalAdjust from "../../services/decimalAdjust";
import rewardImageConstructor from "../../services/rewardImageConstructor";

import "../../assets/scss/SingleComponents/RewardCollectModal.scss";

const RewardCollectModal = ({ isOpen, closeModal, reward }) => {
	const { t } = useTranslation("Game");
	const language = useSelector((state) => state.game.language);
	const rollerCurrencies = useSelector((state) => state.wallet.rollerCurrencies);
	const { item_type: type, amount, item_info: itemInfo, ttl_time: ttlTime, currency } = reward;
	const { name: itemName } = itemInfo;
	let baseColor = "03e1e4";
	const imgSrc = rewardImageConstructor(type, reward);
	const isBonusImgScaled = ["mutation_component", "miner", "trophy", "hat", "appearance", "power", "money", "battery"].includes(type);
	const isOneCellMiner = type === "miner" && itemInfo.width === 1;
	const currencyConfig = rollerCurrencies.find((obj) => obj.balanceKey === currency);

	const rewardTypeContent = (rewardItem) => {
		switch (rewardItem.item_type) {
			case "mutation_component": {
				const { rarity_group_name: rarityGroupName, rarity_color_hex: rarityColor } = itemInfo;
				if (rarityGroupName && rarityColor) {
					baseColor = rarityColor;
				}
				return (
					<p className="bonus-description">
						<span style={{ color: `#${baseColor}` }}>{rarityGroupName[language] || rarityGroupName.en} </span>
						{itemName[language] || itemName.en} <span className="accent">x{amount}</span>
					</p>
				);
			}
			case "power": {
				const { hashDetail, power } = getPrefixPower(itemInfo.power);
				return (
					<p className="bonus-description">
						{t("market.bonusPower")}{" "}
						<span className="accent">
							{power} {hashDetail}
						</span>{" "}
						{t("market.for")} <span className="accent">{msecToDays(ttlTime)} days</span>
					</p>
				);
			}
			case "miner": {
				const { hashDetail, power } = getPrefixPower(itemInfo.power);
				return (
					<p className="bonus-description">
						{itemName[language] || itemName.en}{" "}
						<span className="accent">
							{power} {hashDetail}
						</span>
					</p>
				);
			}
			case "rack": {
				const { hashDetail, power } = getPrefixPower(itemInfo.power);
				return (
					<p className="bonus-description">
						{itemName[language] || itemName.en}{" "}
						<span className="accent">
							{power} {hashDetail}
						</span>
					</p>
				);
			}
			case "trophy":
				return <p className="bonus-description"> {itemName[language] || itemName.en}</p>;
			case "hat":
				return <p className="bonus-description"> {itemName[language] || itemName.en}</p>;
			case "appearance":
				return <p className="bonus-description"> {itemName[language] || itemName.en}</p>;
			case "money":
				return (
					<p className="bonus-description">
						<span className="accent">
							{decimalAdjust(amount / currencyConfig.toSmall / currencyConfig.divider, currencyConfig.precision)} {currency}
						</span>
					</p>
				);
			case "battery":
				return (
					<p className="bonus-description">
						{itemName[language] || itemName.en} <span className="accent">x{amount}</span>
					</p>
				);
			default:
				break;
		}
	};

	return (
		<Fragment>
			{reward && (
				<Modal isOpen={isOpen} centered={true} className="reward-collect-modal">
					<ModalBody className="reward-modal-wrapper">
						<div className="reward-block">
							<div className="reward-text-block">
								<h2 className="info-title">{t("market.congratulations")}</h2>
								<p className="info-subtitle">{t("market.dropsModalDescription")}</p>
							</div>
							<div className="background-light-wrapper">
								<div className="background-light">
									<img className="light" src={`/static/img/game/drops/backLight/_${baseColor}.svg?v=1.0.0`} alt={baseColor} />
								</div>
								<div className="bonus-img">
									<img className={`${isBonusImgScaled ? "bonus-img-scale" : ""} ${isOneCellMiner ? "miner-cell-scale" : ""}`} src={imgSrc} alt={type} />
								</div>
							</div>
							{reward && rewardTypeContent(reward)}
							<div className="collect-button">
								<RollerButton className="reward-collect-button" color="cyan" text="Collect" action={closeModal} />
							</div>
						</div>
					</ModalBody>
				</Modal>
			)}
		</Fragment>
	);
};

RewardCollectModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	closeModal: PropTypes.func.isRequired,
	reward: PropTypes.object.isRequired,
};

export default RewardCollectModal;
