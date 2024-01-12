import React, { Component } from "react";
import PropTypes from "prop-types";
import { Route, Switch, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Row, Col, Container, Table } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { withTranslation } from "react-i18next";
import MainScreen from "../../components/Phaser/HomeScreen";
import Statistics from "../../components/Profile/Statistics";
import NoMatch from "../Static/NoMatch";
import Tabs from "../../components/PublicProfile/Tabs";
import HelmetHead from "../../layouts/HelmetHead";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import calcAge from "../../services/calcAge";
import fetchWithToken from "../../services/fetchWithToken";
import formattedProfileDate from "../../services/formattedProfileDate";
import * as actions from "../../actions/userInfo";

import "../../assets/scss/Profile/public.scss";

import powerImg from "../../assets/img/profile/lightning.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setPower: (state) => dispatch(actions.setPower(state)),
});

const TABS_MAP = {
	is_count_games_visible: "Games",
	is_power_stats_visible: "Power",
	is_rank_stats_visible: "Rank",
};

class PublicProfileClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		match: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		avatarVersion: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			user: {
				gender: "",
				name: "",
				registration: "00-00-0000",
				id: "",
				public_profile_settings: {},
			},
			userNotFound: null,
			power: {
				games: 0,
				miners: 0,
				bonus: 0,
				total: 0,
			},
			tabs: [],
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getUserProfile();
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

	getUserProfile = async () => {
		const { language, history, match } = this.props;
		this.createSignalAndController("getUserProfile");
		try {
			const json = await fetchWithToken(`/api/profile/public-user-profile-data/${match.params.id}`, {
				method: "GET",
				signal: this.signals.getUserProfile,
			});

			if (!json.success) {
				return this.setState({ userNotFound: true });
			}
			const tabs = Object.keys(TABS_MAP).reduce((acc, key) => {
				if (json.data.public_profile_settings[key]) {
					acc.push(TABS_MAP[key]);
				}
				return acc;
			}, []);
			if (tabs.length) {
				history.push(`${getLanguagePrefix(language)}/p/${match.params.id}/${tabs[0].toLowerCase()}`);
			} else {
				history.push(`${getLanguagePrefix(language)}/p/${match.params.id}`);
			}
			this.setState({
				user: {
					gender: json.data.gender,
					name: json.data.name,
					registration: json.data.registration,
					id: json.data.avatar_id,
					public_profile_settings: json.data.public_profile_settings,
				},
				userNotFound: false,
				tabs,
			});
			this.getUserPowerData(json.data.avatar_id);
		} catch (e) {
			console.error(e);
		}
	};

	getUserPowerData = async (userID) => {
		this.createSignalAndController("getUserPowerData");
		try {
			const json = await fetchWithToken(`/api/profile/user-power-data/${userID}`, {
				method: "GET",
				signal: this.signals.getUserPowerData,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ power: json.data });
		} catch (e) {
			console.error(e);
		}
	};

	changeRoute = (route) => {
		const { language, history, match } = this.props;
		history.push(`${getLanguagePrefix(language)}/p/${match.params.id}/${route}`);
	};

	getTitle = () => {
		const { user } = this.state;
		const { pathName } = this.props;
		const profilePathNames = { games: "Games", power: "Power", rank: "Rank" };
		const pathItems = pathName.split("/");
		const currentTab = pathItems[pathItems.length - 1];
		return Object.keys(profilePathNames).includes(currentTab) ? `${user.name} ${profilePathNames[currentTab]} | Rollercoin` : `User profile | ${user.name} | RollerCoin.com`;
	};

	render() {
		const { user, power, userNotFound, tabs } = this.state;
		const { match, language, avatarVersion, pathName, t } = this.props;
		const routeTabs = [...tabs, ...[match.params.id]];
		const title = this.getTitle();
		return (
			<div>
				{userNotFound === false && (
					<Container className={"main-container public-profile-container"}>
						<HelmetHead
							title={title}
							description={`"RollerCoin is the first online bitcoin mining simulator game. Earn real bitcoins while enjoying the game and competing with your friends."`}
						/>
						<div className="content-container">
							<Row className="content-row">
								<Col xs="12" lg="3" className={`left-block`}>
									<div className="container-items top-block">
										<div className="body-items light-gray-bg">
											<Row noGutters={true} className="user-main-info">
												<Col xs={4} lg={12} className="user-image dark-gray-bg text-center">
													<LazyLoadImage
														threshold={100}
														width={144}
														height={144}
														src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/144/${user.id}.png?v=${avatarVersion}`}
														alt="user"
													/>
												</Col>
												<Col xs={8} lg={12}>
													<div className="user-info-wrapper d-flex flex-column justify-content-between h-100">
														<div className="user-info user-name">
															<p className="label">{t("name")}:</p>
															<p className="text name">{user.name}</p>
														</div>
														<div className="user-info">
															<p className="label">{t("gender")}:</p>
															<p className="text">{user.gender}</p>
														</div>
														<div className="user-info">
															<p className="label">{t("registration")}:</p>
															<p className="text">{formattedProfileDate(user.registration)}</p>
														</div>
														<div className="user-info">
															<p className="label">{t("characterAge")}:</p>
															<p className="text">{calcAge(user.registration)}</p>
														</div>
													</div>
												</Col>
											</Row>
											<div className="power-stats">
												<div className="table-responsive">
													<Table className="roller-table">
														<thead>
															<tr>
																<th colSpan={2}>
																	<div className="d-flex align-items-center">
																		<img className="mr-2" src={powerImg} alt={"power"} />
																		<p>Current power</p>
																	</div>
																</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td>
																	<p>Games</p>
																</td>
																<td>
																	<p>
																		{getPrefixPower(power.games).power} <span className="satoshi-text">{getPrefixPower(power.games).hashDetail}</span>
																	</p>
																</td>
															</tr>
															<tr>
																<td>
																	<p>Miners</p>
																</td>
																<td>
																	<p>
																		{getPrefixPower(power.miners).power} <span className="satoshi-text">{getPrefixPower(power.miners).hashDetail}</span>
																	</p>
																</td>
															</tr>
															<tr>
																<td>
																	<p>Bonus</p>
																</td>
																<td>
																	<p>
																		{getPrefixPower(power.bonus).power} <span className="satoshi-text">{getPrefixPower(power.bonus).hashDetail}</span>
																	</p>
																</td>
															</tr>
														</tbody>
														<tfoot>
															<tr>
																<td>
																	<p>
																		<b>Total</b>
																	</p>
																</td>
																<td>
																	<p>
																		{getPrefixPower(power.total).power} <span className="satoshi-text">{getPrefixPower(power.total).hashDetail}</span>
																	</p>
																</td>
															</tr>
														</tfoot>
													</Table>
												</div>
											</div>
										</div>
									</div>
								</Col>
								<Col xs="12" lg="9" className="right-block room-block">
									{user.id && <MainScreen userId={user.id} wsReact={this.props.wsReact} />}
								</Col>
							</Row>
							{!!tabs.length && (
								<Row className="content-row">
									<Col xs="12" lg="3" className={`left-block`}>
										<div className="header-items">
											<p>Player statistics</p>
											{tabs.map((tab) => (
												<Tabs key={tab} pathName={pathName} id={match.params.id} tab={tab} changeRoute={this.changeRoute} />
											))}
										</div>
									</Col>
									<Col xs="12" lg="9" className="right-block">
										<div className="user-stats-block light-gray-bg">
											<Switch>
												{routeTabs.map((tab, i) => (
													<Route
														exact={true}
														path={`${getLanguagePrefix(language)}/p/${match.params.id}${tab !== match.params.id ? `/${tab}` : ""}`}
														key={i}
														render={() => (
															<div>
																<Statistics uid={user.id} hideControl={true} filter={tab !== match.params.id ? tab.toLowerCase() : "games"} />
															</div>
														)}
													/>
												))}
											</Switch>
										</div>
									</Col>
								</Row>
							)}
						</div>
					</Container>
				)}
				{userNotFound && <NoMatch />}
			</div>
		);
	}
}

const PublicProfile = withTranslation("Profile")(connect(mapStateToProps, mapDispatchToProps)(PublicProfileClass));
export default withRouter(PublicProfile);
