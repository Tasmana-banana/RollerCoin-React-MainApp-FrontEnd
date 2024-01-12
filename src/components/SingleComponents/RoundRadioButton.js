import React from "react";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/RoundRadioButton.scss";

const RoundRadioButton = ({ title, subtitle, value, isChecked, handleChange, margin = 0, className = "", bannerId }) => {
	const handleRadioChange = (e) => {
		const { id } = e.currentTarget;
		if (bannerId) {
			handleChange(id, value);
		} else {
			handleChange(id);
		}
	};
	return (
		<label className={`custom-round-radio ${className}`} style={{ marginBottom: `${margin}px` }}>
			<input type="radio" className="custom-round-radio-button" name={title} id={bannerId || value} checked={isChecked} onChange={handleRadioChange} />
			<span className="radio-label-title">{title}</span>
			{!!subtitle && <span className="radio-label-subtitle">{subtitle}</span>}
			<div className="radio-label-checkmark" />
		</label>
	);
};

RoundRadioButton.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	value: PropTypes.string.isRequired,
	isChecked: PropTypes.bool.isRequired,
	handleChange: PropTypes.func.isRequired,
	margin: PropTypes.number,
	className: PropTypes.string,
	bannerId: PropTypes.string,
};

export default RoundRadioButton;
