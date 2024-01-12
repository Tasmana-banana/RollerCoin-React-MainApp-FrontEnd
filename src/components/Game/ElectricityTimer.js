import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { initTimer, makeCounterData } from "../../services/countdownТimer";
import { LEFT_HOURS_TO_FREE_RECHARGE } from "../../constants/Game/electricity";

const ElectricityTimer = ({ timeToRecharge, startRecharge, setActiveCellsCountHandler, setProgressRechargePercent, setElectricityPulsatedBtn, isLowCharge }) => {
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [viewTime, setViewTime] = useState({
		hours: "00",
		minutes: "00",
		seconds: "00",
	});
	const timer = useRef(null);
	const timeOut = useRef(null);

	useEffect(() => {
		return () => {
			if (timer.current) {
				clearInterval(timer.current);
			}
			if (timeOut.current) {
				clearTimeout(timeOut.current);
			}
		};
	}, []);

	useEffect(() => {
		if (timeToRecharge) {
			startTimer(timeToRecharge);
		}
	}, [timeToRecharge]);

	const startTimer = (date) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(date));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	useEffect(() => {
		if (+viewTime.hours < LEFT_HOURS_TO_FREE_RECHARGE) {
			setTimeout(() => {
				setElectricityPulsatedBtn();
			}, 5000);
		}
	}, [viewTime.hours]);

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setActiveCellsCountHandler();
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		const currentViewTime = {
			hours: time.hours.replace("h", ""),
			minutes: time.minutes.replace("m", ""),
			seconds: time.seconds.replace("s", ""),
		};
		setViewTime(currentViewTime);
		const currentDate = dayjs().valueOf();
		const totalTime = dayjs(timeToRecharge).valueOf() - dayjs(startRecharge).valueOf();
		const elapsedTime = currentDate - dayjs(startRecharge).valueOf();
		const remainingPercentage = 100 - (elapsedTime / totalTime) * 100;
		setProgressRechargePercent(remainingPercentage.toFixed(5));
	}, [timeLeftSeconds]);

	return (
		<div className="electricity-timer-block">
			<span className={`${isLowCharge ? "low-charge" : ""}`}>{`${viewTime.hours}:${viewTime.minutes}:${viewTime.seconds}`}</span>
		</div>
	);
};

ElectricityTimer.propTypes = {
	timeToRecharge: PropTypes.string.isRequired,
	setActiveCellsCountHandler: PropTypes.func.isRequired,
	startRecharge: PropTypes.string.isRequired,
	setProgressRechargePercent: PropTypes.func.isRequired,
	setElectricityPulsatedBtn: PropTypes.func.isRequired,
	isLowCharge: PropTypes.bool.isRequired,
};

export default ElectricityTimer;
