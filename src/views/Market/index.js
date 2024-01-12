import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter, Link, Route, Switch } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { Container, Nav, NavItem, NavLink, Row, Col, UncontrolledTooltip } from "reactstrap";
import { toast } from "react-toastify";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import redDotNotification from "../../services/redDotNotify";
import MarketBanner from "../../components/Market/MarketBanner";
import EventShop from "../../components/EventPass/EventShop";
import MarketSales from "../../components/Market/MarketSales";
import CraftOffer from "../../components/Market/CraftOffer";
import MarketAppearances from "../../components/Market/MarketAppearances";
import MarketMiners from "../../components/Market/MarketMiners";
import MarketBoxes from "../../components/Market/MarketBoxes";
import MarketRacks from "../../components/Market/MarketRacks";
import MarketHats from "../../components/Market/MarketHats";
import MarketTrophies from "../../components/Market/MarketTrophies";
import EventStore from "../../components/Market/EventStore/EventStore";
import ProgressionEvent from "../../components/ProgressionEvent/ProgressionEvent";
import TutorialModal from "../../components/Tutorial/TutorialModal";
import BannersLoader from "../../components/Banners/BannersLoader";
import * as actions from "../../actions/userInfo";
import * as actionsWallet from "../../actions/wallet";
import { MARKET_STORE_TYPE } from "../../constants/Market";

import "../../assets/scss/Game/Market.scss";

import leaderboardImg from "../../assets/img/offerwall/leaderboard_icon.svg";
import leaderboardImgActive from "../../assets/img/offerwall/leaderboard_icon_active.svg";
import minersNavImage from "../../assets/img/market/miner-nav.svg";
import minersNavImageActive from "../../assets/img/market/miner-active-nav.svg";
import boxesNavImage from "../../assets/img/market/boxes-nav.svg";
import boxesNavImageActive from "../../assets/img/market/boxes-active-nav.svg";
import racksNavImage from "../../assets/img/market/rack-nav.svg";
import racksNavImageActive from "../../assets/img/market/rack-active-nav.svg";
import skinNavImage from "../../assets/img/market/skin-nav.svg";
import skinNavImageActive from "../../assets/img/market/skin-active-nav.svg";
import hatsNavImage from "../../assets/img/market/hats_nav.svg";
import hatsNavImageActive from "../../assets/img/market/hats_active_nav.svg";
import errorNotice from "../../assets/img/icon/error_notice.svg";
import cartSuccessIcon from "../../assets/img/icon/cart_successfully_notice.svg";
import trophiesNavImage from "../../assets/img/market/trophies-nav.svg";
import trophiesNavActiveImage from "../../assets/img/market/trophies-active-nav.svg";
import seasonStoreNavImage from "../../assets/img/market/season-store-nav.svg";
import eventStoreNavImage from "../../assets/img/market/basket-cyan.svg";
import eventStoreNavActiveImage from "../../assets/img/market/basket.svg";
import seasonStoreNavActiveImage from "../../assets/img/market/season-store-active-nav.svg";
import craftOfferNavIcon from "../../assets/img/market/craft_offer_icon.svg";
import craftOfferActiveIcon from "../../assets/img/market/craft_offer_active_icon.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";
import taskListImg from "../../assets/img/offerwall/task-list.svg";
import taskListImgActive from "../../assets/img/offerwall/task-list_active.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	pathName: state.router.location.pathname,
	language: state.game.language,
	isViewedWeeklyOffer: state.user.isViewedWeeklyOffer,
	endTimeWeeklyOffer: state.user.endTimeWeeklyOffer,
	isViewedTutorial: state.user.userViewedTutorial,
});

const mapDispatchToProps = (dispatch) => ({
	setViewedWeeklyOffer: (state) => dispatch(actions.setViewedWeeklyOffer(state)),
	setEndTimeWeeklyOffer: (state) => dispatch(actions.setEndTimeWeeklyOffer(state)),
	setMinDeposits: (state) => dispatch(actionsWallet.setMinDeposits(state)),
});

