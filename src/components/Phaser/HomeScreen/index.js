import React, { Component } from "react";
import Phaser3 from "phaser";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import MoveToPlugin from "phaser3-rex-plugins/plugins/moveto-plugin";
import ButtonPlugin from "phaser3-rex-plugins/plugins/button-plugin";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import Start from "./scenes/Start";
import Loader from "./scenes/Loader";
import ErrorScreen from "./scenes/ErrorScreen";
import BuyRoom from "./scenes/BuyRoom";
import UpgradeSkin from "./scenes/UpgradeSkin";
import ConfirmationScreen from "./scenes/ConfirmationScreen";
import removePhaserEventListeners from "../../../services/removePhaserEventListeners";
import resizeCanvas from "../../../services/resizeCanvas";
import fetchWithToken from "../../../services/fetchWithToken";
import * as actions from "../../../actions/game";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	language: state.game.language,
	justBoughtItem: state.game.justBoughtItem,
	rollerCurrencies: state.wallet.rollerCurrencies,
	avatarVersion: state.user.avatarVersion,
	avatarType: state.user.avatarType,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setJustBoughtItem: (state) => dispatch(actions.setJustBoughtItem(state)),
	setPhaserScreenInputManager: (state) => dispatch(actions.setPhaserScreenInputManager(state)),
	setRoomLoadedStatus: (state) => dispatch(actions.setIsRoomLoaded(state)),
});
class MainScreenClass extends Component {
	static propTypes = {
		options: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		userId: PropTypes.string.isRequired,
		justBoughtItem: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		balance: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		avatarVersion: PropTypes.string.isRequired,
		avatarType: PropTypes.string.isRequired,
		setJustBoughtItem: PropTypes.func.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		setPhaserScreenInputManager: PropTypes.func.isRequired,
		setRoomLoadedStatus: PropTypes.func.isRequired,
		mainScreenHeight: PropTypes.number.isRequired,
		mainScreenWidth: PropTypes.number.isRequired,
	};

	constructor(props) {
		super(props);
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.config = {
			type: Phaser3.CANVAS,
			parent: "phaserMainScreen",
			width: 1206,
			height: 840,
			backgroundColor: "#181928",
			physics: {
				default: "arcade",
				arcade: {
					debug: false,
				},
			},
			plugins: {
				scene: [
					{
						key: "rexUI",
						plugin: UIPlugin,
						mapping: "rexUI",
					},
				],
				global: [
					{
						key: "rexDrag",
						plugin: DragPlugin,
						start: true,
					},
					{
						key: "rexMoveTo",
						plugin: MoveToPlugin,
						start: true,
					},
					{
						key: "rexButton",
						plugin: ButtonPlugin,
						start: true,
					},
				],
			},
			scale: {
				mode: Phaser3.Scale.NONE,
			},
			scene: [Boot, Preload, Start, Loader, ErrorScreen, BuyRoom, UpgradeSkin, ConfirmationScreen],
		};
	}

	componentDidMount() {
		this.getRoomsConfig();
	}

	componentDidUpdate(prevProps) {
		const { mainScreenHeight, mainScreenWidth } = this.props;
		if (prevProps.mainScreenHeight !== mainScreenHeight || prevProps.mainScreenWidth !== mainScreenWidth) {
			this.resizeGame();
		}
		if (this.props.balance.rlt !== prevProps.balance.rlt && this.game) {
			try {
				this.game.roomsConfig.balance.rlt = this.props.balance.rlt;
			} catch (error) {
				console.error(error);
			}
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resizeGame);
		if (this.game) {
			this.game.destroy();
			removePhaserEventListeners(this.game);
		}
		if (this.controller) {
			this.controller.abort();
		}
		this.props.setRoomLoadedStatus(false);
	}

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	getRoomsConfig = () => {
		this.createSignalAndController();
		const { userId, avatarVersion, avatarType } = this.props;
		fetchWithToken(`/api/game/room-config/${userId}`, {
			method: "GET",
			signal: this.signal,
		})
			.then((json) => {
				if (json.success) {
					this.game = new Phaser3.Game(this.config);
					const { data } = json;
					const { justBoughtItem } = this.props;
					if (!data.is_user_from_session) {
						data.appearance.room_levels_config = data.appearance.room_levels_config.filter((item) => data.rooms.find((room) => room.room_info.level === item.level));
					}
					data.appearance.room_levels_config = data.appearance.room_levels_config.sort((a, b) => a.level - b.level);
					this.game.roomsConfig = data;
					this.game.roomsConfig.userId = userId;
					this.game.roomsConfig.avatarVersion = avatarVersion;
					this.game.roomsConfig.avatarType = avatarType;
					this.game.roomsConfig.balance = this.props.balance;
					this.game.roomsConfig.rollerCurrencies = this.props.rollerCurrencies;
					this.game.roomsConfig.reactHistoryObject = this.props.history;
					this.game.roomsConfig.isEnglishLang = this.props.language === "en";
					this.game.wsReact = this.props.wsReact;
					this.game.setPhaserScreenInputManager = this.props.setPhaserScreenInputManager;
					this.game.staticUrl = process.env.STATIC_URL;
					this.game.inventoryData = data.inventory.sort((a, b) => b.power - a.power);
					this.game.inventoryData = data.inventory.sort((a, b) => a.item_type.localeCompare(b.item_type));
					this.game.inventoryData = this.game.inventoryData.map((item) => {
						return {
							...item,
							is_new: justBoughtItem === item.user_item_id,
						};
					});
					this.game.inventoryData.sort((a, b) => b.is_new - a.is_new);
					this.game.setJustBoughtItem = this.props.setJustBoughtItem;
					this.game.setRoomLoadedStatus = this.props.setRoomLoadedStatus;
					removePhaserEventListeners(this.game);
					window.addEventListener("resize", this.resizeGame);
				}
			})
			.catch((e) => console.error(e));
	};

	resizeGame = () => {
		resizeCanvas("phaserMainScreen", this.config.width, this.config.height);
		if (this.game && this.game.scale) {
			this.game.scale.refresh();
		}
	};

	render() {
		return <div id="phaserMainScreen" />;
	}
}

const MainScreen = connect(mapStateToProps, mapDispatchToProps)(MainScreenClass);
export default withRouter(MainScreen);
