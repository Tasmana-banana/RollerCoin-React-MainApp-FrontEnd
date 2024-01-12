import React, { Component, Fragment } from "react";
import { Container, Nav, NavItem, NavLink, Row, Col } from "reactstrap";
import { Link, Route, Switch, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import OffersList from "../../components/Offerwall/OffersList";
import LeaderBoard from "../../components/Offerwall/Leaderboard";
import PayoutHistory from "../../components/Offerwall/PayoutHistory";
import HowItWorks from "../../components/SingleComponents/HowItWorks";
import NoMatch from "../Static/NoMatch";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import setNotificationReadAccept from "../../services/setNotificationReadAccept";
import { CONTEST_TYPE } from "../../constants/Offerwall";

import payoutHistoryImg from "../../assets/img/offerwall/payout-history.svg";
import payoutHistoryImgActive from "../../assets/img/offerwall/payout-history_active.svg";
import leaderboardImg from "../../assets/img/offerwall/leaderboard_icon.svg";
import leaderboardImgActive from "../../assets/img/offerwall/leaderboard_icon_active.svg";
import taskListImg from "../../assets/img/offerwall/task-list.svg";
import taskListImgActive from "../../assets/img/offerwall/task-list_active.svg";
import howItWorksImg from "../../assets/img/offerwall/how-it-works.svg";
import howItWorksImgActive from "../../assets/img/offerwall/how-it-works_active.svg";
import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import "../../assets/scss/Offerwall/main.scss";

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	isOfferwallsActive: state.user.isOfferwallsActive,
	notifications: state.notification,
	language: state.game.language,
});

class OfferwallClass extends Component {
	static propTypes = {
		isOfferwallsActive: PropTypes.bool.isRequired,
		isMobile: PropTypes.bool.isRequired,
		history: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		notifications: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.routesConfig = {
			offersList: {
				path: ["/taskwall", "/pt/taskwall", "/es/taskwall", "/cn/taskwall", "/taskwall/task-list", "/cn/taskwall/task-list", "/pt/taskwall/task-list", "/es/taskwall/task-list"],
				name: "task-list",
				image: taskListImg,
				imageActive: taskListImgActive,
			},
			leaderboard: {
				path: [
					"/taskwall/leaderboard",
					"/cn/taskwall/leaderboard",
					"/pt/taskwall/leaderboard",
					"/es/taskwall/leaderboard",
					`/taskwall/leaderboard/${CONTEST_TYPE.WEEKLY}`,
					`/pt/taskwall/leaderboard/${CONTEST_TYPE.WEEKLY}`,
					`/es/taskwall/leaderboard/${CONTEST_TYPE.WEEKLY}`,
					`/cn/taskwall/leaderboard/${CONTEST_TYPE.WEEKLY}`,
					`/taskwall/leaderboard/${CONTEST_TYPE.GRAND}`,
					`/cn/taskwall/leaderboard/${CONTEST_TYPE.GRAND}`,
					`/es/taskwall/leaderboard/${CONTEST_TYPE.GRAND}`,
					`/pt/taskwall/leaderboard/${CONTEST_TYPE.GRAND}`,
				],
				name: "leaderboard",
				image: leaderboardImg,
				imageActive: leaderboardImgActive,
			},
			payoutHistory: {
				path: ["/taskwall/payout-history", "/cn/taskwall/payout-history", "/pt/taskwall/payout-history", "/es/taskwall/payout-history"],
				name: "payout-history",
				image: payoutHistoryImg,
				imageActive: payoutHistoryImgActive,
			},
			howItWorksImg: {
				path: ["/taskwall/how-it-works", "/cn/taskwall/how-it-works", "/pt/taskwall/how-it-works", "/es/taskwall/how-it-works"],
				name: "how-it-works",
				image: howItWorksImg,
				imageActive: howItWorksImgActive,
			},
		};
		this.state = {
			contests: {},
			sponsoredProviders: [],
			isLoading: true,
		};
		this.controllers = {};
		this.signals = {};
	}

