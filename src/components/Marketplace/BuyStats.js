import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col } from "reactstrap";
import threeDigitDivisor from "../../services/threeDigitDivisor";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";

import "../../assets/scss/Marketplace/BuyStats.scss";

import totalSalesIcon from "../../assets/img/marketplace/total_sales_icon.svg";
import itemsSoldIcon from "../../assets/img/marketplace/items_sold_icon.svg";
import totalVolumeIcon from "../../assets/img/marketplace/total_volume_icon.svg";

const BuyStats = ({ generalStats }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("Marketplace");
	const rltConfig = getCurrencyConfig("RLT");
	return (
		<div className="marketplace-buy-stats-block">
			<p className="marketplace-buy-stats-title">{t("buy.forLast", { days: 30 })}</p>
			{!isMobile && (
				<Row className="marketplace-buy-stats-wrapper">
					<Col md={4}>
						<div className="buy-stats-card">
							<img className="buy-stats-card-icon" src={totalSalesIcon} height="64" width="64" alt="total sales" />
							<div className="buy-stats-card-text-wrapper">
								<p className="buy-stats-card-title">{t("buy.totalSales")}</p>
								<div className="buy-stats-card-amount">{threeDigitDivisor(generalStats.totalSales, "space")}</div>
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div className="buy-stats-card">
							<img className="buy-stats-card-icon" src={itemsSoldIcon} height="64" width="64" alt="items sold" />
							<div className="buy-stats-card-text-wrapper">
								<p className="buy-stats-card-title">{t("buy.itemsSold")}</p>
								<div className="buy-stats-card-amount">{threeDigitDivisor(generalStats.itemsSold, "space")}</div>
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div className="buy-stats-card">
							<img className="buy-stats-card-icon" src={totalVolumeIcon} height="64" width="64" alt="total volume" />
							<div className="buy-stats-card-text-wrapper">
								<p className="buy-stats-card-title">{t("buy.totalVolume")}</p>
								<div className="buy-stats-card-amount">{threeDigitDivisor(decimalAdjust(generalStats.totalVolume / rltConfig.toSmall, 0), "space")}</div>
							</div>
						</div>
					</Col>
				</Row>
			)}
			{isMobile && (
				<div className="marketplace-buy-stats-wrapper">
					<div className="buy-stats-card">
						<img className="buy-stats-card-icon" src={totalSalesIcon} height="40" width="40" alt="total sales" />
						<div className="buy-stats-card-text-wrapper">
							<p className="buy-stats-card-title">{t("buy.totalSales")}</p>
							<div className="buy-stats-card-amount">{threeDigitDivisor(generalStats.totalSales, "space")}</div>
						</div>
					</div>
					<div className="buy-stats-card">
						<img className="buy-stats-card-icon" src={itemsSoldIcon} height="40" width="40" alt="items sold" />
						<div className="buy-stats-card-text-wrapper">
							<p className="buy-stats-card-title">{t("buy.itemsSold")}</p>
							<div className="buy-stats-card-amount">{threeDigitDivisor(generalStats.itemsSold, "space")}</div>
						</div>
					</div>
					<div className="buy-stats-card">
						<img className="buy-stats-card-icon" src={totalVolumeIcon} height="40" width="40" alt="total volume" />
						<div className="buy-stats-card-text-wrapper">
							<p className="buy-stats-card-title">{t("buy.totalVolume")}</p>
							<div className="buy-stats-card-amount">{threeDigitDivisor(decimalAdjust(generalStats.totalVolume / rltConfig.toSmall, 2), "space")}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

BuyStats.propTypes = {
	generalStats: PropTypes.object.isRequired,
};

export default BuyStats;
