import React from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";
import { useHistory } from "react-router-dom";

import "../../assets/scss/SingleComponents/RollerHorizontalTabs.scss";

const RollerHorizontalTabs = ({ tabsConfig, children, activeTab, onSelect, className = "", iconSize = 24 }) => {
	const history = useHistory();
	return (
		<div className={`roller-horizontal-tabs ${className}`}>
			<Nav tabs>
				{Object.entries(tabsConfig).map(([key, item]) => (
					<NavItem key={key}>
						<NavLink
							className={`${activeTab === key ? "active" : ""}`}
							onClick={() => {
								if (item.href) {
									history.push(item.href);
								}
								onSelect(key);
							}}
						>
							{item.icon && <img src={activeTab === key ? item.iconActive : item.icon} className="tabs-icon" alt="Tab icon" height={iconSize} width={iconSize} />}
							{item.title}
						</NavLink>
					</NavItem>
				))}
			</Nav>
			<TabContent activeTab={activeTab}>{children}</TabContent>
		</div>
	);
};

RollerHorizontalTabs.propTypes = {
	tabsConfig: PropTypes.object.isRequired,
	children: PropTypes.element.isRequired,
	activeTab: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	iconSize: PropTypes.number,
	className: PropTypes.string,
};
export default RollerHorizontalTabs;
