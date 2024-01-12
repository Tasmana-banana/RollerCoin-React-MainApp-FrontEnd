import React from "react";
import { withTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import AvatarCardWrapper from "./AvatarCardWrapper";
import Accordion from "./Accordion";
import SeparatorWithOr from "../SingleComponents/SeparatorWithOr";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import { setNewAvatarVersion, setNewAvatarType } from "../../actions/userInfo";

import "../../assets/scss/CreateProfile/NFTAvatarPage.scss";

import defaultAvatarIconImg from "../../assets/img/createProfile/default_avatar.svg";
import floppyDiskIconImg from "../../assets/img/createProfile/floppydisk.svg";
import errorNotice from "../../assets/img/icon/error_notice.svg";

const mapStateToProps = (state) => ({
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
	userId: state.user.uid,
});

const mapDispatchToProps = (dispatch) => ({
	updateAvatarVersion: (state) => dispatch(setNewAvatarVersion(state)),
	updateAvatarType: (state) => dispatch(setNewAvatarType(state)),
});

class ChooseNFTAvatar extends React.Component {
	static propTypes = {
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		userId: PropTypes.string.isRequired,
		nftAvatarsData: PropTypes.array.isRequired,
		history: PropTypes.object.isRequired,
		avatarVersion: PropTypes.number.isRequired,
		updateAvatarVersion: PropTypes.func.isRequired,
		updateAvatarType: PropTypes.func.isRequired,
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={icon} alt="market notification" />
				<span>{text}</span>
			</div>
		);
	}

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			selectedAvatar: null,
			pathToNFTAvatar: null,
		};
		this.controllers = {};
		this.signals = {};
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

	selectAvatar = (data) =>
		this.setState({
			selectedAvatar: data ? data.id : null,
			pathToNFTAvatar: data ? data.pathToAvatar : null,
		});

	saveAvatar = async () => {
		const { selectedAvatar } = this.state;
		const { t, language, history, updateAvatarVersion, updateAvatarType } = this.props;
		this.createSignalAndController("saveAvatar");
		this.setState({ isLoading: true });
		try {
			const [nftContractID, tokenID] = selectedAvatar.split("_");
			const json = await fetchWithToken("/api/profile/set-token-as-avatar", {
				method: "POST",
				signal: this.signals.saveAvatar,
				body: JSON.stringify({ token_id: tokenID, nft_contract_id: nftContractID }),
			});
			if (!json.success) {
				toast(this.constructor.renderToast(t("setAvatarError"), errorNotice), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});

				return this.setState({ isLoading: false });
			}
			updateAvatarVersion(json.data.new_avatar_version);
			updateAvatarType("nft");
			history.push(`${getLanguagePrefix(language)}/profile`);
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
		}
	};

	render() {
		const { t, language, userId, nftAvatarsData, avatarVersion } = this.props;
		const { selectedAvatar, isLoading, pathToNFTAvatar } = this.state;
		const currentAvatar = selectedAvatar ? pathToNFTAvatar : `${process.env.AVATARS_STATIC_URL}/static/avatars/${userId}.png?v=${avatarVersion}`;
		return (
			<AvatarCardWrapper title={t("nftAvatar")}>
				<Col xs={12} lg={4}>
					<div className="avatar-img">
						<LazyLoadImage width={272} height={272} src={currentAvatar} alt="avatar" threshold={100} />
					</div>
					<div className="mt-4">
						<button type="button" className="tree-dimensional-button btn-cyan w-100" disabled={!selectedAvatar || isLoading} onClick={this.saveAvatar}>
							<span className="text-wrapper flex-row w-100">
								<div className="mr-2">
									<img src={floppyDiskIconImg} alt="Floppy disk icon" />
								</div>
								{t("saveChanges")}
							</span>
						</button>
					</div>
					<SeparatorWithOr className="mt-4" />
					<div className="mt-3 pb-3">
						<Link to={`${getLanguagePrefix(language)}/customize-avatar`} className="tree-dimensional-button btn-default w-100">
							<span className="text-wrapper flex-row w-100">
								<div className="mr-2">
									<img src={defaultAvatarIconImg} alt="Default avatar icon" />
								</div>
								{t("defaultAvatar")}
							</span>
						</Link>
					</div>
				</Col>
				<Col xs={12} lg={8}>
					<Row className="available-nft-wrapper align-items-center">
						<Col xs={12} lg={5}>
							<p className="available-nft">{t("availableNFt")}</p>
						</Col>
						<Col xs={12} lg={{ size: 5, offset: 2 }}>
							<Link to={`${getLanguagePrefix(language)}/profile/nft-collection`} className="tree-dimensional-button btn-default w-100">
								<span className="text-wrapper-without-img w-100">{t("allNftCollection")}</span>
							</Link>
						</Col>
					</Row>
					<Accordion accordionItems={nftAvatarsData} selectedAvatar={selectedAvatar} selectAvatar={this.selectAvatar} />
				</Col>
			</AvatarCardWrapper>
		);
	}
}

export default withTranslation("Avatar")(connect(mapStateToProps, mapDispatchToProps)(withRouter(ChooseNFTAvatar)));