	async componentDidMount() {
		const { notifications } = this.props;
		if (notifications?.offerwall_visit?.is_show_notification) {
			const currentNotification = notifications.offerwall_visit;
			await setNotificationReadAccept("read", currentNotification);
		}
		await this.getActiveContestData();
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	contestsConstructor = (data) => {
		const { contests } = this.state;
		let result = {};
		const poolRewardGrand = data?.[CONTEST_TYPE.GRAND]?.reward_pool_info.reward_info.sort((a, b) => a.required_rank_from - b.required_rank_from) || [];
		const poolRewardWeekly = data?.[CONTEST_TYPE.WEEKLY]?.reward_pool_info.reward_info.sort((a, b) => a.required_rank_from - b.required_rank_from) || [];

		if (data?.[CONTEST_TYPE.GRAND]?._id) {
			result[CONTEST_TYPE.GRAND] = {
				isActive: true,
				id: data[CONTEST_TYPE.GRAND]._id || null,
				endDate: data[CONTEST_TYPE.GRAND].end_date || null,
				startDate: data[CONTEST_TYPE.GRAND].start_date || null,
				backgroundImg: data[CONTEST_TYPE.GRAND].reward_pool_info.imageUrl || "",
				title: {
					en: data[CONTEST_TYPE.GRAND]?.title.en || "",
					cn: data[CONTEST_TYPE.GRAND]?.title.cn || "",
				},
				description: {
					en: data[CONTEST_TYPE.GRAND]?.description.en || "",
					cn: data[CONTEST_TYPE.GRAND]?.description.cn || "",
				},
				reward: {
					amount: data[CONTEST_TYPE.GRAND].reward_pool_info.amount || 0,
					currency: data[CONTEST_TYPE.GRAND].reward_pool_info.currency || "RLT",
					title: data[CONTEST_TYPE.GRAND].reward_pool_info.title || "",
				},
				maxRewardPlaces: data[CONTEST_TYPE.GRAND]?.max_reward_places,
				poolReward: poolRewardGrand,
			};
		}
		if (data?.[CONTEST_TYPE.WEEKLY]?._id) {
			result[CONTEST_TYPE.WEEKLY] = {
				isActive: !!data?.[CONTEST_TYPE.WEEKLY]?._id,
				id: data?.[CONTEST_TYPE.WEEKLY]?._id || null,
				endDate: data?.[CONTEST_TYPE.WEEKLY]?.end_date || null,
				startDate: data?.[CONTEST_TYPE.WEEKLY]?.start_date || null,
				backgroundImg: data?.[CONTEST_TYPE.WEEKLY]?.reward_pool_info.imageUrl || "",
				title: {
					en: data?.[CONTEST_TYPE.WEEKLY]?.title.en || "",
					cn: data?.[CONTEST_TYPE.WEEKLY]?.title.cn || "",
				},
				description: {
					en: data[CONTEST_TYPE.WEEKLY]?.description.en || "",
					cn: data[CONTEST_TYPE.WEEKLY]?.description.cn || "",
				},
				reward: {
					amount: data?.[CONTEST_TYPE.WEEKLY]?.reward_pool_info.amount || 0,
					currency: data?.[CONTEST_TYPE.WEEKLY]?.reward_pool_info.currency || "RLT",
					title: data?.[CONTEST_TYPE.WEEKLY]?.reward_pool_info.title || "",
				},
				maxRewardPlaces: data[CONTEST_TYPE.WEEKLY]?.max_reward_places,
				poolReward: poolRewardWeekly,
			};
		}

		return result;
	};

	getActiveContestData = async () => {
		try {
			this.createSignalAndController("getActiveContestData");
			const json = await fetchWithToken("/api/offerwall/active-contest-data", {
				method: "GET",
				signal: this.signals.getActiveContestData,
			});

			if (!json.success) {
				return console.error(json.error);
			}

			const contests = this.contestsConstructor(json.data.contests);

			this.setState({
				contests,
				sponsoredProviders: json.data.sponsored_providers,
			});
		} catch (err) {
			console.error(err);
		} finally {
			this.setState({
				isLoading: false,
			});
		}
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	getCurrentRouteName = () => {
		const { location, t } = this.props;
		const currentGroup = Object.keys(this.routesConfig).find((key) => this.routesConfig[key].path.includes(location.pathname));
		return currentGroup ? t(this.routesConfig[currentGroup].name) : "";
	};

	isTabActive = (path) => path.includes(this.props.location.pathname) && !this.props.isMobile;

	render() {
		const { location, t, language, isMobile, isOfferwallsActive } = this.props;
		const { contests, sponsoredProviders, isLoading } = this.state;
		const isContestActive = contests?.[CONTEST_TYPE.WEEKLY]?.isActive || contests?.[CONTEST_TYPE.GRAND]?.isActive;
		const isViewOfferWallTitle = !isMobile || location.pathname.endsWith("/taskwall");
		return (
			<Fragment>
				{!isOfferwallsActive && <NoMatch />}
				{isOfferwallsActive && (
					<Container className="offerwall-container">
						<Row>
							<Col xs="12">
								{isViewOfferWallTitle && <h1 className="offerwall-title">{t("titleOfPage")}</h1>}
								{isMobile && !location.pathname.endsWith("/taskwall") && (
									<Row noGutters={true} className="mobile-header">
										<Link to={`${getLanguagePrefix(language)}/taskwall`} className="d-flex back-link">
											<span className="icon">
												<img src="/static/img/wallet/back_angle_white.svg" alt="back_angle" width={14} height={14} />
											</span>
											<span>{t("back")}</span>
										</Link>
										<p className="page-name">{this.getCurrentRouteName()}</p>
									</Row>
								)}
							</Col>
							{((isMobile && location.pathname.endsWith("/taskwall")) || !isMobile) && (
								<Col xs="12" lg="3" className="nav-pills-container nav-taskwall">
									<Nav pills className="flex-column nav-pills w-100">
										{Object.keys(this.routesConfig).map((key) => {
											const isActiveTab = this.isTabActive(this.routesConfig[key].path);
											return (
												<NavItem key={key}>
													<NavLink
														tag={Link}
														hidden={key === "leaderboard" && !isContestActive}
														to={`${getLanguagePrefix(language)}/taskwall/${this.routesConfig[key].name}`}
														className={`${isActiveTab ? "active" : ""} link-pill-ico product-pill`}
													>
														<div className="d-flex align-items-center">
															<div className="offerwall-nav-image">
																<img src={isActiveTab ? this.routesConfig[key]?.imageActive : this.routesConfig[key].image} alt={key} width={18} height={21} />
															</div>
															<span>{t(this.routesConfig[key].name)}</span>
														</div>
													</NavLink>
												</NavItem>
											);
										})}
									</Nav>
								</Col>
							)}
							<Col xs="12" lg="9">
								<Switch>
									{!isMobile && (
										<Route exact path={`${getLanguagePrefix(language)}/taskwall`} render={() => <OffersList contests={contests} sponsoredProviders={sponsoredProviders} />} />
									)}
									{!isLoading && (
										<Route
											exact
											path={`${getLanguagePrefix(language)}/taskwall/task-list`}
											render={() => <OffersList contests={contests} sponsoredProviders={sponsoredProviders} />}
										/>
									)}
									{isContestActive && !isLoading && (
										<Route
											exact
											path={`${getLanguagePrefix(language)}/taskwall/leaderboard`}
											render={() => <LeaderBoard contests={contests} sponsoredProviders={sponsoredProviders} />}
										/>
									)}
									{isContestActive && !isLoading && (
										<Route
											exact
											path={`${getLanguagePrefix(language)}/taskwall/leaderboard/:type`}
											render={() => <LeaderBoard contests={contests} sponsoredProviders={sponsoredProviders} />}
										/>
									)}
									<Route exact path={`${getLanguagePrefix(language)}/taskwall/payout-history`} render={() => <PayoutHistory />} />
									<Route exact path={`${getLanguagePrefix(language)}/taskwall/how-it-works`} render={() => <HowItWorks faqType="offerwalls" />} />
								</Switch>
							</Col>
						</Row>
					</Container>
				)}
			</Fragment>
		);
	}
}

export default withRouter(withTranslation("Offerwall")(connect(mapStateToProps, null)(OfferwallClass)));
