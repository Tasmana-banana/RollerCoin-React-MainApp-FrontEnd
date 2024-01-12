import React from "react";
import { Row, TabPane } from "reactstrap";
import PropTypes from "prop-types";
import ComponentCard from "./ComponentCard";

const ComponentTab = ({ type, gender, currentTypeComponents, codeInAvatarConfig, updateAvatarConfig }) => (
	<TabPane tabId={type}>
		<Row className="mobile-slider">
			{currentTypeComponents.map((code) => (
				<ComponentCard key={code} code={code} gender={gender} type={type} isSelected={codeInAvatarConfig === code} updateAvatarConfig={updateAvatarConfig} />
			))}
		</Row>
	</TabPane>
);

ComponentTab.propTypes = {
	type: PropTypes.string.isRequired,
	gender: PropTypes.string.isRequired,
	currentTypeComponents: PropTypes.array.isRequired,
	codeInAvatarConfig: PropTypes.number.isRequired,
	updateAvatarConfig: PropTypes.func.isRequired,
};

export default ComponentTab;
