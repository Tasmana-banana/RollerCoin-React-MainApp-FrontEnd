import React from "react";
import PropTypes from "prop-types";

import batteryIcon from "../../assets/img/market/small_battery_icon.svg";

const LEFT_PERCENT_IS_NEED_VIEWED_PERCENT = 10;

const getCellBgColor = (activeCell, progressPercent, totalFreeCellsCount) => {
	if (activeCell === totalFreeCellsCount && progressPercent > 50) {
		return { progress: { background: "#74e21b" } };
	}
	if (activeCell === totalFreeCellsCount && progressPercent < 50 && progressPercent > LEFT_PERCENT_IS_NEED_VIEWED_PERCENT) {
		return { progress: { background: "#d53f3f" }, block_fill: { borderColor: "#d53f3f" } };
	}
	if (activeCell === totalFreeCellsCount && progressPercent < LEFT_PERCENT_IS_NEED_VIEWED_PERCENT) {
		return { progress: { background: "#d53f3f" }, block_fill: { borderColor: "#d53f3f", animation: "battery-is-low 1.5s infinite" } };
	}
	if (activeCell !== totalFreeCellsCount) {
		return { progress: { background: "#07efef" } };
	}
};

const ElectricityBar = ({ activeCellsCount, totalCellsCount, progressRechargePercent, totalFreeCellsCount }) => {
	const electroBar = new Array(totalCellsCount);
	const isFreeCell = activeCellsCount <= totalFreeCellsCount;
	electroBar.fill(<div className={`block-fill`} />, 0, activeCellsCount);
	electroBar.fill(<div className={`block-fill free-cell`} />, 0, totalFreeCellsCount);
	electroBar.fill(
		<div className={`block-fill active ${isFreeCell ? "free-cell" : ""}`} style={{ ...getCellBgColor(activeCellsCount, progressRechargePercent, totalFreeCellsCount)?.block_fill }}>
			{activeCellsCount === totalFreeCellsCount && progressRechargePercent < LEFT_PERCENT_IS_NEED_VIEWED_PERCENT && (
				<span className="progress-recharge-percent">{`${Math.round(progressRechargePercent)}%`}</span>
			)}
			<div className="progress-recharge" style={{ width: `${progressRechargePercent}%`, ...getCellBgColor(activeCellsCount, progressRechargePercent, totalFreeCellsCount).progress }}></div>
		</div>,
		activeCellsCount - 1
	);
	electroBar.fill(<div className="block-fill block-empty" />, activeCellsCount);
	if (activeCellsCount < totalFreeCellsCount) {
		electroBar.fill(<div className="block-fill block-empty free-cell" />, 0, totalFreeCellsCount);
	}
	return (
		<>
			<img className="electricity-battery-icon" src={batteryIcon} alt="Battery icon" width="auto" height="12" />
			<div className="electricity-bar">{electroBar}</div>
		</>
	);
};

ElectricityBar.propTypes = {
	activeCellsCount: PropTypes.number.isRequired,
	totalCellsCount: PropTypes.number.isRequired,
	totalFreeCellsCount: PropTypes.number.isRequired,
	progressRechargePercent: PropTypes.number.isRequired,
};

export default ElectricityBar;
