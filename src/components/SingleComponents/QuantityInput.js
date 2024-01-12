import React from "react";
import PropTypes from "prop-types";
import { Input, InputGroup, InputGroupAddon } from "reactstrap";
import validator from "validator";
import RollerButton from "./RollerButton";

import "../../assets/scss/SingleComponents/QuantityInput.scss";

const QuantityInput = ({ value, min, max, handler, disabled, width, className = "" }) => {
	const inputHandler = (e, changedValue) => {
		e.stopPropagation();
		if (validator.isInt(changedValue.toString(), { min }) || changedValue === "") {
			handler(changedValue ? Math.min(changedValue, max) : "");
		}
	};

	return (
		<InputGroup className={`roller-quantity-inputs ${className}`} style={{ maxWidth: `${width ? `${width}px` : "100%"}` }}>
			<InputGroupAddon addonType="prepend">
				<RollerButton className="change-quantity-btn" text="-" disabled={value <= min || disabled} action={(e) => inputHandler(e, +value - 1)} />
			</InputGroupAddon>
			<Input
				value={value}
				className="quantity-input"
				onClick={(e) => {
					e.stopPropagation();
					e.target.select();
				}}
				onBlur={value < min ? (e) => inputHandler(e, min) : null}
				onChange={(e) => inputHandler(e, e.target.value)}
			/>
			<InputGroupAddon addonType="append">
				<RollerButton className="change-quantity-btn" text="+" disabled={value >= max || disabled} action={(e) => inputHandler(e, +value + 1)} />
			</InputGroupAddon>
		</InputGroup>
	);
};

QuantityInput.propTypes = {
	value: PropTypes.number.isRequired,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	handler: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	width: PropTypes.number,
	className: PropTypes.string,
};

export default QuantityInput;
