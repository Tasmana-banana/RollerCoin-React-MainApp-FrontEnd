import React from "react";
import { Progress } from "reactstrap";
import PropTypes from "prop-types";

const LevelBar = ({ level }) => {
	const progress = [];
	for (let i = 0; i < level.size; i += 1) {
		progress.push(<Progress value={i < level.progress ? 100 : 0} className="progress-block" key={i.toString()} />);
	}
	return progress;
};

LevelBar.propTypes = {
	level: PropTypes.number.isRequired,
};

export default LevelBar;
