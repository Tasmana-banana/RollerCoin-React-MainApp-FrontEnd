import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import InternalOffersCard from "./InternalOffersCard";
import fetchWithToken from "../../services/fetchWithToken";
import decimalAdjust from "../../services/decimalAdjust";
import getCurrencyConfig from "../../services/getCurrencyConfig";

import "../../assets/scss/Offerwall/InternalOffers.scss";

import arrowLeft from "../../assets/img/icon/arrow_left.svg";
import arrowRight from "../../assets/img/icon/arrow_right.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import noOffersYetImg from "../../assets/img/offerwall/no_offers_yet.png";

const PROVIDERS_CONFIG = {
	offertoro: {
		title: "Torox",
		code: "offerToro",
	},
};

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	wsNode: state.webSocket.wsNode,
});

class InternalOffers extends Component {
	constructor(props) {
		super(props);
		this.DEFAULT_STATE = {
			offers: [],
			page: 1,
			pages: 0,
			skip: 0,
			totalOffers: 0,
			windowShift: 0,
			isPaginationUpdate: false,
		};
		this.VIEW_LIMITS = {
			mobile: 1,
			pc: 4,
		};
		this.REQUEST_LIMIT = 50;
		this.MIN_REWARDS_BUFFER = 10;
		this.MIN_DELTA_X = 20;
		this.CLASS_ADD_DELTA_X = 5;
		this.state = { ...this.DEFAULT_STATE, viewLimit: this.VIEW_LIMITS.pc, isLoading: false, startX: 0 };
		this.offersBlockRef = React.createRef();
		this.animationInterval = 0;
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount() {
		const { wsNode, provider } = this.props;
		this.setViewLimits();
		this.getOffers();
		if (wsNode && !wsNode.listenersMessage[`internalOffers${provider}`]) {
			wsNode.setListenersMessage({ [`internalOffers${provider}`]: this.onWSNodeMessage });
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const isViewLimitChanged = prevState.viewLimit !== this.state.viewLimit;
		const isTotalOffersChanged = prevState.totalOffers !== this.state.totalOffers;
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
		const { wsNode, provider } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage(`internalOffers${provider}`);
		}
		if (this.controller) {
			this.controller.abort();
		}
	}

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd } = data;
		if (cmd === "offers_list_updated") {
			this.getOffers();
		}
	};

	setViewLimits = () => {
		const { isMobile } = this.props;
		let viewLimit = this.VIEW_LIMITS.pc;
		if (isMobile) {
			viewLimit = this.VIEW_LIMITS.mobile;
		}
		this.setState({ viewLimit });
	};

	setPaginationData = () => {
		const { viewLimit, totalOffers } = this.state;
		const pages = Math.ceil(totalOffers / viewLimit);
		this.setState({ page: 1, pages });
	};

	getOffers = async (isPagination = false) => {
		const { provider, isMobile } = this.props;
		const { offers } = this.state;
		this.createSignalAndController();
		if (!isPagination) {
			this.setState({ isLoading: true });
		}
		let currentSkip = isPagination ? +this.state.skip + this.REQUEST_LIMIT : 0;

		const url = `/api/offerwall/offers-list?provider=${PROVIDERS_CONFIG[provider].code}&is_mobile=${isMobile}&limit=${this.REQUEST_LIMIT}&skip=${currentSkip}`;
		try {
			const json = await fetchWithToken(url, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				this.setState({ ...this.DEFAULT_STATE });
				return false;
			}
			const { items, payout_currency: payoutCurrency, total_offers: totalOffers, skip } = json.data;
			const currentCurrencyConfig = getCurrencyConfig(payoutCurrency || "RLT");
			const adjustedOffers = items.map((item) => {
				const payout = decimalAdjust(item.payout / currentCurrencyConfig.toSmall, 2);
				const clickUrl = item.click_url.replace("[tag]", isMobile ? "mobile" : "desktop");
				return { imageUrl: item.image_url, clickUrl, payout, currency: payoutCurrency, title: item.title, rating: item.rating };
			});
			if (isPagination) {
				this.setState({
					offers: [...offers, ...adjustedOffers],
					skip,
				});
				return true;
			}
			this.setState({
				offers: adjustedOffers,
				totalOffers,
				skip,
				page: 1,
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false, isPaginationUpdate: false });
		}
	};

	setPage = (page) => {
		const { pages, viewLimit, offers, totalOffers, isPaginationUpdate } = this.state;
		if (page < 1) {
			return false;
		}
		if (page > pages) {
			return false;
		}
		this.setState({ page });
		const remainingRewardsBufferCount = offers.length - viewLimit * page;
		if (!isPaginationUpdate && offers.length < totalOffers && remainingRewardsBufferCount <= this.MIN_REWARDS_BUFFER) {
			this.setState({ isPaginationUpdate: true });
			this.getOffers(true);
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	setStartTouchPosition = (e) => {
		const positionX = e.changedTouches[0].pageX;
		this.setState({ startX: positionX });
	};

	setEndTouchPosition = (e) => {
		const { startX } = this.state;
		const positionX = e.changedTouches[0].pageX;
		const { page } = this.state;
		if (document.body.classList.contains("offers-scroll-lock")) {
			document.body.classList.remove("offers-scroll-lock");
		}
		if (!this.offersBlockRef.current) {
			return null;
		}
		const deltaX = startX - positionX;
		if (Math.abs(deltaX) < this.MIN_DELTA_X) {
			return this.setState({ startX: 0 });
		}
		const offsetWidth = this.offersBlockRef.current.offsetWidth || 1;
		const swipedPages = Math.abs(Math.floor(Math.abs(deltaX) / offsetWidth) || 1);
		const isSwipeLeft = deltaX > 0;
		const isSwipeRight = deltaX < 0;
		if (isSwipeLeft) {
			this.setPage(page + swipedPages);
		}
		if (isSwipeRight) {
			this.setPage(page - swipedPages);
		}
		this.setState({ startX: 0 });
	};

	onSwipingNative = (e) => {
		if (!this.offersBlockRef.current) {
			return null;
		}
		const { startX, page, pages } = this.state;
		const offsetWidth = this.offersBlockRef.current.offsetWidth || 1;
		const positionX = e.changedTouches[0].pageX;
		let deltaX = startX - positionX;
		if (!document.body.classList.contains("offers-scroll-lock") && Math.abs(deltaX) >= this.CLASS_ADD_DELTA_X) {
			document.body.classList.add("offers-scroll-lock");
		}
		if ((page === 1 && deltaX < 0) || (page === pages && deltaX > 0)) {
			deltaX = 0;
		}
		const multiplier = window.innerWidth / offsetWidth;
		const windowShift = this.calculateShift(Math.ceil(-1 * deltaX) * multiplier);
		this.setState({ windowShift });
	};

	calculateShift = (swipePosition = 0) => {
		const { isMobile } = this.props;
		const { pages, page } = this.state;
		let offersBlockWidth = 1;
		if (this.offersBlockRef.current) {
			offersBlockWidth = this.offersBlockRef.current.offsetWidth || 1;
		}
		const isLastMobilePage = isMobile && pages === page;
		const deviceMultiplier = isMobile ? 9 / 12 : 1;
		return -offersBlockWidth * (page - 1) * deviceMultiplier + (isLastMobilePage ? (offersBlockWidth / 3) * deviceMultiplier : 0) + swipePosition;
	};

	animatePageChange = (prevPage, newPage) => {
		const isForward = prevPage < newPage;
		const { windowShift } = this.state;
		const { isMobile } = this.props;
		const requiredWindowShift = this.calculateShift();
		clearInterval(this.animationInterval);
		if (windowShift === requiredWindowShift) {
			return false;
		}
		let shift = isMobile ? 10 : 20;
		if (isForward) {
			shift *= -1;
		}
		let newWindowShift = windowShift + shift;
		if (isForward && windowShift < requiredWindowShift) {
			newWindowShift = requiredWindowShift;
		}
		if (!isForward && windowShift > requiredWindowShift) {
			newWindowShift = requiredWindowShift;
		}
		this.setState({ windowShift: newWindowShift });
		this.animationInterval = setInterval(() => this.animatePageChange(prevPage, newPage), 5);
	};
	// End swiping logic

	render() {
		const { offers, page, pages, isLoading, windowShift } = this.state;
		const { t, isMobile, isContestActive, provider } = this.props;
		return (
			<Fragment>
				{!!offers.length && (
					<div className={`internal-offers-container ${isContestActive ? "active-contest" : ""}`}>
						<h3 className="internal-offers-header">
							{t("offer")} {PROVIDERS_CONFIG[provider].title}
						</h3>
						{isLoading && (
							<div className="internal-offers-preloader">
								<div className="loader-wrapper">
									<img src={loaderImg} height={126} width={126} className="loader-img" alt="loader" />
								</div>
							</div>
						)}
						{!isLoading && !offers.length && (
							<div className="internal-no-offers">
								<h3 className="text-center">{t("no_surveys_yet")}</h3>
								<div className="img-wrapper">
									<img src={noOffersYetImg} alt="No offers yet" width={240} height={123} />
								</div>
							</div>
						)}
						{!isLoading && !!offers.length && (
							<Fragment>
								<div ref={this.offersBlockRef} className="width-checker" key="width-checker" />
								<Row
									className={`internal-offers-cards-wrapper`}
									id="internal-offers-cards-wrapper"
									style={{ left: `${windowShift}px` }}
									onTouchStart={this.setStartTouchPosition}
									onTouchMove={this.onSwipingNative}
									onTouchEnd={this.setEndTouchPosition}
								>
									{offers.map((offer) => (
										<InternalOffersCard key={offer.id} offer={offer} />
									))}
								</Row>
								<div className="pagination-block">
									<div className="prev-btn-container">
										<button type="button" className="pagination-btn tree-dimensional-button btn-default" onClick={() => this.setPage(page - 1)} disabled={page <= 1}>
											<span className="w-100">
												<img src={arrowLeft} alt="arrowLeft" width={20} height={20} />
											</span>
										</button>
									</div>
									<p className="pagination-progress">
										{page}
										<span className="progress-divider">/</span>
										{pages}
									</p>
									<div className="next-btn-container">
										<button type="button" className="pagination-btn tree-dimensional-button btn-default" onClick={() => this.setPage(page + 1)} disabled={page >= pages}>
											<span className="w-100">
												<img src={arrowRight} alt="arrowRight" width={20} height={20} />
											</span>
										</button>
									</div>
								</div>
							</Fragment>
						)}
					</div>
				)}
			</Fragment>
		);
	}
}

InternalOffers.propTypes = {
	provider: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
	isContestActive: PropTypes.bool.isRequired,
	wsNode: PropTypes.object.isRequired,
};

export default withTranslation("Offerwall")(connect(mapStateToProps, null)(InternalOffers));
