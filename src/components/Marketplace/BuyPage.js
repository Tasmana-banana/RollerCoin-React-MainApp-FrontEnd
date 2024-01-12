import React, { Component } from "react";
import qs from "qs";
import { Row, Col } from "reactstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { ELECTRICITY_EVENTS } from "../../constants/SingleComponents";
import BuyStats from "./BuyStats";
import TypesFilter from "./TypesFilter";
import BuyFilters from "./BuyFilters";
import BuyItemCard from "./BuyItemCard";
import MarketplacePagination from "./MarketplacePagination";
import SearchAndSortPanel from "../SingleComponents/SearchAndSortPanel";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import { generateFilters, responseFilters } from "./helpers/marketplaceFilters";
import fetchWithToken from "../../services/fetchWithToken";
import scrollToElement from "../../services/scrollToElement";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";

import "../../assets/scss/Marketplace/BuyPage.scss";
import "rc-slider/assets/index.css";

import loaderImg from "../../assets/img/loader_sandglass.gif";

dayjs.extend(utc);

const MINER_TYPE = "miner";
const RACK_TYPE = "rack";

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	balance: state.game.balance,
});

const sortOptions = [
	{
		// index: 0 <= DEFAULT
		label: "dateNew",
		value: {
			field: "date",
			order: -1,
		},
	},
	{
		// index: 1
		label: "dateOld",
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
	{
		// index: 4
		label: "countHigh",
		value: {
			field: "count",
			order: -1,
		},
	},
	{
		// index: 5
		label: "countLow",
		value: {
			field: "count",
			order: 1,
		},
	},
];

const sortMinerOptions = [
	{
		// index: 6
		label: "powerHigh",
		value: {
			field: "power",
			order: -1,
		},
	},
	{
		// index: 7
		label: "powerLow",
		value: {
			field: "power",
			order: 1,
		},
	},
	{
		// index: 8
		label: "minerBonusHigh",
		value: {
			field: "miner_bonus",
			order: -1,
		},
	},
	{
		// index: 9
		label: "minerBonusLow",
		value: {
			field: "miner_bonus",
			order: 1,
		},
	},
];

const sortRackOptions = [
	{
		// index: 6
		label: "rackBonusHigh",
		value: {
			field: "rack_bonus",
			order: -1,
		},
	},
	{
		// index: 7
		label: "rackBonusLow",
		value: {
			field: "rack_bonus",
			order: 1,
		},
	},
];

class BuyPage extends Component {
	static propTypes = {
		balance: PropTypes.number.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			items: [],
			pagesQty: 0,
			currentPageNumber: 1,
			paginationType: "all",
			options: {
				currency: "RLT",
				itemType: "all",
				sort: {
					field: "date",
					order: -1,
				},
				skip: 0,
				limit: 12,
			},
			generalStats: {
				totalSales: 0,
				itemsSold: 0,
				totalVolume: 0,
			},
			itemsCounts: {
				all: 0,
				miners: 0,
				parts: 0,
				racks: 0,
				batteries: 0,
			},
			filters: {},
			filtersData: {},
			isLoading: false,
			sortOptions,
		};
		this.defaultLimit = 12;
		this.controllers = {};
		this.signals = {};
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

	componentDidUpdate(_, prevState) {
		if (prevState.options?.itemType !== this.state.options?.itemType) {
			const newSortOptions = [...sortOptions];

			if (this.state.options?.itemType === MINER_TYPE) {
				newSortOptions.push(...sortMinerOptions);
			}
			if (this.state.options?.itemType === RACK_TYPE) {
				newSortOptions.push(...sortRackOptions);
			}

			this.setState({
				sortOptions: newSortOptions,
			});
		}
	}

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	initialization = async () => {
		await Promise.all([this.getGeneralStats(), this.getFilters(), this.getSaleOrders()]);
	};

	getGeneralStats = async () => {
		const { options } = this.state;
		const fromDate = dayjs.utc().subtract(30, "day").startOf("day").format();
		const toDate = dayjs.utc().format();
		this.createSignalAndController("getGeneralStats");
		try {
			const json = await fetchWithToken(`/api/marketplace/buy/info?currency=${options.currency || "RLT"}&fromDate=${fromDate}&toDate=${toDate}`, {
				method: "GET",
				signal: this.signals.getGeneralStats,
			});
			if (!json.success) {
				return false;
			}
			const { sales, sold, volume } = json.data;
			this.setState({
				generalStats: {
					totalSales: sales,
					itemsSold: sold,
					totalVolume: volume,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	getFilters = async () => {
		const { options } = this.state;
		this.createSignalAndController("getFilters");
		try {
			const json = await fetchWithToken(`/api/marketplace/buy/filters?currency=${options.currency || "RLT"}`, {
				method: "GET",
				signal: this.signals.getFilters,
			});
			if (!json.success) {
				return false;
			}
			const { filters, sales } = json.data;
			this.setState({
				itemsCounts: {
					all: sales.all,
					miners: sales.miner,
					parts: sales.mutation_component,
					racks: sales.rack,
					batteries: sales.battery,
				},
				filters: generateFilters(filters, options.itemType),
				filtersData: filters,
			});
		} catch (e) {
			console.error(e);
		}
	};

	getSaleOrders = async (newOptions, newFilters, isLoadMore = false) => {
		const { items, options, filters } = this.state;
		const currentOptions = newOptions || options;
		const currentFilters = newFilters || filters;
		const adoptFilters = responseFilters(currentFilters);
		const apiUrl = `/api/marketplace/buy/sale-orders?${qs.stringify({ ...currentOptions, ...adoptFilters })}`;
		this.createSignalAndController("getSaleOrders");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(apiUrl, {
				method: "GET",
				signal: this.signals.getSaleOrders,
			});
			if (!json.success) {
				return false;
			}
			const receivedItems = isLoadMore ? [...items, ...json.data.items] : json.data.items;
			this.setState({
				items: receivedItems,
				pagesQty: Math.ceil(json.data.total / (currentOptions ? currentOptions.limit : this.defaultLimit)),
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	typesHandler = async (itemType) => {
		const { event, params } = ELECTRICITY_EVENTS.CHOOSE[itemType];
		googleAnalyticsPush(event, params);
		const { filtersData, options } = this.state;
		const newOptions = { ...options, skip: 0, itemType };

		const isNotMinerTypeAndMinerSort = itemType !== MINER_TYPE && ["power", "miner_bonus"].includes(options.sort?.field);
		const isNotRackTypeAndRackSort = itemType !== RACK_TYPE && options.sort?.field === "rack_bonus";

		if (isNotMinerTypeAndMinerSort || isNotRackTypeAndRackSort) {
			newOptions.sort = {
				field: "date",
				order: -1,
			};
		}

		const newFilters = generateFilters(filtersData, itemType);
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			options: newOptions,
			filters: newFilters,
		});
		await this.getSaleOrders(newOptions, newFilters);
	};

	filtersHandler = async (filters, isFetch) => {
		const { options } = this.state;
		const newOptions = { ...options, skip: 0 };
		this.setState({ filters, paginationType: "all", currentPageNumber: 1, options: newOptions });
		if (isFetch) {
			await this.getSaleOrders(newOptions, filters);
		}
	};

	searchHandler = async (newOptions) => {
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			options: newOptions,
		});
		await this.getSaleOrders(newOptions);
	};

	sortHandler = async (newOptions) => {
		this.setState({
			paginationType: "all",
			currentPageNumber: 1,
			options: newOptions,
		});
		await this.getSaleOrders(newOptions);
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
			scrollToElement(".marketplace-buy-main-block", -16);
		}
		await this.getSaleOrders(newOptions, null, isLoadMore);
	};

	render() {
		const { isMobile, balance } = this.props;
		const { generalStats, itemsCounts, filters, items, isLoading, pagesQty, currentPageNumber, paginationType, options } = this.state;
		return (
			<>
				{<InfoBlockWithIcon tName="Marketplace" message="buyPageInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="marketplace-buy-container">
					{isLoading && (
						<div className="marketplace-preloader-layer">
							<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
						</div>
					)}
					<BuyStats generalStats={generalStats} />
					<Row className="marketplace-buy-main-block">
						<Col xs={{ size: 12, order: 2 }} lg={{ size: 8, order: 1 }}>
							<SearchAndSortPanel options={options} sortHandler={this.sortHandler} searchHandler={this.searchHandler} sortOptionsList={this.state.sortOptions} />
							{!!items.length && (
								<div className="marketplace-buy-items-list">
									{items.map((item) => (
										<BuyItemCard key={item.itemId} item={item} itemHandler={this.itemHandler} />
									))}
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
							{!!filters && <BuyFilters filters={filters} filtersHandler={this.filtersHandler} balance={balance} />}
						</Col>
					</Row>
				</div>
			</>
		);
	}
}

export default withRouter(withTranslation("Marketplace")(connect(mapStateToProps, null)(BuyPage)));
