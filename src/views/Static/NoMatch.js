import React, { Component } from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import getLanguagePrefix from "../../services/getLanguagePrefix";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});
class WellDone extends Component {
	static propTypes = {
		language: PropTypes.string.isRequired,
		match: PropTypes.object.isRequired,
	};

	render() {
		const { language } = this.props;
		return (
			<Container className="main-container">
				<Helmet>
					<title>404 | Page not found | RollerCoin.com</title>
				</Helmet>
				<Row className="justify-content-center">
					<Col xs="12" className="page-header">
						<h1>Page not found</h1>
					</Col>
					<Col lg="6" className="light-gray-bg pd-32">
						<div className="text-center default-text">
							<p className="mgb-24">The link is broken or the page has been moved.</p>
							<a href={`${getLanguagePrefix(language)}/`} className="tree-dimensional-button btn-cyan w-80">
								<span>MAIN PAGE</span>
							</a>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}
export default connect(mapStateToProps, null)(WellDone);
