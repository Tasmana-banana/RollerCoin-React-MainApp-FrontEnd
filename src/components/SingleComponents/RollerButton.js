import React, { Fragment } from "react";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/RollerButton.scss";

import buttonLoader from "../../assets/img/button-loader.gif";

const RollerButton = ({ size = "default", width, color = "default", action = null, disabled = false, text = "", icon = "", redDot = false, className = "", isLoading = false, hidden = false }) => {
	const SIZE_ICON = {
		smallest: 16,
		small: 18,
		medium: 22,
		default: 24,
		large: 26,
	};
	const ICON_ONLY = {
		smallest: 16,
		small: 24,
		medium: 26,
		default: 30,
		large: 36,
	};

	return (
		<button
			type="button"
			className={`roller-button ${size} ${color} ${className} ${isLoading ? "loading" : ""}`}
			style={width ? { width: `${width}%` } : {}}
			onClick={isLoading ? null : action}
			disabled={disabled}
			hidden={hidden}
		>
			{!disabled && <span className="shadow-3d" />}
			<div className="roller-button-text-wrapper">
				{isLoading && (
					<div className="roller-button-img">
						<img src={buttonLoader} width={text ? SIZE_ICON[size] : ICON_ONLY[size]} height={text ? SIZE_ICON[size] : ICON_ONLY[size]} alt="loading" />
					</div>
				)}
				{!isLoading && (
					<Fragment>
						{icon && (
							<div className={`roller-button-img ${text ? "with-separate" : ""}`}>
								<img src={icon} width={text ? SIZE_ICON[size] : ICON_ONLY[size]} height={text ? SIZE_ICON[size] : ICON_ONLY[size]} alt="icon" />
							</div>
						)}
						<span className="roller-button-text">{text}</span>
					</Fragment>
				)}
			</div>
			{redDot && <span className="red-dot" />}
		</button>
	);
};

RollerButton.propTypes = {
	size: PropTypes.oneOf(["small", "default", "large", "smallest", "medium"]),
	color: PropTypes.oneOf(["default", "cyan", "gold", "red"]),
	action: PropTypes.func,
	disabled: PropTypes.bool,
	text: PropTypes.string,
	icon: PropTypes.string,
	width: PropTypes.number,
	redDot: PropTypes.bool,
	className: PropTypes.string,
	isLoading: PropTypes.bool,
	hidden: PropTypes.bool,
};

export default RollerButton;
