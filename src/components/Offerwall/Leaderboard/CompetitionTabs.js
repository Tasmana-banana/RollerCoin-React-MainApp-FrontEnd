import React from "react";
import PropTypes from "prop-types";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

const CompetitionTabs = ({ tabsConfig, activeTab, onSelect, children, className = "", iconSize = 21 }) => {
	const history = useHistory();
	const isMobile = useSelector((state) => state.game.isMobile);
	return (
		<div className={`leaderboard-tabs ${className}`}>
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
							{isMobile ? item.titleMobile : item.title}
						</NavLink>
					</NavItem>
				))}
			</Nav>
			<TabContent activeTab={activeTab}>{children}</TabContent>
		</div>
	);
};

CompetitionTabs.propTypes = {
	tabsConfig: PropTypes.object.isRequired,
	activeTab: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	className: PropTypes.string,
	children: PropTypes.element.isRequired,
	iconSize: PropTypes.number,
};

export default CompetitionTabs;
