import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { initTimer, makeCounterData } from "../../services/countdownТimer";

import "../../assets/scss/SingleComponents/EventTimer.scss";

import clockIcon from "../../assets/img/icon/clock_icon_fff.svg";

const EventTimer = ({
	toDate,
	minWidth,
	timerText = "",
	handleChangeAnimationType = null,
	isStartTimer = true,
	startDate = "",
	isShowSeconds = false,
	needToFetch = null,
	handleIsLittleLeftTime = null,
}) => {
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [viewTime, setViewTime] = useState({
		days: "",
		hours: "0h",
		minutes: "00m",
		seconds: "00s",
	});
	const [progress, setProgress] = useState(0);
	const timer = useRef(null);

	useEffect(() => {
		startTimer();
		return () => {
			if (timer.current) {
				clearInterval(timer.current);
			}
		};
	}, [toDate, isStartTimer]);

	const startTimer = () => {
		if (timer.current) {
			clearInterval(timer.current);
		}

		setTimeLeftSeconds(initTimer(toDate));

		const calculatePercentageDifference = () => {
			const currentDate = dayjs().valueOf();
			const totalTime = dayjs(toDate).valueOf() - dayjs(startDate).valueOf();
			const elapsedTime = currentDate - dayjs(startDate).valueOf();
			return 100 - (elapsedTime / totalTime) * 100;
		};

		if (isStartTimer) {
			timer.current = setInterval(() => {
				setTimeLeftSeconds((prev) => prev - 1);

				if (startDate) {
					setProgress(calculatePercentageDifference().toFixed(2));
				}
			}, 1000);
		}
	};

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setViewTime({
				days: "",
				hours: "0h",
				minutes: "00m",
				seconds: "00s",
			});
			if (handleChangeAnimationType) {
				handleChangeAnimationType();
			}
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		if (handleIsLittleLeftTime) {
			handleIsLittleLeftTime(toDate);
		}
		if (needToFetch && viewTime.hours > time.hours) {
			setTimeout(() => {
				needToFetch(true);
			}, 10000);
		}
		setViewTime({
			days: time.days,
			hours: time.hours,
			minutes: time.minutes,
			seconds: time.seconds,
		});
	}, [timeLeftSeconds]);

	return (
		<div className="event-timer" style={minWidth ? { minWidth: `${minWidth}px` } : {}}>
			{!!startDate && <span className="event-timer-progress" style={{ width: `${progress}%` }}></span>}
			<div className="remaining-time">
				{timerText && <span className="timer-text">{timerText}</span>}
				<div className="time-icon">
					<LazyLoadImage src={clockIcon} width={16} height={16} offset={100} alt="timer" />
				</div>
				<p className="time-text">
					{!!viewTime.days && `${viewTime.days}`} {viewTime.hours} : {viewTime.minutes}
					{isShowSeconds ? ` : ${viewTime.seconds}` : ""}
				</p>
			</div>
		</div>
	);
};

EventTimer.propTypes = {
	toDate: PropTypes.string.isRequired,
	minWidth: PropTypes.number,
	isShowSeconds: PropTypes.bool,
	timerText: PropTypes.string,
	isStartTimer: PropTypes.bool,
	startDate: PropTypes.string,
	handleChangeAnimationType: PropTypes.func,
	needToFetch: PropTypes.func,
	handleIsLittleLeftTime: PropTypes.func,
};

export default EventTimer;
