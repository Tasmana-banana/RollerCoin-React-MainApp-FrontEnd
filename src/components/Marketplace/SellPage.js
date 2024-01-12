import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import qs from "qs";
import RollerTabs from "../SingleComponents/RollerTabs";
import SearchAndSortPanel from "../SingleComponents/SearchAndSortPanel";
import MarketplacePagination from "./MarketplacePagination";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import SellItemCard from "./SellItemCard";
import InfoBlock from "../Storage/Inventory/InfoBlock";
import EmptyInventory from "../Storage/Inventory/EmptyInventory";
import scrollToElement from "../../services/scrollToElement";
import fetchWithToken from "../../services/fetchWithToken";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { ITEM_TYPE, ITEM_TYPE_TO_INVENTORY_MAP } from "../../constants/Marketplace";

import "rc-slider/assets/index.css";
import "../../assets/scss/Marketplace/SellPage.scss";
import "../../assets/scss/SingleComponents/RollerTabs/ItemTypeTabs.scss";

import minerImg from "../../assets/img/storage/basic_miner.svg";
import rackImg from "../../assets/img/storage/rack.svg";
import partImg from "../../assets/img/storage/part.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import lightningIcon from "../../assets/img/profile/lightning.svg";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

const DEFAULT_ITEM_TYPE = ITEM_TYPE.PART;

