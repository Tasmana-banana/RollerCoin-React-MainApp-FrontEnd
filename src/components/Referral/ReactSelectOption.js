import { components } from "react-select";
import React from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";

const { Option, ValueContainer } = components;
const ReactSelectOption = (props) => (
	<Option {...props} className="react-select-option-with-image">
		<div>
			<img src={`/static/img/referral/bounty/${props.data.value}.svg?v=1.1`} alt={props.data.value} width={20} height={20} />
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
			<LazyLoad offset={100}>
				<img src={`/static/img/referral/bounty/${props.selectProps.value.value}.svg?v=1.1`} alt={props.selectProps.value.value} width={20} height={20} />
			</LazyLoad>
			<div className="react-select-option-inner">{children}</div>
		</div>
	</ValueContainer>
);
ReactSelectValue.propTypes = {
	children: PropTypes.string.isRequired,
	selectProps: PropTypes.object.isRequired,
};
export { ReactSelectOption, ReactSelectValue };
