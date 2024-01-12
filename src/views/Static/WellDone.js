import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import LazyLoad from "react-lazyload";
import getLanguagePrefix from "../../services/getLanguagePrefix";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});
class WellDone extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
	};

	render() {
		const { language, t } = this.props;
		return (
			<Container className="main-container">
				<Row className="justify-content-center">
					<Col xs="12" className="page-header">
						<h1>{t("wellDone.title")}</h1>
					</Col>
					<Col lg="6" className="light-gray-bg pd-32">
						<div className="text-center mgb-24">
							<LazyLoad offset={100}>
								<img src="/static/img/autorize/hamster_and_mailman.svg" alt="hamster_and_mailman" />
							</LazyLoad>
						</div>
						<div className="text-center default-text">
							<p className="mgb-24">{t("wellDone.description")}</p>
							<a href={`${getLanguagePrefix(language)}/`} className="tree-dimensional-button btn-default w-80">
								<span>{t("wellDone.linkMain")}</span>
							</a>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}
export default withTranslation("Registration")(connect(mapStateToProps, null)(WellDone));
