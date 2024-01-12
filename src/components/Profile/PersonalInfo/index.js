import React, { Fragment } from "react";
import { Col, Row } from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { setEmail } from "../../../actions/userInfo";
import ProfileSetting from "./ProfileSetting";
import ProfileDetailsInfo from "./ProfileDetailsInfo";
import ProfileActionBtn from "./ProfileActionBtn";
import ProfileEmail from "./ProfileEmail";
import ProfilePublicLink from "./ProfilePublicLink";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import fetchWithToken from "../../../services/fetchWithToken";

import "../../../assets/scss/Profile/ProfileInfo.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

const mapStateToProps = (state) => ({
	userId: state.user.uid,
	fullName: state.user.fullName,
	gender: state.user.gender,
	registrationDate: state.user.registrationDate,
	avatarVersion: state.user.avatarVersion,
	isMobile: state.game.isMobile,
});

const mapDispatchToProps = (dispatch) => ({
	setUserEmail: (state) => dispatch(setEmail(state)),
});

class PersonalInfo extends React.Component {
	static propTypes = {
		userId: PropTypes.string.isRequired,
		fullName: PropTypes.string.isRequired,
		gender: PropTypes.string.isRequired,
		registrationDate: PropTypes.string.isRequired,
		avatarVersion: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		setUserEmail: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.settingList = ["isCountGamesVisible", "isPowerStatsVisible", "isRankStatsVisible", "isShowRollersReplayVisible"];
		const publicProfileSettings = this.settingList.reduce((acc, name) => {
			acc[name] = false;
			return acc;
		}, {});
		this.state = {
			isLoading: false,
			publicLink: "",
			email: null,
			isOpenModalNewEmail: false,
			publicProfileSettings,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.getAccountSetting();
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

	toggleModalNewEmail = () => {
		const { isOpenModalNewEmail } = this.state;
		this.setState({
			isOpenModalNewEmail: !isOpenModalNewEmail,
		});
	};

	updateProfilePublicSetting = async (checkboxName, value) => {
		const bodyApiKeys = {
			isCountGamesVisible: "is_count_games_visible",
			isPowerStatsVisible: "is_power_stats_visible",
			isRankStatsVisible: "is_rank_stats_visible",
			isShowRollersReplayVisible: "is_show_rollers_replay_visible",
		};
		this.setCheckboxStatus(checkboxName, value);
		this.createSignalAndController(checkboxName);
		try {
			const apiKey = bodyApiKeys[checkboxName];
			const response = await fetchWithToken("/api/profile/update-public-setting", {
				method: "POST",
				signals: this.signals[checkboxName],
				body: JSON.stringify({ [apiKey]: value }),
			});
			if (!response.success) {
				this.setCheckboxStatus(checkboxName, !value);
			}
		} catch (error) {
			console.error(error);
			this.setCheckboxStatus(checkboxName, !value);
		}
	};

	getAccountSetting = async () => {
		this.createSignalAndController("accountSetting");
		this.setState({ isLoading: true });
		try {
			const response = await fetchWithToken("/api/profile/user-account-setting", {
				method: "GET",
				signal: this.signals.accountSetting,
			});
			if (!response.success) {
				return this.setState({ isLoading: false });
			}
			this.setState({
				isLoading: false,
				publicLink: response.data.public_link,
				email: response.data.email,
				publicProfileSettings: {
					isCountGamesVisible: response.data.public_profile_settings.is_count_games_visible,
					isPowerStatsVisible: response.data.public_profile_settings.is_power_stats_visible,
					isRankStatsVisible: response.data.public_profile_settings.is_rank_stats_visible,
					isShowRollersReplayVisible: response.data.public_profile_settings.is_show_rollers_replay_visible,
				},
			});
		} catch (error) {
			this.setState({ isLoading: false });
			console.error(error);
		}
	};

	setCheckboxStatus = (checkboxStateName, value) => this.setState({ publicProfileSettings: { ...this.state.publicProfileSettings, [checkboxStateName]: value } });

	setEmail = (email) => {
		this.setState({ email });
		this.props.setUserEmail(email);
	};

	setProfileLink = (publicLink) => this.setState({ publicLink });

	render() {
		const { userId, fullName, gender, registrationDate, avatarVersion, isMobile } = this.props;
		const { publicProfileSettings, publicLink, email, isLoading, isOpenModalNewEmail } = this.state;
		return (
			<Fragment>
				{isLoading && (
					<div className="d-flex justify-content-center">
						<div>
							<img src={loaderImg} height={63} width={63} alt="Loading..." />
						</div>
					</div>
				)}
				{!isLoading && (
					<>
						{<InfoBlockWithIcon tName="Profile" message="personalInfoMessage" obj="infoHints" showButtons={isMobile} />}
						<Row className="profile-info-page" noGutters={true}>
							<Fragment>
								<Col xs={12} lg={6} className="left-col">
									<ProfileDetailsInfo avatarVersion={avatarVersion} fullName={fullName} gender={gender} registrationDate={registrationDate} userID={userId} />
									<ProfileActionBtn publicLink={publicLink} />
									<ProfileEmail email={email} setNewEmail={this.setEmail} toggleModal={this.toggleModalNewEmail} isOpenModal={isOpenModalNewEmail} />
								</Col>
								<Col xs={12} lg={6} className="right-col mobile-space">
									<ProfileSetting settingList={this.settingList} settingState={publicProfileSettings} setCheckboxStatus={this.updateProfilePublicSetting} />
									<ProfilePublicLink publicLink={publicLink} setProfileLink={this.setProfileLink} />
								</Col>
							</Fragment>
						</Row>
					</>
				)}
			</Fragment>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInfo);
