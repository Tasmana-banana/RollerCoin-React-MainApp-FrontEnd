import React from "react";
import { Progress } from "reactstrap";
import PropTypes from "prop-types";

const DifficultyBar = ({ currentLevel }) => {
	const MAX_LEVEL = 10;
	const progress = [];
	for (let i = 0; i < MAX_LEVEL; i++) {
		progress.push(<Progress value={i < currentLevel ? 100 : 0} className="progress-block" key={i.toString()} />);
	}
	return progress;
};

DifficultyBar.propTypes = {
	currentLevel: PropTypes.number.isRequired,
};

export default DifficultyBar;
