import React from "react";
import PropTypes from "prop-types";

import "../../assets/scss/SingleComponents/RollerCheckbox.scss";

const RollerCheckbox = ({ title, value, isChecked, handleChange, margin, className = "" }) => {
	const handleCheckbox = (e) => {
		const { id } = e.currentTarget;
		handleChange(id);
	};
	return (
		<div className={`roller-checkbox-wrapper ${className}`} style={margin ? { marginBottom: `${margin}px` } : {}}>
			<input type="checkbox" className="roller-checkbox-input" name={title} id={value} checked={isChecked} onChange={handleCheckbox} />
			<label className="checkbox-label" htmlFor={value}>
				{title}
			</label>
		</div>
	);
};

RollerCheckbox.propTypes = {
	title: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	isChecked: PropTypes.bool.isRequired,
	handleChange: PropTypes.func.isRequired,
	margin: PropTypes.number,
	className: PropTypes.string,
};

export default RollerCheckbox;
