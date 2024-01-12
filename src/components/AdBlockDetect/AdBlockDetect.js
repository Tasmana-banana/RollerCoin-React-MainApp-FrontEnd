import React, { Component } from "react";
import { Container } from "reactstrap";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";

import "../../assets/scss/AdBlockDetected.scss";
import attention from "../../assets/img/game/attention.gif";

export default class AdBlockDetect extends Component {
	constructor(props) {
		super(props);
		this.state = {
			adBlockDetected: false,
			routeUpdated: false,
		};
		this.checkTimeout = 0;
		this.detectAdBlocker = this.detectAdBlocker.bind(this);
	}

	componentDidMount() {
		this.detectAdBlocker();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.pathName !== this.props.pathName) {
			this.detectAdBlocker();
		}
	}

	componentWillUnmount() {
		clearTimeout(this.checkTimeout);
	}

	detectAdBlocker() {
		clearTimeout(this.checkTimeout);
		const removeBait = () => {
			try {
				// clean up stale bait
				const bait = document.getElementById("ads");
				if (bait) {
					document.body.removeChild(bait);
				}
			} catch (e) {
				console.error("Can't find bait");
			}
		};
		const testAdBlockDetected = () => {
			function checkForBlock(element) {
				switch (true) {
					case element.style.display === "none":
					case element.style.display === "hidden":
					case element.style.visibility === "hidden":
						return true;
					default:
						break;
				}
				return false;
			}
			const bait = document.getElementById("ads");
			try {
				if (checkForBlock(bait)) {
					adBlockDetected();
				} else {
					this.setState({
						adBlockDetected: false,
					});
					removeBait();
				}
			} catch (e) {
				adBlockDetected();
			}
		};

		const adBlockDetected = () => {
			this.checkTimeout = setTimeout(this.detectAdBlocker, 1000);
			this.setState({
				adBlockDetected: true,
			});
			removeBait();
		};

		const bait = document.createElement("img");
		bait.src = "/static/img/referral_160-600.png";
		bait.id = "ads";
		bait.onload = testAdBlockDetected;
		bait.onerror = adBlockDetected;
		document.body.appendChild(bait);
	}

	static noticeContentJSX() {
		return (
			<Container fluid={true} className="adBlock-banner">
				<div className="attention-img text-center">
					<LazyLoad offset={100}>
						<img src={attention} alt="attention" />
					</LazyLoad>
				</div>
				<div className="attention-text-container text-center">
					<p className="header-attention">Apparently, AdBlock is on</p>
					<p className="body-attention">
						Please disable it in your browser settings,
						<br /> refresh the page and play the game.
					</p>
				</div>
			</Container>
		);
	}

	render() {
		return <div>{this.state.adBlockDetected && this.constructor.noticeContentJSX()}</div>;
	}
}

AdBlockDetect.propTypes = {
	pathName: PropTypes.string.isRequired,
};
