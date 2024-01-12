import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import getPrefixPower from "../../../services/getPrefixPower";

import powerImg from "../../../assets/img/profile/profile-desktop.svg";

import "../../../assets/scss/Profile/TableStats.scss";
import arrowCyan from "../../../assets/img/game/arrow_top_cyan.svg";

const PowerTable = ({ data }) => {
	const { t } = useTranslation("Profile");
	return (
		<div className="stats-table">
			<div className="table-header">
				<div className="mr-2">
					<img src={powerImg} width={21} height={21} alt="Lightning" />
				</div>
				<p>{t("powerStats")}</p>
			</div>
			<div className="line" />
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("miners")}</p>
				<p className="body-text">
					{getPrefixPower(data.miners).power} <span className="satoshi-text">{getPrefixPower(data.miners).hashDetail}</span>
				</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("bonus")}</p>
				<div>
					<p className="body-text">
						<span className="satoshi-text">
							{getPrefixPower(data.bonus).power} {getPrefixPower(data.bonus).hashDetail}
						</span>
					</p>
					{+data.bonus_percent > 0 && (
						<div className="bonus-percent-power-wrapper cyan-text">
							<div className="img-block">
								<img src={arrowCyan} width={8} height={8} alt="up" />
							</div>
							<p className="body-text">{`+${+data.bonus_percent / 100}%`}</p>
						</div>
					)}
					{(data.bonus_percent <= 0 || !data.bonus_percent) && (
						<p className="body-text">
							<span className="satoshi-text">0%</span>
						</p>
					)}
				</div>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("rackBonus")}</p>
				<p className="body-text">
					{getPrefixPower(data.racks).power} <span className="satoshi-text">{getPrefixPower(data.racks).hashDetail}</span>
				</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("games")}</p>
				<p className="body-text">
					{getPrefixPower(data.games).power} <span className="satoshi-text">{getPrefixPower(data.games).hashDetail}</span>
				</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("temporary")}</p>
				<p className="body-text">
					{getPrefixPower(data.temp).power} <span className="satoshi-text">{getPrefixPower(data.temp).hashDetail}</span>
				</p>
			</div>
			<div className="stats-info-row">
				<p className="stats-info-row-title">{t("total")}</p>
				<p className="body-text">
					{getPrefixPower(data.total).power} <span className="satoshi-text">{getPrefixPower(data.total).hashDetail}</span>
				</p>
			</div>
		</div>
	);
};

PowerTable.propTypes = {
	data: PropTypes.array.isRequired,
};

export default PowerTable;
