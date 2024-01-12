import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { withTranslation } from "react-i18next";
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import Lightbox from "react-spring-lightbox";
import { CopyToClipboard } from "react-copy-to-clipboard";
import LazyLoad, { forceCheck } from "react-lazyload";

import CopyLinkComponent from "../../components/Referral/CopyLinkComponent";
import FadeAnimation from "../../components/Animations/FadeAnimation";
import RoundRadioButton from "../../components/SingleComponents/RoundRadioButton";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	referralId: state.user.referralId,
	language: state.game.language,
});

class PromoClass extends Component {
	static propTypes = {
		referralId: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.banners = [
			{
				width: 120,
				height: 240,
			},
			{
				width: 120,
				height: 600,
			},
			{
				width: 160,
				height: 600,
			},
			{
				width: 200,
				height: 200,
			},
			{
				width: 250,
				height: 250,
			},
			{
				width: 300,
				height: 250,
			},
			{
				width: 300,
				height: 600,
			},
			{
				width: 300,
				height: 1050,
			},
			{
				width: 320,
				height: 50,
			},
			{
				width: 320,
				height: 100,
			},
			{
				width: 320,
				height: 320,
			},
			{
				width: 460,
				height: 60,
			},
			{
				width: 728,
				height: 90,
			},
			{
				width: 970,
				height: 90,
			},
			{
				width: 970,
				height: 250,
			},
		];
		this.state = {
			activeTab: "gif",
			openedBanner: 0,
			copiedLink: (() => {
				const returnObj = {};
				this.banners.forEach((item, i) => {
					returnObj[`gif${i + 1}`] = false;
					returnObj[`png${i + 1}`] = false;
				});
				return returnObj;
			})(),
			bannersTypes: (() => {
				const returnObj = {};
				this.banners.forEach((item, i) => {
					returnObj[`gif${i + 1}`] = "generic";
					returnObj[`png${i + 1}`] = "generic";
				});
				return returnObj;
			})(),
		};

		this.copyTimeouts = (() => {
			const returnObj = {};
			this.banners.forEach((item, i) => {
				returnObj[`gif${i + 1}`] = 0;
				returnObj[`png${i + 1}`] = 0;
			});
			return returnObj;
		})();
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.activeTab !== prevState.activeTab) {
			forceCheck();
		}
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	setActiveTab = (tab) => {
		this.setState({
			activeTab: tab,
		});
	};

	toggleBanner = (id) => {
		const { openedBanner } = this.state;
		this.setState({ openedBanner: openedBanner === id ? 0 : id });
	};

	setCopiedState = (name) => {
		const setObj = {};
		setObj[name] = true;
		clearTimeout(this.copyTimeouts[name]);
		this.copyTimeouts[name] = setTimeout(() => {
			const setObjFalse = {};
			setObjFalse[name] = false;
			this.setState({
				copiedLink: { ...this.state.copiedLink, ...setObjFalse },
			});
		}, 3000);
		this.setState({
			copiedLink: { ...this.state.copiedLink, ...setObj },
		});
	};

	changeBannerTypeHandler = (id, bannerType) => {
		this.setState({
			bannersTypes: { ...this.state.bannersTypes, [id]: bannerType },
		});
	};

