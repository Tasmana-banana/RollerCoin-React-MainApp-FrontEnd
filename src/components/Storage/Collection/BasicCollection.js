import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import CollectionItemCard from "./BasicItemCard";
import MarketSelectFilter from "../../Market/MarketSelectFilter";
import MarketPagination from "../../Market/MarketPagination";
import fetchWithToken from "../../../services/fetchWithToken";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

import "../../../assets/scss/Storage/Collection/BasicCollection.scss";

const mapStateToProps = (state) => ({
	language: state.game.language,
});

class BasicCollection extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			activeCardID: "",
			collections: [],
			options: {
				sort: "date",
				sort_direction: -1,
				skip: 0,
				limit: 24,
			},
			productsQuantity: 0,
			currentPageNumber: 1,
			pagesQty: 1,
			paginationType: "all",
		};
		this.controllers = {};
		this.signals = {};
		this.sortOptions = [
			{
				label: "bonusHigh",
				value: {
					sort: "bonus_power",
					sort_direction: -1,
				},
			},
			{
				label: "bonusLow",
				value: {
					sort: "bonus_power",
					sort_direction: 1,
				},
			},
			{
				label: "dateNew",
				value: {
					sort: "date",
					sort_direction: -1,
				},
			},
			{
				label: "dateOld",
				value: {
					sort: "date",
					sort_direction: 1,
				},
			},
		];
	}

	componentDidMount = async () => {
		document.addEventListener("click", this.handleClickOutside);
		await this.getCollections(this.state.options, false);
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		document.removeEventListener("click", this.handleClickOutside);
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	toggleActiveCard = (id = "") => {
		const { activeCardID } = this.state;
		this.setState({
			activeCardID: id === activeCardID ? "" : id,
		});
	};

	handleClickOutside = (event) => {
		const element = event.target.closest(".collection-description-switcher");
		if (!element) {
			this.setState({
				activeCardID: "",
			});
		}
	};

	getCollections = async (options, isLoadMore) => {
		const { collections } = this.state;
		const { sort, sort_direction: sortDirection, skip, limit } = options;
		this.createSignalAndController("getCollection");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(`/api/storage/collection/items?type=basic&sort=${sort}&sort_direction=${sortDirection}&skip=${skip}&limit=${limit}`, {
				method: "GET",
				signal: this.signals.getCollection,
			});
			if (!json.success) {
				return this.setState({ isLoading: false });
			}
			const receivedCollections = isLoadMore ? [...collections, ...json.data.items] : json.data.items;
			this.setState({
				collections: receivedCollections,
				pagesQty: Math.ceil(json.data.total / limit),
				productsQuantity: json.data.total,
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
		}
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
		this.toggleActiveCard();
		await this.getCollections(responseOptions, newPaginationType === "more");
	};

	render() {
		const { isLoading, activeCardID, collections, options, paginationType, pagesQty, currentPageNumber } = this.state;
		return (
			<div className="collection-body-wrapper">
				{!!collections && !!collections.length && (
					<div className="collection-filter">
						<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} sortingOptions={this.sortOptions} />
					</div>
				)}
				{!!collections && !!collections.length && (
					<Row noGutters={false} className="collection-container">
						{collections.map((item) => (
							<CollectionItemCard key={item._id} item={item} activeCardID={activeCardID} toggleActiveCard={this.toggleActiveCard} />
						))}
					</Row>
				)}
				{isLoading && (
					<div className="storage-preloader-layer">
						<LazyLoad offset={100}>
							<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
						</LazyLoad>
					</div>
				)}
				{!isLoading && +pagesQty > 1 && (
					<MarketPagination pagesQty={pagesQty} paginationType={paginationType} currentPageNumber={currentPageNumber} options={options} productsUpdate={this.productsUpdate} />
				)}
			</div>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(BasicCollection));
