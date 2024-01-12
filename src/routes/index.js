import React, { Component, lazy, Suspense, Fragment } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import cookie from "react-cookies";
import { Header, Footer } from "../layouts";
import HelmetComponent from "../components/SingleComponents/HelmetComponent";
import RegistrationFlowHeader from "../components/Auth/RegistrationFlowHeader";
import RegistrationFlowFooter from "../components/Auth/RegistrationFlowFooter";
import loaderImg from "../assets/img/icon/hamster_loader.gif";
import PrivateRoute from "./PrivateRoute";
import OnlyNotAuthRoute from "./OnlyNotAuthRoute";
import BasicLayout from "../layouts/BasicLayout";

import { notProtectedRoutes, privateRoutes, onlyNotAuthRoutes } from "./Routes";
import getLanguagePrefix from "../services/getLanguagePrefix";
import fetchWithToken from "../services/fetchWithToken";
import initPagesEventsConfig from "../services/initPagesEventsConfig";
import initCurrenciesConfig from "../services/initCurrenciesConfig";

const NoMatch = lazy(() => import("../views/Static/NoMatch"));
const Banned = lazy(() => import("../views/Static/Banned"));

const mapStateToProps = (state) => ({
	isSessionSocketChecked: state.user.isSessionSocketChecked,
	isSessionNodeChecked: state.user.isSessionNodeChecked,
	isBanned: state.user.isBanned,
	pathName: state.router.location.pathname,
	language: state.game.language,
	rollerCurrencies: state.wallet.rollerCurrencies,
	pagesEventsConfig: state.pagesEventsConfig,
});
class RoutesClass extends Component {
	static propTypes = {
		isSessionSocketChecked: PropTypes.bool.isRequired,
		isSessionNodeChecked: PropTypes.bool.isRequired,
		isBanned: PropTypes.bool.isRequired,
		wsReact: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		pathName: PropTypes.string.isRequired,
		language: PropTypes.string.isRequired,
		location: PropTypes.object.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		pagesEventsConfig: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			title: "",
			description: "",
			keywords: "",
			hreflang: "",
			canonical: "",
			robots: "",
			isLoading: true,
		};
		this.ROUTES_CONFIG = {
			basic: {
				HeaderComponent: <Header wsReact={this.props.wsReact} />,
				FooterComponent: <Footer />,
			},
			registration: {
				HeaderComponent: <div />,
				FooterComponent: <div />,
			},
		};
		this.controllers = {};
		this.signals = {};
	}

	async componentDidMount() {
		await this.initConfigs();
		this.saveReferralActionAndCookie();
		this.analyticsProcess();
	}

	initConfigs = async () => {
		try {
			await initPagesEventsConfig();
			await initCurrenciesConfig();
			this.addDynamicRouteFromRedux([...notProtectedRoutes, ...privateRoutes, ...onlyNotAuthRoutes]);
		} catch (err) {
			console.error(err);
		} finally {
			this.setState({
				isLoading: false,
			});
		}
	};

	addDynamicRouteFromRedux = (routers) => {
		const { rollerCurrencies, pagesEventsConfig } = this.props;
		const [dynamicRoutesEvents] = pagesEventsConfig.map((dynamicEvent) => dynamicEvent.routes);

		return routers.map((route) => {
			if (route?.dynamicRouteType === "networkPower") {
				rollerCurrencies
					.filter((currency) => currency.isCanBeMined)
					.forEach((currency) => {
						route.path.push(`/network-power/${currency.code}`);
					});
			}
			if (route?.dynamicRouteType === "referral") {
				rollerCurrencies
					.filter((currency) => currency.isCanBeMined)
					.forEach((currency) => {
						route.path.push(`/referral/stats/${currency.code}`);
					});
			}
			if (route?.dynamicRouteType === "wallet") {
				rollerCurrencies.forEach((currency) => {
					route.path.push(`/wallet/${currency.code}`);
					route.path.push(`/wallet/${currency.code}/deposit`);
					route.path.push(`/wallet/${currency.code}/withdraw`);
					route.path.push(`/wallet/${currency.code}/history`);
				});
			}
			if (dynamicRoutesEvents && dynamicRoutesEvents.length) {
				dynamicRoutesEvents.forEach((routeEvent) => {
					if (routeEvent.dynamicRouteType === route?.dynamicRouteType) {
						if (routeEvent.title.en) {
							route.helmet.title = routeEvent.title;
						}
						if (routeEvent.description.en) {
							route.helmet.description = routeEvent.description;
						}
						Object.values(routeEvent.path).forEach((item) => {
							route.path.push(item);
						});
					}
				});
			}
			return route;
		});
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	getAnalyticsConfig = async () => {
		try {
			this.createSignalAndController("getAnalyticsConfig");
			const json = await fetchWithToken("/api/analytic/config", {
				method: "GET",
				signal: this.signals.getAnalyticsConfig,
			});
			if (!json.success) {
				return false;
			}
			return json.data;
		} catch (e) {
			console.error("Get analytics error");
		}
	};

	analyticsProcess = async () => {
		const currentReferrer = localStorage.getItem("referrer");
		const exceptionSearch = ["email", "confirm_code_id", "user_id"];
		const searchParams = new URLSearchParams(window.location.search);
		const isExceptionSearch = exceptionSearch.some((item) => searchParams.get(item));
		if (currentReferrer || isExceptionSearch || !window.location.search) {
			return false;
		}
		const analyticsConfig = await this.getAnalyticsConfig();
		if (!analyticsConfig) {
			return false;
		}
		let analyticsReferrer = null;
		Object.keys(analyticsConfig).forEach((item) => {
			const referrer = searchParams.get(item);
			if (referrer) {
				analyticsReferrer = {
					type: analyticsConfig[item],
					id: referrer,
				};
				return true;
			}
		});
		if (analyticsReferrer) {
			localStorage.setItem("referrer", JSON.stringify(analyticsReferrer));
		}
	};

	saveReferralActionAndCookie = async () => {
		try {
			this.createSignalAndController("saveReferralActionAndCookie");
			const options = { method: "POST", signal: this.signals.saveReferralActionAndCookie };
			const params = new URLSearchParams(window.location.search);
			const containsInfluencerTags = params.has("i");
			if (!cookie.load("registered") && containsInfluencerTags) {
				cookie.save("i", window.location.search, {
					httpOnly: false,
					maxAge: 31556952000,
					path: "/",
				});
			}
			const referrerType = params.get("referrerType");
			if (referrerType) {
				localStorage.setItem("referrerType", referrerType);
			}
			const refLink = params.get("r");
			if (!cookie.load("registered") && !cookie.load("referral_id") && refLink) {
				cookie.save("referral_id", refLink, {
					httpOnly: false,
					maxAge: 31556952000,
					path: "/",
				});
				await fetchWithToken("/api/profile/referral/unique", options);
			} else if (!cookie.load("registered") && cookie.load("referral_id")) {
				await fetchWithToken("/api/profile/referral/hit", options);
			}
		} catch (e) {
			console.error(e);
		}
	};

	// updateDynamicRoutes = () => {
	// 	this.addDynamicRouteFromRedux([...notProtectedRoutes, ...privateRoutes, ...onlyNotAuthRoutes]);
	// };

	generateRoutes = (path) => {
		const { language } = this.props;
		if (typeof path === "object") {
			return path.reduce((acc, pathname) => [...acc, ...[`${getLanguagePrefix(language)}${pathname}`.replace(/\/?$/, ""), pathname]], []);
		}
		return [`${getLanguagePrefix(language)}${path}`.replace(/\/?$/, ""), path];
	};

	render() {
		const { history, wsReact, isBanned, isSessionSocketChecked, isSessionNodeChecked, language, rollerCurrencies, location } = this.props;
		const { isLoading } = this.state;
		return (
			<Fragment>
				{!isLoading && (
					<BasicLayout wsReact={wsReact}>
						{!(isSessionSocketChecked && isSessionNodeChecked) && (
							<div className="preloader">
								<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
							</div>
						)}
						<HelmetComponent language={language} location={location} rollerCurrencies={rollerCurrencies} />
						{isSessionSocketChecked && isSessionNodeChecked && (
							<Suspense
								fallback={
									<div className="preloader">
										<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
									</div>
								}
							>
								<Switch>
									{isBanned && <Route component={Banned} />}
									{/* Public routes */}
									{notProtectedRoutes.map((route) => {
										const { HeaderComponent, FooterComponent } = this.ROUTES_CONFIG[route?.layout];
										return (
											<Route key={route.path} exact={route.exact} path={this.generateRoutes(route.path)}>
												<>
													<div className="content">
														{HeaderComponent}
														<route.component history={history} wsReact={wsReact} />
													</div>
													{FooterComponent && FooterComponent}
												</>
											</Route>
										);
									})}
									{/* Private routes */}
									{privateRoutes.map((route) => {
										const { HeaderComponent, FooterComponent } = this.ROUTES_CONFIG[route?.layout];
										return (
											<PrivateRoute key={route.path} exact={route.exact} path={this.generateRoutes(route.path)}>
												<>
													<div className="content">
														{HeaderComponent}
														<route.component history={history} wsReact={wsReact} />
													</div>
													{FooterComponent && FooterComponent}
												</>
											</PrivateRoute>
										);
									})}
									{/* Routes for not auth users */}
									{onlyNotAuthRoutes.map((route) => {
										const { HeaderComponent, FooterComponent } = this.ROUTES_CONFIG[route?.layout];
										return (
											<OnlyNotAuthRoute key={route.path} exact={route.exact} path={this.generateRoutes(route.path)}>
												<>
													<div className="content">
														{HeaderComponent}
														<route.component history={history} wsReact={wsReact} />
													</div>
													{FooterComponent && FooterComponent}
												</>
											</OnlyNotAuthRoute>
										);
									})}
									<div className="wrapper">
										<Header wsReact={this.props.wsReact} />
										<div className="content">
											<Route component={NoMatch} />
										</div>
										<Footer />
									</div>
								</Switch>
							</Suspense>
						)}
					</BasicLayout>
				)}
			</Fragment>
		);
	}
}
const Routes = withRouter(connect(mapStateToProps, null)(RoutesClass));
export default Routes;
