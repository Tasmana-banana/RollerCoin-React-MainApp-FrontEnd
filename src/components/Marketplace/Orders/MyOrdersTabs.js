import React from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";
import { useHistory } from "react-router-dom";

import "../../../assets/scss/SingleComponents/RollerTabs/MyOrdersTabs.scss";
import "../../../assets/scss/SingleComponents/RollerTabs/RollerTabsBase.scss";

const MyOrdersTabs = ({ tabsConfig, active, onSelect, children, className = "", iconSize = 24 }) => {
	const history = useHistory();
	return (
		<div className={`tabs-container roller-tabs-base my-orders-tabs ${className}`}>
			<Nav tabs>
				{Object.entries(tabsConfig).map(([key, item]) => (
					<NavItem key={key}>
						<NavLink
							className={`${active === key ? "active" : ""}`}
							onClick={() => {
								if (item.href) {
									history.push(item.href);
								}
								onSelect(key);
							}}
						>
							{item.icon && <img src={item.icon} alt="Tab icon" height={iconSize} width={iconSize} />}
							{item.title}
							{item.count && <span className={`count`}>{item.count}</span>}
						</NavLink>
					</NavItem>
				))}
			</Nav>
			<TabContent activeTab={active}>{children}</TabContent>
		</div>
	);
};

MyOrdersTabs.propTypes = {
	tabsConfig: PropTypes.object.isRequired,
	active: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	className: PropTypes.string,
	iconSize: PropTypes.number,
	children: PropTypes.element.isRequired,
};

export default MyOrdersTabs;