class MarketClass extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		showMarketConfirmation: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		endTimeWeeklyOffer: PropTypes.string.isRequired,
		isViewedWeeklyOffer: PropTypes.bool.isRequired,
		setViewedWeeklyOffer: PropTypes.func.isRequired,
		setEndTimeWeeklyOffer: PropTypes.func.isRequired,
		setMinDeposits: PropTypes.func.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	constructor(props) {
		super(props);
		this.state = {
			promotion: {},
			sales: [],
			miners: [],
			racks: [],
			appearances: [],
			productsQuantity: {
				sales: false,
				craftingOffers: false,
				event: false,
				seasonStore: false,
				eventStore: false,
				craftOffer: false,
				miners: false,
				racks: false,
				parts: false,
				skins: false,
				boxes: false,
				hats: false,
				trophies: false,
			},
			isLoading: true,
			isPromotion: false,
			isSeason: false,
			defaultGroup: "miners",
			activeProductId: "",
			routesConfig: {
				sales: { path: ["/game/market/sales", "/cn/game/market/sales"], name: "sales", image: leaderboardImg, imageActive: leaderboardImgActive },
				craftOffer: { path: ["/game/market/crafting-offer", "/cn/game/market/crafting-offer"], name: "crafting-offer", image: craftOfferNavIcon, imageActive: craftOfferActiveIcon },
				event: { path: ["/game/market/season-pass", "/cn/game/market/season-pass"], name: "season-pass", image: taskListImg, imageActive: taskListImgActive },
				seasonStore: { path: ["/game/market/season-store", "/cn/game/market/season-store"], name: "season-store", image: seasonStoreNavImage, imageActive: seasonStoreNavActiveImage },
				eventStore: {
					path: ["/game/market/special-event-store", "/cn/game/market/special-event-store"],
					name: "special-event-store",
					image: eventStoreNavImage,
					imageActive: eventStoreNavActiveImage,
				},
				miners: { path: ["/game/market/miners", "/cn/game/market/miners"], name: "miners", image: minersNavImage, imageActive: minersNavImageActive },
				boxes: { path: ["/game/market/lootboxes", "/cn/game/market/lootboxes"], name: "lootboxes", image: boxesNavImage, imageActive: boxesNavImageActive },
				// parts: { path: ["/game/market/parts", "/cn/game/market/parts"], name: "parts", image: partsNavImage },
				racks: { path: ["/game/market/racks", "/cn/game/market/racks"], name: "racks", image: racksNavImage, imageActive: racksNavImageActive },
				skins: { path: ["/game/market/skins", "/cn/game/market/skins"], name: "skins", image: skinNavImage, imageActive: skinNavImageActive },
				hats: { path: ["/game/market/avatar-hats", "/cn/game/market/avatar-hats"], name: "avatar-hats", image: hatsNavImage, imageActive: hatsNavImageActive },
				trophies: { path: ["/game/market/trophies", "/cn/game/market/trophies"], name: "trophies", image: trophiesNavImage, imageActive: trophiesNavActiveImage },
			},
		};
		this.controllers = {};
		this.signals = {};
		this.timer = null;
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getCurrentRouteName = () => {
		const { location, t } = this.props;
		const { routesConfig } = this.state;
		const currentGroup = Object.keys(routesConfig).find((key) => routesConfig[key].path.includes(location.pathname));
		return currentGroup ? t(`market.${routesConfig[currentGroup].name}`) : "";
	};

	isTabActive = (path) => path.includes(this.props.location.pathname) && !this.props.isMobile;

	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
		this.initialization();
		this.checkViewedWeeklyOffer();
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleClickOutside);
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		if (this.timer) {
			clearTimeout(this.timer);
		}
	}

	checkViewedWeeklyOffer = () => {
		const { setViewedWeeklyOffer, endTimeWeeklyOffer } = this.props;
		setViewedWeeklyOffer(redDotNotification.isViewWeeklyOfferOnThisWeek(endTimeWeeklyOffer));
		this.timer = setTimeout(() => setViewedWeeklyOffer(false), redDotNotification.getMSToNextWeeklyOffer(endTimeWeeklyOffer));
	};

	initialization = async () => {
		await this.getMinDepositsAmount();
		await this.getMarketInitial();
	};

	getMinDepositsAmount = async () => {
		const { setMinDeposits } = this.props;
		try {
			this.createSignalAndController("getMinDepositsAmount");
			const json = await fetchWithToken("/api/wallet/get-min-deposits", {
				method: "GET",
				signal: this.signals.getMinDepositsAmount,
			});
			if (!json.success) {
				return false;
			}

			setMinDeposits(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	getMarketInitial = async () => {
		const { location, history, language } = this.props;
		const { routesConfig } = this.state;
		this.createSignalAndController("getMarketInitial");
		try {
			const json = await fetchWithToken("/api/market/get-market", {
				method: "GET",
				signal: this.signals.getMarketInitial,
			});
			if (!json.success) {
				return false;
			}
			const defaultGroup = json.data.is_promotion || json.data.sales > 0 ? "sales" : "miners";
			const { miners, event, seasonStore, eventStore, racks, appearance: skins, sales, craftingOffers, boxes, parts, hats, trophies, is_season: isSeason, is_promotion: isPromotion } = json.data;
			this.setState({
				productsQuantity: {
					miners,
					event,
					seasonStore,
					eventStore,
					racks,
					skins,
					sales,
					craftingOffers,
					boxes,
					parts,
					hats,
					trophies,
				},
				isPromotion,
				isSeason,
				routesConfig: { ...routesConfig, [defaultGroup]: { ...routesConfig[defaultGroup], path: [...routesConfig[defaultGroup].path, "/game/market", "/cn/game/market"] } },
				defaultGroup,
				isLoading: false,
			});
			if (!isSeason && location.pathname.endsWith("/season-pass")) {
				history.push(`${getLanguagePrefix(language)}/game/market`);
			}
		} catch (e) {
			console.error(e);
		}
	};

	buyAction = async (item, isPromo = false, storeType = "") => {
		const { t } = this.props;
		const { id, qty, type, isSales = false } = item;
		this.createSignalAndController("buyProduct");
		try {
			const json = await fetchWithToken(`/api/market/buy-product`, {
				method: "POST",
				body: JSON.stringify({
					id,
					qty,
					type,
					is_promo: isPromo,
					is_sales_purchase: isSales,
					store_type: storeType,
				}),
				signal: this.signals.buyProduct,
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("messages.failedPurchase"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			if (json.data.item_type === "loot_box") {
				return json.data;
			}
			toast(this.constructor.renderToast(t("messages.successful"), cartSuccessIcon), this.toastDefaultConfig);
			this.refreshBalance();
			this.toggleActiveProduct();
			return true;
		} catch (e) {
			console.error(e);
		}

		this.setState({
			activeProductId: "",
		});
	};

	refreshBalance = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	toggleActiveProduct = (id = "") => {
		const { activeProductId } = this.state;
		this.setState({
			activeProductId: id === activeProductId ? "" : id,
		});
	};

	handleClickOutside = (event) => {
		const element = event.target.closest(".product-container, .sales-buy-button, .modal, .product-buy-wrapper");
		if (!element) {
			this.setState({
				activeProductId: "",
			});
		}
	};

	render() {
		// const { location, t, language, isMobile, isViewedWeeklyOffer } = this.props;
		const { location, t, language, isMobile, isViewedTutorial } = this.props;
		const { isLoading, productsQuantity, isPromotion, isSeason, routesConfig, activeProductId, defaultGroup } = this.state;
		const isEventPass = location.pathname.includes("/season-pass");
		return (
			<Container className="market-container">
				<ProgressionEvent wsReact={this.props.wsReact} />
				{!isViewedTutorial.shop &&
					!location.pathname.endsWith("/game/market/season-pass") &&
					!location.pathname.endsWith("/game/market/season-pass/quests") &&
					!location.pathname.endsWith("/game/market/season-store") &&
					!location.pathname.endsWith("/game/market/special-event-store") &&
					!location.pathname.endsWith("/game/market/crafting-offer") && <TutorialModal tutorialCategories={"shop"} />}
				<Row>
					<Col xs="12">
						<div className="info-tooltip-icon-container">
							<div className="info-icon-block" id="storeTitleId">
								<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
							</div>
							<UncontrolledTooltip placement="right" autohide={true} target="storeTitleId">
								{t("infoHints.storeTooltipText")}
							</UncontrolledTooltip>
							<h1 className="market-title">{t("market.store")}</h1>
						</div>
						{isMobile && location.pathname.endsWith("/game/market") && (
							<Fragment>
								<MarketBanner />
							</Fragment>
						)}
						{isMobile && !location.pathname.endsWith("/game/market") && (
							<Row noGutters={true} className="mobile-header">
								<Link to={`${getLanguagePrefix(language)}/game/market`} className="d-flex back-link">
									<span className="icon">
										<img src="/static/img/wallet/back_angle.svg" alt="back_angle" />
									</span>
									<span>{t("market.back")}</span>
								</Link>
								<p className="page-name">{this.getCurrentRouteName()}</p>
							</Row>
						)}
					</Col>
					{((isMobile && location.pathname.endsWith("/game/market")) || !isMobile) && (
						<Col xs="12" lg="3" className="nav-pills-container">
							<Nav pills className="flex-column nav-pills w-100">
								{Object.keys(routesConfig)
									.filter((item) => !(item === "event" && !isSeason))
									.map((key) => (
										<NavItem key={key}>
											<NavLink
												tag={Link}
												hidden={
													(key === "sales" && !productsQuantity.sales && !isPromotion) ||
													(key === "craftOffer" && !productsQuantity.craftingOffers) ||
													(key === "eventStore" && !productsQuantity.eventStore) ||
													(key === "seasonStore" && !productsQuantity.seasonStore)
												}
												disabled={(key === "sales" && !productsQuantity.sales && !isPromotion) || (key === "seasonStore" && !productsQuantity.seasonStore)}
												to={`${getLanguagePrefix(language)}/game/market/${routesConfig[key].name}`}
												className={`${this.isTabActive(routesConfig[key].path) ? "active" : ""} link-pill-ico product-pill ${
													(key === "sales" && !productsQuantity.sales && !isPromotion) || (key === "seasonStore" && !productsQuantity.seasonStore) ? "disabled" : ""
												}`}
											>
												{/* {(key === "sales" && !isViewedWeeklyOffer) && <span className="red-dot" />} */}
												<div className="d-flex align-items-center">
													<div className="market-nav-image">
														<img
															width={18}
															height={21}
															src={this.isTabActive(routesConfig[key].path) ? routesConfig[key].imageActive : routesConfig[key].image}
															alt={key}
														/>
													</div>
													<span>{t(`market.${routesConfig[key].name}`)}</span>
												</div>
											</NavLink>
										</NavItem>
									))}
							</Nav>
						</Col>
					)}
					<Col xs="12" lg="9">
						{!isLoading && (
							<Switch>
								{!isMobile && (
									<Route
										exact
										path={`${getLanguagePrefix(language)}/game/market`}
										render={() => {
											if (defaultGroup === "sales") {
												return (
													<MarketSales
														buyAction={this.buyAction}
														activeProductId={activeProductId}
														toggleActiveProduct={this.toggleActiveProduct}
														wsReact={this.props.wsReact}
													/>
												);
											}
											return (
												<MarketMiners
													buyAction={this.buyAction}
													activeProductId={activeProductId}
													toggleActiveProduct={this.toggleActiveProduct}
													wsReact={this.props.wsReact}
												/>
											);
										}}
									/>
								)}
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/sales`}
									render={() => (
										<MarketSales buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} />
									)}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/crafting-offer`}
									render={() => <CraftOffer isMobile={this.props.isMobile} wsReact={this.props.wsReact} />}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/season-store`}
									render={() => (
										<EventStore
											storeType={MARKET_STORE_TYPE.SEASON_STORE}
											buyAction={this.buyAction}
											activeProductId={activeProductId}
											toggleActiveProduct={this.toggleActiveProduct}
											wsReact={this.props.wsReact}
										/>
									)}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/special-event-store`}
									render={() => (
										<EventStore
											storeType={MARKET_STORE_TYPE.SYSTEM_SALES_EVENT}
											buyAction={this.buyAction}
											activeProductId={activeProductId}
											toggleActiveProduct={this.toggleActiveProduct}
											wsReact={this.props.wsReact}
										/>
									)}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/miners`}
									render={() => (
										<MarketMiners buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} />
									)}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/lootboxes`}
									render={() => (
										<MarketBoxes buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} />
									)}
								/>
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/racks`}
									render={() => (
										<MarketRacks buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} />
									)}
								/>
								{/* <Route */}
								{/*	exact */}
								{/*	path={`${getLanguagePrefix(language)}/game/market/parts`} */}
								{/*	render={() => ( */}
								{/*		<MarketParts buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} /> */}
								{/*	)} */}
								{/* /> */}
								<Route
									exact
									path={`${getLanguagePrefix(language)}/game/market/skins`}
									render={() => (
										<MarketAppearances buyAction={this.buyAction} activeProductId={activeProductId} toggleActiveProduct={this.toggleActiveProduct} wsReact={this.props.wsReact} />
									)}
								/>
								<Route exact path={`${getLanguagePrefix(language)}/game/market/avatar-hats`} render={() => <MarketHats buyAction={this.buyAction} />} />
								<Route
									exact
									path={[`${getLanguagePrefix(language)}/game/market/season-pass`, `${getLanguagePrefix(language)}/game/market/season-pass/quests`]}
									render={() => <EventShop wsReact={this.props.wsReact} />}
								/>
								<Route exact path={`${getLanguagePrefix(language)}/game/market/trophies`} render={() => <MarketTrophies buyAction={this.buyAction} />} />
							</Switch>
						)}

						<div className="market-adv-banners">
							<BannersLoader name={isEventPass ? "storeEventPassSection" : "storeSection"} isMobile={isMobile} />
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}
const Index = withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(MarketClass));
export default withRouter(Index);
