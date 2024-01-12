import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import BasicCollection from "./BasicCollection";
import MergeCollection from "./MergeCollection";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import fetchWithToken from "../../../services/fetchWithToken";

import mergeMinerImg from "../../../assets/img/storage/gold_miner.svg";
import basicMinerImg from "../../../assets/img/storage/basic_miner.svg";

import "../../../assets/scss/Storage/Collection/main.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	isMobile: state.game.isMobile,
});

class Collection extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.TABS = {
			MERGE: 0,
			BASIC: 1,
		};
		this.state = {
			activeTab: this.TABS.MERGE,
			totalBonusPowerPercent: 0,
			basicMiners: {
				userHasAmount: 0,
				maxAmount: 0,
			},
			mergeMiners: {
				userHasAmount: 0,
				maxAmount: 0,
			},
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount = async () => {
		await this.getTotalBonusPower();
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	getTotalBonusPower = async () => {
		this.createSignalAndController("getCollectionStats");
		try {
			const json = await fetchWithToken("/api/storage/collection/stats", {
				method: "GET",
				signal: this.signals.getCollectionStats,
			});
			if (!json.success) {
				return false;
			}

			this.setState({
				totalBonusPowerPercent: json.data.total_bonus_percent,
				basicMiners: {
					userHasAmount: json.data.basic_miners.user_has_amount,
					maxAmount: json.data.basic_miners.max_amount,
				},
				mergeMiners: {
					userHasAmount: json.data.merge_miners.user_has_amount,
					maxAmount: json.data.merge_miners.max_amount,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	handleTabChange = (tab) => this.setState({ activeTab: tab });

	render() {
		const { t, isMobile } = this.props;
		const { totalBonusPowerPercent, basicMiners, mergeMiners, activeTab } = this.state;
		return (
			<Row className="collection-page" noGutters={true}>
				<Col xs="12">
					<InfoBlockWithIcon tName="Storage" message="collectionInfoMessage" obj="infoHints" showButtons={isMobile} />
					<div className="collection-title-wrapper">
						<h2 className="collection-title">
							{t("collection.totalBonusPower")} <span className="collection-value">{`+${totalBonusPowerPercent / 100}%`}</span>
						</h2>
					</div>
					<p className="collection-description">{t("collection.collectMiners")}</p>
					<div className="collection-tab-panel">
						<Nav tabs>
							<NavItem>
								<NavLink className={`${activeTab === this.TABS.MERGE ? "active" : ""}`} onClick={() => this.handleTabChange(this.TABS.MERGE)}>
									<span className="tab-text">
										<img className="miner-img" src={mergeMinerImg} alt="Gold miner" />
										{t("collection.merge")}
										<span className="miners-value">
											{mergeMiners.userHasAmount}/{mergeMiners.maxAmount}
										</span>
									</span>
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink className={`${activeTab === this.TABS.BASIC ? "active" : ""}`} onClick={() => this.handleTabChange(this.TABS.BASIC)}>
									<span className="tab-text">
										<img className="miner-img" src={basicMinerImg} alt="Basic miner" />
										{t("collection.basic")}
										<span className="miners-value">
											{basicMiners.userHasAmount}/{basicMiners.maxAmount}
										</span>
									</span>
								</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={activeTab}>
							<TabPane tabId={this.TABS.MERGE}>{activeTab === this.TABS.MERGE && <MergeCollection />}</TabPane>
							<TabPane tabId={this.TABS.BASIC}>{activeTab === this.TABS.BASIC && <BasicCollection />}</TabPane>
						</TabContent>
					</div>
				</Col>
			</Row>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(Collection));
