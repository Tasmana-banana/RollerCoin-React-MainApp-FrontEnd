import React, { Fragment } from "react";
import { Button } from "reactstrap";
import PropTypes from "prop-types";

import loaderImg from "../../assets/img/loader_sandglass.gif";

import "../../assets/scss/SingleComponents/LoginBtn.scss";

const LoginBtn = ({ text, logo, className, onClick, isLoading }) => (
	<Fragment>
		{!!isLoading && (
			<span className="login-btn-loader">
				<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
			</span>
		)}
		<Button className={["login-button", className].join(" ")} onClick={onClick}>
			<div className="login-logo">
				<img width={20} height={20} src={logo} alt={text} />
			</div>
			<p className="login-label">{text}</p>
		</Button>
	</Fragment>
);

LoginBtn.propTypes = {
	text: PropTypes.string.isRequired,
	logo: PropTypes.object.isRequired,
	className: PropTypes.string,
	onClick: PropTypes.func,
	isLoading: PropTypes.bool,
};

export default LoginBtn;
