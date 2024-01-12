import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, ModalBody, Modal } from "reactstrap";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import DailyBonusModalBanner from "./DailyBonusModalBanner";
import LastNews from "./LastNews";

import xpImg from "../../assets/img/game/xp.png";
import closeIcon from "../../assets/img/header/close_menu.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

import "../../assets/scss/Game/DailyBonus.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
	isRoomLoaded: state.game.isRoomLoaded,
});

class DailyBonusModal extends Component {
	static propTypes = {
		dailyBonus: PropTypes.object.isRequired,
		isShowDailyBonusModal: PropTypes.bool.isRequired,
		toggleBonusModal: PropTypes.func.isRequired,
		collectDailyBonus: PropTypes.func.isRequired,
		viewTime: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		phaserScreenInputManager: PropTypes.object,
		isRoomLoaded: PropTypes.bool,
	};

	constructor(props) {
		super(props);
		this.state = {
			rewards: [],
			lastNews: [],
			isLoading: true,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.rewardsFilter();
		this.getLastNews();
	}

	componentDidUpdate(prevProps) {
		const { isMobile, isShowDailyBonusModal, phaserScreenInputManager, isRoomLoaded } = this.props;
		if (prevProps.isMobile !== isMobile) {
			this.rewardsFilter();
		}
		if (prevProps.isShowDailyBonusModal !== isShowDailyBonusModal && !isShowDailyBonusModal && phaserScreenInputManager) {
			phaserScreenInputManager.enabled = true;
		}
		if (prevProps.isRoomLoaded !== isRoomLoaded && isRoomLoaded && isShowDailyBonusModal && phaserScreenInputManager) {
			phaserScreenInputManager.enabled = false;
		}
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

	rewardsFilter = () => {
		const { isMobile, dailyBonus } = this.props;
		if (!isMobile) {
			this.setState({
				rewards: dailyBonus.dailyRewards,
			});
		}
		if (isMobile) {
			const clippedRewards = dailyBonus.dailyRewards.filter((item) => {
				if (dailyBonus.currentUserDay <= 1) {
					return item.day <= 3;
				}
				if (dailyBonus.currentUserDay >= dailyBonus.dailyBonusCycle) {
					return item.day >= dailyBonus.dailyBonusCycle - 2;
				}
				return item.day - 1 === dailyBonus.currentUserDay || item.day === dailyBonus.currentUserDay || item.day + 1 === dailyBonus.currentUserDay;
			});
			this.setState({
				rewards: clippedRewards,
			});
		}
	};

	getLastNews = async () => {
		this.setState({ isLoading: true });
		this.createSignalAndController("lastNews");
		try {
			const request = await fetch(`${process.env.WP_API}/posts?_embed&per_page=3`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
				signal: this.signals.lastNews,
			});
			const news = await request.json();
			this.setState({ lastNews: news });
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	getTranslatedDay = (day) => {
		const { language } = this.props;
		const translate = {
			cn: {
				1: "第一天",
				2: "第二天",
				3: "第三天",
				4: "第四天",
				5: "第五天",
				6: "第六天",
				7: "第七天",
			},
			en: {
				1: "Day 1",
				2: "Day 2",
				3: "Day 3",
				4: "Day 4",
				5: "Day 5",
				6: "Day 6",
				7: "Day 7",
			},
		};
		return translate.en[day];
	};

	render() {
		const { dailyBonus, isShowDailyBonusModal, toggleBonusModal, collectDailyBonus, viewTime, isMobile, t } = this.props;
		const { rewards, lastNews, isLoading } = this.state;
		return (
			<Modal size="lg" isOpen={isShowDailyBonusModal} toggle={toggleBonusModal} centered className="daily-bonus-modal">
				<ModalBody className="daily-bonus-container">
					<button className="tree-dimensional-button close-menu-btn btn-default daily-bonus-close-btn" onClick={toggleBonusModal}>
						<span>
							<img src={closeIcon} alt="close_modal" />
						</span>
					</button>
					<h3 className="news-title">{t("eventPass.latestNews")}</h3>
					{!isMobile && (
						<Row className="news-wrapper">
							<Col xs="6">
								<DailyBonusModalBanner seasonsId={dailyBonus.seasonsId} imgVer={dailyBonus.imgVer} viewTime={viewTime} toggleBonusModal={toggleBonusModal} />
							</Col>
							<Col xs="6" className="d-flex flex-column justify-content-between">
								{isLoading && (
									<div className="last-news-preloader">
										<img src={loaderImg} height={63} width={63} alt="Loading..." />
									</div>
								)}
								{!isLoading && lastNews.map((news) => <LastNews key={news.id} news={news} isMobile={false} />)}
							</Col>
						</Row>
					)}
					{isMobile && (
						<Row className="news-wrapper">
							<Col xs="12" className="d-flex flex-column justify-content-between">
								<DailyBonusModalBanner seasonsId={dailyBonus.seasonsId} imgVer={dailyBonus.imgVer} viewTime={viewTime} toggleBonusModal={toggleBonusModal} />
								{isLoading && (
									<div className="last-news-preloader">
										<img src={loaderImg} height={63} width={63} alt="Loading..." />
									</div>
								)}
								{!isLoading && lastNews.slice(0, 2).map((news) => <LastNews key={news.id} news={news} isMobile={true} />)}
							</Col>
						</Row>
					)}
					<Row noGutters>
						<Col xs="12" className="daily-bonus-wrapper">
							<h3 className="daily-bonus-title">{t("eventPass.dailyBonus")}</h3>
							<p className="daily-bonus-description">{t("eventPass.logInTo")}</p>
							<div className="daily-bonus-list">
								{rewards.map((item) => (
									<div key={item.id} className={`bonus-item ${item.claimed || item.day === dailyBonus.currentUserDay ? "" : "faded"}`}>
										<p className="bonus-day">{this.getTranslatedDay(item.day)}</p>
										<div className={`bonus-item-wrapper ${item.day === dailyBonus.currentUserDay ? "shining" : ""}`}>
											<LazyLoad offset={100}>
												<img src={xpImg} alt="xp" />
											</LazyLoad>
											<p className="bonus-item-xp">{`+${item.xp}`}</p>
										</div>
									</div>
								))}
							</div>
							<button type="button" className="collect-btn tree-dimensional-button btn-cyan" onClick={collectDailyBonus}>
								<span className="btn-text">{t("eventPass.collect")}</span>
							</button>
						</Col>
					</Row>
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(DailyBonusModal));
