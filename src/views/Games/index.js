import React from "react";
import PropTypes from "prop-types";
import ChooseGame from "../Game/Choose";

import "../../assets/scss/Game/main.scss";

const Games = ({ wsReact }) => (
	<div className="react-body">
		<div className="react-wrapper">
			<ChooseGame wsReact={wsReact} />
		</div>
	</div>
);

Games.propTypes = {
	wsReact: PropTypes.object.isRequired,
};

export default Games;
