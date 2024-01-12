import React, { Component } from "react";
import { Row, Col, Container } from "reactstrap";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Aside from "./Aside";
import getLanguagePrefix from "../services/getLanguagePrefix";
import "../assets/scss/Footer.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});

class Footer extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	render() {
		const { t, language } = this.props;
		return (
			<div className="main-footer">
				<Aside />
				<div className="bottom-footer-container">
					<Container>
						<Row className="align-items-center justify-content-between">
							<Col className="left-block">
								<div className="top-block">
									<p>
										<a href={`${getLanguagePrefix(language)}/privacy`}>{t("footer.privacy")}</a>
									</p>
									<p>|</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/terms`}>{t("footer.term")}</a>
									</p>
									<p>|</p>
									<p>
										<a href={`${getLanguagePrefix(language)}/disclaimer`}>{t("footer.disclaimer")}</a>
									</p>
								</div>
								<div className="bottom-block">
									<p>Copyright © rollercoin.com 2018-{new Date().getFullYear()}</p>
								</div>
							</Col>
						</Row>
					</Container>
				</div>
			</div>
		);
	}
}
export default withTranslation("Layout")(connect(mapStateToProps, null)(Footer));
