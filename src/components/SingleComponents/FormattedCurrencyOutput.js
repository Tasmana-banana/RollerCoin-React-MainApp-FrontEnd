import React from "react";
import PropTypes from "prop-types";

const FormattedCurrencyOutput = ({ amount, precision, precisionToBalance }) => {
	const valueArr = amount.toString().split(".");
	return precisionToBalance >= precision ? (
		<p>
			<span>{valueArr[0]}</span>
			{!!valueArr[1] && (
				<span>
					{`.${valueArr[1].slice(0, precision)}`}
					<small className="btc-small-numbers">{valueArr[1].slice(precision)}</small>
				</span>
			)}
		</p>
	) : (
		<p>{amount}</p>
	);
};
FormattedCurrencyOutput.propTypes = {
	amount: PropTypes.string.isRequired,
	precision: PropTypes.number.isRequired,
	precisionToBalance: PropTypes.number.isRequired,
};
export default FormattedCurrencyOutput;
