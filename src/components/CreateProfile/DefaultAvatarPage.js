import React from "react";
import { Col, CustomInput, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import AvatarComponentsList from "./AvatarComponentsList";
import AvatarCardWrapper from "./AvatarCardWrapper";
import SeparatorWithOr from "../SingleComponents/SeparatorWithOr";
import CanvasObject from "./CanvasObject";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import generateRandomLayersConfig from "../../services/generateRandomLayersConfig";
import { setNewAvatarVersion, setNewAvatarType } from "../../actions/userInfo";

import "../../assets/scss/CreateProfile/CustomizeAvatarPage.scss";

import floppyDiskIconImg from "../../assets/img/createProfile/floppydisk.svg";
import refreshIconImg from "../../assets/img/createProfile/refresh.svg";
import nftCoinIconImg from "../../assets/img/createProfile/nft_coin.svg";

const mapStateToProps = (state) => ({
	language: state.game.language,
});

const mapDispatchToProps = (dispatch) => ({
	updateAvatarVersion: (state) => dispatch(setNewAvatarVersion(state)),
	updateAvatarType: (state) => dispatch(setNewAvatarType(state)),
});

class DefaultAvatarPage extends React.Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		updateAvatarVersion: PropTypes.func.isRequired,
		updateAvatarType: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			gender: "male",
			avatarConfig: null,
			avatarComponents: { mouth: [], eyes: [], face: [], hair: [], clothes: [] },
			avatarType: "default",
			disableRender: false,
			isLoading: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		const { gender } = this.state;
		this.getAvatarComponents(gender);
	}

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

	getAvatarComponents = async (gender) => {
		this.createSignalAndController("getComponents");
		this.setState({ disableRender: true });
		try {
			const json = await fetchWithToken(`/api/avatars/avatar-components?gender=${gender}`, {
				method: "GET",
				signal: this.signals.getComponents,
			});
			if (!json.success) {
				console.error(json.error);
				return false;
			}
			const randomAvatarConfig = generateRandomLayersConfig(json.data);
			this.setState({
				disableRender: false,
				avatarComponents: json.data,
				avatarConfig: randomAvatarConfig,
				gender,
			});
		} catch (error) {
			this.setState({ disableRender: false });
			console.error(error);
		}
	};

	setGender = (e) => this.getAvatarComponents(e.target.value);

	setRandomAvatar = () => {
		const { avatarComponents } = this.state;
		const randomAvatarConfig = generateRandomLayersConfig(avatarComponents);
		this.setState({ avatarConfig: randomAvatarConfig });
	};

	saveAvatar = async () => {
		const { language, history, updateAvatarVersion, updateAvatarType } = this.props;
		const { gender, avatarConfig, avatarType } = this.state;
		this.createSignalAndController("saveAvatar");
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken("/api/profile/customize-user-avatar", {
				method: "POST",
				signal: this.signals.saveAvatar,
				body: JSON.stringify({ gender, avatar_config: avatarConfig, avatar_type: avatarType }),
			});
			this.setState({ isLoading: false });
			if (!json.success) {
				return console.error(json.error);
			}
			updateAvatarVersion(json.data.new_avatar_version);
			updateAvatarType("default");
			history.push(`${getLanguagePrefix(language)}/profile`);
		} catch (error) {
			console.error(error);
		}
	};

	updateAvatarConfig = (newConfig) => this.setState({ avatarConfig: { ...this.state.avatarConfig, ...newConfig } });

	render() {
		const { gender, avatarConfig, disableRender, avatarComponents, isLoading } = this.state;
		const { t, language } = this.props;
		return (
			<AvatarCardWrapper title={t("customizeAvatar")}>
				<Col xs={12} lg={4}>
					<div className="avatar-img">
						<CanvasObject gender={gender} avatarConfig={avatarConfig} disableRender={disableRender} />
					</div>
					<div className="inline-radio-group mt-3">
						<CustomInput type="radio" id="gender_male" name="gender" value="male" label={t("male")} checked={gender === "male"} onChange={this.setGender} />
						<CustomInput type="radio" id="gender_female" name="gender" value="female" label={t("female")} checked={gender === "female"} onChange={this.setGender} />
					</div>
					<Row noGutters={true} className="mt-4 avatar-btn-group">
						<Col lg={12} xs={6} className="save-btn">
							<button type="button" className="tree-dimensional-button btn-cyan w-100" onClick={this.saveAvatar} disabled={isLoading}>
								<span className="text-wrapper flex-row w-100">
									<div className="mr-2">
										<img src={floppyDiskIconImg} alt="Floppy disk icon" />
									</div>
									{t("saveChanges")}
								</span>
							</button>
						</Col>
						<Col lg={12} xs={6} className="random-btn">
							<button type="button" className="tree-dimensional-button btn-default w-100" onClick={this.setRandomAvatar}>
								<span className="text-wrapper flex-row w-100">
									<div className="mr-2">
										<img src={refreshIconImg} alt="Refresh icon" />
									</div>
									{t("randomAvatar")}
								</span>
							</button>
						</Col>
					</Row>
					<SeparatorWithOr className="mt-4" />
					<div className="mt-3">
						<Link to={`${getLanguagePrefix(language)}/customize-avatar/nft`} className="tree-dimensional-button btn-default w-100">
							<span className="text-wrapper flex-row w-100">
								<div className="mr-2">
									<img src={nftCoinIconImg} alt="NFT coin icon" />
								</div>
								{t("chooseNft")}
							</span>
						</Link>
					</div>
				</Col>
				<Col xs={12} lg={8}>
					<AvatarComponentsList gender={gender} avatarConfig={avatarConfig} avatarComponents={avatarComponents} updateAvatarConfig={this.updateAvatarConfig} />
				</Col>
			</AvatarCardWrapper>
		);
	}
}

export default withTranslation("Avatar")(connect(mapStateToProps, mapDispatchToProps)(withRouter(DefaultAvatarPage)));
