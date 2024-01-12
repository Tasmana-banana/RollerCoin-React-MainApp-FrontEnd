import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import LazyLoad, { forceVisible } from "react-lazyload";
import MarketSelectFilter from "../../Market/MarketSelectFilter";
import MarketPagination from "../../Market/MarketPagination";
import InventoryItemCard from "./InventoryItemCard";
import EmptyInventory from "./EmptyInventory";
import fetchWithToken from "../../../services/fetchWithToken";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

import "../../../assets/scss/Storage/Inventroy/MinersAndRacksTab.scss";
import infoImg from "../../../assets/img/storage/info_icon_big.svg";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class MinersAndRacksItems extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		type: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			activeCardID: "",
			items: [],
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
				label: "countHigh",
				value: {
					sort: "quantity",
					sort_direction: -1,
				},
			},
			{
				label: "countLow",
				value: {
					sort: "quantity",
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
		await this.getItems(this.state.options, false);
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
		document.removeEventListener("click", this.handleClickOutside);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.items.length !== this.state.items.length && this.state.items.length) {
			forceVisible();
		}
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getItems = async (options, isLoadMore) => {
		const { items } = this.state;
		const { type } = this.props;
		const { sort, sort_direction: sortDirection, skip, limit } = options;
		this.createSignalAndController("getItems");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(`/api/storage/inventory/${type}?sort=${sort}&sort_direction=${sortDirection}&skip=${skip}&limit=${limit}`, {
				method: "GET",
				signal: this.signals.getItems,
			});
			if (!json.success) {
				return this.setState({ isLoading: false });
			}
			const receivedItems = isLoadMore ? [...items, ...json.data.items] : json.data.items;
			this.setState({
				items: receivedItems,
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
		await this.getItems(responseOptions, newPaginationType === "more");
	};

	toggleActiveCard = (id = "") => {
		const { activeCardID } = this.state;
		this.setState({
			activeCardID: id === activeCardID ? "" : id,
		});
	};

	handleClickOutside = (event) => {
		const element = event.target.closest(".inventory-description-switcher");
		if (!element) {
			this.setState({
				activeCardID: "",
			});
		}
	};

	render() {
		const { items, options, paginationType, isLoading, pagesQty, currentPageNumber, activeCardID } = this.state;
		const { isMobile, type, t } = this.props;
		return (
			<div>
				{!!items && !!items.length && (
					<Fragment>
						<div className="inventory-filter">
							<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} sortingOptions={this.sortOptions} />
						</div>
						<div className="info-block-container">
							<div className="info-icon-block">
								<img className="info-icon" src={infoImg} alt="info img" width="24" height="24" />
							</div>
							<p className="info-text">{t("inventory.tip")}</p>
						</div>
						<Row noGutters={isMobile} className="inventory-parts-container">
							{items.map((item) => (
								<InventoryItemCard key={items.id} toggleActiveCard={this.toggleActiveCard} activeCardID={activeCardID} item={item} />
							))}
						</Row>
					</Fragment>
				)}
				{!items.length && !isLoading && (
					<Fragment>
						<div className="info-block-container">
							<div className="info-icon-block">
								<img className="info-icon" src={infoImg} alt="info img" width="24" height="24" />
							</div>
							<p className="info-text">{t("inventory.tip")}</p>
						</div>
						<EmptyInventory inventoryType={type} />
					</Fragment>
				)}
				{isLoading && (
					<div className="storage-preloader-layer">
						<LazyLoad offset={100}>
							<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
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

export default withTranslation("Storage")(connect(mapStateToProps, null)(MinersAndRacksItems));
