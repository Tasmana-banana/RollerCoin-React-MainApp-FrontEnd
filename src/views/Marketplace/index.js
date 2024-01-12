import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, Route, Switch, withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { Container, Row, Col, Nav, NavItem, NavLink, UncontrolledTooltip } from "reactstrap";
import * as actions from "../../actions/marketplace";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import BuyPage from "../../components/Marketplace/BuyPage";
import SellPage from "../../components/Marketplace/SellPage";
import MyOrders from "../../components/Marketplace/Orders/MyOrders";
import BuyItemPage from "../../components/Marketplace/BuyItemPage";
import SellItemPage from "../../components/Marketplace/SellItemPage";
import TutorialModal from "../../components/Tutorial/TutorialModal";
import BannersLoader from "../../components/Banners/BannersLoader";

import "../../assets/scss/Marketplace/main.scss";

import backIcon from "../../assets/img/wallet/back_angle.svg";
import buyIcon from "../../assets/img/marketplace/buy_icon.svg";
import sellIcon from "../../assets/img/marketplace/sell_icon.svg";
import ordersIcon from "../../assets/img/marketplace/orders_icon.svg";
import auctionIcon from "../../assets/img/marketplace/auction_icon.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	pathName: state.router.location.pathname,
	wsNode: state.webSocket.wsNode,
	isViewedTutorial: state.user.userViewedTutorial,
});

const mapDispatchToProps = (dispatch) => ({
	setMarketplaceConfig: (state) => dispatch(actions.setMarketplaceConfig(state)),
});

class MarketplaceClass extends Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		pathName: PropTypes.string.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		setMarketplaceConfig: PropTypes.func.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.controllers = {};
		this.signals = {};
		this.routesConfig = {
			buy: {
				path: "marketplace/buy",
				name: "buy",
				image: buyIcon,
				disabled: false,
			},
			sell: {
				path: "marketplace/sell",
				name: "sell",
				image: sellIcon,
				disabled: false,
			},
			orders: {
				path: "marketplace/orders",
				name: "orders",
				image: ordersIcon,
				disabled: false,
			},
			auction: {
				path: "marketplace/auction",
				name: "auction",
				image: auctionIcon,
				disabled: true,
			},
		};
	}

	componentDidMount() {
		this.getMarketplaceConfig();
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getCurrentRouteName = () => {
		const { pathName, t } = this.props;
		const currentGroup = Object.keys(this.routesConfig).find((key) => pathName.includes(this.routesConfig[key].path));
		return currentGroup ? t(`main.${this.routesConfig[currentGroup].name}`) : "";
	};

	isTabActive = (name) => {
		const { pathName, isMobile } = this.props;
		return (pathName.includes(name) || (pathName.endsWith("/marketplace") && name === "buy")) && !isMobile;
	};

	getMarketplaceConfig = async () => {
		const { setMarketplaceConfig } = this.props;
		this.createSignalAndController("getMarketplaceConfig");
		try {
			const json = await fetchWithToken(`/api/marketplace/config`, {
				method: "GET",
				signal: this.signals.getMarketplaceConfig,
			});
			if (!json.success) {
				return false;
			}

			setMarketplaceConfig(json.data);
			return json.data;
		} catch (err) {
			console.error(err);
		}
	};

	render() {
		const { pathName, t, language, isMobile, isViewedTutorial } = this.props;
		return (
			<Container className="marketplace-container">
				{!isViewedTutorial.marketplace && <TutorialModal tutorialCategories={"marketplace"} />}
				<Row>
					<Col xs="12">
						<Row>
							<Col xs="12" lg="3" className="marketplace-header">
								<div className="info-tooltip-icon-container">
									<div className="info-icon-block" id="marketplaceTooltipId">
										<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
									</div>
									<h1 className="marketplace-title">{t("main.marketplace")}</h1>
									<UncontrolledTooltip placement="right" autohide={true} target="marketplaceTooltipId">
										{t("infoHints.marketplaceTooltipText")}
									</UncontrolledTooltip>
								</div>
								<span className="marketplace-version">{t("main.marketplaceVersion")}</span>
							</Col>
						</Row>
						{isMobile && (pathName.endsWith("/buy") || pathName.endsWith("/sell") || pathName.endsWith("/orders") || pathName.endsWith("/auction")) && (
							<Row noGutters={true} className="mobile-header">
								<Link to={`${getLanguagePrefix(language)}/marketplace`} className="d-flex back-link">
									<span className="icon">
										<img src={backIcon} alt="back_angle" />
									</span>
									<span>{t("main.back")}</span>
								</Link>
								<p className="page-name">{this.getCurrentRouteName()}</p>
							</Row>
						)}
					</Col>
					{((isMobile && pathName.endsWith("/marketplace")) || !isMobile) && (
						<Col xs="12" lg="3" className="nav-pills-container">
							<Nav pills className="flex-column nav-pills w-100">
								{Object.keys(this.routesConfig).map((key) => (
									<NavItem key={key}>
										<NavLink
											tag={Link}
											to={`${getLanguagePrefix(language)}/${this.routesConfig[key].path}`}
											className={`${this.isTabActive(this.routesConfig[key].name) ? "active" : ""} link-pill-ico product-pill ${
												this.routesConfig[key].disabled ? "disabled" : ""
											}`}
											disabled={this.routesConfig[key].disabled}
										>
											<div className="d-flex">
												<div className="marketplace-nav-image">
													<img src={this.routesConfig[key].image} alt={key} />
												</div>
												<span>{t(`main.${this.routesConfig[key].name}`)}</span>
												{this.routesConfig[key].disabled && <span className="marketplace-nav-disabled-text">{t(`main.comingSoon`)}</span>}
											</div>
										</NavLink>
									</NavItem>
								))}
							</Nav>
							<div className="menu-adv-banners">
								<BannersLoader name="marketPlaceMenu" isMobile={isMobile} />
							</div>
						</Col>
					)}
					<Col xs="12" lg="9">
						<Switch>
							{!isMobile && <Route exact path={`${getLanguagePrefix(language)}/marketplace`} render={() => <BuyPage />} />}
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/buy`} render={() => <BuyPage />} />
							<Route path={`${getLanguagePrefix(language)}/marketplace/buy/:type/:id`} render={() => <BuyItemPage wsReact={this.props.wsReact} wsNode={this.props.wsNode} />} />
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/sell`} render={() => <SellPage />} />
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/sell/:type`} render={() => <SellPage />} />
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/sell/:type/:id`} render={() => <SellItemPage />} />
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/orders`} render={() => <MyOrders />} />
							<Route exact path={`${getLanguagePrefix(language)}/marketplace/orders/:type`} render={() => <MyOrders />} />
						</Switch>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default withRouter(withTranslation("Marketplace")(connect(mapStateToProps, mapDispatchToProps)(MarketplaceClass)));
