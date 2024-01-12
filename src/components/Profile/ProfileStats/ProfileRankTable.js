import React, { Component, Fragment } from "react";
import { Row } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { getRandImg } from "../../Leaderboard/helpers";
import UserRankRow from "./UserRankRow";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import fetchWithToken from "../../../services/fetchWithToken";

import podiumImg from "../../../assets/img/profile/podium-cyan.svg";

import "../../../assets/scss/Profile/ProfileRankTable.scss";

const mapStateToProps = (state) => ({
	language: state.game.language,
	avatarVersion: state.user.avatarVersion,
});

class ProfileRankTable extends Component {
	static propTypes = {
		uid: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		avatarVersion: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			rankStats: [],
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidMount = async () => {
		await this.getUserRankData();
	};

	componentWillUnmount() {
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

	getUserRankData = async () => {
		try {
			this.createSignalAndController();
			const json = await fetchWithToken(`/api/profile/user-and-neighbors-rank-data/${this.props.uid}`, {
				method: "GET",
				signal: this.signal,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ rankStats: json.data });
		} catch (e) {
			console.error(e);
		}
	};

	onErrorLoadImg = (e) => {
		e.target.src = getRandImg();
	};

	render() {
		const { language, t, uid, avatarVersion } = this.props;
		const { rankStats } = this.state;
		return (
			<Fragment>
				{rankStats.length > 0 && (
					<div className="rank-table table-users">
						<div className="rank-block-header">
							<p>{t("yourRank")}</p>
						</div>
						<div className="table-responsive">
							{rankStats.map((user) => (
								<UserRankRow key={user.id} user={user} isCurrentUser={uid === user.id} avatarVersion={avatarVersion} onImageError={this.onErrorLoadImg} />
							))}
							<div className="go-to-rank">
								<Link to={`${getLanguagePrefix(language)}/rank?find-me`} className="choose-game-link">
									<span className="icon">
										<img src={podiumImg} width={15} height={15} alt="podiumImg" />
									</span>
									<span className="button-text">{t("goToLeaderboard")}</span>
								</Link>
							</div>
						</div>
					</div>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("Profile")(withRouter(connect(mapStateToProps, null)(ProfileRankTable)));
