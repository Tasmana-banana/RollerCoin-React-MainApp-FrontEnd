import React from "react";
import { NavItem, NavLink } from "reactstrap";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const ComponentNav = ({ type, image, isActive, setActive }) => {
	const { t } = useTranslation("Avatar");

	const onClickHandler = () => setActive(type);

	return (
		<NavItem key={type} active={isActive} onClick={onClickHandler}>
			<NavLink className="d-flex align-items-center">
				<div className="component-icon-wrapper">
					<img className="component-icon" src={image} alt={`${type} icon`} />
				</div>
				<p className="mb-0">{t(type)}</p>
			</NavLink>
		</NavItem>
	);
};

ComponentNav.propTypes = {
	type: PropTypes.string.isRequired,
	image: PropTypes.string.isRequired,
	isActive: PropTypes.bool.isRequired,
	setActive: PropTypes.func.isRequired,
};

export default ComponentNav;
