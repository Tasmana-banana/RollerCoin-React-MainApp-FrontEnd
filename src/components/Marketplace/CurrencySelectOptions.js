import { components } from "react-select";
import React from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";

const { Option, ValueContainer } = components;
const CurrencySelectOption = (props) => (
	<Option {...props}>
		<LazyLoad offset={100}>
			<img src={`/static/img/wallet/${props.data.value.toLowerCase()}.svg?v=1.13`} alt={props.data.value} width={20} height={20} />
		</LazyLoad>
		<span>{props.data.label}</span>
	</Option>
);
CurrencySelectOption.propTypes = {
	data: PropTypes.object.isRequired,
};
const CurrencySelectValue = ({ children, ...props }) => (
	<ValueContainer {...props}>
		<LazyLoad offset={100}>
			<img src={`/static/img/wallet/${props.selectProps.value.value.toLowerCase()}.svg?v=1.13`} alt={props.selectProps.value.value} width={20} height={20} />
		</LazyLoad>
		{children}
	</ValueContainer>
);
CurrencySelectValue.propTypes = {
	children: PropTypes.string.isRequired,
	selectProps: PropTypes.object.isRequired,
};
export { CurrencySelectOption, CurrencySelectValue };
