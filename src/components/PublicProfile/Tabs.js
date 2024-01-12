import React from "react";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";

const Tabs = ({ pathName, id, tab, changeRoute }) => {
	const isActiveTab = pathName.includes(tab.toLowerCase()) || (pathName.endsWith(id) && tab === "Games");
	const onClickHandler = () => changeRoute(tab.toLowerCase());
	return (
		<div className={`${isActiveTab ? "active " : ""}transparent-roller-pill d-flex justify-content-between align-items-center`} onClick={onClickHandler} key={tab}>
			<div className="currency-title d-inline-flex align-items-center">
				<div className="icon">
					<LazyLoad offset={100}>
						<img src={`/static/img/publicProfile/${tab.toLowerCase()}.svg?v=1.1`} alt={tab} />
					</LazyLoad>
				</div>
				<div className="title-text">{tab}</div>
			</div>
		</div>
	);
};

Tabs.propTypes = {
	pathName: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	tab: PropTypes.string.isRequired,
	changeRoute: PropTypes.func.isRequired,
};

export default Tabs;
