import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { Row, Col, Container } from "reactstrap";
import LazyLoad from "react-lazyload";

import "../../assets/scss/Static/Banned.scss";
import bannedImg from "../../assets/img/banned.gif";

export default class Banned extends Component {
	render() {
		return (
			<Container>
				<Helmet>
					<title>You are banned | RollerCoin.com</title>
				</Helmet>
				<Row noGutters={true} className={`banned-container justify-content-center`}>
					<Col xs="12" md="8" className="img-container te">
						<LazyLoad offset={100}>
							<img src={bannedImg} width={786} height={405} alt="banned" />
						</LazyLoad>
					</Col>
					<Col xs="12" md="8" className="text-container">
						<p>
							We’ve noticed some prohibited activity. Because of the game terms violation, we blocked your account to learn the details. That’s sad, we know. Email{" "}
							<a href="mailto:support@rollercoin.com">support@rollercoin.com</a> if you believe this happened by mistake.
						</p>
					</Col>
				</Row>
			</Container>
		);
	}
}
