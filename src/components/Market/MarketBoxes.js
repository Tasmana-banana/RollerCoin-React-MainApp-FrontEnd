import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import LazyLoad from "react-lazyload";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../services/fetchWithToken";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";
import MarketBoxesCard from "./MarketBoxesCard";
import BonusBoxModal from "./BonusBoxModal";
import MarketBanner from "./MarketBanner";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";

import loaderImg from "../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	isMobile: state.game.isMobile,
	wsNode: state.webSocket.wsNode,
});

class MarketBoxes extends Component {
	static propTypes = {
		buyAction: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		toggleActiveProduct: PropTypes.func.isRequired,
		activeProductId: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			isOpenPresentationModal: false,
			isProcessing: false,
			products: [],
			boxContent: {
				amount: 0,
				baseColor: "ffffff",
				itemId: null,
				lootBoxId: null,
				type: null,
				name: null,
				power: 0,
			},
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount = async () => {
		const { wsNode } = this.props;
		await this.getBoxes();
		if (wsNode && !wsNode.listenersMessage.loot_box) {
			wsNode.setListenersMessage({ loot_box: this.onWSNodeMessage });
		}
	};

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("loot_box");
		}
		if (this.controller) {
			this.controller.abort();
		}
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "loot_box_updated":
				this.handleLimitUpdate(value);
				break;
			default:
				break;
		}
	};

	handleLimitUpdate = (value) => {
		const { products } = this.state;
		const { loot_box_id: lootBoxId, left_for_sale: leftForSale } = value;
		const nextState = products.map((item) => (item._id !== lootBoxId ? item : { ...item, sold: item.limit_for_sale - leftForSale }));
		this.setState({ products: nextState });
	};

	getBoxes = async () => {
		this.createSignalAndController();
		try {
			const json = await fetchWithToken("/api/market/loot-boxes", {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			const sortedItems = json.data.items.sort((a, b) => b.sort - a.sort);
			this.setState({
				products: sortedItems,
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
		}
	};

	closeModal = () => this.setState({ isOpenPresentationModal: false });

	buyBox = async (id) => {
		const { buyAction, wsReact } = this.props;
		let currencyConfig = getCurrencyConfig("RLT");

		this.setState({ isProcessing: true });
		const bonus = await buyAction({ id, qty: 1, type: "loot_box" });
		if (["ETH_SMALL", "BNB_SMALL", "DOGE_SMALL"].includes(bonus.type)) {
			currencyConfig = getCurrencyConfig(bonus.type);
		}

		if (!bonus) {
			return this.setState({ isProcessing: false });
		}

		this.setState({
			isOpenPresentationModal: true,
			isProcessing: false,
			boxContent: {
				amount: ["RLT", "RST", "ETH_SMALL", "BNB_SMALL", "DOGE_SMALL"].includes(bonus.type) ? decimalAdjust(bonus.amount / currencyConfig.toSmall, 2) : bonus.amount,
				baseColor: bonus.base_color_hex,
				itemId: bonus.item_id,
				lootBoxId: bonus.loot_box_id,
				type: ["RLT", "RST", "ETH_SMALL", "BNB_SMALL", "DOGE_SMALL"].includes(bonus.type) ? currencyConfig.name : bonus.type,
				name: bonus.name,
				power: bonus.power || 0,
				filename: bonus.filename || "",
				img_ver: bonus.img_ver || 1,
			},
		});
		wsReact.send(JSON.stringify({ cmd: "balance_request" }));
	};

	render() {
		const { language, activeProductId, toggleActiveProduct, wsReact, isMobile } = this.props;
		const { isLoading, products, isOpenPresentationModal, boxContent, isProcessing } = this.state;
		return (
			<Fragment>
				{isOpenPresentationModal && <BonusBoxModal isOpen={isOpenPresentationModal} closeModal={this.closeModal} boxContent={boxContent} language={language} />}
				{!isLoading && <InfoBlockWithIcon tName="Game" message="lootBoxesInfoMessage" obj="infoHints" showButtons={isMobile} />}
				<div className="products-page">
					<MarketBanner />
					<Row>
						{!isLoading &&
							products.map((item) => {
								const isAvailableProduct = !item.limit_for_sale || item.limit_for_sale > item.sold;
								return (
									<MarketBoxesCard
										key={item._id}
										item={item}
										buyBox={this.buyBox}
										isAvailableProduct={isAvailableProduct}
										isProcessing={isProcessing}
										activeProductId={activeProductId}
										toggleActiveProduct={toggleActiveProduct}
										wsReact={wsReact}
									/>
								);
							})}
					</Row>
					{isLoading && (
						<div className="market-preloader">
							<LazyLoad offset={100}>
								<img src={loaderImg} height={126} width={126} className="loader-img" alt="sales" />
							</LazyLoad>
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

export default withTranslation("Game")(connect(mapStateToProps, null)(MarketBoxes));
