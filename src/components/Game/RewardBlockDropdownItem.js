import React from "react";
import PropTypes from "prop-types";
import FormattedCurrencyOutput from "../SingleComponents/FormattedCurrencyOutput";

const RewardBlockDropdownItem = (props) => {
	return (
		<div className={`currencies-dropdown-container ${props.type === "MyPower" ? "my-power" : ""}`}>
			{props.data.map((item) => (
				<div key={item.name} className="currencies-dropdown-item">
					<div className="dropdown-item-img">
						<img src={`/static/img/icon/currencies/${item.img}.svg?v=1.0`} alt={item.code} height={24} width={24} />
					</div>
					<span className="dropdown-item-currency">{item.name}</span>
					<div className="dropdown-item-power">
						{item.precision ? <FormattedCurrencyOutput amount={item.value} precision={item.precision} precisionToBalance={item.precisionToBalance} /> : <p>{item.value}</p>}
					</div>
				</div>
			))}
		</div>
	);
};
RewardBlockDropdownItem.propTypes = {
	data: PropTypes.array.isRequired,
	type: PropTypes.string,
};
export default RewardBlockDropdownItem;
