import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import LazyLoad from "react-lazyload";
import PropTypes from "prop-types";
import MarketSelectFilter from "../../Market/MarketSelectFilter";
import MarketPagination from "../../Market/MarketPagination";
import EmptyInventory from "./EmptyInventory";
import InfoBlock from "./InfoBlock";
import fetchWithToken from "../../../services/fetchWithToken";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

import "../../../assets/scss/Storage/Inventroy/Parts.scss";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class Parts extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
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
		await this.getParts(this.state.options, false);
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

	getParts = async (options, isLoadMore) => {
		const { collections } = this.state;
		const { sort, sort_direction: sortDirection, skip, limit } = options;
		this.createSignalAndController("getParts");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(`/api/storage/inventory/parts?sort=${sort}&sort_direction=${sortDirection}&skip=${skip}&limit=${limit}`, {
				method: "GET",
				signal: this.signals.getParts,
			});
			if (!json.success) {
				return this.setState({ isLoading: false });
			}
			const receivedParts = isLoadMore ? [...collections, ...json.data.items] : json.data.items;
			this.setState({
				items: receivedParts,
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
		await this.getParts(responseOptions, newPaginationType === "more");
	};

	render() {
		const { items, options, paginationType, isLoading, pagesQty, currentPageNumber } = this.state;
		const { t, language, isMobile } = this.props;
		return (
			<div>
				{!!items && !!items.length && (
					<Fragment>
						<div className="inventory-filter">
							<MarketSelectFilter options={options} paginationType={paginationType} productsUpdate={this.productsUpdate} sortingOptions={this.sortOptions} />
						</div>
						<InfoBlock />
						<Row noGutters={isMobile} className="inventory-parts-container">
							{items.map((part) => (
								<Col xs={12} lg={4} key={part._id} className="part-card-container">
									<div className="part-card-wrapper">
										<div className="part-image-block">
											<img
												className="image"
												style={{ filter: `drop-shadow(0 0 4px #${part.base_color_hex}` }}
												src={`${process.env.STATIC_URL}/static/img/storage/mutation_components/${part._id}.png?v=1.0.1`}
												alt="part image"
												height="64"
												width="64"
											/>
										</div>
										<div className="part-info-block">
											<div className="type-rarity-block">
												<p className="rarity" style={{ color: `#${part.base_color_hex}` }}>
													{part.rarity_name[language] || part.rarity_name.en}
												</p>
												<p className="name">{t(`inventory.${part.type}`)}</p>
											</div>
											<div className="quantity-block">
												<p className="text">{t("inventory.quantity")}</p>
												<p className="number">{part.quantity}</p>
											</div>
										</div>
									</div>
								</Col>
							))}
						</Row>
					</Fragment>
				)}
				{!items.length && !isLoading && (
					<Fragment>
						<InfoBlock />
						<EmptyInventory inventoryType="parts" />
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

export default withTranslation("Storage")(connect(mapStateToProps, null)(Parts));
