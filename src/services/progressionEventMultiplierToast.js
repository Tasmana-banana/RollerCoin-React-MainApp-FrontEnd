import React from "react";
import { toast } from "react-toastify";
import store from "../store";
import { setIsPEUserStatsNeedRefresh } from "../actions/progressionEvent";

const renderToast = (text, img) => (
	<div className="progression-multiplier-toast">
		<div className="progression-toast-img-wrapper">
			<img className="progression-toast-img" src={`/static/img/progressionEvent/${img}`} alt="progression event multiplier" />
		</div>
		<div className="progression-toast-description">
			<p className="progression-toast-text">
				Multiplier<br></br> increased to <span>x{text}</span>
			</p>
		</div>
	</div>
);

const progressionEventMultiplierToast = (value) => {
	if (value.multiplier) {
		store.dispatch(setIsPEUserStatsNeedRefresh(true));
		toast(renderToast(`${value.multiplier / 100}`, "multiplier-toast-icon.svg?v=1.0.2"), {
			className: "progression-multiplier-toast-container",
			position: "top-left",
			autoClose: 4000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	}
};

export default progressionEventMultiplierToast;
