import React from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";
import { useHistory } from "react-router-dom";

import "../../assets/scss/SingleComponents/RollerTabs/RollerTabsBase.scss";

const RollerTabs = ({ tabsConfig, active, onSelect, className, children, iconSize = 24 }) => {
	const history = useHistory();
	return (
		<div className={`tabs-container roller-tabs-base ${className}`}>
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
							{item.count !== undefined && <span className={`count`}>{item.count}</span>}
						</NavLink>
					</NavItem>
				))}
			</Nav>
			<TabContent activeTab={active}>{children}</TabContent>
		</div>
	);
};

RollerTabs.propTypes = {
	tabsConfig: PropTypes.object.isRequired,
	active: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	className: PropTypes.string,
	children: PropTypes.element.isRequired,
	iconSize: PropTypes.number,
};

export default RollerTabs;
