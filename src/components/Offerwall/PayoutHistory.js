import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import connect from "react-redux/es/connect/connect";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import OffersFilter from "./OffersFilter";
import RewardCard from "./RewardCard";
import OffersProviderModal from "./OffersProviderModal";
import fetchWithToken from "../../services/fetchWithToken";
import scrollToElement from "../../services/scrollToElement";

import "../../assets/scss/Offerwall/OffersList.scss";

import loaderImg from "../../assets/img/loader_sandglass.gif";
import restartIcon from "../../assets/img/icon/restart.svg";

const TOP_PROVIDERS = ["timewall", "lootably", "cpx"];

const mapStateToProps = (state) => ({
	uid: state.user.uid,
	isMobile: state.game.isMobile,
});
class PayoutHistory extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		uid: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			filterBy: [],
			payoutAll: false,
			itemsOnPage: [],
			sortByType: [],
			options: {
				filter: "all",
				sort: "created",
				sort_direction: -1,
				skip: 0,
				limit: 24,
			},
			currentPageNumber: 1,
			pagesQty: 1,
			paginationType: "all",
			rewardsStats: [],
			providers: [],
			currentProvider: {},
			isModalOpen: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount = async () => {
		await this.getRewards(this.state.options, false);
	};

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

	updateOptions = async (options, reset = false) => {
		const { currentPageNumber, paginationType } = this.state;
		const newOptions = options;
		if (reset) {
			newOptions.skip = 0;
		}
		this.setState({ options: newOptions, currentPageNumber: reset ? 1 : currentPageNumber, paginationType: reset ? "all" : paginationType });
		await this.getRewards(newOptions, false);
	};

	productsUpdate = async (currentOptions, newPaginationType, currentPage) => {
		const { options, currentPageNumber } = this.state;
		const responseOptions = { ...options, ...currentOptions };

		this.setState({
			options: responseOptions,
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
			isLoading: newPaginationType !== "more",
		});
		if (newPaginationType !== "more") {
			scrollToElement(".products-page", -40);
		}
		await this.getRewards(responseOptions, newPaginationType === "more");
	};

	getRewards = async (options, isLoadMore) => {
		const { rewardsStats, payoutAll } = this.state;
		this.createSignalAndController("payoutHistory");
		this.setState({ isLoading: true });
		const url = `/api/offerwall/payout-history?filter=${options.filter}&sort=${options.sort}&sort_direction=${options.sort_direction}&skip=${options.skip}&limit=${options.limit}`;
		try {
			const json = await fetchWithToken(url, {
				method: "GET",
				signal: this.signals.payoutHistory,
			});
			if (!json.success) {
				return false;
			}
			const lastDate = localStorage.getItem("last_payout_history_date");
			const transactionsWithNewFlag = json.data.offers_transactions.map((transaction) => ({ ...transaction, isNew: Date.parse(transaction.created) > +lastDate }));
			localStorage.setItem("last_payout_history_date", Date.now().toString());
			const receivedRewards = isLoadMore ? [...rewardsStats, ...transactionsWithNewFlag] : transactionsWithNewFlag;

			if (!receivedRewards.length && !payoutAll) {
				await this.getProviders();
			}
			if (options.filter === "all" && !!receivedRewards.length) {
				this.setState({
					payoutAll: true,
				});
			}
			this.setState({
				rewardsStats: receivedRewards,
				filterBy: json.data.filter_by,
				itemsOnPage: json.data.pagination_sort_select,
				sortByType: json.data.sort_by_select,
				pagesQty: json.data.total_pages,
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
		}
	};

	getProviders = async () => {
		this.createSignalAndController("getProviders");
		try {
			const json = await fetchWithToken("/api/offerwall/providers", {
				method: "GET",
				signal: this.signals.getProviders,
			});
			if (!json.success) {
				return false;
			}
			if (!json.data) {
				return false;
			}
			const providersData = json.data
				.filter((item) => TOP_PROVIDERS.includes(item.code))
				.map((item) => {
					const { uid } = this.props;
					const url = item.iframe_url.replace("{uid}", uid);
					const { code, title, tag, sort, tag_color: tagColor, tag_text_color: tagTextColor } = item;
					return { code, title, tag, url, sort, tagColor, tagTextColor };
				});
			const sortedProviders = providersData.sort((a, b) => a.sort - b.sort);
			this.setState({
				providers: sortedProviders,
			});
		} catch (e) {
			console.error(e);
		}
	};

	switchPageHandler = async (pageNumber, type) => {
		const responseOptions = { ...this.state.options };
		responseOptions.skip = this.state.options.limit * (pageNumber - 1);
		await this.productsUpdate(responseOptions, type, pageNumber);
		if (type !== "more") {
			scrollToElement(".select-filters-wrapper", -32);
		}
	};

	providerModalHandler = (providerCode) => {
		const { providers } = this.state;
		const current = providers.find((provider) => provider.code === providerCode);
		if (!current) {
			return false;
		}
		this.setState({
			currentProvider: current,
			isModalOpen: true,
		});
	};

	closeModalHandler = () => {
		this.setState({
			isModalOpen: false,
		});
	};

	render() {
		const { options, filterBy, itemsOnPage, sortByType, isLoading, rewardsStats, pagesQty, paginationType, currentPageNumber, providers, isModalOpen, currentProvider } = this.state;
		const { t, isMobile } = this.props;
		return (
			<div className="products-page">
				<div className="title-block">
					<h3 className="page-name">Payout history</h3>
					<p className="subtitle-text">Here you can see the transaction history from our partners in TaskWall.</p>
				</div>

				<Row>
					<Col xs={12}>
						<OffersFilter
							options={options}
							filterBy={filterBy}
							itemsOnPage={itemsOnPage}
							sortByType={sortByType}
							paginationType={paginationType}
							updateOptions={this.updateOptions}
							disable={options.filter === "all" && !rewardsStats.length}
						/>
					</Col>
				</Row>
				<Row>{!!rewardsStats.length && rewardsStats.map((stats) => <RewardCard key={stats._id} reward={stats} />)}</Row>
				{!isLoading && !rewardsStats.length && (
					<div className="container-empty-data">
						<div className="text-center mgb-24">
							<LazyLoad offset={100}>
								<img src="/static/img/offerwall/purse_big.svg" className="empty-data-img" alt="purseBig" />
							</LazyLoad>
						</div>
						<div>
							<p className="sorry-text text-center mgb-8">
								<b>{t("sorry")}</b>
							</p>
						</div>
					</div>
				)}
				{!isLoading && !rewardsStats.length && !!providers.length && (
					<div className="offers-list-page">
						<div className="offers-list-block">
							<h3 className="offers-list-header">It's time to start earning RLT</h3>
							<p className="offers-info-text">Check the list of our partners providing tasks for the Task Wall</p>
							<Row>
								{providers.map((provider) => (
									<Col xs={6} lg={4} key={provider.code} className={isMobile ? "mb-2" : "mb-3"}>
										<div className="offers-provider" onClick={() => this.providerModalHandler(provider.code)}>
											<div className="offers-provider-logo-wrapper">
												{provider.tag && (
													<div className="offers-provider-tag" style={{ background: provider.tagColor }}>
														<p className="offers-provider-tag-text" style={{ color: provider.tagTextColor }}>
															{provider.tag.toUpperCase()}
														</p>
													</div>
												)}
												<LazyLoadImage
													className="offers-provider-logo"
													width={240}
													height={64}
													src={`${process.env.STATIC_URL}/static/img/offerwalls/providers/${provider.code}.png?v=1.0.1`}
													alt={provider.title}
													threshold={100}
												/>
											</div>
											<p className="provider-view-btn">{t("view_task")}</p>
										</div>
									</Col>
								))}
							</Row>
						</div>
					</div>
				)}
				{isModalOpen && <OffersProviderModal isModalOpen={isModalOpen} closeModalHandler={this.closeModalHandler} currentProvider={currentProvider} />}
				{isLoading && (
					<div className="offerwall-preloader">
						<LazyLoad offset={100}>
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="sales" />
						</LazyLoad>
					</div>
				)}
				{!isLoading && +pagesQty > 1 && (
					<div className="payout-pagination">
						{this.state.paginationType !== "page" && +pagesQty > +currentPageNumber && (
							<button type="button" className="payout-load-more" onClick={() => this.switchPageHandler(+currentPageNumber + 1, "more")}>
								<img src={restartIcon} alt="load more icon" width={16} height={16} className="payout-pagination-icon" />
								<span className="btn-text">Load more</span>
							</button>
						)}
					</div>
				)}
			</div>
		);
	}
}

export default withTranslation("Offerwall")(connect(mapStateToProps, null)(PayoutHistory));
