import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import RewardBlockDropdownItem from "./RewardBlockDropdownItem";
import ToggleSwitch from "../SingleComponents/ToggleSwitch";

import "../../assets/scss/Game/RewardBlock.scss";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";

const RewardBlock = ({ buttonText, buttonLink, buttonIcon, isOpen, data, type, userPower, togglePartitionModal = null }) => {
	const language = useSelector((state) => state.game.language);
	const [gameCurrencies, setGameCurrencies] = useState([]);
	const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
	const [showAllCurrencies, setShowAllCurrencies] = useState(false);
	const { t } = useTranslation("Game");
	useEffect(() => {
		const showAll = localStorage.getItem("myPowerAllCurrencies");
		if (showAll === "true") {
			setShowAllCurrencies(true);
		}
	}, []);

	useEffect(() => {
		const sortedData = data
			.filter((item) => !["RLT", "RST"].includes(item.name))
			.sort((a, b) => {
				const aValue = parseFloat(a.originalValue);
				const bValue = parseFloat(b.originalValue);
				if (aValue < bValue) {
					return 1;
				}
				if (aValue > bValue) {
					return -1;
				}
				return 0;
			});
		if (togglePartitionModal && data.length && !showAllCurrencies) {
			const currentData = sortedData.filter((item) => item.value && +item.value.replace(/\D/g, "") > 0);
			setCryptoCurrencies(currentData);
		}
		if (togglePartitionModal && data.length && showAllCurrencies) {
			setCryptoCurrencies(sortedData);
		}
		if (type !== "MyPower") {
			setCryptoCurrencies(data);
		}
		const currentGameCurrencies = data.filter((item) => item.name === "RLT" || item.name === "RST");
		setGameCurrencies(currentGameCurrencies);
	}, [data, showAllCurrencies]);

	const showAllHandler = () => {
		localStorage.setItem("myPowerAllCurrencies", `${!showAllCurrencies}`);
		setShowAllCurrencies(!showAllCurrencies);
	};

	const userWithoutActivities = togglePartitionModal && getPrefixPower(userPower).power === 0;

	return (
		<div className={`reward-block-wrapper ${isOpen ? "open" : ""}`}>
			{((type !== "block" && !togglePartitionModal) || userWithoutActivities) && <div className="line" />}
			{togglePartitionModal && (
				<div className="my-power-link-wrapper">
					{!userWithoutActivities && (
						<div>
							<div className="reward-power-stats">
								<span className="reward-info-title">{t("header.total")}</span>
								<div className="my-power-total-wrapper bonus-info">
									<div className="bonus-percent-power-wrapper">
										<span className={`power-value`}>{`${getPrefixPower(userPower).power} ${getPrefixPower(userPower).hashDetail}`}</span>
									</div>
								</div>
							</div>

							<div className="dashed-line" />
							<Link to={`${getLanguagePrefix(language)}/profile/profile-stats`} className="power-link">
								<span className=" flex-lg-row button-text-wrapper">
									<img src={`/static/img/icon/${buttonIcon}.svg`} width={16} height={16} alt={buttonIcon} />
									<span className="power-link-text cyan-text">{t("header.profileStats")}</span>
								</span>
							</Link>
							<div className="line reward-line" />
						</div>
					)}
					<div className="power-wrapper">
						<p className="title-block ">{t("header.gameCurrencies")}</p>
					</div>
					<RewardBlockDropdownItem data={gameCurrencies} type={type} />
					<div className="line reward-line" />
					<div className="power-wrapper">
						<p className="title-block ">{t("header.cryptoCurrencies")}</p>
					</div>
					<div className="power-toggle-wrapper">
						<ToggleSwitch disabled={false} name="Currencies" id="showallcurrencies" handler={showAllHandler} isActive={showAllCurrencies} />
						<span className="subtitle">{t("header.accountWithZero")}</span>
					</div>
				</div>
			)}
			{!!cryptoCurrencies.length && <RewardBlockDropdownItem data={cryptoCurrencies} type={type} />}
			<div className="line reward-line" />
			<div className="dropdown-footer">
				{userWithoutActivities && (
					<div className="power-wrapper justify-content-center">
						<p className="title-block ">{t("header.chooseAndStart")}</p>
					</div>
				)}
				{(userWithoutActivities || !togglePartitionModal) && (
					<Link to={buttonLink} className="power-link">
						<span className=" flex-lg-row button-text-wrapper">
							<img src={`/static/img/icon/${userWithoutActivities ? "gamepad_cyan" : buttonIcon}.svg`} width={16} height={16} alt={userWithoutActivities ? "gamepad_cyan" : buttonIcon} />
							<span className="power-link-text cyan-text">{userWithoutActivities ? t("header.chooseGame") : buttonText}</span>
						</span>
					</Link>
				)}
				{togglePartitionModal && getPrefixPower(userPower).power > 0 && (
					<div className="power-link" onClick={togglePartitionModal}>
						<span className=" flex-lg-row button-text-wrapper">
							<img src={`/static/img/icon/${buttonIcon}.svg`} width={16} height={16} alt={buttonIcon} />
							<span className="power-link-text cyan-text">{buttonText}</span>
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
RewardBlock.propTypes = {
	buttonText: PropTypes.string.isRequired,
	buttonLink: PropTypes.string.isRequired,
	buttonIcon: PropTypes.string.isRequired,
	userPower: PropTypes.string,
	data: PropTypes.array.isRequired,
	isOpen: PropTypes.bool.isRequired,
	togglePartitionModal: PropTypes.func,
	type: PropTypes.string,
};
export default RewardBlock;
