import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import SocialBanner from "./SocialBanner";
import closeIcon from "../../assets/img/icon/close-light.svg";
import "../../assets/scss/SingleComponents/BannerOnGamePage.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
});

/* UPDATE BANNER VERSION */
const BANNER_VERSION = "1.1.3";

class BannerOnGamePage extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isBannerVisible: true,
			total: 0,
			templateDate: "00D : 00H : 00M",
		};
		this.endUTCDate = new Date("Aug 03 2021 10:00:00 GMT");
		this.timer = null;
	}

	componentDidMount() {
		if (!this.isBannerShows()) {
			this.setState({ isBannerVisible: false });
		}
		const total = Date.parse(this.endUTCDate.toString()) - Date.now();
		if (total > 0) {
			this.setState({ total });
			this.timer = setInterval(this.updateDate, 1000);
		}
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	isBannerShows = () => {
		if (!this.props.isMobile) {
			return true;
		}
		if (localStorage.getItem("bannerConfig")) {
			const bannerConfig = JSON.parse(localStorage.getItem("bannerConfig"));
			if (!bannerConfig.showOnMobile && bannerConfig.bannerVersion === BANNER_VERSION) {
				return false;
			}
		}
		return true;
	};

	closeBannerOnMobile = () => {
		const bannerConfig = {
			showOnMobile: false,
			bannerVersion: BANNER_VERSION,
		};
		try {
			localStorage.setItem("bannerConfig", JSON.stringify(bannerConfig));
		} catch (e) {
			console.error(e);
		}
		this.setState({ isBannerVisible: false });
	};

	getTimeRemaining = (endTime) => {
		const total = Date.parse(endTime) - Date.now();
		const minutes = Math.floor((total / 1000 / 60) % 60);
		const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
		const days = Math.floor(total / (1000 * 60 * 60 * 24));
		return { total, days, hours, minutes };
	};

	updateDate = () => {
		const time = this.getTimeRemaining(this.endUTCDate.toString());
		const days = `0${time.days}`.slice(-2);
		const hours = `0${time.hours}`.slice(-2);
		const minutes = `0${time.minutes}`.slice(-2);
		const templateData = `${days}D : ${hours}H : ${minutes}M`;

		this.setState({ total: time.total, templateData });
		if (time.total <= 0) {
			clearInterval(this.timer);
		}
	};

	render() {
		const { isBannerVisible, total, templateData } = this.state;
		return (
			isBannerVisible && (
				<Fragment>
					{total > 0 && (
						<div className="game-banner-container">
							{this.props.isMobile && (
								<div className="close-button-wrapper" onClick={this.closeBannerOnMobile}>
									<button className="close-button-custom">
										<img src={closeIcon} width={16} height={16} alt="close" />
									</button>
								</div>
							)}
							<div className="banner-text">
								<p className="banner-title">NEW ERA OF</p>
								<p className="banner-subtitle">ROLLERCOIN</p>
							</div>
							<p className="banner-timer">{templateData}</p>
						</div>
					)}
					{total <= 0 && <SocialBanner />}
				</Fragment>
			)
		);
	}
}

export default connect(mapStateToProps, null)(BannerOnGamePage);
