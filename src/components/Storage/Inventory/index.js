import React, { Component, Fragment } from "react";
import { Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Parts from "./Parts";
import MinersAndRacksItems from "./MinersAndRacksItems";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import fetchWithToken from "../../../services/fetchWithToken";

import minerImg from "../../../assets/img/storage/basic_miner.svg";
import rackImg from "../../../assets/img/storage/rack.svg";
import partImg from "../../../assets/img/storage/part.svg";

import "../../../assets/scss/Storage/Inventroy/main.scss";

const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class Inventory extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		location: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.TABS = {
			PARTS: "parts",
			MINERS: "miners",
			RACKS: "racks",
		};
		this.state = {
			isLoading: true,
			activeTab: this.TABS.PARTS,
			itemsCount: {
				parts: 0,
				miners: 0,
				racks: 0,
			},
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount = async () => {
		await this.getItemsCount();
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	getItemsCount = async () => {
		this.createSignalAndController("getItemsCount");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken("/api/storage/inventory/items-count", {
				method: "GET",
				signal: this.signals.getItemsCount,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ itemsCount: json.data, isLoading: false });
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
		}
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	handleTabChange = (tab) => this.setState({ activeTab: tab });

	render() {
		const { activeTab, itemsCount } = this.state;
		const { t, isMobile } = this.props;
		return (
			<Fragment>
				<Row className="inventory-page-container" noGutters={true}>
					<Col xs="12">
						<InfoBlockWithIcon tName="Storage" message="inventoryInfoMessage" obj="infoHints" showButtons={isMobile} />
						<div className="inventory-tab-panel">
							<Nav tabs>
								<NavItem>
									<NavLink className={`${activeTab === this.TABS.PARTS ? "active" : ""}`} onClick={() => this.handleTabChange(this.TABS.PARTS)}>
										<span className="tab-text">
											<img className="item-img" src={partImg} alt="Parts icon" height="24" width="24" />
											{t("inventory.parts")}
											<span className="items-count">{itemsCount.parts}</span>
										</span>
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={`${activeTab === this.TABS.MINERS ? "active" : ""}`} onClick={() => this.handleTabChange(this.TABS.MINERS)}>
										<span className="tab-text">
											<img className="item-img" src={minerImg} alt="Miner icon" height="24" width="24" />
											{t("inventory.miners")}
											<span className="items-count">{itemsCount.miners}</span>
										</span>
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={`${activeTab === this.TABS.RACKS ? "active" : ""}`} onClick={() => this.handleTabChange(this.TABS.RACKS)}>
										<span className="tab-text">
											<img className="item-img" src={rackImg} alt="Rack icon" height="24" width="24" />
											{t("inventory.racks")}
											<span className="items-count">{itemsCount.racks}</span>
										</span>
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={activeTab}>
								<TabPane tabId={this.TABS.PARTS}>{activeTab === this.TABS.PARTS && <Parts />}</TabPane>
								<TabPane tabId={this.TABS.MINERS}>{activeTab === this.TABS.MINERS && <MinersAndRacksItems type={this.TABS.MINERS} />}</TabPane>
								<TabPane tabId={this.TABS.RACKS}>{activeTab === this.TABS.RACKS && <MinersAndRacksItems type={this.TABS.RACKS} />}</TabPane>
							</TabContent>
						</div>
					</Col>
				</Row>
			</Fragment>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(Inventory));
