import React from "react";
import PropTypes from "prop-types";

const NavTab = ({ currentCurrencyConfig, changeRoute, miningConfig }) =>
	miningConfig.map((item) => (
		<div key={item.code} className={`nav-tab-item${currentCurrencyConfig.code === item.code ? " active-currency" : ""}`} onClick={() => changeRoute(item.code)}>
			<img src={`/static/img/icon/currencies/${item.img}.svg?v=1.11`} alt={item.img} />
			<span className="nav-tab-name">{item.name}</span>
		</div>
	));
NavTab.propTypes = {
	changeRoute: PropTypes.func.isRequired,
	miningConfig: PropTypes.array.isRequired,
	currentCurrencyConfig: PropTypes.object.isRequired,
};
export default NavTab;
