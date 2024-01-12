import React, { Component, createRef, Fragment } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "reactstrap";
import { connect } from "react-redux";
import { Header } from "../../components/Game";
import MainScreen from "../../components/Phaser/HomeScreen";
import DailyWeeklyQuests from "../../components/Game/DailyWeeklyQuests/DailyWeeklyQuests";
import * as actions from "../../actions/game";
import fetchWithToken from "../../services/fetchWithToken";
import BannersLine from "../../components/Game/BannersLine";
import InfoBlockWithIcon from "../../components/SingleComponents/InfoBlockWithIcon";
import PwaMain from "../../components/Game/PWA/PwaMain";

import "../../assets/scss/Game/PhaserScreen.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	userId: state.user.uid,
	isPwaActive: state.user.isPwaActive,
	isMobile: state.game.isMobile,
	isMainGameVisible: state.game.isMainGameVisible,
	isCompleted: state.user.isCompleted,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	reloadMainGame: (state) => dispatch(actions.reloadMainGame(state)),
});

class MainContentClass extends Component {
	static propTypes = {
		wsReact: PropTypes.object.isRequired,
		userId: PropTypes.string.isRequired,
		isPwaActive: PropTypes.bool.isRequired,
		isMainGameVisible: PropTypes.bool.isRequired,
		reloadMainGame: PropTypes.func.isRequired,
		isMobile: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.resizeObserver = null;
		this.resizeElement = createRef();
		this.state = {
			mainScreenHeight: 0,
			mainScreenWidth: 0,
			isLoading: true,
			isViewPWA: true,
		};
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
		this.resizeObserver = new ResizeObserver(this.resizeEventHandler);
		this.resizeObserver.observe(this.resizeElement.current);
	}

	componentWillUnmount() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	resizeEventHandler = (entity) => {
		if (entity.length && entity[0].contentRect) {
			this.setState({
				mainScreenHeight: entity[0].contentRect.height,
				mainScreenWidth: entity[0].contentRect.width,
			});
		}
	};

	componentDidUpdate(prevProps) {
		const { isMainGameVisible } = this.props;
		if (prevProps.isMainGameVisible && !isMainGameVisible) {
			this.props.reloadMainGame(true);
		}
	}

	render() {
		const { isMainGameVisible, isMobile, isPwaActive, wsReact } = this.props;
		const { mainScreenHeight, mainScreenWidth, isLoading } = this.state;
		return (
			<div ref={this.resizeElement}>
				<Container className="main-game-container">
					<BannersLine isMobile={isMobile} wsReact={wsReact} isLoading={isLoading} />
					<Row>
						<Col xs="12" lg="3">
							<Header wsReact={wsReact} widthLg={12} isLoading={isLoading} />
						</Col>
						<Col xs="12" lg="9">
							<div className="main-game">
								{isMainGameVisible && (
									<MainScreen
										mainScreenHeight={mainScreenHeight}
										mainScreenWidth={mainScreenWidth}
										wsReact={wsReact}
										userId={this.props.userId}
										resizeEventHandler={this.resizeEventHandler}
									/>
								)}
							</div>
							{!isMobile && <InfoBlockWithIcon tName="Game" message="mainInfoMessage" obj="infoHints" showButtons />}
						</Col>
						{isMobile && (
							<Fragment>
								<Col xs="12">
									<DailyWeeklyQuests wsReact={wsReact} />
									<InfoBlockWithIcon tName="Game" message="mainInfoMessage" obj="infoHints" showButtons />
								</Col>
							</Fragment>
						)}
					</Row>
					{isPwaActive && <PwaMain wsReact={wsReact} />}
				</Container>
			</div>
		);
	}
}
const MainContent = connect(mapStateToProps, mapDispatchToProps)(MainContentClass);
export default MainContent;
