import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";

import craftingOfferClockIcon from "../../../assets/img/market/crafting_offer_clock_icon.svg";

const CountdownTimer = ({ date }) => {
	const timer = useRef(null);
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [viewTime, setViewTime] = useState({
		days: "0D",
		hours: "0H",
		minutes: "00M",
	});

	useEffect(() => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(date));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	}, [date]);

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setViewTime({
				days: "0D",
				hours: "00H",
				minutes: "00M",
			});
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		setViewTime({
			days: time.days,
			hours: time.hours,
			minutes: time.minutes,
		});
	}, [timeLeftSeconds]);

	return (
		<div className="crafting-title-timer">
			<img className="crafting-timer-icon" src={craftingOfferClockIcon} alt="crafting timer icon" />
			<span className="crafting-timer-text">
				{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes} {viewTime.seconds}
			</span>
		</div>
	);
};

CountdownTimer.propTypes = {
	date: PropTypes.string.isRequired,
};

export default CountdownTimer;
