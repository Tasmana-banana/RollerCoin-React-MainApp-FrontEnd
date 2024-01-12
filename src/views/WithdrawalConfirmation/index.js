import React, { Component } from "react";
import { Row, Col, Container } from "reactstrap";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import LazyLoad from "react-lazyload";
import fetchWithToken from "../../services/fetchWithToken";

class WithdrawalConfirmation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmed: null,
			error: "",
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	componentDidMount() {
		this.confirmWithdrawal();
	}

	confirmWithdrawal = async () => {
		this.createSignalAndController();
		try {
			const json = await fetchWithToken(`/api/validate-confirmation-withdrawal-code/${this.props.match.params.token}`, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return this.setState({
					confirmed: false,
					error: json.error,
				});
			}
			this.setState({ confirmed: true });
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		return (
			<Container className="main-container">
				<Row className="justify-content-center">
					<Col xs="12" className="page-header">
						<h1>Confirm withdrawal</h1>
					</Col>
					<Col md="6" className="light-gray-bg p-5">
						<Row>
							<Col xs="12" className="text-center default-text">
								{this.state.confirmed && (
									<div className="row no-gutters justify-content-beetwen align-items-center dark-gray-bg p-4">
										<Col xs="4" md="2">
											<LazyLoad offset={100}>
												<img src="/static/img/icon/success_notice.svg" alt="check" />
											</LazyLoad>
										</Col>
										<Col xs="8" md="10">
											<p className="mgb-0">
												Your withdrawal request is accepted.
												<br /> It will be processed within 1-3 business days.
											</p>
										</Col>
									</div>
								)}
								{this.state.confirmed === false && (
									<div className="row no-gutters justify-content-beetwen align-items-center dark-gray-bg p-4">
										<Col xs="4" md="2">
											<LazyLoad offset={100}>
												<img src="/static/img/icon/error_notice.svg" alt="error" />
											</LazyLoad>
										</Col>
										<Col xs="8" md="10">
											<p className="mgb-0">
												An error occurred during confirmation, the error text: <span className={"text-danger"}>{this.state.error}</span>
											</p>
										</Col>
									</div>
								)}
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		);
	}
}

WithdrawalConfirmation.propTypes = {
	match: PropTypes.object.isRequired,
};

export default withRouter(WithdrawalConfirmation);