class SellPage extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		match: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		const { t, language, match } = props;
		const defaultPage = match.params.type || DEFAULT_ITEM_TYPE;
		const tabsNavigationPrefix = `${getLanguagePrefix(language)}/marketplace/sell/`;
		this.state = {
			tabsConfig: {
				[ITEM_TYPE.PART]: { title: t("sell.mutation_components"), icon: partImg, count: 0, href: `${tabsNavigationPrefix}${ITEM_TYPE.PART}` },
				[ITEM_TYPE.MINER]: { title: t("sell.miners"), icon: minerImg, count: 0, href: `${tabsNavigationPrefix}${ITEM_TYPE.MINER}` },
				[ITEM_TYPE.RACK]: { title: t("sell.racks"), icon: rackImg, count: 0, href: `${tabsNavigationPrefix}${ITEM_TYPE.RACK}` },
				[ITEM_TYPE.BATTERY]: { title: t("sell.batteries"), icon: lightningIcon, count: 0, href: `${tabsNavigationPrefix}${ITEM_TYPE.BATTERY}` },
			},
			activeTab: defaultPage,
			// General
			isLoading: true,
			items: [],
			selectedItem: null,
			// Pagination
			pagesQty: 0,
			currentPageNumber: 1,
			paginationType: "all",
			// Page options
			options: {
				itemType: defaultPage,
				sort: {
					field: "date",
					order: -1,
				},
				skip: 0,
				limit: 12,
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
				label: t("sort.countHigh"),
				value: {
					field: "quantity",
					order: -1,
				},
			},
			{
				// index: 3
				label: t("sort.countLow"),
				value: {
					field: "quantity",
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
		await Promise.all([this.getItemsCount(), this.getInventoryItems()]);
	};

	async componentDidUpdate(prevProps, prevState) {
		const { match } = this.props;
		const selectedTabFromRoute = match.params.type || DEFAULT_ITEM_TYPE;
		const isSkipChanged = prevState.options.skip !== this.state.options.skip;
		const isLimitChanged = prevState.options.limit !== this.state.options.limit;
		const isActiveTabChanged = prevState.activeTab !== this.state.activeTab;
		const isSortFieldChanged = prevState.options.sort.field !== this.state.options.sort.field;
		const isSortOrderChanged = prevState.options.sort.order !== this.state.options.sort.order;
		const isRouteChanged = selectedTabFromRoute !== prevState.activeTab;
		if (isSkipChanged || isLimitChanged || isActiveTabChanged || isSortFieldChanged || isSortOrderChanged) {
			await this.getInventoryItems();
		}
		if (isRouteChanged) {
			this.setState({ activeTab: selectedTabFromRoute });
		}
	}

	getItemsCount = async () => {
		this.createSignalAndController("getItemsCount");
		try {
			let json = await fetchWithToken(`/api/marketplace/sell/inventory-items/count`, {
				method: "GET",
				signal: this.signals.getItemsCount,
			});
			if (!json.success) {
				return false;
			}
			const tabsConfig = Object.entries(this.state.tabsConfig).reduce((acc, [key, value]) => {
				return { ...acc, [key]: { ...value, count: json.data[key] || 0 } };
			}, {});
			this.setState({ tabsConfig });
		} catch (e) {
			console.error(e);
		}
	};

	getInventoryItems = async () => {
		const { items, options, activeTab, paginationType } = this.state;
		const isLoadMore = paginationType === "more";
		const apiUrl = `/api/marketplace/sell/inventory-items/list?${qs.stringify({ ...options, ...{ itemType: activeTab } })}`;
		this.createSignalAndController("getInventoryItems");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.getInventoryItems,
			});
			if (!json.success) {
				return false;
			}
			const newItems = json.data.items.map((item) => ({
				...item,
				sellName: item.itemType === ITEM_TYPE.PART ? item.type : item.itemType,
			}));
			const receivedItems = isLoadMore ? [...items, ...newItems] : newItems;
			this.setState({
				items: receivedItems,
				pagesQty: Math.ceil(json.data.total / (options ? options.limit : this.defaultLimit)),
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
	};

	handleTabSelect = async (tab) => {
		this.setState({
			activeTab: tab,
			paginationType: "all",
			currentPageNumber: 1,
			pagesQty: 0,
			options: { ...this.state.options, skip: 0 },
		});
	};

	paginationHandler = (newOptions, newPaginationType, currentPage) => {
		const { currentPageNumber } = this.state;
		this.setState({
			paginationType: newPaginationType,
			currentPageNumber: currentPage || currentPageNumber,
			options: newOptions,
		});
		if (newPaginationType !== "more") {
			scrollToElement(".marketplace-sell-main-block", -16);
		}
	};

	onSellClickHandler = async (item) => {
		scrollToElement(".marketplace-container", -16);
		this.setState({
			selectedItem: item,
		});
		if (!item) {
			await this.getInventoryItems();
		}
	};

	render() {
		const { isMobile } = this.props;
		const { isLoading, tabsConfig, activeTab, options, items, selectedItem, pagesQty, paginationType, currentPageNumber } = this.state;
		return (
			<div className="marketplace-sell-container">
				{!selectedItem && (
					<Fragment>
						{<InfoBlockWithIcon tName="Marketplace" message="sellPageInfoMessage" obj="infoHints" showButtons={isMobile} />}
						<RollerTabs className="item-type-tabs" tabsConfig={tabsConfig} active={activeTab} onSelect={(tab) => this.handleTabSelect(tab)} />
						{activeTab === ITEM_TYPE.PART && (
							<div className="mb-3">
								<InfoBlock />
							</div>
						)}
						<Row className="marketplace-sell-main-block">
							<Col xs={{ size: 12, order: 2 }} lg={{ size: 12, order: 1 }}>
								{!!items.length && <SearchAndSortPanel options={options} sortHandler={this.sortHandler} sortOptionsList={this.sortOptions} />}
								<Row>
									{items.map((item) => (
										<SellItemCard key={item._id} item={item} onClick={() => this.onSellClickHandler(item)} />
									))}
								</Row>
								{!items.length && !isLoading && <EmptyInventory inventoryType={ITEM_TYPE_TO_INVENTORY_MAP[activeTab]} />}
								{!isLoading && +pagesQty > 1 && (
									<MarketplacePagination
										pagesQty={pagesQty}
										paginationType={paginationType}
										currentPageNumber={currentPageNumber}
										options={options}
										paginationHandler={this.paginationHandler}
									/>
								)}
							</Col>
						</Row>
					</Fragment>
				)}
				{isLoading && (
					<span className="marketplace-preloader-layer">
						<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
					</span>
				)}
			</div>
		);
	}
}

export default withRouter(withTranslation("Marketplace")(connect(mapStateToProps, null)(SellPage)));
