import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import queryString from "query-string";
import { Container } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import { RankTable, TopList, Pagination } from "../../components/Leaderboard";
import scrollToElement from "../../services/scrollToElement";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Leaderboard/main.scss";
import loaderImg from "../../assets/img/icon/hamster_loader.gif";
import reloadImg from "../../assets/img/reload.svg";
import gamepadImg from "../../assets/img/rank/gamepad.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	search: state.router.location.search,
	isAuthorizedSocket: state.user.isAuthorizedSocket,
	isAuthorizedNode: state.user.isAuthorizedNode,
	language: state.game.language,
});

class LeaderBoardClass extends Component {
	constructor(props) {
		super(props);
		this.USERS_PER_PAGE = 20;
		this.state = {
			typeView: "page",
			isLoading: true,
			rankData: [],
			now: 0,
			pages: 0,
			start: 0,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		const query = queryString.parse(this.props.search);
		this.getUsers(query.page, query["find-me"] === null);
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const query = queryString.parse(this.props.search);
		const prevQuery = queryString.parse(prevProps.search);
		if ((query.page && query.page !== prevQuery.page) || (this.props.search["find-me"] === null && this.props.search["find-me"] !== prevProps.search["find-me"])) {
			this.getDataWithTypeView();
		}
		if (this.state.now !== prevState.now && query.page > 0) {
			scrollToElement(".rank-content", -20);
		}
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	getDataWithTypeView = () => {
		const query = queryString.parse(this.props.search);
		const { typeView } = this.state;
		if (query.page && typeView !== "page") {
			this.setState({ typeView: "page" });
			return this.getUsers(query.page);
		}
		if (typeView === "page") {
			return this.getUsers(query.page);
		}
		if (typeView !== "page" && !query.page) {
			this.setState({ typeView: "continuous" });
		}
		this.loadMore();
	};

	getUsers = async (page, isFindMe) => {
		const { isAuthorizedNode } = this.props;
		this.setState({
			isLoading: true,
		});
		let rankQuery = `${page ? `?start=${(page - 1) * this.USERS_PER_PAGE}` : ""}`;
		if (isFindMe && isAuthorizedNode) {
			rankQuery = `?find-me=1`;
		}
		try {
			this.createSignalAndController();
			const json = await fetchWithToken(`/api/game/rank${rankQuery}`, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			this.handleNewList(json.data, isFindMe);
		} catch (e) {
			console.error(e);
		}
	};

	loadMore = () => {
		const { typeView, now } = this.state;
		if (typeView !== "continuous") {
			this.setState({
				typeView: "continuous",
			});
			return this.getUsers(2);
		}
		this.getUsers(+now + 1);
	};

	clearDataFromMinus = (data) =>
		data.map((item) => {
			const defaultPowerHistory = [0, 0, 0, 0, 0, 0, 0];
			const power = Math.sign(item.power) === -1 ? 0 : item.power;
			const powerHistory = Math.sign(item.power) === -1 ? defaultPowerHistory : item.power_history;
			return { ...item, power, power_history: powerHistory };
		});

	handleNewList = (data, isFindMe) => {
		const { typeView, rankData } = this.state;
		const { total, start, limit, items } = data;
		const pages = Math.ceil(total / limit);
		const newOffset = typeView === "continuous" ? 0 : +start;
		const now = start / limit + 1;
		const newData = typeView === "continuous" && !isFindMe ? [...rankData, ...items] : items;
		const newDataWithoutMinus = this.clearDataFromMinus(newData);
		this.setState({
			rankData: newDataWithoutMinus,
			now,
			pages,
			start: newOffset,
			isLoading: false,
		});
		if (isFindMe) {
			scrollToElement(".currentUser", -20);
		}
	};

	render() {
		const { start, pages, now, isLoading, rankData, typeView } = this.state;
		const { language, t, isAuthorizedSocket, isAuthorizedNode } = this.props;
		return (
			<Container className="leaderboard-container">
				{isLoading && (
					<div className="preloader">
						<LazyLoad offset={100}>
							<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
						</LazyLoad>
					</div>
				)}
				<div>
					<div className="rank-header">
						<div className="logo-rank mgb-16">
							<LazyLoad offset={100}>
								<img src={gamepadImg} alt="gamepad" />
							</LazyLoad>
						</div>
						<h1 className="header-page mgb-16">{t("topMiners")}</h1>
						{isAuthorizedSocket && isAuthorizedNode && (
							<div className="find-me-block">
								<Link to={`${getLanguagePrefix(language)}/rank?find-me`} onClick={() => this.getUsers(null, true)} className="tree-dimensional-button btn-cyan mgb-0">
									<span>{t("findMe")}</span>
								</Link>
							</div>
						)}
					</div>
					<div className="rank-content">
						{+start === 0 && <TopList leaderBoardUsers={rankData} />}
						<div className="table-viewed-positions mgb-24">
							<div className="table-users light-gray-bg">
								<RankTable leaderBoardUsers={rankData} start={start} />
								{+start === 0 && +pages >= +now + 1 && (
									<div className="container-load-more text-center">
										<Link to={`${getLanguagePrefix(language)}/rank`} onClick={this.loadMore} className="tree-dimensional-button btn-default load-more mg-0">
											<span>
												<img src={reloadImg} alt="more" /> {t("loadMore")}
											</span>
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				<div>
					<ul className="pagination justify-content-center roller-pagination mgb-0">
						<Pagination language={language} pages={pages} now={now} typeView={typeView} getUsers={this.getUsers} />
					</ul>
				</div>
			</Container>
		);
	}
}
LeaderBoardClass.propTypes = {
	pathName: PropTypes.string.isRequired,
	isAuthorizedSocket: PropTypes.bool.isRequired,
	isAuthorizedNode: PropTypes.bool.isRequired,
	search: PropTypes.string.isRequired,
	wsReact: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
const LeaderBoard = withTranslation("Rank")(connect(mapStateToProps, null)(LeaderBoardClass));
export default LeaderBoard;
