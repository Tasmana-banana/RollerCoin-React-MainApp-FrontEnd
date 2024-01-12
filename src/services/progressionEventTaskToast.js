import React from "react";
import { toast } from "react-toastify";
import store from "../store";
import { setIsPEUserStatsNeedRefresh } from "../actions/progressionEvent";

const renderToast = (points, img) => (
	<div className="progression-task-toast">
		<div className="progression-toast-img-wrapper">
			<img className="progression-toast-img" src={`/static/img/progressionEvent/${img}`} alt="progression event multiplier" />
		</div>
		<div className="progression-toast-description">
			<p className="progression-toast-text">
				<span>+{points}</span> points
			</p>
		</div>
	</div>
);

const progressionEventTaskToast = (value) => {
	if (value.received_xp) {
		store.dispatch(setIsPEUserStatsNeedRefresh(true));
		toast(renderToast(`${value.received_xp}`, "task-toast-icon.svg?v=1.0.1"), {
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

export default progressionEventTaskToast;
