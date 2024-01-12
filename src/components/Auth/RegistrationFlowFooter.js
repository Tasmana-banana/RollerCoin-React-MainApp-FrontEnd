import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { Container } from "reactstrap";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { history } from "../../reducers";

import "../../assets/scss/Auth/RegistrationFlowFooter.scss";

const RegistrationFlowFooter = () => {
	const language = useSelector((state) => state.game.language);
	const { pathname } = history.location;
	const isVerifyPage = pathname.startsWith("/email-verify");
	return (
		<footer className="registration-footer">
			<Container className="container footer-container">
				<div className="footer-links">
					{!isVerifyPage && (
						<Fragment>
							<p>
								<a href={`${getLanguagePrefix(language)}/terms`}>Terms Of Use</a>
							</p>
							<p>
								<a href={`${getLanguagePrefix(language)}/privacy`}>Privacy Policy</a>
							</p>
							<p>
								<a href={`${getLanguagePrefix(language)}/disclaimer`}>Disclaimer</a>
							</p>
						</Fragment>
					)}
				</div>
				<div className="copyright-block">
					<p>© rollercoin.com 2023 All rights reserved</p>
				</div>
			</Container>
		</footer>
	);
};

export default RegistrationFlowFooter;
