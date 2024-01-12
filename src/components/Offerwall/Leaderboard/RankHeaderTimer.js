import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";

import timerIcon from "../../../assets/img/market/crafting_timer_icon.svg";

const RankHeaderTimer = ({ contest }) => {
	const [viewTime, setViewTime] = useState({
		days: "00",
		hours: "00",
		minutes: "00",
	});
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const timer = useRef(null);

	useEffect(() => {
		return () => {
			if (timer.current) {
				clearInterval(timer.current);
			}
		};
	}, []);

	useEffect(() => {
		startTimer(contest.endDate);
		if (timeLeftSeconds <= 0) {
			clearInterval(timer.current);
			setViewTime({
				days: "0d",
				hours: "00h",
				minutes: "00m",
			});
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		setViewTime({
			days: time.days || "0d",
			hours: time.hours || "00h",
			minutes: time.minutes,
		});
	}, [timeLeftSeconds]);

	const startTimer = (date) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(date));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	return (
		<div className="timer-block">
			<div className="timer-text">
				<img src={timerIcon} alt="crafting-timer" width={16} height={16} />
				<span>
					{viewTime.days && `${viewTime.days}`} : {viewTime.hours} : {viewTime.minutes}
				</span>
			</div>
		</div>
	);
};

RankHeaderTimer.propTypes = {
	contest: PropTypes.object.isRequired,
};

export default RankHeaderTimer;
