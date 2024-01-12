import React, { Fragment, useState } from "react";
import { FormFeedback, Input, Label } from "reactstrap";
import PropTypes from "prop-types";

import showImg from "../../../assets/img/profile/open.svg";
import hideImg from "../../../assets/img/profile/close.svg";

const PasswordInput = ({ id, label, value, onChangeHandler, onBlurHandler, error, className = "" }) => {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisible = () => setIsVisible(!isVisible);

	const onBlurWrapper = () => onBlurHandler(id);

	return (
		<Fragment>
			<Label for={id}>{label}</Label>
			<Input invalid={error} type={isVisible ? "text" : "password"} className={className} id={id} onBlur={onBlurWrapper} onChange={(e) => onChangeHandler(e.target.value, id)} value={value} />
			<span className="toggle-pass" onClick={toggleVisible}>
				<img src={!isVisible ? showImg : hideImg} alt={!isVisible ? "show" : "hide"} className="pass-control-btn" />
			</span>
			<FormFeedback>{error}</FormFeedback>
		</Fragment>
	);
};

PasswordInput.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	onChangeHandler: PropTypes.func.isRequired,
	onBlurHandler: PropTypes.func.isRequired,
	error: PropTypes.string.isRequired,
	className: PropTypes.string.isRequired,
};

export default PasswordInput;
