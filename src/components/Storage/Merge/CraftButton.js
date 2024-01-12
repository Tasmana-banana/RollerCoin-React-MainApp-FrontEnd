import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import fetchWithToken from "../../../services/fetchWithToken";

import "../../../assets/scss/Storage/Merge/CraftButton.scss";

import errorNotice from "../../../assets/img/icon/error_notice.svg";
import successIcon from "../../../assets/img/icon/success_notice.svg";
import wrenchIcon from "../../../assets/img/storage/wrench_icon.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});

class CraftButton extends Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		currentCraftingID: PropTypes.string.isRequired,
		currentCraftingQuantity: PropTypes.number,
		requiredItemsAvailable: PropTypes.bool.isRequired,
		requiredItems: PropTypes.object,
		toggleShowComponentsModal: PropTypes.func,
		craftConfirmationHandler: PropTypes.func,
		craftConfirmation: PropTypes.bool,
		refreshMainData: PropTypes.func.isRequired,
	};

	static defaultProps = {
		requiredItems: [],
	};

	constructor(props) {
		super(props);
		this.state = {
			isProcessing: false,
			internalCraftConfirmation: false,
			minersFromStorageForMerge: [],
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
	}

	componentDidMount() {
		this.updateDataForMerge();
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.requiredItems) !== JSON.stringify(this.props.requiredItems)) {
			this.updateDataForMerge();
		}
	}

	updateDataForMerge = () => {
		const { requiredItems } = this.props;
		const minersItem = requiredItems.find(({ type }) => type === "miners");
		if (!minersItem || !minersItem.user_items || !minersItem.user_items.length) {
			return null;
		}
		const countInInventory = minersItem.user_items.filter(({ is_in_inventory: isInInventory }) => !!isInInventory).length;
		if (countInInventory >= minersItem.count) {
			return null;
		}
		const requiredFromInventoryCount = minersItem.count - countInInventory;
		const minersInRacks = minersItem.user_items.filter(({ is_in_inventory: isInInventory }) => !isInInventory);
		const minersForMerge = minersInRacks.slice(0, requiredFromInventoryCount).map(({ id }) => id);
		this.setState({ minersFromStorageForMerge: minersForMerge });
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="crafting notification" />
				<span>{text}</span>
			</div>
		);
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	moveMinerToInventory = async (minerID) => {
		this.createSignalAndController();
		const json = await fetchWithToken(`/api/game/move-miner-to-inventory`, {
			method: "POST",
			body: JSON.stringify({ miner_id: minerID }),
			signal: this.signal,
		});
		if (!json.success) {
			throw new Error(json.error);
		}
	};

	craftProduct = async () => {
		const { t, currentCraftingID, currentCraftingQuantity, refreshMainData } = this.props;
		const { minersFromStorageForMerge } = this.state;
		this.createSignalAndController();
		this.setState({ isProcessing: true });
		try {
			if (minersFromStorageForMerge.length) {
				for (let i = 0; i < minersFromStorageForMerge.length; i += 1) {
					// eslint-disable-next-line no-await-in-loop
					await this.moveMinerToInventory(minersFromStorageForMerge[i]);
				}
			}
			const json = await fetchWithToken("/api/storage/merge-items", {
				method: "POST",
				signal: this.signal,
				body: JSON.stringify({ id: currentCraftingID, quantity: currentCraftingQuantity || 1 }),
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("merge.messages.failedCraft"), errorNotice), this.toastDefaultConfig);
				return false;
			}
			toast(this.constructor.renderToast(t("merge.messages.successCraft"), successIcon), this.toastDefaultConfig);
			await refreshMainData();
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({
				isProcessing: false,
			});
			this.internalConfirmationHandler();
		}
	};

	internalConfirmationHandler = () => {
		const { currentCraftingID, craftConfirmationHandler, craftConfirmation } = this.props;
		const { internalCraftConfirmation } = this.state;
		if (craftConfirmationHandler) {
			craftConfirmationHandler(craftConfirmation ? "" : currentCraftingID);
		}
		this.setState({ internalCraftConfirmation: !internalCraftConfirmation });
	};

	render() {
		const { requiredItemsAvailable, craftConfirmation, craftConfirmationHandler, t } = this.props;
		const { isProcessing, internalCraftConfirmation, minersFromStorageForMerge } = this.state;
		return (
			<div className="craft-button-wrapper">
				<button
					type="button"
					className="craft-button tree-dimensional-button btn-cyan w-100"
					hidden={craftConfirmationHandler ? craftConfirmation : internalCraftConfirmation}
					onClick={this.internalConfirmationHandler}
					disabled={!requiredItemsAvailable}
				>
					<span className="with-horizontal-image flex-lg-row button-text-wrapper">
						<img src={wrenchIcon} height={24} width={24} alt="cart" />
						<span className="btn-text">{t("merge.merge")}</span>
					</span>
				</button>
				<div className="crafting-confirmation-wrapper" hidden={craftConfirmationHandler ? !craftConfirmation : !internalCraftConfirmation}>
					{!!minersFromStorageForMerge.length && (
						<p className="confirmation-merge-info">
							<span className="cyan-text">{minersFromStorageForMerge.length}</span> {t("merge.removedFromTheRack")}
						</p>
					)}
					<p className="confirmation-title">{t("merge.youSure")}</p>
					<div className="confirmation-buttons">
						<button type="button" className="tree-dimensional-button btn-cyan" onClick={this.craftProduct}>
							<span className="btn-text">{t("merge.merge")}</span>
						</button>
						<button type="button" className="tree-dimensional-button btn-red" onClick={this.internalConfirmationHandler}>
							<span className="btn-text">{t("merge.discard")}</span>
						</button>
					</div>
				</div>
				{isProcessing && (
					<div className="storage-preloader-layer">
						<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
					</div>
				)}
			</div>
		);
	}
}

export default withTranslation("Storage")(connect(mapStateToProps, null)(CraftButton));
