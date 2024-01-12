import { components } from "react-select";
import React from "react";
import PropTypes from "prop-types";

const { Option, ValueContainer } = components;
const ReactSelectOption = (props) => (
	<Option {...props} className="react-select-option-with-image">
		<div>
			<div>
				<img src={`/static/img/wallet/${props.data.icon}.svg?v=1.13`} alt={props.data.value} width={20} height={20} />
			</div>
			<div className="react-select-option-inner">{props.data.label}</div>
		</div>
	</Option>
);
ReactSelectOption.propTypes = {
	data: PropTypes.object.isRequired,
};
const ReactSelectValue = ({ children, ...props }) => (
	<ValueContainer {...props} className="react-select-option-with-image">
		<div>
			<img src={`/static/img/wallet/${props.selectProps.value.icon}.svg?v=1.13`} alt={props.selectProps.value.label} width={20} height={20} />
			<div className="react-select-option-inner">{children}</div>
		</div>
	</ValueContainer>
);

ReactSelectValue.propTypes = {
	children: PropTypes.string.isRequired,
	selectProps: PropTypes.object.isRequired,
};
export { ReactSelectOption, ReactSelectValue };
