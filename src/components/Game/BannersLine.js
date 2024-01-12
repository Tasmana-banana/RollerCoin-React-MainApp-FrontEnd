import React, { Fragment } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Row } from "reactstrap";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
// import CryptoQuestBanner from "./DailyWeeklyQuests/CryptoQuestBanner";
import DailyBonus from "../EventPass/DailyBonus";
import fetchWithToken from "../../services/fetchWithToken";
import HalloweenEventPopup from "../SingleComponents/HalloweenEventPopup";
import DotPagination from "./MainBanners/DotPagination";
import MainBannerCard from "./MainBanners/MainBannerCard";

import "../../assets/scss/Game/BannersLine.scss";

import loaderImg from "../../assets/img/loader_sandglass.gif";
import arrowLeft from "../../assets/img/icon/arrow_left_purple.svg";

dayjs.extend(utc);

const mapStateToProps = (state) => ({
	isViewedTutorial: state.user.userViewedTutorial,
	language: state.game.language,
	halloweenEventPopup: state.notification.hangover_burning_event_pop_up,
});

class BannersLine extends React.Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		halloweenEventPopup: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.VIEW_LIMITS = {
			mobile: 1,
			pc: {
				lg: 3,
				xl: 4,
			},
		};

		this.state = {
			dailyBonus: {
				dailyRewards: null,
				currentUserDay: 0,
				seasonEndDate: new Date(),
				dailyBonusCycle: 0,
			},
			isLoading: true,
			banners: [],
			viewLimit: this.VIEW_LIMITS.pc.xl,
			windowShift: 0,
			page: 1,
			pages: 0,
			totalBanners: 0,
			dotPagination: [],
			isStopAutoSlide: false,
			cellsPosition: {},
			startX: 0,
			endX: 0,
			nowX: 0,
		};
		this.bannersBlockRef = React.createRef();
		this.controllers = {};
		this.signals = {};
		this.delayTimeout = 0;
	}

	componentDidMount() {
		this.initialization();
	}

	initialization = async () => {
		const { isViewedTutorial } = this.props;
		this.setViewLimits();
		await this.getBanners();
		if (isViewedTutorial.game) {
			await Promise.all([this.dailyBonusDelayedLoading()]);
		}
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidUpdate(prevProps, prevState) {
		const { isViewedTutorial } = this.props;
		if (prevProps.isViewedTutorial.game !== isViewedTutorial.game && isViewedTutorial.game) {
			this.dailyBonusDelayedLoading();
		}
		const isViewLimitChanged = prevState.viewLimit !== this.state.viewLimit;
		const isTotalOffersChanged = prevState.totalBanners !== this.state.totalBanners;
		const isDeviceChanged = prevProps.isMobile !== this.props.isMobile;
		const isPageChanged = prevState.page !== this.state.page;
		if (isDeviceChanged) {
			this.setViewLimits();
		}
		if (isViewLimitChanged || isTotalOffersChanged) {
			this.setPaginationData();
		}
		if (isPageChanged) {
			this.animatePageChange(prevState.page, this.state.page);
		}
	}

	componentWillUnmount() {
		if (this.delayTimeout) {
			clearTimeout(this.delayTimeout);
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	setViewLimits = () => {
		const { isMobile } = this.props;
		const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		let viewLimit = screenWidth < 1199 ? this.VIEW_LIMITS.pc.lg : this.VIEW_LIMITS.pc.xl;
		if (isMobile) {
			viewLimit = this.VIEW_LIMITS.mobile;
		}
		this.setState({ viewLimit });
	};

	dailyBonusDelayedLoading = async () => {
		const nowUTC = dayjs.utc();
		if (!this.delayTimeout && nowUTC.hour() === 0 && nowUTC.minute() < 15) {
			const msDelay = Math.floor(Math.random() * 100000);
			this.delayTimeout = setTimeout(() => {
				this.getEventDailyBonus();
			}, msDelay);
		} else {
			await this.getEventDailyBonus();
		}
	};

	setPaginationData = () => {
		const { isMobile } = this.props;
		const { viewLimit, totalBanners, banners } = this.state;
		const getPagesInDesktop = () => {
			let pages = 0;
			let currentPageItem = 0;
			banners.forEach((item) => {
				currentPageItem += item.cells;
				if (currentPageItem === viewLimit && !pages) {
					currentPageItem = 0;
					pages += 1;
				}
				if (pages) {
					pages += currentPageItem;
					currentPageItem = 0;
				}
			});
			return pages;
		};
		const pageCalculation = isMobile ? totalBanners / viewLimit : getPagesInDesktop();
		const pages = Math.floor(pageCalculation);
		this.setState({ page: 1, pages });
	};

	getEventDailyBonus = async () => {
		this.createSignalAndController("daily");
		try {
			const json = await fetchWithToken("/api/season/daily-bonus", {
				method: "GET",
				signal: this.signals.daily,
			});
			if (!json.success || !json.data || !json.data.daily_rewards) {
				return false;
			}
			localStorage.setItem("is_daily_collected_today", "false");

			const {
				daily_rewards: dailyRewards,
				current_user_day: currentUserDay,
				season_end_date: seasonEndDate,
				daily_bonus_cycle: dailyBonusCycle,
				seasons_id: seasonsId,
				img_ver: imgVer,
			} = json.data;
			this.setState({
				dailyBonus: {
					dailyRewards,
					currentUserDay,
					seasonEndDate,
					dailyBonusCycle,
					seasonsId,
					imgVer,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	getBanners = async () => {
		const { isMobile } = this.props;
		this.createSignalAndController("getBanners");
		try {
			const json = await fetchWithToken("/api/game/banners", {
				method: "GET",
				signal: this.signals.getBanners,
			});

			if (!json.success) {
				return false;
			}

			const banners = isMobile ? json.data.filter((item) => item.is_show_mobile) : json.data;

			this.setState({ banners, totalBanners: banners.length, page: 1 });
			this.getDotPagination();
		} catch (err) {
			console.error(err);
		} finally {
			this.setState({
				isLoading: false,
			});
		}
	};

	setStartTouchPosition = (e) => {
		const positionX = e.touches[0].clientX;
		this.setState({ startX: positionX, nowX: 0 });
	};

	handleTouchMove = (e) => {
		const endPositionX = e.touches[0].clientX;
		this.setState({ endX: endPositionX, nowX: endPositionX });
	};

	handleTouchEnd = () => {
		const { startX, endX, nowX, page } = this.state;

		if (!nowX) {
			return false;
		}

		if (startX !== 0 && endX !== 0) {
			const deltaX = endX - startX;

			if (deltaX > 0) {
				this.setPage(page - 1);
			} else if (deltaX < 0) {
				this.setPage(page + 1);
			}
		}
	};

	setPage = (page) => {
		const { pages } = this.state;
		if (page < 1) {
			return false;
		}
		if (page > pages) {
			return false;
		}
		this.setState({ page });
		this.getDotPagination(page);
	};

	calculateShift = () => {
		const { isMobile } = this.props;
		const { pages, page } = this.state;
		let bannersBlockWidth = 1;
		if (this.bannersBlockRef.current) {
			bannersBlockWidth = this.bannersBlockRef.current.offsetWidth + 10 || 1;
		}
		const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		let slideMultiplier = screenWidth < 1199 ? 4 / 12 : 3 / 12;
		const isLastMobilePage = isMobile && pages === page;

		const deviceMultiplier = isMobile ? 9 / 12 : slideMultiplier;
		if (page === 1) {
			return 0;
		}

		return bannersBlockWidth * (page - 1) * deviceMultiplier - (isLastMobilePage ? (bannersBlockWidth / 4) * deviceMultiplier : 0);
	};

	animatePageChange = (prevPage, newPage) => {
		const isForward = prevPage < newPage;
		const { windowShift } = this.state;
		const { isMobile } = this.props;
		const requiredWindowShift = this.calculateShift();
		if (windowShift === requiredWindowShift) {
			return false;
		}
		let shift = isMobile ? 10 : 20;
		if (isForward) {
			shift *= -1;
		}
		let newWindowShift = windowShift + shift;
		if (isForward && windowShift < requiredWindowShift) {
			newWindowShift = -requiredWindowShift;
		}
		if (!isForward && windowShift < requiredWindowShift && !!requiredWindowShift) {
			newWindowShift = -requiredWindowShift;
		}
		if (!isForward && windowShift < requiredWindowShift && !requiredWindowShift) {
			newWindowShift = requiredWindowShift;
		}
		this.setState({ windowShift: newWindowShift });
	};
	// End swiping logic

	getDotPagination = (page) => {
		const { pages } = this.state;
		const dotPagination = [];

		const newPage = page || this.state.page;

		for (let i = 1; i <= pages; i++) {
			dotPagination.push(`pagination-dot ${newPage === i ? "active" : ""}`);
		}
		this.setState({ dotPagination });
	};

	render() {
		const { wsReact, isViewedTutorial, halloweenEventPopup } = this.props;
		const { dailyBonus, isLoading, banners, windowShift, page, pages, dotPagination, isStopAutoSlide } = this.state;
		const isShowHalloweenModal = isViewedTutorial.game && !!halloweenEventPopup && halloweenEventPopup.is_show_notification;
		const isShowDailyModal = (!halloweenEventPopup || !halloweenEventPopup.is_show_notification) && dailyBonus && dailyBonus.dailyRewards && isViewedTutorial.game;

		return (
			<Fragment>
				<div className="banner-line-container" onMouseEnter={() => this.setState({ isStopAutoSlide: true })} onMouseLeave={() => this.setState({ isStopAutoSlide: false })}>
					{isLoading && (
						<div className="banners-line-preloader">
							<img src={loaderImg} height={63} width={63} alt="Loading..." />
						</div>
					)}
					{!isLoading && !!banners.length && (
						<Fragment>
							<div ref={this.bannersBlockRef} className="width-checker" key="width-checker" />
							<Row
								className={`banners-cards-wrapper`}
								id="banners-cards-wrapper"
								style={{ left: `${windowShift}px` }}
								onTouchStart={this.setStartTouchPosition}
								onTouchMove={this.handleTouchMove}
								onTouchEnd={this.handleTouchEnd}
							>
								{banners.map((banner) => (
									<MainBannerCard banner={banner} key={banner._id} wsReact={wsReact} />
								))}
							</Row>
							{pages > 1 && (
								<div className="pagination-block">
									<div className="prev-btn-container d-flex">
										<button type="button" className="pagination-btn prev-btn" onClick={() => this.setPage(page - 1)} disabled={page <= 1}>
											<span className="w-100 d-flex">
												<img src={arrowLeft} alt="arrowLeft" width={8} height={12} />
											</span>
										</button>
									</div>
									<div className="pagination-dots-block d-flex">
										{dotPagination.map((dot, index) => {
											return (
												<DotPagination
													className={dot}
													page={index + 1}
													currentPage={page}
													key={index}
													setPage={this.setPage}
													totalPages={pages}
													isStopAutoSlide={isStopAutoSlide}
												/>
											);
										})}
									</div>
									<div className="next-btn-container d-flex">
										<button type="button" className="pagination-btn next-btn" onClick={() => this.setPage(page + 1)} disabled={page >= pages}>
											<span className="w-100 d-flex">
												<img src={arrowLeft} alt="arrowRight" width={8} height={12} />
											</span>
										</button>
									</div>
								</div>
							)}
							{isShowDailyModal && <DailyBonus dailyBonus={dailyBonus} />}
							{isShowHalloweenModal && <HalloweenEventPopup eventData={halloweenEventPopup} />}
						</Fragment>
					)}
				</div>
			</Fragment>
		);
	}
}

export default withTranslation(["ProgressionEvent", "Game", "Banner", "SingleComponents"])(connect(mapStateToProps, null)(BannersLine));
