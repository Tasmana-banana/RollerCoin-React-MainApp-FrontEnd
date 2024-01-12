import React from "react";
import * as PropType from "prop-types";

import "../../assets/scss/SingleComponents/ToggleSwitch.scss";

const ToggleSwitch = ({ name, id, handler, isActive, disabled }) => {
	const onChangeHandler = () => {
		if (disabled) {
			return false;
		}
		handler(!isActive);
	};
	return (
		<div className={`toggle-switch ${disabled ? "disabled" : ""}`}>
			<label className="switch" htmlFor={id}>
				<input type="checkbox" className="checkbox" name={name} id={id} checked={isActive} onChange={onChangeHandler} disabled={disabled} />
				<span className="slider" />
			</label>
		</div>
	);
};

ToggleSwitch.propTypes = {
	name: PropType.string.isRequired,
	id: PropType.string.isRequired,
	handler: PropType.func.isRequired,
	isActive: PropType.bool.isRequired,
	disabled: PropType.bool,
};

export default ToggleSwitch;
