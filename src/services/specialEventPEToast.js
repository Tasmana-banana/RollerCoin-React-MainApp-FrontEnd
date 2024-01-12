import React from "react";
import { toast } from "react-toastify";
import store from "../store";
import { setIsPEUserStatsNeedRefresh } from "../actions/progressionEvent";

const renderToast = (points, img) => (
	<div className="progression-task-toast">
		<div className="progression-toast-img-wrapper">
			<img className="progression-toast-img" src={img} alt="progression event multiplier" />
		</div>
		<div className="progression-toast-description">
			<p className="progression-toast-text">
				<span>+{points}</span> points
			</p>
		</div>
	</div>
);

const specialEventPEToast = (value, rewardIcon) => {
	if (value) {
		store.dispatch(setIsPEUserStatsNeedRefresh(true));
		toast(renderToast(`${value}`, rewardIcon), {
			className: "progression-task-toast-container",
			position: "top-left",
			autoClose: 4000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	}
};

export default specialEventPEToast;
