import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import qs from "qs";

import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import fetchWithToken from "../../../services/fetchWithToken";

import MyOrdersTabs from "./MyOrdersTabs";
import SearchAndSortPanel from "../../SingleComponents/SearchAndSortPanel";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import OrdersItemCard from "./OrdersItemCard";
import MarketplacePagination from "../MarketplacePagination";
import TypesFilter from "../TypesFilter";
import DateFilter from "./DateFilter";
import ModalEditOrder from "./ModalEditOrder";
import ModalDeleteOrder from "./ModalDeleteOrder";

import getLanguagePrefix from "../../../services/getLanguagePrefix";
import scrollToElement from "../../../services/scrollToElement";

import { ITEM_TYPE } from "../../../constants/Marketplace";

import activeListIcon from "../../../assets/img/marketplace/orders/active_listing_icon.svg";
import marketHistoryIcon from "../../../assets/img/marketplace/orders/market_history_icon.svg";
import salesHistoryIcon from "../../../assets/img/marketplace/orders/sales_history_icon.svg";
import emptyImg from "../../../assets/img/marketplace/orders/empty_orders.gif";

import "../../../assets/scss/Marketplace/MyOrders.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	language: state.game.language,
});

const DEFAULT_ITEM_TYPE = ITEM_TYPE.ACTIVE;

