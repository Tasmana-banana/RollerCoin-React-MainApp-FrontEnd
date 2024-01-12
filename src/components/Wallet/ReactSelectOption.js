import { components } from "react-select";
import React from "react";
import PropTypes from "prop-types";

const { Option, ValueContainer } = components;
const ReactSelectOption = (props) => (
	<Option {...props} className="react-select-option-with-image">
		<div className="d-flex w-100">
			<div>
				<img src={`/static/img/wallet/${props.data.value}.svg?v=1.13`} alt={props.data.value} width={20} height={20} />
			</div>
			<div className="d-flex justify-content-between flex-grow-1">
				<span>{props.data.label}</span> {props.data.discount > 0 && <span className="cyan-text bold-text">-{props.data.discount}%</span>}
			</div>
		</div>
	</Option>
);
ReactSelectOption.propTypes = {
	data: PropTypes.object.isRequired,
};
const ReactSelectValue = ({ children, ...props }) => (
	<ValueContainer {...props} className="react-select-option-with-image">
		<div>
			<div>
				<img src={`/static/img/wallet/${props.selectProps.value.value}.svg?v=1.13`} alt={props.selectProps.value.value} width={20} height={20} />
			</div>{" "}
			<div className="react-select-option-inner">{children}</div>
		</div>
	</ValueContainer>
);
ReactSelectValue.propTypes = {
	children: PropTypes.string.isRequired,
	selectProps: PropTypes.object.isRequired,
};
export { ReactSelectOption, ReactSelectValue };
