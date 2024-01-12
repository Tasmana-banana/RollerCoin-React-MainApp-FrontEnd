import React from "react";
import PropTypes from "prop-types";

const Youtube = ({ id, width = 320, height = 180, allowFullScreen = 0 }) => (
	<iframe
		className="youtube-player"
		title="Rollercoin video"
		frameBorder="0"
		sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-presentation"
		width={width}
		height={height}
		allowFullScreen={true}
		src={`https://youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1&showinfo=0&fs=${allowFullScreen}`}
	/>
);

Youtube.propTypes = {
	id: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	allowFullScreen: PropTypes.bool,
};

export default Youtube;