class MyOrders extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		match: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		const { t, language, match } = props;
		const defaultPage = match.params.type || DEFAULT_ITEM_TYPE;
		const tabsNavigationPrefix = `${getLanguagePrefix(language)}/marketplace/orders/`;
		this.state = {
			isLoading: true,
			items: [],
			tabsConfig: {
				[ITEM_TYPE.ACTIVE]: { title: t("orders.activeListing"), icon: activeListIcon, href: `${tabsNavigationPrefix}${ITEM_TYPE.ACTIVE}` },
				[ITEM_TYPE.MARKET_HISTORY]: { title: t("orders.marketHistory"), icon: marketHistoryIcon, href: `${tabsNavigationPrefix}${ITEM_TYPE.MARKET_HISTORY}` },
				[ITEM_TYPE.SALES_HISTORY]: { title: t("orders.salesHistory"), icon: salesHistoryIcon, href: `${tabsNavigationPrefix}${ITEM_TYPE.SALES_HISTORY}` },
			},
			activeTab: defaultPage,
			selectedItem: null,
			pagesQty: 0,
			currentPageNumber: 1,
			paginationType: "all",
			deleteModal: {
				isModalOpen: false,
				orderId: "",
				item_type: "",
			},
			isEditModalOpen: false,
			editModalData: {},
			options: {
				active: "true",
				currency: "RLT",
				itemType: "all",
				sort: {
					field: "date",
					order: -1,
				},
				skip: 0,
				limit: 12,
			},
			itemsCounts: {
				all: 0,
				miners: 0,
				parts: 0,
				racks: 0,
				batteries: 0,
			},
		};
		this.controllers = {};
		this.signals = {};
		this.sortOptions = [
			{
				// index: 0 <= DEFAULT
				label: t("sort.dateNew"),
				value: {
					field: "date",
					order: -1,
				},
			},
			{
				// index: 1
				label: t("sort.dateOld"),
				value: {
					field: "date",
					order: 1,
				},
			},
			{
				// index: 2
				label: "priceHigh",
				value: {
					field: "price",
					order: -1,
				},
			},
			{
				// index: 3
				label: "priceLow",
				value: {
					field: "price",
					order: 1,
				},
			},
		];
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidMount() {
		this.initialization();
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	initialization = async () => {
		await Promise.all([this.getMyOrdersCount(), this.getMyOrders()]);
	};

	async componentDidUpdate(prevProps, prevState) {
		const { match } = this.props;
		const selectedTabFromRoute = match.params.type || DEFAULT_ITEM_TYPE;
		const isActiveTabChanged = prevState.activeTab !== this.state.activeTab;
		const isRouteChanged = selectedTabFromRoute !== prevState.activeTab;
		if (isActiveTabChanged) {
			await Promise.all([this.getMyOrders(), this.getMyOrdersCount()]);
		}
		if (isRouteChanged) {
			this.setState({ activeTab: selectedTabFromRoute });
		}
	}

	getMyOrdersCount = async (newOptions, newTab, fromDate, toDate) => {
		const { options, activeTab } = this.state;
		this.createSignalAndController("getOrdersCount");
		const currentOptions = newOptions || options;
		const currentTab = newTab || activeTab;
		const dateParams = qs.stringify({ fromDate, toDate });
		try {
			const queryString = qs.stringify({ ...currentOptions });
			const json = await fetchWithToken(`/api/marketplace/seller/get-count?${queryString}&${dateParams}&ordersType=${currentTab}`, {
				method: "GET",
				signal: this.signals.getOrdersCount,
			});
			if (!json.success) {
				return false;
			}
			const { all, miner, rack, mutation_component: mutationComponent, battery } = json.data;
			this.setState({
				itemsCounts: {
					all: all ?? 0,
					miners: miner ?? 0,
					racks: rack ?? 0,
					parts: mutationComponent ?? 0,
					batteries: battery ?? 0,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	getMyOrders = async (newOptions, newTab, fromDate, toDate, isLoadMore = false) => {
		const { options, items, activeTab } = this.state;
		this.setState({ isLoading: true });
		const currentOptions = newOptions || options;
		this.createSignalAndController("getMyOrders");
		let queryString = qs.stringify(currentOptions);
		let currentTab = newTab || activeTab;

		let apiUrl = `/api/marketplace/seller/orders-list/?${queryString}`;
		const dateParams = qs.stringify({ fromDate, toDate });
		if (currentTab === ITEM_TYPE.MARKET_HISTORY) {
			apiUrl = `/api/marketplace/seller/purchase-list/?${queryString}&${dateParams}`;
		} else if (currentTab === ITEM_TYPE.SALES_HISTORY) {
			queryString = qs.stringify({ ...currentOptions, active: false });
			apiUrl = `/api/marketplace/seller/orders-list/?${queryString}&${dateParams}`;
		}
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.getMyOrders,
			});
			if (!json.success) {
				return false;
			}
			const receivedItems = isLoadMore ? [...items, ...json.data.items] : json.data.items;
			this.setState({
				items: receivedItems,
				pagesQty: Math.ceil(json.data.total / (currentOptions ? currentOptions.limit : options.limit)),
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	sortHandler = async (newOptions) => {
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			pagesQty: 0,
			options: newOptions,
		});

		await this.getMyOrders(newOptions);
	};

	typesHandler = async (itemType) => {
		const { options } = this.state;
		const newOptions = { ...options, skip: 0, itemType };
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			options: newOptions,
		});
		await this.getMyOrders(newOptions);
	};

	handleTabSelect = async (tab) => {
		const { options } = this.state;
		let active = "true";
		if (tab === ITEM_TYPE.SALES_HISTORY) {
			active = "false";
		}
		const newOptions = { ...options, itemType: "all", skip: 0, active, searchString: "" };
		this.setState({
			activeTab: tab,
			paginationType: tab,
			currentPageNumber: 1,
			pagesQty: 0,
			options: newOptions,
			items: [],
		});
	};

	paginationHandler = async (newOptions, newPaginationType, currentPage) => {
		const { currentPageNumber } = this.state;
		const isLoadMore = newPaginationType === "more";
		this.setState({
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
			options: newOptions,
		});
		if (!isLoadMore) {
			scrollToElement(".marketplace-orders-main-block", -16);
		}
		await this.getMyOrders(newOptions, null, null, null, isLoadMore);
	};

	searchHandler = async (newOptions) => {
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			options: newOptions,
		});
		await this.getMyOrders(newOptions);
	};

	openEditModalHandler = async (orderId, title, imgSrc, priceValue, quantity, type, itemId, currency, level) => {
		this.setState({
			editModalData: {
				title,
				imgSrc,
				priceValue,
				quantity,
				orderId,
				currency,
				type,
				itemId,
				level,
			},
			isEditModalOpen: true,
		});
	};

	closeEditModalHandler = () => {
		this.setState({
			editModalData: {},
			isEditModalOpen: false,
		});
	};

	stateChanger = (state, value) => {
		this.setState({
			[state]: value,
		});
	};

	openDeleteModalHandler = async (orderId, itemType) => {
		this.setState({
			deleteModal: {
				isModalOpen: true,
				orderId,
				item_type: itemType,
			},
		});
	};

	closeDeleteModalHandler = async () => {
		this.setState({
			deleteModal: {
				isModalOpen: false,
				orderId: "",
				item_type: "",
			},
		});
	};

	deleteHandler = async (orderId, itemType) => {
		const { items } = this.state;
		const newItems = items.filter((item) => item.orderId !== orderId);

		this.setState((prevState) => ({
			items: newItems,
			itemsCounts: {
				all: prevState.itemsCounts.all - 1,
				miners: itemType === "miner" ? prevState.itemsCounts.miners - 1 : prevState.itemsCounts.miners,
				parts: itemType === "mutation_component" ? prevState.itemsCounts.parts - 1 : prevState.itemsCounts.parts,
				racks: itemType === "rack" ? prevState.itemsCounts.racks - 1 : prevState.itemsCounts.racks,
				batteries: itemType === "battery" ? prevState.itemsCounts.batteries - 1 : prevState.itemsCounts.batteries,
			},
		}));
	};

	render() {
		const { isLoading, items, tabsConfig, activeTab, deleteModal, isEditModalOpen, editModalData, options, pagesQty, paginationType, currentPageNumber, itemsCounts } = this.state;
		return (
			<>
				{<InfoBlockWithIcon tName="Marketplace" message="myOrdersInfoMessage" obj="infoHints" showButtons />}
				<div className="marketplace-orders-container">
					{isLoading && (
						<div className="marketplace-preloader-layer">
							<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
						</div>
					)}
					<Fragment>
						<MyOrdersTabs tabsConfig={tabsConfig} active={activeTab} onSelect={(tab) => this.handleTabSelect(tab)}>
							<Row className="marketplace-orders-main-block">
								<Col xs={{ size: 12, order: 1 }} lg={{ size: 8, order: 1 }}>
									<SearchAndSortPanel options={options} searchHandler={this.searchHandler} sortOptionsList={this.sortOptions} sortHandler={this.sortHandler} activeTab={activeTab} />
									{!!items.length && (
										<Row>
											{items.map((item) => (
												<OrdersItemCard
													openEditModalHandler={this.openEditModalHandler}
													openDeleteModalHandler={this.openDeleteModalHandler}
													key={item.orderId}
													item={item}
													activeTab={activeTab}
												/>
											))}
										</Row>
									)}
									{!items.length && !isLoading && (
										<div className="marketplace-orders-empty">
											<img src={emptyImg} width={276} height={210} alt="no orders" />
										</div>
									)}
									{!isLoading && +pagesQty > 1 && (
										<MarketplacePagination
											pagesQty={pagesQty}
											paginationType={paginationType}
											currentPageNumber={currentPageNumber}
											options={options}
											paginationHandler={this.paginationHandler}
											turnOffLoadMore={true}
										/>
									)}
								</Col>
								<Col xs={{ size: 12, order: 1 }} lg={{ size: 4, order: 2 }}>
									<TypesFilter selectedType={options.itemType} typesHandler={this.typesHandler} itemsCounts={itemsCounts} />
									{activeTab !== ITEM_TYPE.ACTIVE && <DateFilter currentTab={activeTab} getMyOrders={this.getMyOrders} getMyOrdersCount={this.getMyOrdersCount} />}
								</Col>
							</Row>
						</MyOrdersTabs>
					</Fragment>
					<Fragment>
						{isEditModalOpen && (
							<ModalEditOrder
								isEditModalOpen={isEditModalOpen}
								closeEditModalHandler={this.closeEditModalHandler}
								getMyOrders={this.getMyOrders}
								editModalData={editModalData}
								stateChanger={this.stateChanger}
							/>
						)}
						{deleteModal.isModalOpen && (
							<ModalDeleteOrder deleteModal={deleteModal} stateChanger={this.stateChanger} closeDeleteModalHandler={this.closeDeleteModalHandler} deleteHandler={this.deleteHandler} />
						)}
					</Fragment>
				</div>
			</>
		);
	}
}

export default withRouter(withTranslation("Marketplace")(connect(mapStateToProps, null)(MyOrders)));
