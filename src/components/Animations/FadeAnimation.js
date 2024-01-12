import React from "react";
import { Spring } from "react-spring/renderprops-universal";
import PropTypes from "prop-types";

const FadeAnimation = (props) => (
	<Spring config={{ duration: props.duration }} from={{ opacity: 0 }} to={{ opacity: 1 }}>
		{(styles) => <div style={styles}>{props.children}</div>}
	</Spring>
);
FadeAnimation.propTypes = {
	children: PropTypes.element.isRequired,
	duration: PropTypes.number.isRequired,
};

FadeAnimation.defaultProps = {
	duration: 600,
};

export default FadeAnimation;
