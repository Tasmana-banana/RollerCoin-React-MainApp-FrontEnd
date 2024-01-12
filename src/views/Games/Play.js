import React, { Component } from "react";
import SignIn from "../SignIn";

import "../../assets/scss/Games/main.scss";

class Play extends Component {
	componentDidMount() {
		this.constructor.partnerScript();
	}

	static partnerScript() {
		const iframe = document.getElementById("ut-player");
		window.addEventListener("message", (event) => {
			if (event.source === iframe.contentWindow && event.data === "no_ads") {
				iframe.parentNode.removeChild(iframe);
			}
		});
	}

	render() {
		return (
			<div className="play-not-auth-container d-flex flex-column align-items-center">
				<iframe id="ut-player" width="640" height="360" frameBorder="0" scrolling="no" allowFullScreen allow="autoplay" src="//utraff.com/index.php?r=iframe/index&id=3697"></iframe>
				<SignIn />
			</div>
		);
	}
}

export default Play;