	createBanners = (type) => {
		const { t } = this.props;
		const { bannersTypes } = this.state;
		return this.banners.map((banner, i) => {
			if ("type" in banner && banner.type !== type) {
				return null;
			}
			const imageType = bannersTypes[`${type + (i + 1)}`] === "generic" ? "gen2" : "gen3";
			return (
				<div className="banner-item" key={i}>
					<div className="title-size">
						<p>
							{banner.width}x{banner.height} px
						</p>
					</div>
					<div className="banner-design-buttons">
						<form>
							<RoundRadioButton
								isChecked={bannersTypes[`${type + (i + 1)}`] === "generic"}
								title={`Generic Banner`}
								bannerId={`${type + (i + 1)}`}
								handleChange={this.changeBannerTypeHandler}
								value="generic"
								className="transparent-radio-button"
							/>
							<RoundRadioButton
								isChecked={bannersTypes[`${type + (i + 1)}`] === "seasonal"}
								title={`Seasonal Banner`}
								bannerId={`${type + (i + 1)}`}
								handleChange={this.changeBannerTypeHandler}
								value="seasonal"
								className="transparent-radio-button"
							/>
						</form>
					</div>
					<div className="banner-view">
						<LazyLoad offset={100}>
							<img src={`${process.env.STATIC_URL}/static/img/ref/${imageType}/w${banner.width}h${banner.height}.${type}?v=1.0.11`} alt={`w${banner.width}h${banner.height}`} />
						</LazyLoad>
						<div className="zoom" onClick={() => this.toggleBanner(i + 1)}>
							<LazyLoad offset={100}>
								<img src="/static/img/referral/zoom.svg" alt="zoom" />
							</LazyLoad>
						</div>
					</div>
					<div className="text-block">
						<p>HTML {t("promo.code")}</p>
					</div>
					<div className="referral-link-container">
						<p>
							&lt;!--Start rollercoin.com code--&gt;
							<br />
							&lt;a href=&quot;https://rollercoin.com/?r=
							{this.props.referralId}
							&quot;&gt;
							<br />
							&nbsp;&nbsp; &lt;img src=&quot;{process.env.STATIC_URL}/static/img/ref/{imageType}/w{banner.width}h{banner.height}.{type}
							&quot;/&gt; <br /> &lt;/a&gt; <br /> &lt;!--End rollercoin.com code--&gt;
						</p>
					</div>
					<div className="copy-btn-container">
						<CopyToClipboard
							text={`
						<!--Start rollercoin.com code-->
						<a href="https://rollercoin.com/?r=${this.props.referralId}">
							<img src="${process.env.STATIC_URL}/static/img/ref/${imageType}/w${banner.width}h${banner.height}.${type}" alt="${banner.width}h${banner.height}"/>
						</a>
						<!--End rollercoin.com code-->
					`}
							onCopy={() => this.setCopiedState(`${type + (i + 1)}`)}
						>
							<button type="button" className="btn btn-default-btn copy-btn">
								{this.state.copiedLink[`${type + (i + 1)}`] ? t("promo.copied") : t("promo.copy")}
							</button>
						</CopyToClipboard>
					</div>
				</div>
			);
		});
	};

	render() {
		const { t } = this.props;
		const { activeTab, openedBanner, bannersTypes } = this.state;
		const imageExt = activeTab === "static" ? "png" : "gif";
		const images = this.banners.map((banner, index) => ({
			src: `${process.env.STATIC_URL}/static/img/ref/${bannersTypes[`${imageExt + (index + 1)}`] === "generic" ? "gen2" : "gen3"}/w${banner.width}h${banner.height}.${imageExt}?v=1.0.11`,
			loading: "lazy",
			alt: `ref_${banner.width}x${banner.height}`,
			index,
		}));

		const gotoPrevious = () => openedBanner > 0 && this.toggleBanner(openedBanner - 1);

		const gotoNext = () => openedBanner + 1 < images.length && this.toggleBanner(openedBanner + 1);
		return (
			<FadeAnimation>
				<Row className="promo-container">
					<Helmet>
						<title>{t("promo.title")}</title>
					</Helmet>
					{this.props.referralId !== "" && (
						<Col xs="12" lg="6" className="left-block">
							<Nav pills className="nav-pills vertical-pills">
								<NavItem>
									<NavLink className={`${this.state.activeTab === "static" ? "active" : ""}`} onClick={() => this.setActiveTab("static")}>
										{t("promo.static")}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={`${this.state.activeTab === "gif" ? "active" : ""}`} onClick={() => this.setActiveTab("gif")}>
										{t("promo.gif")}
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={this.state.activeTab} className="dark-gray-bg banners-tab">
								<TabPane tabId="static">{this.createBanners("png")}</TabPane>
								<TabPane tabId="gif">{this.createBanners("gif")}</TabPane>
							</TabContent>
						</Col>
					)}
					<Col xs="12" lg="6" className="right-block">
						<CopyLinkComponent />
					</Col>
				</Row>
				<Lightbox
					onPrev={gotoPrevious}
					onNext={gotoNext}
					currentIndex={openedBanner === 0 ? 0 : openedBanner - 1}
					setCurrentIndex={this.toggleBanner}
					isOpen={!!openedBanner}
					onClose={() => this.toggleBanner(0)}
					images={images}
				/>
			</FadeAnimation>
		);
	}
}

const Promo = withTranslation("Referral")(connect(mapStateToProps, null)(PromoClass));
export default Promo;
